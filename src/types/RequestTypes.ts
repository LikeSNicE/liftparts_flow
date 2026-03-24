// Типы статусов заявки
export type RequestStatus = "pending" | "in_progress" | "approved" | "rejected" | "completed";

// Типы заявок
export type RequestType = "planned" | "emergency";

// Интерфейс заявки
export interface Request {
  id: number;
  title: string;
  author: string;
  authorId: number;
  status: RequestStatus;
  liftId: string;
  type: RequestType;
  partName: string;
  quantity: number;
  objectAddress: string;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

// Форма создания/редактирования заявки
export type RequestForm = Omit<Request, "id" | "createdAt" | "updatedAt">;
