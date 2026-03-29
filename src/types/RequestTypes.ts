// Типы статусов заявки
export type RequestStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected"
  | "completed";

// Типы заявок
export type RequestType = "planned" | "emergency";

export interface PartOption {
  partName: string;
  quantity: string;
}

// Интерфейс заявки
export interface Request {
  id: number;
  author: string;
  authorId: number;
  status: RequestStatus;
  liftId: number;
  type: RequestType;
  parts: PartOption[];
  selectedProblems?: string[];
  emergencyOtherProblem?: string;
  objectAddress: string;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NewRequest = Omit<Request, "id">;

// Форма создания/редактирования заявки
export type RequestForm = Omit<Request, "id" | "createdAt" | "updatedAt">;
