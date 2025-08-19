import React, { useEffect, useState } from 'react'
import { loadA11yPrefs, saveA11yPrefs, type A11yPrefs } from '../lib/storage'

export const A11yToolbar: React.FC = () => {
  const [prefs, setPrefs] = useState<A11yPrefs>(() => loadA11yPrefs())

  useEffect(() => {
    // Aplicar preferencias al <html>
    document.documentElement.setAttribute('data-font', prefs.font)
    document.documentElement.setAttribute('data-contrast', prefs.contrast)
    document.documentElement.setAttribute('data-motion', prefs.motion)
    saveA11yPrefs(prefs)
  }, [prefs])

  return (
    <div className="w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-2 flex flex-wrap gap-3 items-center justify-between text-sm">
        <div className="flex gap-2 items-center">
          <span className="font-medium">Preferencias de accesibilidad</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <label className="flex items-center gap-2">
            <span>Tamaño de texto</span>
            <select
              aria-label="Tamaño de texto"
              className="rounded-md border border-slate-300 px-2 py-1"
              value={prefs.font}
              onChange={(e) => setPrefs(p => ({ ...p, font: e.target.value as A11yPrefs['font'] }))}
            >
              <option value="md">Medio</option>
              <option value="lg">Grande</option>
              <option value="xl">Muy grande</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span>Contraste</span>
            <select
              aria-label="Contraste"
              className="rounded-md border border-slate-300 px-2 py-1"
              value={prefs.contrast}
              onChange={(e) => setPrefs(p => ({ ...p, contrast: e.target.value as A11yPrefs['contrast'] }))}
            >
              <option value="normal">Normal</option>
              <option value="high">Alto</option>
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span>Movimiento</span>
            <select
              aria-label="Movimiento"
              className="rounded-md border border-slate-300 px-2 py-1"
              value={prefs.motion}
              onChange={(e) => setPrefs(p => ({ ...p, motion: e.target.value as A11yPrefs['motion'] }))}
            >
              <option value="normal">Normal</option>
              <option value="reduced">Reducido</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  )
}