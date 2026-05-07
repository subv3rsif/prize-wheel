'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateSettings, uploadLogo } from '@/app/actions/wheel'

interface Settings {
  primary_color: string
  secondary_color: string
  wheel_bg: string
  segment_text_color: string
  logo_url: string | null
}

export default function BrandingPage() {
  const [settings, setSettings] = useState<Settings>({
    primary_color: '#f59e0b',
    secondary_color: '#ef4444',
    wheel_bg: '#ffffff',
    segment_text_color: '#ffffff',
    logo_url: null,
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
    const result = await updateSettings(settings)

    if (result.success) {
      setMessage('✅ Paramètres sauvegardés avec succès !')
      setTimeout(() => setMessage(null), 3000)
      window.location.reload() // Refresh to apply CSS vars
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage('❌ Le fichier doit faire moins de 2MB')
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append('logo', file)

    const result = await uploadLogo(formData)

    if (result.success && result.url) {
      setSettings({ ...settings, logo_url: result.url })
      setMessage('✅ Logo téléchargé avec succès !')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(`❌ Erreur: ${result.error}`)
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Branding</h2>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Colors */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Couleurs</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur Principale
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur Secondaire
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fond de la Roue
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.wheel_bg}
                  onChange={(e) => setSettings({ ...settings, wheel_bg: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.wheel_bg}
                  onChange={(e) => setSettings({ ...settings, wheel_bg: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur du Texte
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={settings.segment_text_color}
                  onChange={(e) => setSettings({ ...settings, segment_text_color: e.target.value })}
                  className="w-16 h-16 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.segment_text_color}
                  onChange={(e) => setSettings({ ...settings, segment_text_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>

          {settings.logo_url && (
            <div className="mb-4">
              <img
                src={settings.logo_url}
                alt="Logo"
                className="h-24 object-contain border border-gray-200 rounded-lg p-2"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleLogoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-orange-600 cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-2">
            PNG, JPG ou SVG. Maximum 2MB.
          </p>
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
      </div>
    </div>
  )
}
