/**
 * Generic API Wrapper Response Model
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
