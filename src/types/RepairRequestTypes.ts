// Типы статусов заявки

export interface PartOption {
  partName: string;
  quantity: number;
}

// Типы заявок
export type RepairRequestType = "planned" | "emergency";

// Типы статусов заявки
export type RepairRequestStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "completed"
  | "rejected";

// Типы сихнонизации статуса с монитором
export type MonitorSyncStatus = "pending" | "synced" | "failed";

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
  city?: string;
  latitude?: number | null;
  longitude?: number | null;
  monitorRequestId?: string;
  monitorSyncStatus?: MonitorSyncStatus;
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
