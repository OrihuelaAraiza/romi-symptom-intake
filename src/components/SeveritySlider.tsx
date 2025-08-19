import React from 'react'
import type { UseFormRegister } from 'react-hook-form'
import type { FormValues } from '../lib/schema'

type Props = {
  label: string
  min: number
  max: number
  name: 'painLevel'
  value: number
  register: UseFormRegister<FormValues>
  error?: string
}

export const SeveritySlider: React.FC<Props> = ({
  label, min, max, name, value, register, error
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-sm font-medium">{label}</label>
        <span className="text-sm text-slate-600">
          Actual: <strong>{value}</strong>
        </span>
      </div>
      <input
        id={name}
        type="range"
        min={min}
        max={max}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-invalid={Boolean(error)}
        className="mt-2"
        {...register(name, { valueAsNumber: true })}
      />
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{min}</span><span>{Math.floor((min + max) / 2)}</span><span>{max}</span>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}