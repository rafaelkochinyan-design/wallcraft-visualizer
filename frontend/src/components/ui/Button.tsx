import { ButtonHTMLAttributes, ReactNode } from 'react'

export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type BtnSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?:    BtnSize
  full?:    boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size    = 'md',
  full    = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    full ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ')

  return <button className={cls} {...rest}>{children}</button>
}
