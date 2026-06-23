export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export const createInitialResponse = <T>(initialData: T | null = null): ApiResponse<T> => ({
  data: initialData,
  error: null,
  status: 'idle',
});
