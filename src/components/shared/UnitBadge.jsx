import { cn } from '@/lib/utils'

const colorMap = {
  CABANG_INDUK: 'bg-blue-50 text-blue-700 border-blue-200',
  KANTOR_FUNGSIONAL: 'bg-green-50 text-green-700 border-green-200',
  CABANG_PEMBANTU: 'bg-orange-50 text-orange-700 border-orange-200',
}

const labelMap = {
  CABANG_INDUK: 'CI',
  KANTOR_FUNGSIONAL: 'KF',
  CABANG_PEMBANTU: 'CP',
}

export default function UnitBadge({ kodeUnit, tipeUnit, showLabel = true }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border',
        colorMap[tipeUnit] || 'bg-gray-50 text-gray-700 border-gray-200'
      )}>
        <span className="text-[10px]">{labelMap[tipeUnit] || '?'}</span>
      </span>
      {showLabel && (
        <span className="text-sm text-gray-700">{kodeUnit}</span>
      )}
    </div>
  )
}
