/**
 * City model within a governorate boundary
 */
export interface City {
  id: number;
  name: string;
  governorateId: number;
  governorateName: string;
}
