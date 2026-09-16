export type RoomStatus = "OPEN" | "RUNNING" | "PAUSED" | "ENDED";
export type Avatar = { gender: "boy" | "girl"; skin: string; hair: string; hairColor: string; shirt: string; hat: "none" | "cap" | "lab" };
export type ActivityConfig = {
  mode: "PRESET" | "CUSTOM";
  title: string;
  levelIds: number[];
  pointsByLevel: Record<number, number>;
};
export type Student = { id: string; nickname: string; avatar: Avatar; deskId?: string; handRaised: boolean; currentLevel: number; totalScore: number; wrongAttempts: number; completed: number[] };
export type Desk = { id: string; label: string; locked: boolean; occupantId?: string; x: number; y: number };
export type Classroom = { id: string; code: string; name: string; subject: string; layout: "ROWS" | "U_SHAPE" | "GROUPS"; status: RoomStatus; desks: Desk[]; students: Student[]; activity: ActivityConfig; createdAt: string };
