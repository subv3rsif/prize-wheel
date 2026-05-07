'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateSettings } from '@/app/actions/wheel'

interface Settings {
  spin_button_label: string
  session_label: string
  spin_duration_min: number
  spin_duration_max: number
  is_spinning: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    spin_button_label: 'SPIN',
    session_label: 'Mon Événement',
    spin_duration_min: 5000,
    spin_duration_max: 7000,
    is_spinning: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (data) {
        setSettings(data)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleSave = async () => {
    setIsLoading(true)
    const result = await updateSettings({
      spin_button_label: settings.spin_button_label,
      session_label: settings.session_label,
      spin_duration_min: settings.spin_duration_min,
      spin_duration_max: settings.spin_duration_max,
    })

    if (result.success) {
      setMessage('✅ Paramètres sauvegardés avec succès !')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  const handleForceUnlock = async () => {
    if (!confirm('Forcer le déblocage de la roue ? À utiliser uniquement si un spin est bloqué.')) {
      return
    }

    setIsLoading(true)
    const result = await updateSettings({ is_spinning: false })

    if (result.success) {
      setSettings({ ...settings, is_spinning: false })
      setMessage('✅ Roue débloquée !')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  const avgDuration = (settings.spin_duration_min + settings.spin_duration_max) / 2 / 1000

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Paramètres</h2>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Button Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texte du bouton SPIN
          </label>
          <input
            type="text"
            value={settings.spin_button_label}
            onChange={(e) => setSettings({ ...settings, spin_button_label: e.target.value })}
            placeholder="SPIN"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Le texte affiché sur le bouton du contrôleur iPad
          </p>
        </div>

        {/* Session Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de l'événement
          </label>
          <input
            type="text"
            value={settings.session_label}
            onChange={(e) => setSettings({ ...settings, session_label: e.target.value })}
            placeholder="Mon Événement"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Utilisé pour l'historique des tirages
          </p>
        </div>

        {/* Spin Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durée du spin (en secondes)
          </label>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Minimum</label>
              <input
                type="number"
                min="4000"
                max="10000"
                step="500"
                value={settings.spin_duration_min}
                onChange={(e) => setSettings({ ...settings, spin_duration_min: parseInt(e.target.value) || 4000 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(settings.spin_duration_min / 1000).toFixed(1)}s
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Maximum</label>
              <input
                type="number"
                min="4000"
                max="10000"
                step="500"
                value={settings.spin_duration_max}
                onChange={(e) => setSettings({ ...settings, spin_duration_max: parseInt(e.target.value) || 7000 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(settings.spin_duration_max / 1000).toFixed(1)}s
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Durée moyenne:</span> {avgDuration.toFixed(1)}s
            </p>
            <p className="text-xs text-gray-500 mt-1">
              La durée réelle varie aléatoirement entre le min et le max pour plus de naturel
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-3 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Enregistrement...' : '💾 Sauvegarder'}
          </button>
        </div>

        {/* Emergency Unlock */}
        {settings.is_spinning && (
          <div className="pt-4 border-t border-gray-200">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-3">
              <p className="text-sm text-red-800 font-semibold mb-1">
                ⚠️ La roue est actuellement verrouillée (spin en cours)
              </p>
              <p className="text-xs text-red-700">
                Si aucun spin n'est réellement en cours, utilisez le bouton ci-dessous
              </p>
            </div>
            <button
              onClick={handleForceUnlock}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🔓 Forcer le déblocage
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
