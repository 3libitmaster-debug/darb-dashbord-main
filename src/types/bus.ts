export interface Bus {
  busId: number;
  plateNumber: string;
  model: string;
  capacity: number;
  status: 'Available' | 'OnTrip' | 'Maintenance' | 'UnderMaintenance' | string;
}
