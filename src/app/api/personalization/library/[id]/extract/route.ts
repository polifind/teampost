import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import * as cheerio from "cheerio";

// Lazy initialization to avoid build errors when ANTHROPIC_API_KEY is not set
let _anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return _anthropic;
}

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Extract content from YouTube
async function extractYouTube(url: string): Promise<{ title: string; content: string }> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  // Get video info via oEmbed first
  let title = `YouTube Video: ${videoId}`;
  let authorName = "";
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = await response.json();
      title = data.title || title;
      authorName = data.author_name || "";
    }
  } catch {
    // Keep default title
  }

  // Try to get transcript using YouTube's timedtext API directly
  let fullText = "";
  try {
    console.log(`[YouTube Extract] Fetching transcript for video: ${videoId}`);

    // Fetch the video page to find caption tracks
    const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (videoPageResponse.ok) {
      const html = await videoPageResponse.text();

      // Look for caption track URL in the page
      const captionMatch = html.match(/"captionTracks":\s*\[([^\]]+)\]/);
      if (captionMatch) {
        // Find English caption URL
        const captionData = captionMatch[1];
        const urlMatch = captionData.match(/"baseUrl":\s*"([^"]+)"/);

        if (urlMatch) {
          const captionUrl = urlMatch[1].replace(/\\u0026/g, "&");
          console.log(`[YouTube Extract] Found caption URL, fetching...`);

          // Fetch the captions
          const captionResponse = await fetch(captionUrl);
          if (captionResponse.ok) {
            const captionXml = await captionResponse.text();
            // Parse the XML to extract text
            const textMatches = captionXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
            const texts: string[] = [];
            for (const match of textMatches) {
              // Decode HTML entities
              const text = match[1]
                .replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/\n/g, " ");
              if (text.trim()) {
                texts.push(text.trim());
              }
            }
            fullText = texts.join(" ");
            console.log(`[YouTube Extract] Got transcript, length: ${fullText.length} chars`);
          }
        }
      }
    }
  } catch (transcriptError) {
    console.log("[YouTube Extract] Transcript not available for video:", videoId, transcriptError);
    // Continue without transcript - we'll use video metadata
  }

  // If no transcript, create content from video metadata
  if (!fullText) {
    console.log(`[YouTube Extract] No transcript available, using metadata for: ${videoId}`);
    // Fetch video page to get description
    try {
      const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        // Try to extract description from meta tags
        const descMatch = html.match(/<meta name="description" content="([^"]*)"/) ||
                          html.match(/<meta property="og:description" content="([^"]*)"/);
        if (descMatch && descMatch[1]) {
          fullText = `Video: ${title}\n\nDescription: ${descMatch[1]}`;
          if (authorName) {
            fullText += `\n\nChannel: ${authorName}`;
          }
        }
      }
    } catch {
      // Ignore page fetch errors
    }

    // If still no content, use just the title and metadata
    if (!fullText) {
      fullText = `YouTube Video Title: ${title}`;
      if (authorName) {
        fullText += `\nChannel: ${authorName}`;
      }
      fullText += `\n\nNote: This video does not have a transcript available. The ghostwriter will use the video title and metadata to understand the topic.`;
    }
  }

  return { title, content: fullText };
}

// Extract content from a web link
async function extractLink(url: string): Promise<{ title: string; content: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TeamPostBot/1.0)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove script and style elements
  $("script, style, nav, footer, header, aside").remove();

  // Extract title
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    url;

  // Extract main content
  const contentSelectors = [
    "article",
    "main",
    ".content",
    ".post-content",
    ".article-content",
    "#content",
    ".entry-content",
  ];

  let content = "";
  for (const selector of contentSelectors) {
    const selected = $(selector);
    if (selected.length > 0) {
      content = selected.text().trim();
      break;
    }
  }

  // Fallback to body
  if (!content) {
    content = $("body").text().trim();
  }

  // Clean up whitespace
  content = content.replace(/\s+/g, " ").substring(0, 50000);

  return { title: title.trim(), content };
}

