const roleIconMap = {
  traditional_photographer: 'Camera',
  traditional_videographer: 'Video',
  semi_candid_photographer: 'Focus',
  semi_candid_videographer: 'Film',
  candid_photographer: 'Sparkles',
  cinematographer: 'Clapperboard',
  drone: 'Plane',
}

// Note: event title suggestions are UI-only helper data.
// They are NOT used as Services/Add-ons catalog data.
export const EVENT_SUGGESTIONS = [
  'Haldi',
  'Mehndi',
  'Sangeet',
  'Wedding',
  'Reception',
  'Engagement',
  'Cocktail Party',
]

export function normalizeService(service) {

  return {

    id: service._id || service.id,
    backendId: service._id || service.id,
    name: service.name,
    description:
      service.priceType === 'per_day'
        ? 'Per day service'
        : service.priceType === 'per_unit'
          ? 'Quantity based service'
          : 'Fixed price service',
    pricePerDay: service.price || service.pricePerDay || 0,
    price: service.price || service.pricePerDay || 0,
    priceType: service.priceType,
    type: service.type,
    role: service.role,
    icon: roleIconMap[service.role] || service.icon || 'Camera',
  }
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function calculateEventTotal(event, services) {
  return event.selectedServices.reduce((total, serviceId) => {
    const service = services.find((s) => s.id === serviceId)
    const quantity = Math.max(1, Number(event.serviceQuantities?.[serviceId]) || 1)
    return total + ((service?.pricePerDay || 0) * quantity)
  }, 0)
}

export function calculateGrandTotal(events, services) {
  return events.reduce((total, event) => {
    return total + calculateEventTotal(event, services)
  }, 0)
}

