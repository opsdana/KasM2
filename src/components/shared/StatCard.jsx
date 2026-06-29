import { cn } from '@/lib/utils'

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'default',
  className,
}) {
  const colorStyles = {
    default: {
      iconBg: 'bg-brand-light',
      iconColor: 'text-brand-primary',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
    red: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      trendUp: 'text-red-600',
      trendDown: 'text-green-600',
    },
    orange: {
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
      trendUp: 'text-orange-600',
      trendDown: 'text-green-600',
    },
    blue: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
    purple: {
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      trendUp: 'text-green-600',
      trendDown: 'text-red-600',
    },
  }

  const styles = colorStyles[color] || colorStyles.default

  return (
    <div className={cn(
      'bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className={cn(
                'text-xs font-semibold',
                trend >= 0 ? styles.trendUp : styles.trendDown
              )}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', styles.iconBg)}>
            <Icon className={cn('h-5 w-5', styles.iconColor)} />
          </div>
        )}
      </div>
    </div>
  )
}
