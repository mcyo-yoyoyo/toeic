export type Category =
  | "vocabulary"
  | "grammar"
  | "part5"
  | "part6"
  | "part7"
  | "mock"
  | "review"
  | "baseline";

export type Reason =
  | "vocabulary"
  | "grammar"
  | "comprehension"
  | "careless"
  | "time";

export type Part = "5" | "6" | "7" | "V";

export type TimeMode = 15 | 30 | 60 | 90;

export type TaskSource = "plan" | "minimum" | "coach";

export type DayKind = "baseline" | "study" | "light" | "exam" | "eve";

export type ExamChoice = "dec20" | "nov22" | "both" | "later";

export type Unit =
  | "words"
  | "questions"
  | "passages"
  | "mistakes"
  | "sets"
  | "none";

export interface PlannedTask {
  id: string;
  category: Category;
  title: string;
  detail: string;
  minutes: number;
  quantity: number;
  unit: Unit;
  target?: string;
  resourceId: string;
  importance: 1 | 2 | 3;
  href?: string;
}

export interface DayPlan {
  day: number;
  date: string;
  week: number;
  phase: string;
  focus: string;
  why: string;
  light: boolean;
  kind: DayKind;
  tasks: PlannedTask[];
}

export interface DaySession {
  date: string;
  source: TaskSource;
  mode: TimeMode | "minimum";
  tasks: PlannedTask[];
  focus: string;
  why: string;
  day: number;
  week: number;
  light: boolean;
  phase: string;
  kind: DayKind;
}

export interface Completion {
  completed: boolean;
  completedAt?: string;
  correct?: number;
  total?: number;
  minutesSpent?: number;
  skipped?: boolean;
}

export interface SessionTask extends PlannedTask {
  completed: boolean;
  skipped?: boolean;
  correct?: number;
  total?: number;
  minutesSpent?: number;
}

export interface Baseline {
  completedAt: string;
  readingCorrect: number;
  part5Correct: number;
  part6Correct: number;
  part7Correct: number;
  part5Total?: number;
  part6Total?: number;
  part7Total?: number;
  source?: "full" | "short";
  totalMinutes: number;
  remainingMinutes: number;
  estimate: number;
}

export interface PerformanceEntry {
  id: string;
  date: string;
  day: number;
  category: Category;
  correct: number;
  total: number;
  minutes: number;
}

export interface Mistake {
  id: string;
  date: string;
  part: Part;
  category: string;
  questionId: string;
  reason: Reason;
  notes: string;
  reviewCount: number;
  mastered: boolean;
  nextReview: string;
  lastReviewed?: string;
}

export interface Goal {
  targetScore: number;
  targetDate: string;
}

export interface AppState {
  version: 1;
  goal: Goal;
  baseline: Baseline | null;
  baselineSkipped: boolean;
  completions: Record<string, Completion>;
  sessions: Record<string, DaySession>;
  performance: PerformanceEntry[];
  mistakes: Mistake[];
  seenIds: string[];
  preferredMode: TimeMode;
  modeTouched: boolean;
  resourceCheckedAt: string | null;
  resourceNote: string | null;
  examChoice: ExamChoice | null;
  registrationConfirmed: boolean;
  name: string;
}
