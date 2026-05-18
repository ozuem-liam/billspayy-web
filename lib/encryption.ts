/**
 * AES-256-GCM payload encryption using the native Web Crypto API.
 * No extra npm packages required.
 *
 * Controlled by NEXT_PUBLIC_ENCRYPTION_ENABLED=true.
 * When disabled all functions are transparent pass-throughs.
 */

const KEY_HEX = process.env.NEXT_PUBLIC_ENCRYPTION_KEY ?? ''
const ENABLED = process.env.NEXT_PUBLIC_ENCRYPTION_ENABLED === 'true'

let _cachedKey: CryptoKey | null = null

async function getKey(): Promise<CryptoKey> {
  if (_cachedKey) return _cachedKey
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error('NEXT_PUBLIC_ENCRYPTION_KEY must be a 64-character hex string')
  }
  const raw = new Uint8Array(KEY_HEX.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
  _cachedKey = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
  return _cachedKey
}

function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return new Uint8Array(bytes.buffer as ArrayBuffer)
}

export interface EncryptedPayload {
  _enc: true
  iv: string
  data: string
  tag: string
}

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  const v = value as any
  return v?._enc === true && typeof v.iv === 'string' && typeof v.data === 'string' && typeof v.tag === 'string'
}

/**
 * Encrypts a request body object before sending to the backend.
 * Returns the original value unchanged if encryption is disabled.
 */
export async function encryptPayload(data: unknown): Promise<unknown> {
  if (!ENABLED || data === undefined || data === null) return data

  const key = await getKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(JSON.stringify(data))

  // AES-GCM output = ciphertext + 16-byte auth tag (appended by Web Crypto)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)

  const ciphertext = encrypted.slice(0, encrypted.byteLength - 16)
  const tag = encrypted.slice(encrypted.byteLength - 16)

  return {
    _enc: true,
    iv: toBase64(iv),
    data: toBase64(ciphertext),
    tag: toBase64(tag),
  } satisfies EncryptedPayload
}

/**
 * Decrypts a response body from the backend.
 * Returns the original value unchanged if it is not an encrypted payload.
 */
export async function decryptResponse(payload: unknown): Promise<unknown> {
  if (!ENABLED || !isEncryptedPayload(payload)) return payload

  const key = await getKey()
  const iv = fromBase64(payload.iv)
  const ciphertext = fromBase64(payload.data)
  const tag = fromBase64(payload.tag)

  // Web Crypto expects ciphertext + tag concatenated
  const combined = new Uint8Array(new ArrayBuffer(ciphertext.length + tag.length))
  combined.set(ciphertext)
  combined.set(tag, ciphertext.length)

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, combined)
  return JSON.parse(new TextDecoder().decode(decrypted))
}
