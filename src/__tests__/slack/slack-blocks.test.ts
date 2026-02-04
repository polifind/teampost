import { describe, it, expect } from "vitest";
import {
  buildDraftMessage,
  buildScheduleModal,
  buildFeedbackModal,
  buildConfirmationMessage,
  buildGeneratingMessage,
  buildErrorMessage,
  buildWelcomeMessage,
  buildPhotoAddedMessage,
} from "@/lib/slack-blocks";

describe("Slack Block Builders", () => {
  describe("buildDraftMessage", () => {
    it("should create a valid draft message with buttons", () => {
      const message = buildDraftMessage("draft-123", "Test content for LinkedIn post");

      expect(message.text).toBe("Here's your LinkedIn post draft!");
      expect(message.blocks).toBeDefined();
      expect(message.blocks.length).toBeGreaterThan(0);

      // Check for action buttons
      const actionsBlock = message.blocks.find((b) => b.type === "actions");
      expect(actionsBlock).toBeDefined();
      expect(actionsBlock?.elements).toHaveLength(2);

      // Check button action IDs
      const approveButton = actionsBlock?.elements.find(
        (e: { action_id: string }) => e.action_id === "approve_post"
      );
      const regenerateButton = actionsBlock?.elements.find(
        (e: { action_id: string }) => e.action_id === "regenerate_post"
      );
      expect(approveButton).toBeDefined();
      expect(regenerateButton).toBeDefined();
      expect(approveButton?.value).toBe("draft-123");
    });

    it("should show 'Save as Draft' when no schedule is provided", () => {
      const message = buildDraftMessage("draft-123", "Test content");

      const actionsBlock = message.blocks.find((b) => b.type === "actions");
      const approveButton = actionsBlock?.elements.find(
        (e: { action_id: string }) => e.action_id === "approve_post"
      );

      expect(approveButton?.text.text).toBe("✅ Save as Draft");
    });

    it("should show 'Approve & Schedule' when schedule is provided", () => {
      const message = buildDraftMessage("draft-123", "Test content", {
        dayOfWeek: "monday",
        time: "09:00",
        timezone: "est",
      });

      const actionsBlock = message.blocks.find((b) => b.type === "actions");
      const approveButton = actionsBlock?.elements.find(
        (e: { action_id: string }) => e.action_id === "approve_post"
      );

      expect(approveButton?.text.text).toBe("✅ Approve & Schedule");
    });

    it("should format schedule time correctly in AM", () => {
      const message = buildDraftMessage("draft-123", "Test content", {
        dayOfWeek: "tuesday",
        time: "09:30",
        timezone: "pst",
      });

      const headerBlock = message.blocks.find((b) => b.type === "section");
      expect(headerBlock?.text.text).toContain("9:30 AM");
      expect(headerBlock?.text.text).toContain("Tuesday");
      expect(headerBlock?.text.text).toContain("PST");
    });

    it("should format schedule time correctly in PM", () => {
      const message = buildDraftMessage("draft-123", "Test content", {
        dayOfWeek: "friday",
        time: "14:00",
        timezone: "est",
      });

      const headerBlock = message.blocks.find((b) => b.type === "section");
      expect(headerBlock?.text.text).toContain("2:00 PM");
    });

    it("should truncate very long content", () => {
      const longContent = "A".repeat(4000);
      const message = buildDraftMessage("draft-123", longContent);

      const contentBlock = message.blocks.find(
        (b) => b.type === "section" && b.text?.text?.includes("A")
      );

      // Should be truncated (original was 4000 chars, should be much shorter)
      // The truncation adds an indicator message, so total should be around 3000
      expect(contentBlock?.text.text.length).toBeLessThan(3100);
      expect(contentBlock?.text.text.length).toBeLessThan(longContent.length);
      expect(contentBlock?.text.text).toContain("[Content truncated");
    });

    it("should not truncate short content", () => {
      const shortContent = "This is a short post";
      const message = buildDraftMessage("draft-123", shortContent);

      const contentBlock = message.blocks.find(
        (b) => b.type === "section" && b.text?.text?.includes("short")
      );

      expect(contentBlock?.text.text).toBe(shortContent);
    });
  });

  describe("buildScheduleModal", () => {
    it("should create a valid schedule modal", () => {
      const modal = buildScheduleModal("draft-123", "America/New_York");

      expect(modal.type).toBe("modal");
      expect(modal.callback_id).toBe("schedule_post");
      expect(modal.private_metadata).toContain("draft-123");
    });

    it("should include day options", () => {
      const modal = buildScheduleModal("draft-123");

      const dayBlock = modal.blocks.find((b) => b.block_id === "schedule_day");
      expect(dayBlock).toBeDefined();

      const options = dayBlock?.element?.options;
      expect(options).toHaveLength(7);
      expect(options?.[0].value).toBe("monday");
      expect(options?.[6].value).toBe("sunday");
    });

    it("should include time options from 6AM to 9PM", () => {
      const modal = buildScheduleModal("draft-123");

      const timeBlock = modal.blocks.find((b) => b.block_id === "schedule_time");
      expect(timeBlock).toBeDefined();

      const options = timeBlock?.element?.options;
      // 6AM to 9PM (inclusive) = 16 hours, with :00 and :30 = 32 options
      expect(options?.length).toBe(32);

      // First option should be 6:00 AM
      expect(options?.[0].text.text).toBe("6:00 AM");
      expect(options?.[0].value).toBe("06:00");

      // Last option should be 9:30 PM
      expect(options?.[options.length - 1].text.text).toBe("9:30 PM");
      expect(options?.[options.length - 1].value).toBe("21:30");
    });

    it("should display user timezone", () => {
      const modal = buildScheduleModal("draft-123", "America/Los_Angeles");

      const contextBlock = modal.blocks.find((b) => b.type === "context");
      expect(contextBlock?.elements[0].text).toContain("America/Los_Angeles");
    });
  });

  describe("buildFeedbackModal", () => {
    it("should create a valid feedback modal", () => {
      const modal = buildFeedbackModal("draft-123");

      expect(modal.type).toBe("modal");
      expect(modal.callback_id).toBe("regenerate_with_feedback");
      expect(modal.private_metadata).toContain("draft-123");
    });

    it("should have a text input for feedback", () => {
      const modal = buildFeedbackModal("draft-123");

      const inputBlock = modal.blocks.find((b) => b.block_id === "feedback_input");
      expect(inputBlock).toBeDefined();
      expect(inputBlock?.element?.type).toBe("plain_text_input");
      expect(inputBlock?.element?.multiline).toBe(true);
    });
  });

  describe("buildConfirmationMessage", () => {
    it("should show draft saved message when not scheduled", () => {
      const message = buildConfirmationMessage("post-123", false);

      expect(message.text).toBe("Post saved!");
      const sectionBlock = message.blocks.find((b) => b.type === "section");
      expect(sectionBlock?.text.text).toContain("saved as draft");
    });

    it("should show scheduled message with time", () => {
      const message = buildConfirmationMessage("post-123", true, "Monday at 9:00 AM EST");

      expect(message.text).toBe("Post scheduled!");
      const sectionBlock = message.blocks.find((b) => b.type === "section");
      expect(sectionBlock?.text.text).toContain("scheduled for Monday at 9:00 AM EST");
    });

    it("should include post ID in context", () => {
      const message = buildConfirmationMessage("post-123456789", false);

      const contextBlock = message.blocks.find((b) => b.type === "context");
      expect(contextBlock?.elements[0].text).toContain("456789");
    });

    it("should include dashboard link", () => {
      const message = buildConfirmationMessage("post-123", false);

      const linkBlock = message.blocks.find(
        (b) => b.type === "section" && b.text?.text?.includes("dashboard")
      );
      expect(linkBlock?.text.text).toContain("/posts");
    });
  });

  describe("buildGeneratingMessage", () => {
    it("should show generating status", () => {
      const message = buildGeneratingMessage();

      expect(message.text).toContain("Generating");
      const sectionBlock = message.blocks.find((b) => b.type === "section");
      expect(sectionBlock?.text.text).toContain("5-10 seconds");
    });
  });

  describe("buildErrorMessage", () => {
    it("should display error message", () => {
      const message = buildErrorMessage("Something went wrong with the API");

      expect(message.text).toContain("Error");
      const sectionBlock = message.blocks.find((b) => b.type === "section");
      expect(sectionBlock?.text.text).toContain("Something went wrong with the API");
    });
  });

  describe("buildWelcomeMessage", () => {
    it("should display welcome information", () => {
      const message = buildWelcomeMessage();

      expect(message.text).toContain("LinkedIn ghostwriter");

      // Should have sections explaining features
      const instructionBlock = message.blocks.find(
        (b) => b.type === "section" && b.text?.text?.includes("Share an idea")
      );
      expect(instructionBlock).toBeDefined();
      expect(instructionBlock?.text.text).toContain("Attach photos");
      expect(instructionBlock?.text.text).toContain("Schedule");
    });
  });

  describe("buildPhotoAddedMessage", () => {
    it("should show message for photo attached to draft", () => {
      const message = buildPhotoAddedMessage("https://example.com/photo.jpg", true);

      expect(message.text).toContain("attached to draft");
      const sectionBlock = message.blocks.find((b) => b.type === "section");
      expect(sectionBlock?.text.text).toContain("attached to your draft");
    });

    it("should show message for photo saved to library", () => {
      const message = buildPhotoAddedMessage("https://example.com/photo.jpg", false);

      expect(message.text).toContain("saved to library");
      const sectionBlock = message.blocks.find((b) => b.type === "section");
      expect(sectionBlock?.text.text).toContain("photo library");
    });

    it("should include image block with URL", () => {
      const imageUrl = "https://example.com/photo.jpg";
      const message = buildPhotoAddedMessage(imageUrl, false);

      const imageBlock = message.blocks.find((b) => b.type === "image");
      expect(imageBlock).toBeDefined();
      expect(imageBlock?.image_url).toBe(imageUrl);
    });
  });
});
