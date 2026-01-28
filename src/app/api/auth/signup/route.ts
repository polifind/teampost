import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
      },
    });

    // Auto-join organization based on email domain
    const normalizedEmail = email.toLowerCase();
    const emailDomain = normalizedEmail.split("@")[1];
    if (emailDomain) {
      // Find organization with matching domain
      const organization = await prisma.organization.findUnique({
        where: { domain: emailDomain },
      });

      if (organization) {
        // Check if already a member (e.g., from a pending invite)
        const existingMembership = await prisma.organizationMember.findFirst({
          where: {
            organizationId: organization.id,
            OR: [
              { userId: user.id },
              { email: normalizedEmail },
            ],
          },
        });

        if (!existingMembership) {
          // Auto-add to organization as MEMBER
          await prisma.organizationMember.create({
            data: {
              organizationId: organization.id,
              userId: user.id,
              email: normalizedEmail,
              role: "MEMBER",
              inviteStatus: "ACCEPTED",
              joinedAt: new Date(),
            },
          });
          console.log(`Auto-joined user ${normalizedEmail} to organization ${organization.name}`);
        } else if (!existingMembership.userId && existingMembership.inviteStatus === "PENDING") {
          // User had a pending invite - accept it
          await prisma.organizationMember.update({
            where: { id: existingMembership.id },
            data: {
              userId: user.id,
              inviteStatus: "ACCEPTED",
              joinedAt: new Date(),
              inviteToken: null,
              inviteTokenExpiry: null,
            },
          });
          console.log(`Auto-accepted pending invite for ${normalizedEmail} to organization ${organization.name}`);
        }
      }
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
