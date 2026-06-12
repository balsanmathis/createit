'use client'

import { useState } from 'react'

interface MonthData {
  month: string
  amount: number
}

export default function RevenueChart({ data }: { data: MonthData[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxAmount = Math.max(...data.map(d => d.amount), 1)

  return (
    <div>
      <div className="flex items-stretch gap-2 h-32 mb-2">
        {data.map((d, i) => (
          <div
            key={i}
            className="relative flex-1 flex flex-col justify-end cursor-default"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {hoveredIndex === i && d.amount > 0 && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0d0d1a] border border-amber-500/40 text-amber-300 text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap z-10">
                {d.amount.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €
              </div>
            )}
            <div
              className="w-full rounded-t transition-colors duration-150"
              style={{
                height: `${Math.max((d.amount / maxAmount) * 100, d.amount > 0 ? 3 : 1)}%`,
                backgroundColor: hoveredIndex === i
                  ? 'rgba(251,191,36,0.55)'
                  : d.amount > 0 ? 'rgba(251,191,36,0.22)' : 'rgba(255,255,255,0.04)',
                borderTop: `1px solid ${d.amount > 0 ? 'rgba(251,191,36,0.35)' : 'rgba(255,255,255,0.06)'}`,
                borderLeft: `1px solid ${d.amount > 0 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)'}`,
                borderRight: `1px solid ${d.amount > 0 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)'}`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-white/25 truncate">
            {d.month}
          </div>
        ))}
      </div>
    </div>
  )
}
