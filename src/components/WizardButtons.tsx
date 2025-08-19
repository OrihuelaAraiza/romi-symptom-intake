// src/components/WizardButtons.tsx
import React from 'react'

export const WizardButtons: React.FC<{
  step: number
  total: number
  onPrev: () => void
  onNext: () => void
  onSubmit?: () => void
  loading?: boolean
}> = ({ step, total, onPrev, onNext, onSubmit, loading }) => {
  const isLast = step === total - 1
  return (
    <div className="flex items-center gap-3">
      {step > 0 && (
        <button
          type="button"
          onClick={onPrev}
          className="rounded-xl border border-slate-300 px-4 py-3"
        >
          Anterior
        </button>
      )}
      {!isLast && (
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-brand-700 hover:bg-brand-800 text-white px-4 py-3"
        >
          Siguiente
        </button>
      )}
      {isLast && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="rounded-xl bg-brand-700 enabled:hover:bg-brand-800 disabled:opacity-60 text-white px-4 py-3"
        >
          {loading ? 'Enviando…' : 'Enviar'}
        </button>
      )}
    </div>
  )
}