// types/PartsRequestTypes.ts - Заявки на запчасти

import type { PartsRequestItem } from "./PartsTypes";

export type PartsRequestStatus =
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected"
  | "completed";

export type PartsRequestUrgency = "low" | "medium" | "high";


export interface PartsRequest {
  id: number;
  author: string;
  authorId: number;
  status: PartsRequestStatus;

  // Специфично для запчастей
  parts: PartsRequestItem[];
  purpose: string; // Для чего нужны запчасти
  urgency: PartsRequestUrgency;

  // Опционально связь с ремонтом
  relatedRepairRequestId?: number;
  liftId?: number;
  objectAddress?: string;

  // Складские данные
  approvedBy?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  issuedTo?: number; // кому выдано
  issuedToName?: string; // имя получателя
  issuedAt?: string; // когда выдано

  comment?: string;
  createdAt: string;
  updatedAt?: string;
}

export type NewPartsRequest = Omit<PartsRequest, "id">;

export type PartsRequestForm = Omit<
  PartsRequest,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "approvedBy"
  | "approvedByName"
  | "approvedAt"
  | "rejectionReason"
  | "issuedTo"
  | "issuedToName"
  | "issuedAt"
>;
