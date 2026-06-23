export interface TripFare {
  tripFareId: number;
  fromGovId: number;
  fromGovernorateName: string;
  toGovId: number;
  toGovernorateName: string;
  stationId: number;
  cityName: string;
  price: number;
  isMainStation: boolean;
  companyId: number;
}

export interface TripFareCreateInput {
  fromGovId: number;
  toGovId: number;
  stationId: number;
  price: number;
  isMainStation: boolean;
}

export interface TripFareUpdateInput {
  price?: number;
  isMainStation?: boolean;
}
