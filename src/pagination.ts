export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function parsePaginatedResponse<T>(
  body: Record<string, unknown>,
): PaginatedResponse<T> {
  const data = (body.data as T[]) || [];
  const rawMeta = (body.meta as Record<string, number>) || {};
  return {
    data,
    meta: {
      total: rawMeta.total || 0,
      page: rawMeta.page || 1,
      limit: rawMeta.limit || 20,
      total_pages: rawMeta.total_pages || 0,
    },
  };
}