// Extract content from PDF
async function extractPDF(fileUrl: string): Promise<{ content: string }> {
  // pdf-parse has inconsistent exports, so we handle both cases
  const pdfParseModule = await import("pdf-parse");
  const pdfParse = (pdfParseModule as { default?: (buffer: Buffer) => Promise<{ text: string }> }).default || pdfParseModule;

  const response = await fetch(fileUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const data = await (pdfParse as (buffer: Buffer) => Promise<{ text: string }>)(buffer);

  return { content: data.text.substring(0, 100000) };
}

// Extract content from DOCX
async function extractDOCX(fileUrl: string): Promise<{ content: string }> {
  const mammoth = await import("mammoth");

  const response = await fetch(fileUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const result = await mammoth.extractRawText({ buffer });

  return { content: result.value.substring(0, 100000) };
}

// Summarize content using Claude
async function summarizeContent(
  content: string,
  type: string,
  title: string
): Promise<{ summary: string; extractedContent: string }> {
  // Truncate content if too long
  const truncatedContent = content.substring(0, 30000);

  const response = await getAnthropicClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are analyzing content from a user's personal library to help a ghostwriter create personalized LinkedIn posts. Extract the key information that would be useful for writing posts.

Source: ${type} - "${title}"

Content:
${truncatedContent}

Please provide:
1. A SHORT SUMMARY (2-3 sentences) for display purposes
2. KEY CONTENT extracted that could inspire LinkedIn posts:
   - Main topics/themes
   - Personal stories or anecdotes
   - Achievements or milestones
   - Insights or lessons learned
   - Quotable statements
   - Interesting facts or data

Format your response as:

SUMMARY:
[Your 2-3 sentence summary]

KEY CONTENT:
[Bullet points of key information for post creation]`,
      },
    ],
  });

  const responseText =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Parse summary and key content
  const summaryMatch = responseText.match(/SUMMARY:\s*([\s\S]*?)(?=KEY CONTENT:|$)/);
  const keyContentMatch = responseText.match(/KEY CONTENT:\s*([\s\S]*?)$/);

  const summary = summaryMatch
    ? summaryMatch[1].trim()
    : responseText.substring(0, 200);
  const extractedContent = keyContentMatch
    ? keyContentMatch[1].trim()
    : responseText;

  return { summary, extractedContent };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the item ID from params
    const { id } = await params;

    // Get the library item
    const item = await prisma.lifeLibraryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if already processed
    if (item.processingStatus === "COMPLETED") {
      return NextResponse.json({
        message: "Already processed",
        item,
      });
    }

    // Mark as processing
    await prisma.lifeLibraryItem.update({
      where: { id },
      data: { processingStatus: "PROCESSING" },
    });

    try {
      let title = item.title || "";
      let content = "";

      // Extract based on type
      switch (item.type) {
        case "YOUTUBE":
          if (!item.sourceUrl) throw new Error("No source URL");
          const ytResult = await extractYouTube(item.sourceUrl);
          title = ytResult.title;
          content = ytResult.content;
          break;

        case "LINK":
          if (!item.sourceUrl) throw new Error("No source URL");
          const linkResult = await extractLink(item.sourceUrl);
          title = linkResult.title;
          content = linkResult.content;
          break;

        case "PDF":
          if (!item.fileUrl) throw new Error("No file URL");
          const pdfResult = await extractPDF(item.fileUrl);
          content = pdfResult.content;
          break;

        case "DOCX":
          if (!item.fileUrl) throw new Error("No file URL");
          const docxResult = await extractDOCX(item.fileUrl);
          content = docxResult.content;
          break;

        default:
          throw new Error(`Unsupported type: ${item.type}`);
      }

      // Summarize using Claude
      const { summary, extractedContent } = await summarizeContent(
        content,
        item.type,
        title
      );

      // Update item with extracted content
      const updatedItem = await prisma.lifeLibraryItem.update({
        where: { id },
        data: {
          title,
          extractedContent,
          extractedSummary: summary,
          processingStatus: "COMPLETED",
          processingError: null,
        },
      });

      return NextResponse.json({
        success: true,
        item: updatedItem,
      });
    } catch (extractError) {
      // Mark as failed
      const errorMessage =
        extractError instanceof Error
          ? extractError.message
          : "Unknown extraction error";

      await prisma.lifeLibraryItem.update({
        where: { id },
        data: {
          processingStatus: "FAILED",
          processingError: errorMessage,
        },
      });

      console.error("Extraction error:", extractError);
      return NextResponse.json(
        { error: "Extraction failed", details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in extraction route:", error);
    return NextResponse.json(
      { error: "Failed to process extraction" },
      { status: 500 }
    );
  }
}
