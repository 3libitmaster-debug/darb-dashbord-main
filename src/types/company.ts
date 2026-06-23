export interface Company {
  id: number;
  name: string;
  address: string;
  fleetCapacity: number;
  dailyTickets: number;
  status: 'active' | 'inactive';
}
