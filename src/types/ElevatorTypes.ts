export interface Elevator {
  id: number;
  name: string;
  model: string;
  serial_number: string;
  location: string;
  floors: number;
  capacity: number;
  status: ElevatorsStatus;
  current_floor: number;
  installation_date: string;
  last_maintenance: string;
  next_maintenance: string;
  manufacturer: string;
  is_active: boolean;
  max_speed: number;
  door_type: ElevatorDoorType;
  drive_type: ElevatorDriveType;
}

export type ElevatorsStatus = "active" | "inactive" | "maintenance";
export type ElevatorDoorType = "automatic" | "manual";
export type ElevatorDriveType = "electric" | "hydraulic" | "pneumatic";


