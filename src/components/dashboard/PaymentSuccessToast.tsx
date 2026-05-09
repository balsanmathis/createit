'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export default function PaymentSuccessToast() {
  useEffect(() => {
    toast.success('Paiement réussi ! Votre abonnement est activé.', { duration: 6000 })
    // Clean URL without full reload
    const url = new URL(window.location.href)
    url.searchParams.delete('success')
    window.history.replaceState({}, '', url.toString())
  }, [])

  return null
}
