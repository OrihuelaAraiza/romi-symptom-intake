import React, { useEffect, useRef } from 'react'

type ErrorItem = { id: string; message: string }

export const ErrorSummary: React.FC<{
  errors: ErrorItem[]
}> = ({ errors }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (errors.length > 0) {
      // Enfocar el contenedor al aparecer errores
      ref.current?.focus()
    }
  }, [errors])

  if (errors.length === 0) return null

  const onClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.focus()
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="mb-4 rounded-lg border-2 border-red-600 bg-red-50 p-4"
    >
      <p className="font-semibold text-red-800">Por favor corrige los siguientes errores:</p>
      <ul className="list-disc pl-6 mt-2 text-red-800">
        {errors.map((e, idx) => (
          <li key={idx}>
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => onClick(e.id)}
            >
              {e.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}