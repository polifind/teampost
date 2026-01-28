import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Helper to extract LinkedIn ID from URL
function extractLinkedInId(url: string): { type: "PERSON" | "COMPANY"; id: string } | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Person URL: linkedin.com/in/username
    const personMatch = pathname.match(/^\/in\/([^\/]+)/);
    if (personMatch) {
      return { type: "PERSON", id: personMatch[1] };
    }

    // Company URL: linkedin.com/company/companyname
    const companyMatch = pathname.match(/^\/company\/([^\/]+)/);
    if (companyMatch) {
      return { type: "COMPANY", id: companyMatch[1] };
    }

    return null;
  } catch {
    return null;
  }
}

// GET - List all contacts for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // Optional filter: "PERSON" or "COMPANY"
    const search = searchParams.get("search"); // Optional search query

    const where: {
      userId: string;
      type?: "PERSON" | "COMPANY";
      name?: { contains: string; mode: "insensitive" };
    } = {
      userId: session.user.id,
    };

    if (type === "PERSON" || type === "COMPANY") {
      where.type = type;
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const contacts = await prisma.linkedInContact.findMany({
      where,
      orderBy: [
        { usageCount: "desc" },
        { lastUsedAt: "desc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Get LinkedIn contacts error:", error);
    return NextResponse.json(
      { error: "Failed to get contacts" },
      { status: 500 }
    );
  }
}

// POST - Add a new contact
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { linkedinUrl, name, headline, profileImageUrl } = body;

    if (!linkedinUrl || !name) {
      return NextResponse.json(
        { error: "LinkedIn URL and name are required" },
        { status: 400 }
      );
    }

    // Normalize the URL
    let normalizedUrl = linkedinUrl.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Extract the type from the URL
    const extracted = extractLinkedInId(normalizedUrl);
    if (!extracted) {
      return NextResponse.json(
        { error: "Invalid LinkedIn URL. Please use a profile (linkedin.com/in/...) or company (linkedin.com/company/...) URL." },
        { status: 400 }
      );
    }

    // Check if this contact already exists for the user
    const existing = await prisma.linkedInContact.findUnique({
      where: {
        userId_linkedinUrl: {
          userId: session.user.id,
          linkedinUrl: normalizedUrl,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This contact already exists", contact: existing },
        { status: 409 }
      );
    }

    // Create the contact
    const contact = await prisma.linkedInContact.create({
      data: {
        userId: session.user.id,
        type: extracted.type,
        linkedinUrl: normalizedUrl,
        name: name.trim(),
        headline: headline?.trim() || null,
        profileImageUrl: profileImageUrl || null,
      },
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    console.error("Create LinkedIn contact error:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a contact
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("id");

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const contact = await prisma.linkedInContact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    await prisma.linkedInContact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete LinkedIn contact error:", error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
