'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSegment, updateSegment, deleteSegment } from '@/app/actions/wheel'

interface Segment {
  id: string
  label: string
  color: string
  probability: number
  is_prize: boolean
  is_active: boolean
  display_order: number
}

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    label: '',
    color: '#3b82f6',
    probability: 10,
    is_prize: false,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    const { data } = await supabase
      .from('segments')
      .select('*')
      .order('display_order', { ascending: true })

    if (data) {
      setSegments(data)
    }
  }

  const handleAdd = async () => {
    const maxOrder = Math.max(...segments.map(s => s.display_order), 0)
    const result = await createSegment({
      ...formData,
      display_order: maxOrder + 1,
    })

    if (result.success) {
      setMessage('✅ Segment ajouté !')
      setIsAdding(false)
      setFormData({ label: '', color: '#3b82f6', probability: 10, is_prize: false })
      fetchSegments()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${result.error}`)
    }
  }

  const handleUpdate = async (id: string, data: Partial<Segment>) => {
    const result = await updateSegment(id, data)

    if (result.success) {
      setMessage('✅ Segment mis à jour !')
      fetchSegments()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${result.error}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce segment ?')) return

    const result = await deleteSegment(id)

    if (result.success) {
      setMessage('✅ Segment supprimé !')
      fetchSegments()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ ${result.error}`)
    }
  }

  const activeCount = segments.filter(s => s.is_active).length

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Segments</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
        >
          + Ajouter un segment
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
          {message}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouveau Segment</h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Prix Spécial"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (probabilité)
              </label>
              <input
                type="number"
                min="1"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_prize}
                    onChange={(e) => setFormData({ ...formData, is_prize: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">🎁 Est un prix</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              ✅ Ajouter
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Segments List */}
      <div className="space-y-3">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: segment.color }}
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {segment.label}
                    </span>
                    {segment.is_prize && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                        🎁 PRIZE
                      </span>
                    )}
                    {!segment.is_active && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                        INACTIF
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Poids: {segment.probability} • Ordre: {segment.display_order}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdate(segment.id, { is_active: !segment.is_active })}
                  disabled={segment.is_active && activeCount === 1}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={segment.is_active && activeCount === 1 ? 'Impossible de désactiver le dernier segment actif' : ''}
                >
                  {segment.is_active ? '👁️ Actif' : '👁️‍🗨️ Inactif'}
                </button>

                <button
                  onClick={() => handleDelete(segment.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded hover:bg-red-200 transition-colors"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg">Aucun segment. Cliquez sur "Ajouter un segment" pour commencer.</p>
        </div>
      )}
    </div>
  )
}
