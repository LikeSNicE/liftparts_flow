// Типы статусов заявки

import type { PartOption } from "./PartsRequestTypes";

// Типы заявок
export type RepairRequestType = "planned" | "emergency";

// Типы статусов заявки
export type RepairRequestStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "completed"
  | "rejected";

// Интерфейс заявки
export interface RepairRequest {
  id: number;
  author: string;
  authorId: number;
  status: RepairRequestStatus;
  liftId: number;
  type: RepairRequestType;
  parts: PartOption[];
  selectedProblems?: string[];
  emergencyOtherProblem?: string;
  objectAddress: string;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NewRepairRequest = Omit<RepairRequest, "id">;

// Форма создания/редактирования заявки
export type RepairRequestForm = Omit<
  RepairRequest,
  "id" | "createdAt" | "updatedAt"
>;
