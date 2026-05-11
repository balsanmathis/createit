'use client'

import { useState } from 'react'

interface DataPoint {
  date: string
  users: number
}

function formatDate(yyyymmdd: string) {
  const d = new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function AdminChart({ data }: { data: DataPoint[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; point: DataPoint } | null>(null)

  const W = 800
  const H = 220
  const pad = { top: 20, right: 20, bottom: 40, left: 44 }
  const cw = W - pad.left - pad.right
  const ch = H - pad.top - pad.bottom

  const maxVal = Math.max(...data.map(d => d.users), 1)

  const getX = (i: number) => pad.left + (i / (data.length - 1)) * cw
  const getY = (v: number) => pad.top + ch - (v / maxVal) * ch

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${getX(i).toFixed(1)},${getY(d.users).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${getX(data.length - 1).toFixed(1)},${(pad.top + ch).toFixed(1)} L${getX(0).toFixed(1)},${(pad.top + ch).toFixed(1)} Z`

  const gridValues = [0, Math.round(maxVal * 0.25), Math.round(maxVal * 0.5), Math.round(maxVal * 0.75), maxVal]

  const labelIndices = data.reduce<number[]>((acc, _, i) => {
    if (i === 0 || i === data.length - 1 || i % 7 === 0) acc.push(i)
    return acc
  }, [])

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 360 }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6dfa" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7c6dfa" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridValues.map((v) => {
          const y = getY(v)
          return (
            <g key={v}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
              <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.25)" fontSize="10">
                {v}
              </text>
            </g>
          )
        })}

        {/* Area + line */}
        <path d={areaPath} fill="url(#chartFill)" />
        <path d={linePath} fill="none" stroke="#7c6dfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* X labels */}
        {labelIndices.map(i => (
          <text key={i} x={getX(i)} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="10">
            {formatDate(data[i].date)}
          </text>
        ))}

        {/* Invisible hover targets */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={getX(i) - cw / (data.length * 2)}
            y={pad.top}
            width={cw / data.length}
            height={ch}
            fill="transparent"
            onMouseEnter={() => setTooltip({ x: getX(i), y: getY(d.users), point: d })}
          />
        ))}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <line x1={tooltip.x} y1={pad.top} x2={tooltip.x} y2={pad.top + ch} stroke="rgba(124,109,250,0.4)" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#7c6dfa" />
            <rect
              x={Math.min(tooltip.x + 8, W - 100)}
              y={tooltip.y - 28}
              width="90"
              height="36"
              rx="6"
              fill="rgba(13,13,26,0.95)"
              stroke="rgba(124,109,250,0.3)"
              strokeWidth="1"
            />
            <text x={Math.min(tooltip.x + 14, W - 94)} y={tooltip.y - 12} fill="rgba(255,255,255,0.5)" fontSize="9">
              {formatDate(tooltip.point.date)}
            </text>
            <text x={Math.min(tooltip.x + 14, W - 94)} y={tooltip.y + 3} fill="white" fontSize="12" fontWeight="bold">
              {tooltip.point.users.toLocaleString('fr-FR')} visiteurs
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}
