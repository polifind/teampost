import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/cadence - Get user's draft cadence settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cadence = await prisma.draftCadence.findUnique({
      where: { userId: session.user.id },
    });

    // Also get user's slack integration status
    const slackIntegration = await prisma.slackIntegration.findUnique({
      where: { userId: session.user.id },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({
      cadence,
      hasSlackIntegration: !!slackIntegration?.isActive,
    });
  } catch (error) {
    console.error("Error fetching cadence:", error);
    return NextResponse.json(
      { error: "Failed to fetch cadence settings" },
      { status: 500 }
    );
  }
}

// POST /api/cadence - Create or update draft cadence
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      frequency,
      dayOfWeek,
      dayOfMonth,
      timeOfDay,
      selectedLibraryItemIds,
      deliveryMethod,
      isActive,
    } = body;

    // Validate required fields
    if (!frequency || !timeOfDay) {
      return NextResponse.json(
        { error: "frequency and timeOfDay are required" },
        { status: 400 }
      );
    }

    // Validate frequency-specific fields
    if (frequency === "WEEKLY" && !dayOfWeek) {
      return NextResponse.json(
        { error: "dayOfWeek is required for weekly cadence" },
        { status: 400 }
      );
    }

    if (frequency === "MONTHLY" && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 28)) {
      return NextResponse.json(
        { error: "dayOfMonth (1-28) is required for monthly cadence" },
        { status: 400 }
      );
    }

    // Check if Slack is required but not connected
    if (deliveryMethod === "SLACK") {
      const slackIntegration = await prisma.slackIntegration.findUnique({
        where: { userId: session.user.id },
        select: { isActive: true },
      });

      if (!slackIntegration?.isActive) {
        return NextResponse.json(
          { error: "Slack integration required for Slack delivery" },
          { status: 400 }
        );
      }
    }

    // Get user's timezone
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { timezone: true },
    });

    // Calculate next generation time
    const nextGenerationAt = calculateNextGenerationTime(
      frequency,
      dayOfWeek,
      dayOfMonth,
      timeOfDay,
      user?.timezone || "America/New_York"
    );

    // Upsert the cadence
    const cadence = await prisma.draftCadence.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        frequency,
        dayOfWeek: dayOfWeek || null,
        dayOfMonth: dayOfMonth || null,
        timeOfDay,
        selectedLibraryItemIds: selectedLibraryItemIds || [],
        deliveryMethod: deliveryMethod || "SLACK",
        isActive: isActive ?? true,
        nextGenerationAt,
      },
      update: {
        frequency,
        dayOfWeek: dayOfWeek || null,
        dayOfMonth: dayOfMonth || null,
        timeOfDay,
        selectedLibraryItemIds: selectedLibraryItemIds || [],
        deliveryMethod: deliveryMethod || "SLACK",
        isActive: isActive ?? true,
        nextGenerationAt,
      },
    });

    return NextResponse.json({ cadence });
  } catch (error) {
    console.error("Error saving cadence:", error);
    return NextResponse.json(
      { error: "Failed to save cadence settings" },
      { status: 500 }
    );
  }
}

// DELETE /api/cadence - Delete draft cadence
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.draftCadence.delete({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting cadence:", error);
    return NextResponse.json(
      { error: "Failed to delete cadence settings" },
      { status: 500 }
    );
  }
}

// Helper: Calculate next generation time
function calculateNextGenerationTime(
  frequency: string,
  dayOfWeek: string | null,
  dayOfMonth: number | null,
  timeOfDay: string,
  timezone: string
): Date {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(":").map(Number);

  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const currentYear = parseInt(parts.find((p) => p.type === "year")?.value || "2024");
  const currentMonth = parseInt(parts.find((p) => p.type === "month")?.value || "1") - 1;
  const currentDay = parseInt(parts.find((p) => p.type === "day")?.value || "1");
  const currentHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
  const currentMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

  // Create a date in the user's timezone
  let targetDate = new Date(currentYear, currentMonth, currentDay, hours, minutes, 0);

  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const currentDayOfWeek = new Date(currentYear, currentMonth, currentDay).getDay();

  switch (frequency) {
    case "DAILY":
      // If today's time has passed, schedule for tomorrow
      if (currentHour > hours || (currentHour === hours && currentMinute >= minutes)) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      break;

    case "WEEKLY":
      if (dayOfWeek) {
        const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
        let daysUntilTarget = targetDayIndex - currentDayOfWeek;

        if (daysUntilTarget < 0) {
          daysUntilTarget += 7;
        } else if (daysUntilTarget === 0) {
          // Same day - check if time has passed
          if (currentHour > hours || (currentHour === hours && currentMinute >= minutes)) {
            daysUntilTarget = 7;
          }
        }

        targetDate.setDate(targetDate.getDate() + daysUntilTarget);
      }
      break;

    case "BIWEEKLY":
      if (dayOfWeek) {
        const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
        let daysUntilTarget = targetDayIndex - currentDayOfWeek;

        if (daysUntilTarget < 0) {
          daysUntilTarget += 14;
        } else if (daysUntilTarget === 0) {
          if (currentHour > hours || (currentHour === hours && currentMinute >= minutes)) {
            daysUntilTarget = 14;
          }
        } else {
          // Add extra week for biweekly
          daysUntilTarget += 7;
        }

        targetDate.setDate(targetDate.getDate() + daysUntilTarget);
      }
      break;

    case "MONTHLY":
      if (dayOfMonth) {
        targetDate.setDate(dayOfMonth);
        // If this month's date has passed, move to next month
        if (
          targetDate.getDate() < currentDay ||
          (targetDate.getDate() === currentDay &&
            (currentHour > hours || (currentHour === hours && currentMinute >= minutes)))
        ) {
          targetDate.setMonth(targetDate.getMonth() + 1);
        }
      }
      break;
  }

  // Convert from user's timezone to UTC
  // Create a date string and parse it as the user's timezone
  const targetString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${String(targetDate.getDate()).padStart(2, "0")}T${timeOfDay}:00`;

  // Use a trick: create date in local time, then adjust
  const tempDate = new Date(targetString);
  const utcDate = new Date(tempDate.toLocaleString("en-US", { timeZone: timezone }));
  const offset = tempDate.getTime() - utcDate.getTime();

  return new Date(tempDate.getTime() + offset);
}
