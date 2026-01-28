export interface Question {
  id: number;
  text: string;
  shortTitle: string;
  prompt: string; // Used for AI generation context
}

export const QUESTIONS: Question[] = [
  // Set 1: Core Career Stories (Questions 0-9)
  {
    id: 0,
    text: "Tell me about a significant career turning point or decision you made",
    shortTitle: "Career Turning Point",
    prompt: "A pivotal career decision or turning point",
  },
  {
    id: 1,
    text: "Describe a failure or setback that taught you an important lesson",
    shortTitle: "Lessons from Failure",
    prompt: "A failure or setback and the lessons learned",
  },
  {
    id: 2,
    text: "What's the best professional advice you've ever received?",
    shortTitle: "Best Advice",
    prompt: "Valuable professional advice received",
  },
  {
    id: 3,
    text: "Tell me about a mentor or person who significantly influenced your career",
    shortTitle: "Career Mentor",
    prompt: "A mentor or influential person in their career",
  },
  {
    id: 4,
    text: "Describe a time you took a risk that paid off",
    shortTitle: "Risk That Paid Off",
    prompt: "A professional risk that led to success",
  },
  {
    id: 5,
    text: "What's a common misconception in your industry that you'd like to address?",
    shortTitle: "Industry Misconception",
    prompt: "A misconception in their industry",
  },
  {
    id: 6,
    text: "Tell me about a recent win or accomplishment you're proud of",
    shortTitle: "Recent Win",
    prompt: "A recent professional accomplishment",
  },
  {
    id: 7,
    text: "What habit or routine has been most impactful for your productivity?",
    shortTitle: "Productivity Habit",
    prompt: "A productivity habit or routine",
  },
  {
    id: 8,
    text: "Describe a challenge you're currently working through",
    shortTitle: "Current Challenge",
    prompt: "A current professional challenge",
  },
  {
    id: 9,
    text: "What would you tell your younger self about building a career?",
    shortTitle: "Advice to Younger Self",
    prompt: "Career advice for their younger self",
  },

  // Set 2: Leadership & Team Dynamics (Questions 10-19)
  {
    id: 10,
    text: "What's the hardest decision you've had to make as a leader or team member?",
    shortTitle: "Hardest Decision",
    prompt: "A difficult leadership or team decision",
  },
  {
    id: 11,
    text: "Tell me about a time you had to have a difficult conversation at work",
    shortTitle: "Difficult Conversation",
    prompt: "A challenging workplace conversation",
  },
  {
    id: 12,
    text: "What's something you believed early in your career that you've completely changed your mind about?",
    shortTitle: "Changed Belief",
    prompt: "A professional belief they've changed",
  },
  {
    id: 13,
    text: "Describe a project or initiative that didn't go as planned - what did you learn?",
    shortTitle: "Project Gone Wrong",
    prompt: "A project that didn't go as planned",
  },
  {
    id: 14,
    text: "What's a skill you wish you had learned earlier in your career?",
    shortTitle: "Skill I Wish I Had",
    prompt: "A skill they wish they learned earlier",
  },
  {
    id: 15,
    text: "Tell me about someone you hired or worked with who surprised you",
    shortTitle: "Surprising Colleague",
    prompt: "A colleague who exceeded expectations",
  },
  {
    id: 16,
    text: "What's the most important thing you look for when building a team?",
    shortTitle: "Team Building",
    prompt: "What they value in team members",
  },
  {
    id: 17,
    text: "Describe a moment when you felt like giving up - what kept you going?",
    shortTitle: "Almost Gave Up",
    prompt: "A moment of perseverance",
  },
  {
    id: 18,
    text: "What's a controversial opinion you have about your industry?",
    shortTitle: "Controversial Take",
    prompt: "A contrarian industry opinion",
  },
  {
    id: 19,
    text: "Tell me about a time you received feedback that was hard to hear but valuable",
    shortTitle: "Hard Feedback",
    prompt: "Valuable but difficult feedback",
  },

  // Set 3: Growth & Learning (Questions 20-29)
  {
    id: 20,
    text: "What book, podcast, or resource has most influenced your professional life?",
    shortTitle: "Influential Resource",
    prompt: "A resource that shaped their career",
  },
  {
    id: 21,
    text: "Describe a moment when you realized you were in the right career",
    shortTitle: "Right Career Moment",
    prompt: "A career confirmation moment",
  },
  {
    id: 22,
    text: "What's something you're learning right now that excites you?",
    shortTitle: "Currently Learning",
    prompt: "Something they're learning now",
  },
  {
    id: 23,
    text: "Tell me about a time you had to learn something completely new for your job",
    shortTitle: "Learning on the Job",
    prompt: "Rapid learning for a job requirement",
  },
  {
    id: 24,
    text: "What's the best investment you've made in yourself?",
    shortTitle: "Self Investment",
    prompt: "A valuable personal investment",
  },
  {
    id: 25,
    text: "Describe a time when saying 'no' to an opportunity was the right decision",
    shortTitle: "Saying No",
    prompt: "A beneficial declined opportunity",
  },
  {
    id: 26,
    text: "What's a mistake you see people make repeatedly in your field?",
    shortTitle: "Common Mistake",
    prompt: "A recurring industry mistake",
  },
  {
    id: 27,
    text: "Tell me about a partnership or collaboration that changed your perspective",
    shortTitle: "Transformative Partnership",
    prompt: "A perspective-changing collaboration",
  },
  {
    id: 28,
    text: "What do you wish more people understood about your job?",
    shortTitle: "Misunderstood Aspects",
    prompt: "Misunderstandings about their job",
  },
  {
    id: 29,
    text: "Describe a time when you had to adapt quickly to a major change",
    shortTitle: "Adapting to Change",
    prompt: "Rapid adaptation to change",
  },

  // Set 4: Values & Purpose (Questions 30-39)
  {
    id: 30,
    text: "What motivates you to keep pushing forward in your career?",
    shortTitle: "Career Motivation",
    prompt: "What drives their career ambition",
  },
  {
    id: 31,
    text: "Tell me about a time you stood up for something you believed in at work",
    shortTitle: "Standing Your Ground",
    prompt: "Taking a principled stand at work",
  },
  {
    id: 32,
    text: "What legacy do you want to leave in your industry?",
    shortTitle: "Career Legacy",
    prompt: "Their desired professional legacy",
  },
  {
    id: 33,
    text: "Describe a moment when you helped someone else succeed",
    shortTitle: "Helping Others",
    prompt: "Enabling someone else's success",
  },
  {
    id: 34,
    text: "What's the most important lesson you've learned about work-life balance?",
    shortTitle: "Work-Life Balance",
    prompt: "Lessons about balance",
  },
  {
    id: 35,
    text: "Tell me about a time when you had to rebuild trust with someone at work",
    shortTitle: "Rebuilding Trust",
    prompt: "Repairing a professional relationship",
  },
  {
    id: 36,
    text: "What's something you're proud of that most people don't know about?",
    shortTitle: "Hidden Achievement",
    prompt: "An unknown accomplishment",
  },
  {
    id: 37,
    text: "Describe your approach to handling conflict in the workplace",
    shortTitle: "Handling Conflict",
    prompt: "Workplace conflict resolution",
  },
  {
    id: 38,
    text: "What's the most meaningful compliment you've received in your career?",
    shortTitle: "Meaningful Compliment",
    prompt: "A career-defining compliment",
  },
  {
    id: 39,
    text: "Tell me about a time you had to make a decision with incomplete information",
    shortTitle: "Uncertain Decision",
    prompt: "Decision-making under uncertainty",
  },

  // Set 5: Innovation & Future (Questions 40-49)
  {
    id: 40,
    text: "What trend in your industry do you think is overrated? Underrated?",
    shortTitle: "Industry Trends",
    prompt: "Over/underrated industry trends",
  },
  {
    id: 41,
    text: "Describe an idea you had that others initially doubted",
    shortTitle: "Doubted Idea",
    prompt: "An idea that faced initial skepticism",
  },
  {
    id: 42,
    text: "What's the biggest opportunity you see in your industry right now?",
    shortTitle: "Industry Opportunity",
    prompt: "Current industry opportunities",
  },
  {
    id: 43,
    text: "Tell me about a time you had to unlearn something to move forward",
    shortTitle: "Unlearning",
    prompt: "Unlearning to progress",
  },
  {
    id: 44,
    text: "What prediction do you have about the future of your field?",
    shortTitle: "Future Prediction",
    prompt: "A prediction about their field",
  },
  {
    id: 45,
    text: "Describe a time when you connected dots that others didn't see",
    shortTitle: "Connecting Dots",
    prompt: "Seeing unique connections",
  },
  {
    id: 46,
    text: "What's the most undervalued skill in your profession?",
    shortTitle: "Undervalued Skill",
    prompt: "An underappreciated professional skill",
  },
  {
    id: 47,
    text: "Tell me about a time you had to pivot your strategy mid-project",
    shortTitle: "Mid-Project Pivot",
    prompt: "A strategic pivot during execution",
  },
  {
    id: 48,
    text: "What would you build or create if you had unlimited resources?",
    shortTitle: "Dream Project",
    prompt: "An aspirational project idea",
  },
  {
    id: 49,
    text: "Describe a small win that meant more to you than a big achievement",
    shortTitle: "Meaningful Small Win",
    prompt: "A significant small victory",
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
export const BATCH_SIZE = 5;
