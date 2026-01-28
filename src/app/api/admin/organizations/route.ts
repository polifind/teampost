import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "rohan.pavuluri@gmail.com";

// GET - List all organizations (super admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            members: true,
            notes: true,
          },
        },
        members: {
          where: { role: "ADMIN" },
          select: {
            email: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

// POST - Create new organization (super admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, domain, adminEmails } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug already exists
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An organization with this name already exists" },
        { status: 400 }
      );
    }

    // If domain is provided, check if it's already in use
    const normalizedDomain = domain?.toLowerCase().trim() || null;
    if (normalizedDomain) {
      const existingDomain = await prisma.organization.findUnique({
        where: { domain: normalizedDomain },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: "This domain is already associated with another organization" },
          { status: 400 }
        );
      }
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        description: description || null,
        domain: normalizedDomain,
      },
    });

    // Add admins if provided
    if (adminEmails && Array.isArray(adminEmails) && adminEmails.length > 0) {
      for (const email of adminEmails) {
        const normalizedEmail = email.toLowerCase().trim();
        if (!normalizedEmail) continue;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        await prisma.organizationMember.create({
          data: {
            organizationId: organization.id,
            email: normalizedEmail,
            userId: existingUser?.id || null,
            role: "ADMIN",
            joinedAt: existingUser ? new Date() : null,
          },
        });
      }
    }

    // Fetch the created org with relations
    const createdOrg = await prisma.organization.findUnique({
      where: { id: organization.id },
      include: {
        _count: {
          select: {
            members: true,
            notes: true,
          },
        },
        members: {
          where: { role: "ADMIN" },
          select: {
            email: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ organization: createdOrg });
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}
