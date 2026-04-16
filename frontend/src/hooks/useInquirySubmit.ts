import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import api from '../lib/api'

export function useInquirySubmit() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  async function submit(
    payload: Record<string, string>,
    onSuccess?: () => void
  ) {
    setLoading(true)
    try {
      await api.post('/api/inquiry', payload)
      toast.success(t('contact.success'))
      onSuccess?.()
    } catch {
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading }
}
