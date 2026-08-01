export type ServiceRecord = Record<string, unknown>

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export function findServiceRecords(value: unknown): ServiceRecord[] {
  const parsed = parseJson(value)
  if (Array.isArray(parsed)) {
    return parsed.filter(
      (item): item is ServiceRecord => !!item && typeof item === 'object' && !Array.isArray(item)
    )
  }
  if (!parsed || typeof parsed !== 'object') return []

  const record = parsed as ServiceRecord
  for (const key of ['data', 'details', 'detail', 'packages', 'products', 'countries', 'items']) {
    const found = findServiceRecords(record[key])
    if (found.length > 0) return found
  }
  return []
}

export function findServiceStrings(value: unknown): string[] {
  const parsed = parseJson(value)
  if (Array.isArray(parsed)) {
    return parsed.filter((item): item is string => typeof item === 'string' && !!item.trim())
  }
  if (!parsed || typeof parsed !== 'object') return []
  const record = parsed as ServiceRecord
  for (const key of ['data', 'details', 'detail', 'countries', 'items']) {
    const found = findServiceStrings(record[key])
    if (found.length > 0) return found
  }
  return []
}

export function readServiceText(record: ServiceRecord, fields: string[]): string {
  for (const field of fields) {
    const value = record[field]
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim()
  }
  return ''
}

export function readServiceAmount(record: ServiceRecord): number {
  const value = readServiceText(record, [
    'amount', 'price', 'sellingPrice', 'selling_price', 'retailPrice', 'retail_price', 'fee',
  ])
  const amount = Number(value.replace(/[^0-9.-]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}
