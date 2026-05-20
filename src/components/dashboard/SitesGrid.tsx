'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import SiteCard from '@/components/dashboard/SiteCard'
import type { Site as SiteCardSite } from '@/components/dashboard/SiteCard'

interface Props {
  sites: SiteCardSite[]
}

export default function SitesGrid({ sites: initial }: Props) {
  const router = useRouter()
  const [sites, setSites] = useState(initial)

  useEffect(() => { setSites(initial) }, [initial])

  async function handleDuplicate(id: string) {
    try {
      const res = await fetch(`/api/sites/${id}/duplicate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Site dupliqué !')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la duplication.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce site définitivement ?')) return
    setSites(prev => prev.filter(s => s.id !== id))
    try {
      const res = await fetch(`/api/sites/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error)
      }
      toast.success('Site supprimé.')
    } catch {
      toast.error('Erreur lors de la suppression.')
      router.refresh()
    }
  }

  if (!sites.length) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {sites.map((site) => (
        <SiteCard
          key={site.id}
          site={site}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
