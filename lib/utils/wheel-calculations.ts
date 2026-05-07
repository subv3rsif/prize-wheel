export interface PolarPoint {
  x: number
  y: number
}

/**
 * Convert polar coordinates to cartesian
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): PolarPoint {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

/**
 * Generate SVG path for arc segment
 */
export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M', x, y,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ')
}

/**
 * Calculate target angle for wheel spin
 */
export function calculateTargetAngle(
  segmentIndex: number,
  totalSegments: number,
  currentRotation: number = 0
): number {
  const segmentAngle = 360 / totalSegments
  const segmentCenter = segmentIndex * segmentAngle + segmentAngle / 2

  // 5-8 full rotations for dramatic effect
  const minRotations = 5
  const maxRotations = 8
  const rotations = minRotations + Math.random() * (maxRotations - minRotations)

  // Total rotation = current + full rotations + angle to land on segment
  // Invert because pointer is fixed at top and wheel rotates
  const targetAngle = currentRotation + rotations * 360 + (360 - segmentCenter)

  return Math.round(targetAngle)
}
