import { z } from 'zod'

/**
 * Preprocesa string vacío -> undefined y string numérico -> number
 * Útil para campos opcionales como temperatura.
 */
const toOptionalNumber = z.preprocess((v) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}, z.number().min(34, 'Mín 34°C').max(43, 'Máx 43°C').optional())

export const schema = z.object({
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  age: z.number({ invalid_type_error: 'Ingresa una edad válida' })
    .int('La edad debe ser un número entero')
    .min(0, 'Edad mínima 0')
    .max(120, 'Edad máxima 120'),
  sex: z.enum(['masculino', 'femenino', 'no-especificado'], {
    required_error: 'Selecciona una opción'
  }),
  symptoms: z.object({
    headache: z.boolean().default(false),
    fever: z.boolean().default(false),
    cough: z.boolean().default(false),
    soreThroat: z.boolean().default(false),
    nausea: z.boolean().default(false),
    diarrhea: z.boolean().default(false),
    fatigue: z.boolean().default(false),
    shortnessOfBreath: z.boolean().default(false),
    other: z.string().optional().default('')
  }).refine(
    (s) =>
      s.headache ||
      s.fever ||
      s.cough ||
      s.soreThroat ||
      s.nausea ||
      s.diarrhea ||
      s.fatigue ||
      s.shortnessOfBreath ||
      (s.other && s.other.trim().length > 0),
    { message: 'Selecciona al menos un síntoma o escribe otro', path: [] }
  ),
  painLevel: z.number({ invalid_type_error: 'Selecciona un nivel de dolor' })
    .min(1, 'Mínimo 1')
    .max(10, 'Máximo 10'),
  temperature: toOptionalNumber, // opcional 34–43°C
  onsetDate: z.string().optional(),
  onsetTime: z.string().optional(),
  notes: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  consent: z.boolean().refine((v) => v === true, 'Necesitamos tu autorización')
})

export type FormValues = z.infer<typeof schema>

export type Triage = {
  level: 'bajo' | 'medio' | 'alto',
  reason: string,
  recommendation?: string
}

export function triageFrom(values: FormValues): Triage {
  const severePain = values.painLevel >= 8
  const highFever = (values.temperature ?? 0) >= 39
  const breathing = values.symptoms.shortnessOfBreath

  if (breathing || (severePain && highFever)) {
    return {
      level: 'alto',
      reason: breathing
        ? 'Dificultad para respirar reportada.'
        : 'Dolor intenso junto con fiebre alta.',
      recommendation: 'Se recomienda valoración médica inmediata / urgencias.'
    }
  }

  if (severePain || highFever || values.symptoms.fever) {
    return {
      level: 'medio',
      reason: severePain
        ? 'Dolor alto.'
        : highFever
          ? 'Fiebre elevada.'
          : 'Fiebre moderada.',
      recommendation: 'Revisar evolución en 24–48h y consultar si empeora.'
    }
  }

  return {
    level: 'bajo',
    reason: 'Síntomas sin señales de alarma.',
    recommendation: 'Reposo, hidratación y seguimiento de síntomas.'
  }
}