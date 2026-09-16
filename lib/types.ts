export type RoomStatus = "OPEN" | "RUNNING" | "PAUSED" | "ENDED";
export type Avatar = { gender: "boy" | "girl"; skin: string; hair: string; hairColor: string; shirt: string; hat: "none" | "cap" | "lab" };
export type ActivityConfig = {
  mode: "PRESET" | "CUSTOM" | "QUESTIONS";
  title: string;
  levelIds: number[];
  pointsByLevel: Record<number, number>;
  hintsEnabled?: boolean;
  customQuestions?: CustomQuestion[];
};
export type CustomQuestion = { id: number; title: string; mixture: string; objective: string; equipment: { id: string; label: string }[]; maxPoints: number; correctPoints: number; wrongPenalty: number };
export type TeacherProfile = { nickname: string; avatar: "flask" | "atom" | "book"; color: "cyan" | "navy" | "gold" };
export type Student = { id: string; nickname: string; avatar: Avatar; deskId?: string; handRaised: boolean; currentLevel: number; totalScore: number; wrongAttempts: number; attemptsByLevel?: Record<number,number>; completed: number[]; skipped?: number[] };
export type Desk = { id: string; label: string; locked: boolean; occupantId?: string; x: number; y: number };
export type Classroom = { id: string; code: string; name: string; subject: string; layout: "ROWS" | "U_SHAPE" | "GROUPS"; status: RoomStatus; gameStartsAt?: number; catalogVersion?: 2; desks: Desk[]; students: Student[]; activity: ActivityConfig; createdAt: string };
