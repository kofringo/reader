'use client'

import Link from 'next/link'

export default function RankItemSelect({ 
  itemId, 
  novelTitle,
  novelSlug,
  originalRank,
  itemStats,
  selectedRank,
  onSelect
}: { 
  itemId: string, 
  novelTitle: string,
  novelSlug?: string,
  originalRank: number,
  itemStats?: { total: number, topPosition?: number },
  selectedRank: number | null,
  onSelect: (itemId: string) => void
}) {
  return (
    <div
      onClick={() => onSelect(itemId)}
      className={`relative w-full overflow-hidden flex items-center justify-between px-5 py-4 rounded-xl border transition cursor-pointer select-none ${
        selectedRank !== null 
          ? 'bg-blue-50/70 text-gray-100 border-blue-500 shadow-sm' 
          : 'bg-gray-900 text-amber-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
      }`}
    >
      <div className="relative z-10 flex items-center gap-4">
        {/* Shows user choice rank when selected, or original list rank (#1, #2, etc.) prior to voting */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition ${
          selectedRank !== null 
            ? 'bg-blue-600 text-gray-100 shadow-sm ring-2 ring-blue-200' 
            : 'bg-amber-50 text-amber-600 border border-amber-200/80'
        }`}>
          {selectedRank !== null ? `#${selectedRank}` : `#${originalRank}`}
        </div>
        
        {novelSlug ? (
          <Link 
            href={`/novel/${novelSlug}`} 
            onClick={(e) => e.stopPropagation()} 
            className="font-semibold text-gray-100 hover:text-blue-600 transition"
          >
            {novelTitle}
          </Link>
        ) : (
          <span className="font-semibold text-gray-500">{novelTitle}</span>
        )}
      </div>

      <div className="relative z-10 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
        {itemStats?.total || 0} Votes {itemStats?.topPosition ? `(Most voted #${itemStats.topPosition})` : ''}
      </div>
    </div>
  )
}