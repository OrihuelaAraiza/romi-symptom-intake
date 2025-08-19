// src/components/Toast.tsx
import React, { createContext, useContext, useMemo, useState } from 'react'

type Toast = { id: string; type: 'success'|'error'|'info'; text: string }
type Ctx = {
  toasts: Toast[]
  push: (t: Omit<Toast,'id'>) => void
  remove: (id: string) => void
  clear: () => void
}
const ToastCtx = createContext<Ctx | null>(null)

export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const api = useMemo<Ctx>(() => ({
    toasts,
    push: (t) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { id, ...t }])
      // auto-hide
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4000)
    },
    remove: (id) => setToasts(prev => prev.filter(t => t.id !== id)),
    clear: () => setToasts([])
  }), [toasts])

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* Contenedor visual; live regions separadas para lectores */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2 w-[min(92vw,28rem)]">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className={
              'rounded-xl border px-4 py-3 shadow ' +
              (t.type === 'success' ? 'bg-green-50 border-green-600 text-green-900' :
               t.type === 'error'   ? 'bg-red-50 border-red-600 text-red-900' :
                                      'bg-slate-50 border-slate-400 text-slate-900')
            }
          >
            <div className="flex items-start gap-3">
              <strong className="capitalize">{t.type}</strong>
              <p className="flex-1">{t.text}</p>
              <button
                aria-label="Cerrar notificación"
                onClick={() => api.remove(t.id)}
                className="text-sm underline"
              >Cerrar</button>
            </div>
          </div>
        ))}
      </div>
      {/* live region invisible para announcement inmediato */}
      <div aria-live="assertive" className="sr-only">
        {toasts.length ? toasts[toasts.length - 1].text : ''}
      </div>
    </ToastCtx.Provider>
  )
}