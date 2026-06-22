import { BookOpen, Check, HardDrive, Image, Play, Video } from 'lucide-react'
import { Button } from '@user/components/ui/button'
import { Input } from '@user/components/ui/input'

export const EDITED_PHOTO_PRICE = 30


const iconMap = {
  BookOpen,
  HardDrive,
  Image,
  Play,
  Video,
}

export function createAlbumSelection() {
  return {
    premiumAlbum: false,
    videoEditing: false,
    magazine: false,
    hardDrive: false,
    sameDayHighlight: false,
    sameDayPhotoScanner: false,
    editedPhotos: 0,
    addonQuantities: {},
  }
}

export function getAlbumLineItems(albumSelection, addonServices) {
  const safeAddonServices = Array.isArray(addonServices) ? addonServices : []

  const selectedAddons = safeAddonServices
    .filter((addon) => albumSelection[addon.id])
    .map((addon) => {
      const quantity = addon.priceType === 'per_unit'
        ? Math.max(1, Number(albumSelection.addonQuantities?.[addon.id]) || 1)
        : 1
      const unitPrice = addon.price || addon.pricePerDay || 0

      return {
        id: addon.id,
        serviceId: addon.backendId || addon.id,
        name: addon.name,
        price: addon.priceType === 'per_unit' ? unitPrice * quantity : unitPrice,
        quantity,
        priceType: addon.priceType,
      }
    })


  const editedPhotos = Number(albumSelection.editedPhotos) || 0
  if (editedPhotos > 0) {
    const editedPhotoService = safeAddonServices.find((addon) => {

      const name = addon.name?.toLowerCase() || ''
      return name.includes('edited photo') || (name.includes('edit') && name.includes('photo'))
    })

    selectedAddons.push({
      id: 'editedPhotos',
      serviceId: editedPhotoService?.backendId || editedPhotoService?.id || 'editedPhotos',
      name: `Edited Photos (${editedPhotos})`,
      price: editedPhotoService?.price
        ? editedPhotos * editedPhotoService.price
        : editedPhotos * EDITED_PHOTO_PRICE,
      quantity: editedPhotos,
      priceType: editedPhotoService?.priceType,
    })
  }

  return selectedAddons
}

export function calculateAlbumTotal(albumSelection, addonServices) {
  return getAlbumLineItems(albumSelection, addonServices).reduce((total, item) => total + item.price, 0)
}

function AddonSkeleton() {
  return (
    <div className="grid gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted/80" />
            </div>
            <div className="size-5 shrink-0 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AlbumSection({ albumSelection, addonServices, isLoading = false, onChange, onBack, onContinue }) {
  const visibleAddons = Array.isArray(addonServices) ? addonServices : []


  const handleToggle = (id) => {
    const isSelected = albumSelection[id]
    const nextQuantities = { ...(albumSelection.addonQuantities || {}) }

    if (isSelected) {
      delete nextQuantities[id]
    } else if (!nextQuantities[id]) {
      nextQuantities[id] = 1
    }

    onChange({
      ...albumSelection,
      [id]: !isSelected,
      addonQuantities: nextQuantities,
    })
  }

  const handleEditedPhotosChange = (event) => {
    const value = Math.max(0, Number(event.target.value) || 0)
    onChange({
      ...albumSelection,
      editedPhotos: value,
    })
  }

  const handleAddonQuantityChange = (id, value) => {
    onChange({
      ...albumSelection,
      addonQuantities: {
        ...(albumSelection.addonQuantities || {}),
        [id]: Math.max(1, Number(value) || 1),
      },
    })
  }

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Album & Delivery Add-ons</h3>
        <p className="text-sm text-muted-foreground">
          Select album, editing, storage, and same-day delivery options for this package.
        </p>
      </div>

      {isLoading ? (
        <AddonSkeleton />
      ) : (
        <div className="grid gap-3">
          {visibleAddons.map((addon) => {
          const Icon = typeof addon.icon === 'string' ? iconMap[addon.icon] || BookOpen : addon.icon
          const selected = albumSelection[addon.id]

          return (
            <div
              key={addon.id}
              className={`rounded-lg border transition-colors ${
                selected
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card hover:bg-accent/40'
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggle(addon.id)}
                className="flex w-full min-w-0 items-center gap-3 p-3 text-left"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-medium">{addon.name}</span>
                </span>
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'
                  }`}
                >
                  {selected && <Check className="size-3" />}
                </span>
              </button>

              {selected && addon.priceType === 'per_unit' && (
                <div className="border-t border-border/60 px-3 pb-3 pt-2">
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor={`addon-qty-${addon.id}`}>
                    Qty
                  </label>
                  <Input
                    id={`addon-qty-${addon.id}`}
                    type="number"
                    min="1"
                    value={albumSelection.addonQuantities?.[addon.id] || 1}
                    onChange={(event) => handleAddonQuantityChange(addon.id, event.target.value)}
                    className="h-10 bg-background sm:max-w-28"
                  />
                </div>
              )}
            </div>
          )
          })}
        </div>
      )}

      

      <div className="flex flex-col-reverse gap-3 justify-end sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
          Back
        </Button>
        <Button type="button" onClick={onContinue} disabled={isLoading} className="w-full sm:w-auto">
          Continue to Details
        </Button>
      </div>
    </div>
  )
}
