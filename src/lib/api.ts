// src/lib/api.ts
import type { FormValues } from './schema'

export type ApiResult =
  | { ok: true; id: string; message: string }
  | { ok: false; error: string }

function wait(ms: number) {
  return new Promise(res => setTimeout(res, ms))
}


export async function submitSymptoms(data: FormValues): Promise<ApiResult> {
  await wait(1200) 
  if (data.fullName.toLowerCase().includes('test')) {
    return { ok: false, error: 'El nombre no puede contener la palabra "test".' }
  }
  if (Math.random() < 0.15) {
    return { ok: false, error: 'Servicio temporalmente no disponible. Intenta de nuevo.' }
  }
  return { ok: true, id: crypto.randomUUID(), message: 'Registro recibido' }
}