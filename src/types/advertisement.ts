/**
 * Promotional and Campaign Advertisement model
 */
export interface Advertisement {
  advertisementID?: number;
  accountID?: number;
  account_Email?: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDateAds: string;
  endDateAds: string;
  adsStatus: number | string;
  createdAt?: string;
}
