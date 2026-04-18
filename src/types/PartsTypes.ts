export interface Part {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  status: string;
}

export interface PartsRequestItem {
  partId: number;
  partName: string;
  quantity: number;
}
