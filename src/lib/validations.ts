import { z } from "zod";

/**
 * Shared Zod schemas for API input validation
 *
 * Usage in API routes:
 * ```ts
 * import { postSchema } from "@/lib/validations";
 *
 * const body = await request.json();
 * const result = postSchema.safeParse(body);
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
 * }
 * const { content, imageUrl } = result.data;
 * ```
 */

// === Post Schemas ===

export const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(3000, "Post content must be under 3000 characters"),
  imageUrl: z.string().url().optional().nullable(),
});

export const postUpdateSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(3000, "Post content must be under 3000 characters")
    .optional(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(["DRAFT", "SCHEDULED", "POSTED", "FAILED"]).optional(),
});

export const postRegenerateSchema = z.object({
  feedback: z.string().max(500, "Feedback must be under 500 characters").optional(),
});

// === Schedule Schemas ===

export const scheduleCreateSchema = z.object({
  dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

export const scheduleUpdateSchema = z.object({
  scheduledFor: z.string().datetime({ message: "Invalid datetime format" }),
  imageUrl: z.string().url().optional().nullable(),
});

// === Library Schemas ===

export const libraryItemSchema = z.object({
  url: z.string().url("Invalid URL").optional(),
  content: z.string().max(50000, "Content too large").optional(),
  title: z.string().max(200, "Title too long").optional(),
  type: z.enum(["URL", "FILE", "TEXT", "SCREENSHOT"]).optional(),
});

// === User Settings Schemas ===

export const userSettingsSchema = z.object({
  timezone: z.string().max(50).optional(),
  writingGuidelines: z.string().max(5000, "Guidelines too long").optional(),
  name: z.string().max(100).optional(),
});

// === Conversation Schemas ===

export const conversationResponseSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  message: z.string().min(1, "Message is required").max(10000, "Message too long"),
});

// === Photo Schemas ===

export const photoUploadSchema = z.object({
  filename: z.string().max(255).optional(),
  source: z.enum(["UPLOAD", "SLACK", "LIBRARY"]).optional(),
});

// === Slack Schemas ===

export const slackEventSchema = z.object({
  type: z.string(),
  challenge: z.string().optional(),
  event: z
    .object({
      type: z.string(),
      user: z.string().optional(),
      text: z.string().optional(),
      channel: z.string().optional(),
      files: z.array(z.any()).optional(),
    })
    .optional(),
});

// === Helper function for API routes ===

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.flatten();
    const errorMessage =
      Object.values(errors.fieldErrors).flat().join(", ") ||
      errors.formErrors.join(", ") ||
      "Validation failed";
    return { success: false, error: errorMessage };
  }
  return { success: true, data: result.data };
}
