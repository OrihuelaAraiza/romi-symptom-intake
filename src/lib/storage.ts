import type { FormValues } from './schema'

const KEY = 'romi:lastSubmission'
const PREFS = 'romi:a11y'

export function saveSubmission(data: FormValues) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}
export function loadLastSubmission(): FormValues | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as FormValues
  } catch {
    return null
  }
}

/** Preferencias de accesibilidad */
export type A11yPrefs = {
  font: 'md' | 'lg' | 'xl'
  contrast: 'normal' | 'high'
  motion: 'normal' | 'reduced'
}

export function loadA11yPrefs(): A11yPrefs {
  try {
    const raw = localStorage.getItem(PREFS)
    if (!raw) return { font: 'md', contrast: 'normal', motion: 'normal' }
    const parsed = JSON.parse(raw) as Partial<A11yPrefs>
    return {
      font: parsed.font ?? 'md',
      contrast: parsed.contrast ?? 'normal',
      motion: parsed.motion ?? 'normal'
    }
  } catch {
    return { font: 'md', contrast: 'normal', motion: 'normal' }
  }
}

export function saveA11yPrefs(p: A11yPrefs) {
  try {
    localStorage.setItem(PREFS, JSON.stringify(p))
  } catch {}
}