import { ApiResponse } from '../types/api/api-response.type';

export default function isApiResponse(
  // Type 'unknown' can't be used here. We want to check whether type is ApiResponse without narrowing type.
  // Unknown result in error since .success doesn't appear on empty object '{}'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): data is ApiResponse<unknown> {
  return data && data.success !== undefined;
}
