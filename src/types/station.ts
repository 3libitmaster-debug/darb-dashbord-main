export interface Station {
  stationId: number;
  address: string;
  cityId: number;
  cityName: string;
  governorateId: number;
  governorateName: string;
  companyId: number;
}

export interface StationCreateInput {
  address: string;
  cityId: number;
  governorateId: number;
}

export interface StationUpdateInput {
  address?: string;
  cityId?: number;
  governorateId?: number;
}
