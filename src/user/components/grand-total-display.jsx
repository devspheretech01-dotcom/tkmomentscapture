import { useEffect, useState } from 'react'
import { Button } from '@user/components/ui/button'
import { Separator } from '@user/components/ui/separator'
import { formatPrice } from '@user/services/package-data'
import { getAlbumLineItems } from '@user/components/album-section'
import { createBooking } from '@user/services/api'
import { buildBookingPayload } from '@user/services/booking-payload'
import { Check, Mail, Phone, User } from 'lucide-react'

export function GrandTotalDisplay({
  events,
  services,
  albumSelection,
  addonServices,
  customerDetails,
  onConfirm,
  onBack,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estimate, setEstimate] = useState(null)
  const [subtotal, setSubtotal] = useState(null)
  const [isCalculatingEstimate, setIsCalculatingEstimate] = useState(false)

  const albumLineItems = getAlbumLineItems(albumSelection, addonServices?.length ? addonServices : undefined)
  const eventsWithServices = events.filter((e) => e.selectedServices.length > 0)

  const fetchEstimate = async () => {
    // Backend calculates totals using DB service prices + profit
    const payload = buildBookingPayload({
      events,
      services,
      albumSelection,
      addonServices,
      customerDetails: customerDetails || {},
      isConfirmed: false,
    })

    setIsCalculatingEstimate(true)
    try {
      const response = await fetch(`${(import.meta.env.VITE_API_URL || "").replace(/\/$/, "")}/api/bookings/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: payload.events, addons: payload.addons }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to calculate estimate")
      }

      setSubtotal(data.subtotal ?? null)
      setEstimate(data.estimate ?? null)
    } catch (err) {
      setSubtotal(null)
      setEstimate(null)
      alert(err.message || "Unable to calculate estimate")
    } finally {
      setIsCalculatingEstimate(false)
    }
  }

  useEffect(() => {
    fetchEstimate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, services, albumSelection, addonServices])

  const handleConfirm = async () => {

    const payload = buildBookingPayload({
      events,
      services,
      albumSelection,
      addonServices,
      customerDetails,
      isConfirmed: true,
    })

    if (payload.events.length === 0) {
      alert('Please select backend services before confirming the booking.')
      return
    }

    setIsSubmitting(true)
    try {
      const data = await createBooking(payload)
      alert(`${data.message || 'Booking created'}${data.booking?.bookingId ? `: ${data.booking.bookingId}` : ''}`)
      onConfirm()
    } catch (error) {

      alert(error.message || 'Unable to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-1 pt-1">
      {/* Customer Details Summary */}
      <div className="space-y-4 rounded-lg border border-border/70 bg-accent/40 p-4 sm:p-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 text-sm">
          <User className="size-4 text-primary" />
          <span className="text-muted-foreground">Name:</span>
          <span className="min-w-0 break-words font-medium text-foreground">{customerDetails.name}</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 text-sm">
          <Mail className="size-4 text-primary" />
          <span className="text-muted-foreground">Email:</span>
          <span className="min-w-0 break-all font-medium text-foreground">{customerDetails.email}</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 text-sm">
          <Phone className="size-4 text-primary" />
          <span className="text-muted-foreground">Phone:</span>
          <span className="min-w-0 break-words font-medium text-foreground">{customerDetails.phone}</span>
        </div>
      </div>

      <Separator />

      {/* Events Summary */}
      <div className="space-y-4 rounded-lg border border-border/70 bg-muted/20 p-4 sm:p-5">
        <h4 className="font-semibold text-foreground">Package Summary</h4>
        {eventsWithServices.map((event, index) => (
          <div key={event.id} className="space-y-3">
            {index > 0 && <Separator className="my-4" />}
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">{event.name}</p>
              <p className="text-xs text-muted-foreground">
                {event.date?.toLocaleDateString()} {event.time && `at ${event.time}`}
              </p>
            </div>
            <div className="space-y-2 pl-4">
              {event.selectedServices.map((serviceId) => {
                const service = services.find((s) => s.id === serviceId)
                const quantity = Math.max(1, Number(event.serviceQuantities?.[serviceId]) || 1)
                return (
                  <div
                    key={serviceId}
                    className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2.5">
                      <Check className="size-3 shrink-0 text-green-600" />
                      <span className="min-w-0 break-words">{service?.name}</span>
                    </span>
                    <span className="shrink-0 rounded-md bg-background px-2 py-0.5 text-xs font-semibold text-foreground ring-1 ring-border">
                      Qty {quantity}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Album Summary */}
      <div className="space-y-4 rounded-lg border border-border/70 bg-muted/20 p-4 sm:p-5">
        <h4 className="font-semibold text-foreground">Album Add-ons</h4>
        {albumLineItems.length > 0 ? (
          <div className="space-y-2">
            {albumLineItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check className="size-3 text-green-600" />
                <span className="min-w-0 break-words">{item.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No album add-ons selected</p>
        )}
      </div>

      <Separator />

      {/* Grand Total */}
      <div className="space-y-4 rounded-lg border border-primary/15 bg-primary/5 p-4 sm:p-5">
        {/* <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>Services Total</span>
          <span>
            {isCalculatingEstimate ? '...' : subtotal != null ? formatPrice(subtotal) : '--'}
          </span>
        </div> */}
        <div className="flex flex-col gap-2 border-primary/15 pt-4 text-lg sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-foreground">Grand Total</span>
          <span className="text-2xl font-bold text-primary">
            {isCalculatingEstimate ? '...' : estimate != null ? formatPrice(estimate) : '--'}
          </span>
        </div>
        {/* <p className="text-xs text-muted-foreground">
          Total is calculated from backend (DB service prices + profit).
        </p> */}
      </div>


      <Separator className="my-7" />

      {/* Action Buttons */}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
        <Button variant="outline" onClick={onBack} className="w-full sm:flex-1">
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={isSubmitting} className="w-full sm:flex-1">
          {isSubmitting ? 'Submitting...' : 'Confirm & Proceed'}
        </Button>
      </div>
    </div>
  )
}
