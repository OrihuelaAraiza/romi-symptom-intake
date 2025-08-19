import React from 'react'
import type { FormValues, Triage } from '../lib/schema'

export const PreviewCard: React.FC<{ values: FormValues, triage: Triage }> = ({ values, triage }) => {
  return (
    <div className="space-y-3 text-sm" aria-live="polite">
      <div className="rounded-xl border p-3">
        <p className="font-medium">Paciente</p>
        <p className="text-slate-700">
          {values.fullName || '—'} · {values.age ?? '—'} años · {values.sex}
        </p>
        {values.email && <p className="text-slate-700">{values.email}</p>}
      </div>

      <div className="rounded-xl border p-3">
        <p className="font-medium">Síntomas</p>
        <ul className="list-disc pl-5 text-slate-700">
          {values.symptoms.headache && <li>Dolor de cabeza</li>}
          {values.symptoms.fever && <li>Fiebre</li>}
          {values.symptoms.cough && <li>Tos</li>}
          {values.symptoms.soreThroat && <li>Dolor de garganta</li>}
          {values.symptoms.nausea && <li>Náusea</li>}
          {values.symptoms.diarrhea && <li>Diarrea</li>}
          {values.symptoms.fatigue && <li>Fatiga</li>}
          {values.symptoms.shortnessOfBreath && <li>Dificultad para respirar</li>}
          {values.symptoms.other && <li>Otros: {values.symptoms.other}</li>}
        </ul>
        <p className="mt-2">Dolor: <strong>{values.painLevel}</strong>/10</p>
        {values.temperature !== undefined && (
          <p>Temperatura: <strong>{values.temperature} °C</strong></p>
        )}
        {(values.onsetDate || values.onsetTime) && (
          <p>Inicio: {values.onsetDate} {values.onsetTime}</p>
        )}
      </div>

      <div className="rounded-xl border p-3">
        <p className="font-medium">Triage (estimación local)</p>
        <p
          className={
            triage.level === 'alto'
              ? 'text-red-700'
              : triage.level === 'medio'
              ? 'text-amber-700'
              : 'text-green-700'
          }
        >
          Nivel: <strong className="uppercase">{triage.level}</strong> · {triage.reason}
        </p>
        {triage.recommendation && <p className="mt-1">{triage.recommendation}</p>}
      </div>
    </div>
  )
}