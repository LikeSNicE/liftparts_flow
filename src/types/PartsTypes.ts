export interface Part {
  id: number;
  name: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

export interface PartsRequestItem {
  partId: number;
  partName: string;
  quantity: number;
}
