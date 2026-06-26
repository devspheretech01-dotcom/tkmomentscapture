import {
  Camera,
  Video,
  Focus,
  Film,
  Sparkles,
  Clapperboard,
  Plane,
  Check,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'

const iconMap = {
  Camera: Camera,
  Video: Video,
  Focus: Focus,
  Film: Film,
  Sparkles: Sparkles,
  Clapperboard: Clapperboard,
  Plane: Plane,
}

export function ServiceSelector({ services, selectedServices, serviceQuantities = {}, onToggle, onQuantityChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
      {services.map((service) => {
        const Icon = iconMap[service.icon] || Camera
        const isSelected = selectedServices.includes(service.id)
        const quantity = Math.max(1, Number(serviceQuantities[service.id]) || 1)

        return (
          <div
            key={service.id}
            className={cn(
              'relative flex min-h-[5.75rem] w-full items-start gap-3 rounded-lg border-2 p-4 text-left transition-all duration-200 group sm:min-h-[6.25rem] sm:p-5',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            )}
          >
            {/* Selection Indicator */}
            <div
              className={cn(
                'absolute right-4 top-4 size-5 rounded-full flex items-center justify-center transition-all duration-200',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted border border-border group-hover:border-primary/50'
              )}
              onClick={() => onToggle(service.id)}
            >
              {isSelected && <Check className="size-3" />}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              )}
            >
              <Icon className="size-4" />
            </div>

            {/* Content */}
            <button
              type="button"
              onClick={() => onToggle(service.id)}
              className="min-w-0 flex-1 pr-7 text-left"
            >
              <div>
                <h4 className="break-words font-medium text-foreground text-sm leading-tight">
                  {service.name}
                </h4>
                <p className="mt-2 break-words text-xs leading-5 text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </button>

            {isSelected && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 shadow-sm">
                <label htmlFor={`quantity-${service.id}`} className="text-[11px] font-medium text-muted-foreground">
                  Quantity
                </label>
                <input
                  id={`quantity-${service.id}`}
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) => onQuantityChange?.(service.id, event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  className="h-7 w-14 rounded border border-border bg-card px-2 text-center text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
