// src/App.tsx
import React, { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormValues, triageFrom } from './lib/schema'
import { saveSubmission, loadLastSubmission } from './lib/storage'
import { SeveritySlider } from './components/SeveritySlider'
import { PreviewCard } from './components/PreviewCard'
import { A11yToolbar } from './components/A11yToolbar'
import { ErrorSummary } from './components/ErrorSummary'
import { Stepper } from './components/Stepper'
import { WizardButtons } from './components/WizardButtons'
import { ToastProvider, useToast } from './components/Toast'
import { submitSymptoms } from './lib/api'

const steps = ['Identificación', 'Síntomas', 'Mediciones', 'Confirmar']

function FormWizard() {
  const last = loadLastSubmission()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { push } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, submitCount }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    shouldFocusError: true,
    criteriaMode: 'firstError',
    defaultValues: last ?? {
      fullName: '',
      age: undefined as unknown as number,
      sex: 'no-especificado',
      symptoms: {
        headache: false,
        fever: false,
        cough: false,
        soreThroat: false,
        nausea: false,
        diarrhea: false,
        fatigue: false,
        shortnessOfBreath: false,
        other: ''
      },
      painLevel: 1,
      temperature: undefined,
      onsetDate: '',
      onsetTime: '',
      notes: '',
      consent: false,
      email: ''
    }
  })

  const values = watch()
  const triage = useMemo(() => triageFrom(values), [values])

  // Campos a validar por paso
  const stepFields: (keyof FormValues | `${string}.${string}`)[][] = [
    ['fullName', 'age', 'sex', 'email'],
    [
      'symptoms.headache',
      'symptoms.fever',
      'symptoms.cough',
      'symptoms.soreThroat',
      'symptoms.nausea',
      'symptoms.diarrhea',
      'symptoms.fatigue',
      'symptoms.shortnessOfBreath',
      'symptoms.other',
      'painLevel'
    ],
    ['temperature', 'onsetDate', 'onsetTime', 'notes'],
    ['consent']
  ]

  const goNext = async () => {
    const ok = await trigger(stepFields[step] as any)
    if (!ok) {
      push({ type: 'error', text: 'Revisa los campos marcados antes de continuar.' })
      return
    }
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const goPrev = () => setStep((s) => Math.max(s - 1, 0))

  const onFinalSubmit = handleSubmit(async (data) => {
    const ok = await trigger(stepFields.flat() as any)
    if (!ok) {
      push({ type: 'error', text: 'Hay errores pendientes en el formulario.' })
      return
    }
    setSubmitting(true)
    const res = await submitSymptoms(data)
    setSubmitting(false)
    if (res.ok) {
      saveSubmission(data)
      push({ type: 'success', text: '¡Síntomas registrados correctamente!' })
    } else {
      push({ type: 'error', text: res.error })
    }
  })

  // Errores para ErrorSummary
  const summaryErrors = useMemo(() => {
    const list: { id: string; message: string }[] = []
    if (errors.fullName?.message) list.push({ id: 'fullName', message: `Nombre: ${errors.fullName.message}` })
    if (errors.age?.message) list.push({ id: 'age', message: `Edad: ${errors.age.message}` })
    if (errors.sex?.message) list.push({ id: 'sex-masculino', message: `Sexo: ${errors.sex.message}` })
    if (errors.symptoms && (errors.symptoms as any).message) {
      list.push({ id: 'symptoms-headache', message: `Síntomas: ${(errors.symptoms as any).message as string}` })
    }
    if (errors.painLevel?.message) list.push({ id: 'painLevel', message: `Dolor: ${errors.painLevel.message}` })
    if (errors.temperature?.message) list.push({ id: 'temperature', message: `Temperatura: ${errors.temperature.message}` })
    if (errors.onsetDate?.message) list.push({ id: 'onsetDate', message: `Inicio (fecha): ${errors.onsetDate.message}` })
    if (errors.onsetTime?.message) list.push({ id: 'onsetTime', message: `Inicio (hora): ${errors.onsetTime.message}` })
    if (errors.email?.message) list.push({ id: 'email', message: `Email: ${errors.email.message}` })
    if (errors.consent?.message) list.push({ id: 'consent', message: `Consentimiento: ${errors.consent.message}` })
    return list
  }, [errors])

  return (
    <main className="min-h-screen" id="contenido">
      <A11yToolbar />

      <header
        role="banner"
        className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight wrap-anywhere">
            <span className="text-brand-700">ROMI</span> · Registro de Síntomas
          </h1>
          <span className="text-xs sm:text-sm text-slate-600 wrap-anywhere"></span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 px-4 py-6">
        {/* Formulario por pasos */}
        <section
          aria-labelledby="form-title"
          className="card py-5 sm:py-6 px-7 sm:px-2 min-w-0" 
          role="form"
        >
          <h2 id="form-title" className="text-base sm:text-lg font-semibold mb-4 wrap-anywhere">
            Datos del paciente
          </h2>

          <Stepper steps={steps} current={step} />

          {submitCount > 0 && <ErrorSummary errors={summaryErrors} />}

          {/* Paso 0: Identificación */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="min-w-0">
                  <label htmlFor="fullName" className="block text-sm font-medium wrap-anywhere">
                    Nombre completo
                  </label>
                  <p id="fullName-help" className="text-xs text-slate-600 wrap-anywhere">
                    Escribe tu nombre y apellidos.
                  </p>
                  <input
                    id="fullName"
                    type="text"
                    className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                    aria-invalid={!!errors.fullName}
                    aria-describedby="fullName-help fullName-error"
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="mt-1 text-sm text-red-600 wrap-anywhere">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="age" className="block text-sm font-medium wrap-anywhere">
                    Edad
                  </label>
                  <p id="age-help" className="text-xs text-slate-600 wrap-anywhere">
                    Número entero entre 0 y 120.
                  </p>
                  <input
                    id="age"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={120}
                    className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                    aria-invalid={!!errors.age}
                    aria-describedby="age-help age-error"
                    {...register('age', { valueAsNumber: true })}
                  />
                  {errors.age && (
                    <p id="age-error" className="mt-1 text-sm text-red-600 wrap-anywhere">
                      {errors.age.message}
                    </p>
                  )}
                </div>
              </div>

              <fieldset className="border rounded-xl p-3 wrap-anywhere">
                <legend className="text-sm font-medium wrap-anywhere">
                  Sexo (biológico o declarado)
                </legend>
                <p id="sex-help" className="text-xs text-slate-600 wrap-anywhere">
                  Selecciona una opción.
                </p>
                <div
                  className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4"
                  aria-describedby="sex-help"
                >
                  <label className="inline-flex items-center gap-2">
                    <input id="sex-masculino" type="radio" value="masculino" {...register('sex')} />
                    <span>Masculino</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input id="sex-femenino" type="radio" value="femenino" {...register('sex')} />
                    <span>Femenino</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input id="sex-nosay" type="radio" value="no-especificado" {...register('sex')} />
                    <span>Prefiero no decir</span>
                  </label>
                </div>
                {errors.sex && (
                  <p className="mt-2 text-sm text-red-600 wrap-anywhere">{errors.sex.message}</p>
                )}
              </fieldset>

              <div className="min-w-0">
                <label htmlFor="email" className="block text-sm font-medium wrap-anywhere">
                  Email (opcional)
                </label>
                <p id="email-help" className="text-xs text-slate-600 wrap-anywhere">
                  Para contacto si es necesario.
                </p>
                <input
                  id="email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                  aria-describedby="email-help email-error"
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600 wrap-anywhere">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Paso 1: Síntomas */}
          {step === 1 && (
            <div className="space-y-6">
              <fieldset className="border rounded-xl p-3 wrap-anywhere">
                <legend className="text-sm font-medium wrap-anywhere">Síntomas básicos</legend>
                <p id="symptoms-help" className="text-xs text-slate-600 wrap-anywhere">
                  Marca los que apliquen o escribe otros.
                </p>
                <div
                  className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 min-w-0"
                  aria-describedby="symptoms-help"
                >
                  <label className="inline-flex items-center gap-2">
                    <input id="symptoms-headache" type="checkbox" {...register('symptoms.headache')} />
                    <span>Dolor de cabeza</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register('symptoms.fever')} />
                    <span>Fiebre</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register('symptoms.cough')} />
                    <span>Tos</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register('symptoms.soreThroat')} />
                    <span>Dolor de garganta</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register('symptoms.nausea')} />
                    <span>Náusea</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register('symptoms.diarrhea')} />
                    <span>Diarrea</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register('symptoms.fatigue')} />
                    <span>Fatiga</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" {...register('symptoms.shortnessOfBreath')} />
                    <span>Dificultad para respirar</span>
                  </label>
                </div>

                <div className="mt-3 min-w-0">
                  <label htmlFor="other" className="block text-sm wrap-anywhere">
                    Otros (opcional)
                  </label>
                  <input
                    id="other"
                    type="text"
                    placeholder="Describe otros síntomas..."
                    className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                    {...register('symptoms.other')}
                  />
                </div>

                {errors.symptoms && (
                  <p className="mt-2 text-sm text-red-600 wrap-anywhere">
                    {(errors.symptoms as any).message as string}
                  </p>
                )}
              </fieldset>

              <SeveritySlider
                label="Nivel de dolor (1-10)"
                min={1}
                max={10}
                name="painLevel"
                register={register}
                error={errors.painLevel?.message}
                value={values.painLevel}
              />
            </div>
          )}

          {/* Paso 2: Mediciones */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
                <div className="min-w-0">
                  <label htmlFor="temperature" className="block text-sm font-medium wrap-anywhere">
                    Temperatura (°C)
                  </label>
                  <p id="temperature-help" className="text-xs text-slate-600 wrap-anywhere">
                    Opcional. Rango 34–43 °C.
                  </p>
                  <input
                    id="temperature"
                    type="number"
                    step={0.1}
                    min={34}
                    max={43}
                    className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                    aria-invalid={!!errors.temperature}
                    aria-describedby="temperature-help temperature-error"
                    {...register('temperature')}
                  />
                  {errors.temperature && (
                    <p id="temperature-error" className="mt-1 text-sm text-red-600 wrap-anywhere">
                      {errors.temperature.message}
                    </p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="onsetDate" className="block text-sm font-medium wrap-anywhere">
                    Inicio (fecha)
                  </label>
                  <input
                    id="onsetDate"
                    type="date"
                    className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                    {...register('onsetDate')}
                  />
                  {errors.onsetDate && (
                    <p className="mt-1 text-sm text-red-600 wrap-anywhere">{errors.onsetDate.message}</p>
                  )}
                </div>

                <div className="min-w-0">
                  <label htmlFor="onsetTime" className="block text-sm font-medium wrap-anywhere">
                    Inicio (hora)
                  </label>
                  <input
                    id="onsetTime"
                    type="time"
                    className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                    {...register('onsetTime')}
                  />
                  {errors.onsetTime && (
                    <p className="mt-1 text-sm text-red-600 wrap-anywhere">{errors.onsetTime.message}</p>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="notes" className="block text-sm font-medium wrap-anywhere">
                  Notas (opcional)
                </label>
                <p id="notes-help" className="text-xs text-slate-600 wrap-anywhere">
                  Contexto: viajes, medicamentos, etc.
                </p>
                <textarea
                  id="notes"
                  rows={4}
                  className="mt-1 w-full rounded-xl border-slate-300 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Describe el contexto"
                  aria-describedby="notes-help"
                  {...register('notes')}
                ></textarea>
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600 wrap-anywhere">{errors.notes.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Paso 3: Confirmar */}
          {step === 3 && (
            <div className="space-y-6 min-w-0">
              <div className="rounded-xl border p-3 wrap-anywhere">
                <p className="text-sm text-slate-700">
                  Revisa tu información y confirma el consentimiento para enviar.
                </p>
              </div>

              <label className="inline-flex items-center gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  {...register('consent')}
                  aria-invalid={!!errors.consent}
                />
                <span className="text-sm wrap-anywhere">
                  Autorizo el uso de estos datos con fines de orientación médica (demo)
                </span>
              </label>
              {errors.consent && (
                <p className="text-sm text-red-600 wrap-anywhere">{errors.consent.message}</p>
              )}

              <div className="rounded-xl border p-3">
                <p className="text-sm">Resumen</p>
                <div className="mt-2 text-sm text-slate-700 wrap-anywhere">
                  <strong>Nombre:</strong> {values.fullName || '—'}<br />
                  <strong>Edad:</strong> {values.age ?? '—'}<br />
                  <strong>Sexo:</strong> {values.sex}<br />
                  {values.email && (
                    <>
                      <strong>Email:</strong> {values.email}<br />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <WizardButtons
              step={step}
              total={steps.length}
              onPrev={goPrev}
              onNext={goNext}
              onSubmit={onFinalSubmit}
              loading={submitting}
            />
          </div>
        </section>

        {/* Vista previa / triage */}
        <aside
          className="card p-4 sm:p-6 h-fit min-w-0"
          role="complementary"
          aria-label="Resumen de información"
        >
          <h2 className="text-base sm:text-lg font-semibold mb-3 wrap-anywhere">
            Resumen y Triaging (local)
          </h2>
          <PreviewCard values={values} triage={triage} />
        </aside>
      </div>

      <footer role="contentinfo" className="pb-8 px-4">
        <div className="max-w-5xl mx-auto text-xs text-slate-600 wrap-anywhere"></div>
      </footer>
    </main>
  )
}

export const App: React.FC = () => (
  <ToastProvider>
    <FormWizard />
  </ToastProvider>
)