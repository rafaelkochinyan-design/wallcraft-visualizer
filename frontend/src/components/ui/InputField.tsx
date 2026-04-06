interface InputFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  suffix?: string
  error?: string
  type?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  autoFocus?: boolean
}

export function InputField({
  label,
  value,
  onChange,
  suffix,
  error,
  type = 'text',
  placeholder,
  min,
  max,
  step,
  autoFocus,
}: InputFieldProps) {
  return (
    <div className="input-wrap">
      <label className="input-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className={`input${suffix ? ' has-suffix' : ''}${error ? ' error' : ''}`}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          autoFocus={autoFocus}
        />
        {suffix && (
          <span
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 'var(--text-md)',
              color: 'var(--c-gray-400)',
              fontWeight: 'var(--weight-medium)',
              pointerEvents: 'none',
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}
