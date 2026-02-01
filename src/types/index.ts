// Type definitions for TeamPost

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  linkedInConnected: boolean;
  onboardingCompleted: boolean;
}

export interface VoiceNote {
  id: string;
  questionIndex: number;
  questionText: string;
  transcription?: string;
  duration?: number;
  createdAt: Date;
}

export interface Post {
  id: string;
  content: string;
  weekNumber: number;
  status: PostStatus;
  linkedinPostId?: string;
  likes: number;
  comments: number;
  shares: number;
  schedule?: Schedule;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  scheduledFor: Date;
  postedAt?: Date;
  status: ScheduleStatus;
  error?: string;
}

export type PostStatus = "DRAFT" | "SCHEDULED" | "POSTED" | "FAILED";
export type ScheduleStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface DashboardData {
  postsCount: number;
  scheduledCount: number;
  postedCount: number;
  linkedInConnected: boolean;
  onboardingCompleted: boolean;
}

export interface Question {
  id: number;
  text: string;
  shortTitle: string;
  prompt: string;
}

export interface LinkedInContact {
  id: string;
  type: "PERSON" | "COMPANY";
  linkedinUrl: string;
  linkedinUrn: string | null;
  name: string;
  headline: string | null;
  profileImageUrl: string | null;
  usageCount: number;
}

export interface LibraryPhoto {
  id: string;
  imageUrl: string;
  filename: string | null;
  usageCount: number;
}
