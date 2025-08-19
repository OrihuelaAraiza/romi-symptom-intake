// src/components/Stepper.tsx
import React from 'react'

export const Stepper: React.FC<{
  steps: string[]
  current: number
}> = ({ steps, current }) => {
  return (
    <nav aria-label="Progreso" className="mb-4">
      <ol className="flex items-center gap-2">
        {steps.map((label, i) => {
          const active = i === current
          const done = i < current
          return (
            <li key={i} className="flex items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={
                  'inline-flex items-center justify-center w-8 h-8 rounded-full border ' +
                  (active ? 'bg-brand-700 text-white border-brand-700' :
                   done   ? 'bg-brand-100 text-brand-900 border-brand-600' :
                            'bg-white text-slate-700 border-slate-300')
                }
              >
                {i + 1}
              </span>
              <span className={'text-sm ' + (active ? 'font-semibold' : 'text-slate-600')}>{label}</span>
              {i < steps.length - 1 && <span className="mx-2 w-8 h-px bg-slate-300" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}