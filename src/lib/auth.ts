import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

// Custom adapter that allows account linking and handles existing users at signup
const customAdapter = {
  ...PrismaAdapter(prisma),
  // Override getUserByAccount to allow linking accounts with the same email
  async getUserByAccount(providerAccountId: { provider: string; providerAccountId: string }) {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: providerAccountId.provider,
          providerAccountId: providerAccountId.providerAccountId,
        },
      },
      include: { user: true },
    });
    return account?.user ?? null;
  },
  // Override getUserByEmail to return null - this prevents the OAuthAccountNotLinked error
  // by making NextAuth think no user exists, so it will call createUser instead
  // Our createUser override handles returning the existing user
  async getUserByEmail(email: string) {
    // Return null to bypass the OAuthAccountNotLinked check
    // The createUser method will handle existing users
    return null;
  },
  // Override createUser to return existing user if email already exists
  // This allows "signup" with OAuth to work for existing users (acts as sign in)
  async createUser(data: { name?: string | null; email?: string | null; image?: string | null; emailVerified?: Date | null }) {
    if (!data.email) {
      // No email, create normally
      return prisma.user.create({ data: data as any });
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // User exists - update their info and return them (acts as sign in)
      // This handles the case where an existing user tries to "sign up" with OAuth
      console.log(`Existing user ${data.email} signing in via OAuth signup flow`);
      return prisma.user.update({
        where: { email: data.email },
        data: {
          // Only update name/image if they're not already set
          name: existingUser.name || data.name,
          image: existingUser.image || data.image,
        },
      });
    }

    // New user, create normally
    return prisma.user.create({ data: data as any });
  },
  // Override linkAccount to handle linking to existing users
  async linkAccount(account: any) {
    // Check if this account already exists
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
    });

    if (existingAccount) {
      // Update existing account with new tokens
      return prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        data: {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at,
          id_token: account.id_token,
        },
      });
    }

    // Create new account link
    return prisma.account.create({ data: account });
  },
};

export const authOptions: NextAuthOptions = {
  adapter: customAdapter as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    ...(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET
      ? [
          LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
            issuer: "https://www.linkedin.com/oauth",
            authorization: {
              url: "https://www.linkedin.com/oauth/v2/authorization",
              params: {
                // Request posting permission (w_member_social) along with basic profile scopes
                // This allows users who sign up with LinkedIn to immediately post
                scope: "openid profile email w_member_social",
              },
            },
            token: {
              url: "https://www.linkedin.com/oauth/v2/accessToken",
            },
            userinfo: {
              url: "https://api.linkedin.com/v2/userinfo",
            },
            jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
              };
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // If signing in with LinkedIn, store the access token on the User record for posting
        if (account?.provider === "linkedin" && account.access_token && user.email) {
          try {
            // Calculate token expiry (LinkedIn tokens typically expire in 60 days)
            const tokenExpiry = account.expires_at
              ? new Date(account.expires_at * 1000)
              : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

            // Update or create user with LinkedIn tokens
            await prisma.user.upsert({
              where: { email: user.email },
              update: {
                linkedinAccessToken: account.access_token,
                linkedinRefreshToken: account.refresh_token || null,
                linkedinTokenExpiry: tokenExpiry,
                linkedinUserId: account.providerAccountId,
              },
              create: {
                email: user.email,
                name: user.name,
                image: user.image,
                linkedinAccessToken: account.access_token,
                linkedinRefreshToken: account.refresh_token || null,
                linkedinTokenExpiry: tokenExpiry,
                linkedinUserId: account.providerAccountId,
              },
            });
            console.log(`Stored LinkedIn posting token for ${user.email}`);
          } catch (linkedinTokenError) {
            console.error("Failed to store LinkedIn token (non-fatal):", linkedinTokenError);
          }
        }

        // For OAuth sign-ins, ensure we have the correct user ID from database
        // Note: Account linking is handled by the adapter's linkAccount() method
        if (account?.provider && account.provider !== "credentials" && user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (existingUser) {
            user.id = existingUser.id;
          }
        }

        // Auto-join organization based on email domain (for EXISTING users only)
        // New users are handled in the events.createUser callback
        try {
          const userEmail = user.email?.toLowerCase();
          if (userEmail) {
            const emailDomain = userEmail.split("@")[1];
            if (emailDomain) {
              // Find organization with matching domain
              const organization = await prisma.organization.findUnique({
                where: { domain: emailDomain },
              });

              if (organization) {
                // Get the user's ID (only works for existing users)
                const dbUser = await prisma.user.findUnique({
                  where: { email: userEmail },
                });

                if (dbUser) {
                  // Check if already a member
                  const existingMembership = await prisma.organizationMember.findFirst({
                    where: {
                      organizationId: organization.id,
                      OR: [
                        { userId: dbUser.id },
                        { email: userEmail },
                      ],
                    },
                  });

                  if (!existingMembership) {
                    // Auto-add to organization as MEMBER
                    await prisma.organizationMember.create({
                      data: {
                        organizationId: organization.id,
                        userId: dbUser.id,
                        email: userEmail,
                        role: "MEMBER",
                        inviteStatus: "ACCEPTED",
                        joinedAt: new Date(),
                      },
                    });
                    console.log(`Auto-joined user ${userEmail} to organization ${organization.name}`);
                  } else if (!existingMembership.userId && existingMembership.inviteStatus === "PENDING") {
                    // User had a pending invite - accept it
                    await prisma.organizationMember.update({
                      where: { id: existingMembership.id },
                      data: {
                        userId: dbUser.id,
                        inviteStatus: "ACCEPTED",
                        joinedAt: new Date(),
                        inviteToken: null,
                        inviteTokenExpiry: null,
                      },
                    });
                    console.log(`Auto-accepted pending invite for ${userEmail} to organization ${organization.name}`);
                  }
                }
              }
            }
          }
        } catch (autoJoinError) {
          // Don't fail sign-in if auto-join fails
          console.error("Auto-join error (non-fatal):", autoJoinError);
        }

        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        // Still allow sign-in even if there's an error with account linking
        return true;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      // If we have an account, try to get the user id from the database
      if (account && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    // Auto-join organization when a new user is created via OAuth
    async createUser({ user }) {
      try {
        const userEmail = user.email?.toLowerCase();
        if (!userEmail) return;

        const emailDomain = userEmail.split("@")[1];
        if (!emailDomain) return;

        // Find organization with matching domain
        const organization = await prisma.organization.findUnique({
          where: { domain: emailDomain },
        });

        if (!organization) return;

        // Check if already a member (e.g., from a pending invite)
        const existingMembership = await prisma.organizationMember.findFirst({
          where: {
            organizationId: organization.id,
            OR: [
              { userId: user.id },
              { email: userEmail },
            ],
          },
        });

        if (!existingMembership) {
          // Auto-add to organization as MEMBER
          await prisma.organizationMember.create({
            data: {
              organizationId: organization.id,
              userId: user.id,
              email: userEmail,
              role: "MEMBER",
              inviteStatus: "ACCEPTED",
              joinedAt: new Date(),
            },
          });
          console.log(`Auto-joined new user ${userEmail} to organization ${organization.name}`);
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
          console.log(`Auto-accepted pending invite for new user ${userEmail} to organization ${organization.name}`);
        }
      } catch (error) {
        // Don't fail user creation if auto-join fails
        console.error("Auto-join on user creation error (non-fatal):", error);
      }
    },
  },
};

// Type augmentation for next-auth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
