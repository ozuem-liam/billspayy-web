import axios from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string; data?: { message?: string } }>(error)) {
    return error.response?.data?.message ?? error.response?.data?.data?.message ?? fallback
  }
  return error instanceof Error ? error.message : fallback
}
