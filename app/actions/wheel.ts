'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

interface Segment {
  id: string
  label: string
  color: string
  probability: number
  is_prize: boolean
  is_active: boolean
  display_order: number
}

interface Settings {
  id: number
  is_spinning: boolean
  spin_duration_min: number
  spin_duration_max: number
  session_label: string
}

/**
 * Draw a prize using weighted random selection with server-side lock
 */
export async function drawPrize() {
  const supabase = await createClient()

  // 1. CHECK LOCK
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('is_spinning, spin_duration_min, spin_duration_max, session_label')
    .eq('id', 1)
    .single<Settings>()

  if (settingsError || !settings) {
    return { error: 'Settings not found' }
  }

  if (settings.is_spinning) {
    return { error: 'Spin already in progress', code: 'CONCURRENT_SPIN' }
  }

  // 2. SET LOCK
  const { error: lockError } = await supabase
    .from('settings')
    .update({ is_spinning: true })
    .eq('id', 1)

  if (lockError) {
    return { error: 'Failed to acquire lock' }
  }

  try {
    // 3. FETCH ACTIVE SEGMENTS
    const { data: segments, error: segmentsError } = await supabase
      .from('segments')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (segmentsError || !segments || segments.length === 0) {
      throw new Error('No active segments')
    }

    // 4. WEIGHTED RANDOM DRAW
    const totalWeight = segments.reduce((sum: number, s: Segment) => sum + s.probability, 0)
    const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1)
    const randomWeight = randomValue * totalWeight

    let cumulativeWeight = 0
    let selectedSegment = segments[0]

    for (const segment of segments) {
      cumulativeWeight += segment.probability
      if (randomWeight <= cumulativeWeight) {
        selectedSegment = segment
        break
      }
    }

    // 5. CALCULATE TARGET ANGLE
    const segmentIndex = segments.findIndex((s: Segment) => s.id === selectedSegment.id)
    const segmentAngle = 360 / segments.length
    const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2

    const minRotations = 5
    const maxRotations = 8
    const rotations = minRotations + Math.random() * (maxRotations - minRotations)
    const targetAngle = rotations * 360 + (360 - segmentCenter)

    // 6. RANDOM SPIN DURATION
    const spinDuration = Math.floor(
      settings.spin_duration_min +
      Math.random() * (settings.spin_duration_max - settings.spin_duration_min)
    )

    // 7. INSERT DRAW RECORD
    const { error: drawError } = await supabase
      .from('draws')
      .insert({
        segment_id: selectedSegment.id,
        session_label: settings.session_label,
        spin_duration: spinDuration,
        is_prize: selectedSegment.is_prize,
      })

    if (drawError) {
      throw new Error('Failed to insert draw record')
    }

    // 8. BROADCAST REALTIME EVENT
    const channel = supabase.channel('wheel')
    await channel.send({
      type: 'broadcast',
      event: 'spin',
      payload: {
        targetAngle: Math.round(targetAngle),
        segmentId: selectedSegment.id,
        isPrize: selectedSegment.is_prize,
        segmentLabel: selectedSegment.label,
        spinDuration,
      },
    })

    // 9. RELEASE LOCK AFTER ANIMATION (async)
    setTimeout(async () => {
      await supabase
        .from('settings')
        .update({ is_spinning: false })
        .eq('id', 1)

      revalidatePath('/play')
      revalidatePath('/display')
    }, spinDuration + 1000)

    return {
      success: true,
      segment: selectedSegment,
      targetAngle: Math.round(targetAngle),
      spinDuration,
    }
  } catch (error) {
    // RELEASE LOCK on error
    await supabase
      .from('settings')
      .update({ is_spinning: false })
      .eq('id', 1)

    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Update settings
 */
export async function updateSettings(data: {
  primary_color?: string
  secondary_color?: string
  wheel_bg?: string
  segment_text_color?: string
  logo_url?: string
  spin_button_label?: string
  session_label?: string
  spin_duration_min?: number
  spin_duration_max?: number
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('settings')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', 1)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Create segment
 */
export async function createSegment(data: {
  label: string
  color: string
  probability: number
  is_prize: boolean
  display_order: number
}) {
  const supabase = await createClient()

  if (data.probability <= 0) {
    return { error: 'Probability must be greater than 0' }
  }

  const { error } = await supabase
    .from('segments')
    .insert(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/display')
  return { success: true }
}

/**
 * Update segment
 */
export async function updateSegment(id: string, data: {
  label?: string
  color?: string
  probability?: number
  is_prize?: boolean
  is_active?: boolean
  display_order?: number
}) {
  const supabase = await createClient()

  if (data.probability !== undefined && data.probability <= 0) {
    return { error: 'Probability must be greater than 0' }
  }

  const { error } = await supabase
    .from('segments')
    .update(data)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/display')
  return { success: true }
}

/**
 * Delete segment
 */
export async function deleteSegment(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('segments')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/display')
  return { success: true }
}

/**
 * Upload logo to Supabase Storage
 */
export async function uploadLogo(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('logo') as File

  if (!file) {
    return { error: 'No file provided' }
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: 'File size must be less than 2MB' }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `logo-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName)

  // Update settings with new logo URL
  await updateSettings({ logo_url: publicUrl })

  return { success: true, url: publicUrl }
}
