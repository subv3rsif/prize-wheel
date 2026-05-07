'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { forceUnlockWheel } from '@/app/actions/wheel'

export default function DebugPage() {
  const [isSpinning, setIsSpinning] = useState<boolean | null>(null)
  const [segments, setSegments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const fetchStatus = async () => {
    setLoading(true)

    // Check settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settings) {
      setIsSpinning(settings.is_spinning)
    }

    // Check segments
    const { data: segmentsData } = await supabase
      .from('segments')
      .select('*')
      .order('display_order', { ascending: true })

    if (segmentsData) {
      setSegments(segmentsData)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleUnlock = async () => {
    setMessage('Déblocage en cours...')
    const result = await forceUnlockWheel()

    if (result.success) {
      setMessage('✅ Wheel débloqué avec succès!')
      await fetchStatus()
    } else {
      setMessage('❌ Erreur: ' + result.error)
    }

    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Chargement...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Debug Panel</h1>

        {message && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-lg">
            {message}
          </div>
        )}

        {/* Spin Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">État du Spin</h2>
          <div className="flex items-center gap-4">
            <span className="text-lg">is_spinning:</span>
            <span className={`text-2xl font-bold ${isSpinning ? 'text-red-600' : 'text-green-600'}`}>
              {isSpinning ? '🔒 LOCKED (true)' : '✅ UNLOCKED (false)'}
            </span>
          </div>

          {isSpinning && (
            <button
              onClick={handleUnlock}
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              🔓 DÉBLOQUER LE WHEEL
            </button>
          )}

          <button
            onClick={fetchStatus}
            className="mt-4 ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔄 Rafraîchir
          </button>
        </div>

        {/* Segments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Segments ({segments.length} total)
          </h2>

          <div className="space-y-2">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="flex items-center gap-4 p-3 border rounded-lg"
                style={{ borderLeft: `4px solid ${segment.color}` }}
              >
                <div className="flex-1">
                  <div className="font-semibold">{segment.label}</div>
                  <div className="text-sm text-gray-600">
                    Poids: {segment.probability} |
                    {segment.is_prize ? ' 🎁 PRIZE' : ' Non-prize'} |
                    {segment.is_active ? ' ✅ Actif' : ' ❌ Inactif'}
                  </div>
                </div>
                <div
                  className="w-12 h-12 rounded"
                  style={{ backgroundColor: segment.color }}
                />
              </div>
            ))}
          </div>

          {segments.filter(s => s.is_active).length === 0 && (
            <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
              ⚠️ Aucun segment actif ! La roue ne peut pas tourner.
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">URLs de test:</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/display" className="text-blue-600 hover:underline">/display</a> - Affichage TV</li>
            <li><a href="/play" className="text-blue-600 hover:underline">/play</a> - Contrôleur iPad</li>
            <li><a href="/admin" className="text-blue-600 hover:underline">/admin</a> - Administration</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
