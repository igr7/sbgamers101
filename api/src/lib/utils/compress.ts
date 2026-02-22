import { promisify } from 'util'
import { gzip, gunzip } from 'zlib'

const gzipAsync = promisify(gzip)
const gunzipAsync = promisify(gunzip)

export async function compress(data: string): Promise<Buffer> {
  return gzipAsync(Buffer.from(data))
}

export async function decompress(data: Buffer): Promise<string> {
  return (await gunzipAsync(data)).toString()
}

export function shouldCompress(data: string, thresholdBytes: number = 1024): boolean {
  return Buffer.byteLength(data, 'utf8') > thresholdBytes
}

export function estimateCompressedSize(originalSize: number): number {
  return Math.floor(originalSize * 0.3)
}