interface BrandMarkProps {
  size?: number
}

/** 8-point sunburst mark: 7 orange petals + 1 blue accent petal, matching the MedTech logo. */
export function BrandMark({ size = 28 }: BrandMarkProps) {
  const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315]
  const accentIndex = 1

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {petalAngles.map((angle, i) => (
        <ellipse
          key={angle}
          cx="20"
          cy="9"
          rx="3.1"
          ry="7.5"
          fill={i === accentIndex ? '#1A3E8C' : '#F7941D'}
          transform={`rotate(${angle} 20 20)`}
        />
      ))}
    </svg>
  )
}
