import { ReactNode } from 'react'
import PublicNavbar from './PublicNavbar'
import PublicFooter from './PublicFooter'
import { useTenant } from '../../hooks/useTenant'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  useTenant() // ensures tenant data is loaded on every public page
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-main">{children}</main>
      <PublicFooter />
    </div>
  )
}
