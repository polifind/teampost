import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasActiveSubscription, FREE_POST_LIMIT } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        stripePriceId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Count scheduled posts
    const scheduledPostCount = await prisma.schedule.count({
      where: {
        userId: session.user.id,
      },
    });

    const isSubscribed = hasActiveSubscription(user);
    const postsRemaining = Math.max(0, FREE_POST_LIMIT - scheduledPostCount);
    const needsSubscription = scheduledPostCount >= FREE_POST_LIMIT && !isSubscribed;

    return NextResponse.json({
      isSubscribed,
      scheduledPostCount,
      freePostLimit: FREE_POST_LIMIT,
      postsRemaining,
      needsSubscription,
      subscriptionEnd: user.stripeCurrentPeriodEnd,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}
