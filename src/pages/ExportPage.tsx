import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExportCard } from '@/components/export/ExportCard'
import { Spinner } from '@/components/ui/Spinner'
import api from '@/services/api'
import type { Conversion } from '@/types'

export function ExportPage() {
  const { id } = useParams<{ id: string }>()

  const { data: conversion, isLoading, isError } = useQuery<Conversion>({
    queryKey: ['conversion', id],
    queryFn: async () => {
      const res = await api.get(`/conversions/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" className="text-pm-teal" />
      </div>
    )
  }

  if (isError || !conversion) {
    return (
      <div className="flex h-screen items-center justify-center text-pm-muted">
        Failed to load presentation.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pm-app flex items-center justify-center px-4 py-16">
      <ExportCard conversion={conversion} />
    </div>
  )
}
