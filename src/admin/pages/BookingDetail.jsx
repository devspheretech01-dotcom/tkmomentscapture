import { Link, useParams } from "react-router-dom";
import { useSettings } from "@admin/services/SettingsContext";
import { formatCurrency, getInitials } from "@shared/utils/admin";
import {
  useGetBooking,
  getGetBookingQueryKey,
  useUpdateBooking,
  useUpdateBookingPrice,
  useUpdateWorkStatus,
  useUpdateClientPayment,
  useGetPhotographers,
  useGetAvailablePhotographers,
  useAssignPhotographer,
  useConvertInquiryToBooking,
  useDeleteBooking,
  useUpdateDataHandover
} from "@admin/services/api";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@admin/components/ui/skeleton";
import { getRoleConfig, getRoleLabel } from "@admin/services/roles";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@admin/components/ui/dialog";
import { Button } from "@admin/components/ui/button";
import { MapPin, Mail, Phone, Calendar, ChevronLeft, CheckCircle, User, Lock, AlertCircle, Trash2, Wallet, ArrowLeft, Camera, HardDrive, XCircle, Download } from "lucide-react";
import { useToast } from "@shared/hooks/use-toast";

const STATUS_CONFIG = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 ring-1 ring-red-200" },
};

const getBookingStatus = (booking) => booking.status || "pending";
const formatDateValue = (value, pattern = "MMM d, yyyy") => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, pattern);
};
const formatDateTimeValue = (value) => formatDateValue(value, "MMM d, yyyy h:mm a");
const getAssignedPhotographer = (booking, day) => booking.assigned?.find((item) => item.day === day);
const getAssignedNames = (assigned, allPhotographers = []) => {
  const entries = Array.isArray(assigned?.assignments)
    ? assigned.assignments.map((item) => item.photographerId)
    : (Array.isArray(assigned?.photographerIds || assigned?.photographerId)
      ? (assigned.photographerIds || assigned.photographerId)
      : [assigned?.photographerIds || assigned?.photographerId]);

  return entries
    .map((photo) => {
      if (photo?.name) return photo.name;
      const id = getPhotoId(photo);
      return allPhotographers.find((item) => item.id === id || item._id === id)?.name || id;
    })
    .filter(Boolean)
    .join(", ");
};
const getService = (item) => item?.serviceId || item?.service || item;
const getServiceId = (item) => {
  const service = getService(item);
  return service?._id || service?.id || (typeof service === "string" ? service : "") || item?.serviceId || item?.service || "";
};
const getServiceName = (item) => {
  const service = getService(item);
  return service?.name || service || "Service";
};
const getServiceQuantity = (item) => Math.max(1, Number(item?.quantity) || 1);
const normalizeLabel = (value = "") => String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
const shouldShowRoleLabel = (serviceName, role) => {
  if (!role) return false;
  return normalizeLabel(serviceName) !== normalizeLabel(getRoleLabel(role));
};
const getRoleFromServiceName = (name = "") => {
  const value = String(name).toLowerCase();
  if (value.includes("drone")) return "drone";
  if (value.includes("cinema") || value.includes("film")) return "cinematographer";
  if (value.includes("semi") && value.includes("candid") && (value.includes("video") || value.includes("videography"))) return "semi_candid_videographer";
  if (value.includes("semi") && value.includes("candid") && (value.includes("photo") || value.includes("photography"))) return "semi_candid_photographer";
  if (value.includes("traditional") && (value.includes("video") || value.includes("videography"))) return "traditional_videographer";
  if (value.includes("traditional") && (value.includes("photo") || value.includes("photography"))) return "traditional_photographer";
  if (value.includes("candid") && (value.includes("video") || value.includes("videography"))) return "semi_candid_videographer";
  if (value.includes("candid") && (value.includes("photo") || value.includes("photography"))) return "candid_photographer";
  if (value.includes("video") || value.includes("videography")) return "traditional_videographer";
  if (value.includes("photo") || value.includes("photography")) return "traditional_photographer";
  return "";
};
const getServiceRole = (item) => {
  const service = getService(item);
  return (typeof service === "object" ? service.role : "") || getRoleFromServiceName(getServiceName(item));
};
const getNumberOrNull = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const firstAmount = (...values) => {
  const amounts = values.map(getNumberOrNull).filter((value) => value !== null);
  return amounts.find((value) => value > 0) ?? amounts[0] ?? 0;
};
const getEventRequiredRoles = (event) => {
  const roles = event.services?.map(getServiceRole).filter(Boolean) || [];
  return [...new Set(roles)];
};
const getRoleServices = (event, role) => (
  event.services?.filter((item) => getServiceRole(item) === role).map(getServiceName) || []
);
const getEventRoleNeeds = (event) => {
  const needs = {};
  event.services?.forEach((item) => {
    const role = getServiceRole(item);
    if (!role) return;
    if (!needs[role]) needs[role] = { role, services: [], count: 0 };
    const quantity = getServiceQuantity(item);
    needs[role].services.push(`${getServiceName(item)} x ${quantity}`);
    needs[role].count += quantity;
  });
  return Object.values(needs);
};
const getPhotoId = (photo) => photo?._id || photo?.id || photo;
const getPhotoRole = (photo, allPhotographers) => {
  if (photo?.role) return photo.role;
  const id = getPhotoId(photo);
  return allPhotographers.find((item) => item.id === id || item._id === id)?.role || "";
};
const getAssignedIdsForDay = (booking, day) => getAssignedEntries(booking, day).map((item) => getPhotoId(item.photographerId)).filter(Boolean);
const getAssignedPhotosForService = (booking, day, serviceItem, allPhotographers) => (
  getAssignedEntries(booking, day)
    .filter((assignment) => getServiceId(assignment.serviceId) === getServiceId(serviceItem))
    .map((assignment) => getResolvedPhoto(assignment.photographerId, allPhotographers))
);
const getAssignedCountForService = (booking, day, serviceItem) => (
  getAssignedEntries(booking, day)
    .filter((assignment) => getServiceId(assignment.serviceId) === getServiceId(serviceItem))
    .length
);
const getAssignedRoleCount = (booking, day, role, allPhotographers, event) => {
  const entries = getAssignedEntries(booking, day);
  if (event?.services?.length) {
    const serviceRoles = new Map(event.services.map((item) => [getServiceId(item), getServiceRole(item)]));
    return entries.filter((assignment) => serviceRoles.get(getServiceId(assignment.serviceId)) === role).length;
  }

  return entries
    .map((item) => getResolvedPhoto(item.photographerId, allPhotographers))
    .filter((photo) => getPhotoRole(photo, allPhotographers) === role).length;
};
const getServicePrice = (item) => {
  const service = getService(item);
  return typeof service === "object" ? service.price || 0 : 0;
};
const getServicePriceType = (item) => {
  const service = getService(item);
  return typeof service === "object" ? service.priceType : "";
};
const getAssignedEntries = (booking, day) => {
  const assigned = getAssignedPhotographer(booking, day);
  if (!assigned) return [];
  if (Array.isArray(assigned.assignments)) return assigned.assignments;

  const legacyPhotographers = assigned.photographerIds || assigned.photographerId || [];
  return (Array.isArray(legacyPhotographers) ? legacyPhotographers : [legacyPhotographers])
    .filter(Boolean)
    .map((photographerId) => ({ photographerId, serviceId: "" }));
};
const getResolvedPhoto = (photo, allPhotographers) => {
  if (photo?.name || photo?.role) return photo;
  const id = getPhotoId(photo);
  return allPhotographers.find((item) => item.id === id || item._id === id) || photo;
};
const getNormalizedAssignments = (assigned = []) => assigned.map((item) => ({
  day: item.day,
  assignments: Array.isArray(item.assignments)
    ? item.assignments.map((assignment) => ({
      photographerId: assignment.photographerId,
      serviceId: assignment.serviceId,
      payAmount: assignment.payAmount,
    }))
    : (Array.isArray(item.photographerIds || item.photographerId)
      ? (item.photographerIds || item.photographerId)
      : [item.photographerIds || item.photographerId]
    ).filter(Boolean).map((photographerId) => ({ photographerId, serviceId: "" })),
}));
const getAssignmentPayload = (assigned = []) => assigned.map((item) => ({
  day: item.day,
  assignments: (item.assignments || [])
    .map((assignment) => ({
      photographerId: getPhotoId(assignment.photographerId),
      serviceId: getServiceId(assignment.serviceId),
      payAmount: Math.max(0, Number(assignment.payAmount) || 0),
    }))
    .filter((assignment) => assignment.photographerId && assignment.serviceId),
}));
const getMergedAssignments = (current = [], day, serviceItem, photographer, payAmount) => {
  const photoId = getPhotoId(photographer);
  const serviceId = getServiceId(serviceItem);
  let dayFound = false;

  const assigned = current.map((item) => {
    if (item.day !== day) {
      return item;
    }

    dayFound = true;
    const assignments = item.assignments || [];
    const serviceQuantity = getServiceQuantity(serviceItem);
    const serviceAssignments = assignments.filter((assignment) => getServiceId(assignment.serviceId) === serviceId);
    return {
      day,
      assignments: serviceAssignments.length >= serviceQuantity
        ? assignments
        : [...assignments, { photographerId: photographer, serviceId, payAmount }],
    };
  });

  if (!dayFound) assigned.push({ day, assignments: [{ photographerId: photographer, serviceId, payAmount }] });
  return assigned;
};
const getUnassignedServiceForRole = (booking, event, role) => {
  return event.services?.find((item) => (
    getServiceRole(item) === role &&
    getAssignedCountForService(booking, event.day, item) < getServiceQuantity(item)
  ));
};
const getNextAssignableService = (booking, event, preferredRoles = []) => {
  const roles = preferredRoles.filter(Boolean);
  for (const role of roles) {
    const service = getUnassignedServiceForRole(booking, event, role);
    if (service) return service;
  }

  return event.services?.find((item) => (
    getAssignedCountForService(booking, event.day, item) < getServiceQuantity(item)
  ));
};
const getUniqueAssignedPhotographers = (booking, allPhotographers = []) => {
  const map = new Map();
  (booking.assigned || []).forEach((assign) => {
    const entries = Array.isArray(assign.assignments)
      ? assign.assignments.map((assignment) => assignment.photographerId)
      : (Array.isArray(assign.photographerIds || assign.photographerId) ? (assign.photographerIds || assign.photographerId) : [assign.photographerIds || assign.photographerId]);
    entries.forEach((photo) => {
      const id = getPhotoId(photo);
      if (id && !map.has(id)) map.set(id, getResolvedPhoto(photo, allPhotographers));
    });
  });
  return [...map.values()];
};
const getHandoverEntry = (booking, photographerId) => (
  booking.dataHandover?.find((item) => getPhotoId(item.photographerId) === photographerId)
);
const DRIVE_TYPES = ["A", "B", "C", "D"];

const getPhotographerConflict = (photo, selectedDay, booking) => {
  if (!photo.isActive) return "Photographer is inactive";
  const assignedIds = selectedDay ? getAssignedIdsForDay(booking, selectedDay.day) : [];
  const photoId = getPhotoId(photo);
  if (photo.bookedDates?.includes(selectedDay.date) && !assignedIds.includes(photoId)) return "Booked for this event date";

  return "";
};
const getAvailableCountForRole = (photographers, role, event) => (
  photographers.filter((photo) => photo.role === role && !getPhotographerConflict(photo, event, {})).length
);

export default function BookingDetail() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id;
  const queryClient = useQueryClient();
  const { data: apiBooking, isLoading } = useGetBooking(id, { query: { enabled: !!id } });
  const updateBooking = useUpdateBooking();
  const updateBookingPrice = useUpdateBookingPrice();
  const updateWorkStatus = useUpdateWorkStatus();
  const updateClientPayment = useUpdateClientPayment();
  const assignPhotographer = useAssignPhotographer();
  const convertInquiry = useConvertInquiryToBooking();
  const deleteBooking = useDeleteBooking();
  const updateDataHandover = useUpdateDataHandover();
  const { data: allPhotographers = [] } = useGetPhotographers();

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [assigningPhotographer, setAssigningPhotographer] = useState(null);
  const [assignmentPayAmount, setAssignmentPayAmount] = useState("");
  const [draftAssigned, setDraftAssigned] = useState([]);
  const [workStatus, setWorkStatus] = useState("");
  const [paymentForm, setPaymentForm] = useState({ amount: "", transactionId: "", paymentMethod: "upi", note: "" });
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [handoverForms, setHandoverForms] = useState({});

  const { data: availability, isLoading: isAvailabilityLoading } = useGetAvailablePhotographers(
    { date: selectedDay?.date },
    { query: { enabled: !!selectedDay } }
  );

  const booking = apiBooking;
  useEffect(() => {
    if (apiBooking) {
      setDraftAssigned(getNormalizedAssignments(apiBooking.assigned || []));
      setDiscountPercentage(String(apiBooking.discountPercentage ?? 0));
    }
  }, [apiBooking]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-card py-16 text-center text-sm text-muted-foreground dark:border-border">
        Booking not found.
      </div>
    );
  }
  const customer = booking.customer || {};
  const firstEvent = booking.events?.[0] || {};
  const status = getBookingStatus(booking);
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const draftBooking = { ...booking, assigned: draftAssigned };
  const selectedDayRoles = selectedDay ? getEventRequiredRoles(selectedDay) : [];
  const selectedDayNeeds = selectedDay ? getEventRoleNeeds(selectedDay) : [];
  const availablePhotographers = selectedDay ? (availability || []) : allPhotographers;
  const selectedCategoryConfig = selectedCategory ? getRoleConfig(selectedCategory) : null;
  const categoryRoles = selectedDay
    ? [...new Set([
      ...selectedDayRoles,
      ...availablePhotographers.map((photo) => photo.role).filter(Boolean),
    ])].sort((a, b) => getRoleLabel(a).localeCompare(getRoleLabel(b)))
    : [];
  const categoryStats = selectedDay ? categoryRoles.map((role) => {
    const config = getRoleConfig(role);
    const need = selectedDayNeeds.find((item) => item.role === role);
    const assignedCount = getAssignedRoleCount(draftBooking, selectedDay.day, role, allPhotographers, selectedDay);
    const photographers = availablePhotographers.filter((photo) => photo.role === role);
    const availableCount = photographers.filter((photo) => !getPhotographerConflict(photo, selectedDay, draftBooking)).length;
    return {
      role,
      ...config,
      services: need?.services || getRoleServices(selectedDay, role),
      required: need?.count || 0,
      isRequired: !!need,
      assigned: assignedCount,
      total: photographers.length,
      available: availableCount,
      unavailable: photographers.length - availableCount,
    };
  }) : [];
  const selectedDayAssignedIds = selectedDay ? getAssignedIdsForDay(draftBooking, selectedDay.day) : [];
  const selectedDayRemainingServices = selectedDay
    ? (selectedDay.services || []).filter((item) => getAssignedCountForService(draftBooking, selectedDay.day, item) < getServiceQuantity(item))
    : [];
  const categoryPhotographers = selectedCategory
    ? availablePhotographers.filter((photo) => photo.role === selectedCategory)
    : [];
  const assignedPhotographers = getUniqueAssignedPhotographers(booking, allPhotographers);
  const hasDiscount = Number(booking.discountPercentage || 0) > 0;
  const calculatedEstimate = (Number(booking.subtotal || 0) + Number(booking.profitAmount || 0)) || null;
  const baseEstimate = firstAmount(booking.estimate, calculatedEstimate, booking.payment?.totalAmount, booking.finalAmount);
  const displayTotal = hasDiscount
    ? (getNumberOrNull(booking.finalAmount) ?? Math.max(baseEstimate - Number(booking.discountAmount || 0), 0))
    : baseEstimate;
  const requiredPhotographerCount = booking.events?.reduce((sum, event) => (
    sum + getEventRoleNeeds(event).reduce((total, need) => total + need.count, 0)
  ), 0) || 0;
  const selectedPhotographerCount = draftAssigned.reduce((sum, item) => {
    return sum + (item.assignments || []).filter((assignment) => getPhotoId(assignment.photographerId) && getServiceId(assignment.serviceId)).length;
  }, 0);

  const openAssignmentDialog = (photo) => {
    setAssigningPhotographer(photo);
    setAssignmentPayAmount(String(photo.perDayRate || 0));
    // setAssignmentWorkUnits("1");
  };

  const confirmAssignment = () => {
    if (!selectedDay || !assigningPhotographer) return;
    if (getPhotographerConflict(assigningPhotographer, selectedDay, draftBooking)) return;
    const payAmount = Math.max(0, Number(assignmentPayAmount) || 0);
    if (payAmount <= 0) {
      toast({ title: "Pay amount required", description: "Enter the amount payable to this photographer for the assignment." });
      return;
    }
    const serviceToAssign = getNextAssignableService(draftBooking, selectedDay, [
      selectedCategory,
      assigningPhotographer.role,
    ]);
    if (!serviceToAssign) {
      toast({ title: "Quantity limit reached", description: "This service already has the required number of photographers." });
      setAssigningPhotographer(null);
      return;
    }
    setDraftAssigned((current) => getMergedAssignments(current, selectedDay.day, serviceToAssign, assigningPhotographer, payAmount));
    toast({ title: "Selected", description: "Photographer added to assignment draft." });
    setAssigningPhotographer(null);
  };

  const saveAssignments = () => {
    if (selectedPhotographerCount < requiredPhotographerCount) {
      toast({ title: "Assignment incomplete", description: "Select photographers for all services before saving." });
      return;
    }
    if (apiBooking) {
      assignPhotographer.mutate(
        { id, data: { assigned: getAssignmentPayload(draftAssigned) } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(id) });
            queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "photographers"] });
            toast({ title: "Assign done", description: "Photographer assignments saved and mails sent." });
            setSelectedCategory(null);
            setSelectedDay(null);
          },
          onError: (err) => toast({ title: "Assignment failed", description: err.message }),
        }
      );
    }
  };

  const handleConfirmRequest = () => {
    if (!window.confirm("Are you sure you want to confirm this booking?")) return;
    if (apiBooking) {
      if (booking.type === "enquiry") {
        convertInquiry.mutate(id, {
          onSuccess: () => {
            updateBooking.mutate({ id, data: { status: "confirmed" } }, {
              onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(id) })
            });
          }
        });
        return;
      }
      updateBooking.mutate({ id, data: { status: "confirmed" } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(id) })
      });
    }
  };

  const handleDeleteBooking = () => {
    if (booking.type !== "enquiry" && !["cancelled", "pending"].includes(booking.status)) {
      toast({ title: "Delete not allowed", description: "Only pending or cancelled bookings can be deleted." });
      return;
    }
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    if (booking.status === "pending" && booking.type !== "enquiry") {
      updateBooking.mutate({ id, data: { status: "cancelled" } }, {
        onSuccess: () => {
          deleteBooking.mutate(id, {
            onSuccess: () => {
              toast({ title: "Deleted", description: "Booking record deleted successfully." });
              window.location.href = "/admin/bookings";
            },
            onError: (err) => toast({ title: "Delete failed", description: err.message }),
          });
        },
        onError: (err) => toast({ title: "Cancel failed", description: err.message }),
      });
      return;
    }
    deleteBooking.mutate(id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: "Booking record deleted successfully." });
        window.location.href = booking.type === "enquiry" ? "/admin/inquiries" : "/admin/bookings";
      },
      onError: (err) => toast({ title: "Delete failed", description: err.message }),
    });
  };

  const handleCancelBooking = () => {
    if (booking.status !== "pending") return;
    if (!window.confirm("Cancel this pending booking?")) return;
    updateBooking.mutate({ id, data: { status: "cancelled" } }, {
      onSuccess: () => {
        toast({ title: "Booking cancelled", description: "This booking can now be deleted if needed." });
        queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      },
      onError: (err) => toast({ title: "Cancel failed", description: err.message }),
    });
  };

  const handleWorkStatusSubmit = (e) => {
    e.preventDefault();
    if (!workStatus) return;
    if (!window.confirm(`Update work status to "${workStatus}"?`)) return;
    updateWorkStatus.mutate({ id, data: { workStatus } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(id) })
    });
  };

  const handleClientPaymentSubmit = (e) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount) return;
    if (!window.confirm(`Save client payment of ${amount}?`)) return;
    updateClientPayment.mutate({
      id,
      data: {
        amount,
        transactionId: paymentForm.transactionId,
        paymentMethod: paymentForm.paymentMethod,
        note: paymentForm.note,
      },
    }, {
      onSuccess: () => setPaymentForm({ amount: "", transactionId: "", paymentMethod: "upi", note: "" })
    });
  };

  const handleDiscountSubmit = (e) => {
    e.preventDefault();
    const discount = Number(discountPercentage);
    if (Number.isNaN(discount) || discount < 0 || discount > 100) {
      toast({ title: "Invalid discount", description: "Discount percentage must be between 0 and 100." });
      return;
    }
    updateBookingPrice.mutate({ id, data: { discountPercentage: discount } }, {
      onSuccess: () => toast({ title: "Discount updated", description: "Booking price has been recalculated." }),
      onError: (err) => toast({ title: "Discount failed", description: err.message }),
    });
  };

  const handleHandoverChange = (photographerId, key, value) => {
    setHandoverForms((current) => ({
      ...current,
      [photographerId]: {
        driveType: "A",
        receivedBy: "",
        note: "",
        copiedToPC: false,
        ...(current[photographerId] || {}),
        [key]: value,
      },
    }));
  };

  const handleDataHandoverSubmit = (event, photographerId) => {
    event.preventDefault();
    const form = handoverForms[photographerId] || {};
    const payload = {
      photographerId,
      driveType: form.driveType || "A",
      receivedBy: form.receivedBy || "",
      note: form.note || "",
      copiedToPC: form.copiedToPC === true,
    };
    if (!payload.receivedBy.trim()) {
      toast({ title: "Receiver required", description: "Enter who received the drive." });
      return;
    }
    updateDataHandover.mutate({ id, data: payload }, {
      onSuccess: () => {
        toast({ title: "Data handover saved", description: `Drive ${payload.driveType} marked as received.` });
        setHandoverForms((current) => ({ ...current, [photographerId]: { driveType: "A", receivedBy: "", note: "", copiedToPC: false } }));
      },
      onError: (err) => toast({ title: "Handover failed", description: err.message }),
    });
  };

  const handleCopiedToPCChange = (photographerId, drive, copiedToPC) => {
    updateDataHandover.mutate({
      id,
      data: {
        photographerId,
        driveId: drive._id || drive.id,
        driveType: drive.driveType,
        receivedBy: drive.receivedBy || "",
        note: drive.note || "",
        copiedToPC,
      },
    }, {
      onSuccess: () => toast({
        title: copiedToPC ? "Copied to PC" : "Copy pending",
        description: `Drive ${drive.driveType} status updated.`,
      }),
      onError: (err) => toast({ title: "Handover update failed", description: err.message }),
    });
  };

  const handleDownloadBill = () => {
    const escapeHtml = (value) => String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
    const rows = [];
    (booking.events || []).forEach((event) => {
      (event.services || []).forEach((item) => {
        rows.push({
          group: `Day ${event.day} - ${formatDateValue(event.date)}${event.location ? `, ${event.location}` : ""}`,
          name: getServiceName(item),
          quantity: getServiceQuantity(item),
        });
      });
    });
    (booking.addons || []).forEach((item) => {
      rows.push({
        group: "Add-on",
        name: item.serviceId?.name || item.serviceId || "Add-on",
        quantity: Math.max(1, Number(item.quantity) || 1),
      });
    });

    const billWindow = window.open("", "_blank", "width=900,height=700");
    if (!billWindow) {
      toast({ title: "Popup blocked", description: "Allow popups to download the bill PDF." });
      return;
    }

    const rowHtml = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.group)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td class="right">${row.quantity}</td>
      </tr>
    `).join("");

    billWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Bill ${booking.bookingId || booking.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
            .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #111827; padding-bottom: 18px; }
            h1 { margin: 0; font-size: 24px; }
            h2 { margin: 24px 0 8px; font-size: 16px; }
            p { margin: 4px 0; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; vertical-align: top; }
            th { background: #f3f4f6; color: #374151; }
            .right { text-align: right; }
            .totals { margin-left: auto; width: 340px; margin-top: 18px; }
            .totals div { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #e5e7eb; }
            .grand { font-weight: 700; font-size: 18px; color: #111827; }
            .muted { color: #6b7280; font-size: 12px; }
            @media print { button { display: none; } body { margin: 20px; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="float:right;padding:8px 14px;margin-bottom:12px;">Download PDF</button>
          <div class="top">
            <div>
              <h1>TK Moments Capture</h1>
              <p>Bill / Estimate</p>
            </div>
            <div class="right">
              <p><b>Booking:</b> ${escapeHtml(booking.bookingId || booking.id)}</p>
              <p><b>Date:</b> ${formatDateValue(new Date())}</p>
              <p><b>Status:</b> ${escapeHtml(booking.status || "-")}</p>
            </div>
          </div>
          <h2>Customer</h2>
          <p><b>${escapeHtml(customer.name || "-")}</b></p>
          <p>${escapeHtml(customer.email || "")}</p>
          <p>${escapeHtml(customer.phone || "")}</p>
          <h2>Service Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Service</th>
                <th class="right">Qty</th>
              </tr>
            </thead>
            <tbody>${rowHtml || `<tr><td colspan="3">No services found</td></tr>`}</tbody>
          </table>
          <div class="totals">
            ${hasDiscount ? `<div><span>Discount (${booking.discountPercentage || 0}%)</span><b>-${formatCurrency(booking.discountAmount || 0, settings.currency)}</b></div>` : ""}
            <div class="grand"><span>Total</span><span>${formatCurrency(displayTotal || 0, settings.currency)}</span></div>
            <div><span>Paid</span><b>${formatCurrency(booking.payment?.paidAmount || 0, settings.currency)}</b></div>
            <div><span>Remaining</span><b>${formatCurrency(booking.payment?.remainingAmount || 0, settings.currency)}</b></div>
          </div>
          <p class="muted">Generated from admin booking details.</p>
          <script>window.onload = () => setTimeout(() => window.print(), 250);</script>
        </body>
      </html>
    `);
    billWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/bookings" className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-muted-foreground hover:text-slate-700">
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-slate-900 dark:text-foreground">{customer.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.cls}`}>{sc.label}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-muted-foreground mt-0.5">Booking #{booking.bookingId || booking.id}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleDownloadBill} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 dark:border-border dark:text-muted-foreground dark:hover:bg-slate-900">
            <Download className="h-4 w-4" /> Bill PDF
          </button>
          {status !== "confirmed" && (
            <button onClick={handleConfirmRequest} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm">
              <CheckCircle className="h-4 w-4" /> Confirm Request
            </button>
          )}
          {status === "pending" && (
            <button onClick={handleCancelBooking} disabled={updateBooking.isPending} className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-50 disabled:opacity-60">
              <XCircle className="h-4 w-4" /> Cancel
            </button>
          )}
          {(booking.type === "enquiry" || ["pending", "cancelled"].includes(booking.status)) && (
            <button onClick={handleDeleteBooking} disabled={deleteBooking.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 transition-all">
              <Trash2 className="h-4 w-4" /> {deleteBooking.isPending ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-5">Event Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {[
                { label: "Days", value: `${booking.events?.length || 0}` },
                { label: "First Date", value: formatDateValue(firstEvent.date, "MMMM d, yyyy") },
                { label: "First Event / Location", value: firstEvent.location || "-", icon: MapPin },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground/70 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-foreground">
                    {Icon && <Icon className="inline h-3.5 w-3.5 text-slate-400 mr-1" />}
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {customer.note && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-border">
                <p className="text-xs font-medium text-slate-400 dark:text-muted-foreground/70 uppercase tracking-wide mb-2">Customer Note</p>
                <p className="text-sm text-slate-600 dark:text-muted-foreground bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 leading-relaxed">{customer.note}</p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Events & Photographer Assignment</h3>
            <div className="space-y-3">
              {booking.events?.map((event) => {
                const assigned = getAssignedPhotographer(draftBooking, event.day);
                const requiredRoles = getEventRequiredRoles(event);
                const assignedIds = getAssignedIdsForDay(draftBooking, event.day);
                const requiredCount = event.services?.reduce((sum, item) => sum + getServiceQuantity(item), 0) || 0;
                const isEventFilled = requiredCount > 0 && assignedIds.length >= requiredCount;
                const assignmentState = requiredCount === 0 || assignedIds.length === 0
                  ? "none"
                  : assignedIds.length >= requiredCount
                    ? "full"
                    : "partial";
                const assignmentIndicator = {
                  none: "bg-red-50 text-red-700 ring-red-200",
                  partial: "bg-orange-50 text-orange-700 ring-orange-200",
                  full: "bg-emerald-50 text-emerald-700 ring-emerald-200",
                }[assignmentState];
                return (
                  <div key={event.day} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[11px] font-bold text-primary">{event.day}</div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-foreground">{formatDateValue(event.date, "EEEE, MMM d, yyyy")}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground ml-8">{event.location}</p>
                      {!event.services?.length && (
                        <div className="ml-8 mt-2 flex flex-wrap gap-1.5">
                          <span className="text-[11px] text-amber-600">No service role found</span>
                        </div>
                      )}
                      <div className="ml-8 mt-3 space-y-1.5">
                        {event.services?.map((item, index) => {
                          const serviceName = getServiceName(item);
                          const role = getServiceRole(item);
                          const showRole = shouldShowRoleLabel(serviceName, role);
                          const requiredQuantity = getServiceQuantity(item);
                          const photos = getAssignedPhotosForService(draftBooking, event.day, item, allPhotographers);
                          const serviceState = photos.length === 0 ? "none" : photos.length >= requiredQuantity ? "full" : "partial";
                          const serviceIndicator = {
                            none: "bg-red-50 text-red-700 ring-red-200",
                            partial: "bg-orange-50 text-orange-700 ring-orange-200",
                            full: "bg-emerald-50 text-emerald-700 ring-emerald-200",
                          }[serviceState];
                          const hasAvailable = role ? getAvailableCountForRole(allPhotographers, role, event) > 0 : true;
                          const shouldShowUnavailable = !photos.length && !hasAvailable;
                          return (
                            <div key={`${event.day}-service-assign-${index}`} className="flex flex-wrap items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-xs text-slate-600 ring-1 ring-slate-100 dark:bg-card dark:text-muted-foreground dark:ring-border">
                              <span className="font-medium text-slate-800 dark:text-foreground">{serviceName}</span>
                              {showRole && (
                                <>
                                  <span className="text-slate-300">|</span>
                                  <span>{getRoleLabel(role)}</span>
                                </>
                              )}
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${serviceIndicator}`}>
                                {photos.length}/{requiredQuantity} assigned
                              </span>
                              <span className="text-slate-300">|</span>
                              {photos.length ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                                  <User className="h-3 w-3" /> {photos.map((photo) => photo?.name || getPhotoId(photo)).join(", ")}
                                </span>
                              ) : (
                                <span className="font-medium text-slate-400">Not assigned</span>
                              )}
                              {shouldShowUnavailable && (
                                <>
                                  <span className="text-slate-300">|</span>
                                  <span className="font-semibold text-red-600">Not available</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {assigned && (
                        <div className="ml-8 mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                          <User className="h-3 w-3" /> {assigned.photographerName || getAssignedNames(assigned, allPhotographers)}
                        </div>
                      )}
                      <p className="ml-8 mt-2 text-[11px] text-slate-400 dark:text-muted-foreground/70">
                        <span className={`inline-flex rounded-full px-2 py-0.5 font-semibold ring-1 ${assignmentIndicator}`}>
                          {assignedIds.length}/{requiredCount} photographers assigned
                        </span>
                      </p>
                    </div>
                    <button
                      disabled={isEventFilled}
                      onClick={() => {
                        if (isEventFilled) return;
                        setSelectedCategory(null);
                        setSelectedDay(selectedDay?.day === event.day ? null : event);
                      }}
                      className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${isEventFilled ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-border/60 dark:bg-slate-800 dark:text-slate-500" : "bg-primary text-white hover:bg-primary/90"}`}
                    >
                      {isEventFilled ? "Assigned" : "Assign Photographer"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedDay && (
            <div className="bg-white dark:bg-card rounded-2xl border-2 border-primary/20 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">
                    {selectedCategoryConfig ? `${selectedCategoryConfig.label} - Day ${selectedDay.day}` : `Choose Category - Day ${selectedDay.day}`}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground mt-0.5">{formatDateValue(selectedDay.date, "EEEE, MMMM d, yyyy")}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedDay(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
              {isAvailabilityLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : !selectedCategory ? (
                !categoryStats.length ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-border py-10 text-center">
                    <Camera className="h-7 w-7 text-slate-300 dark:text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-muted-foreground">No role is attached to this day's services.</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {categoryStats.map((category) => {
                    const Icon = category.icon;
                    const hasAvailable = category.available > 0;
                    const fillState = !category.isRequired || category.assigned === 0 ? "none" : category.assigned >= category.required ? "full" : "partial";
                    const fillCls = {
                      none: "bg-red-50 text-red-700 ring-red-200",
                      partial: "bg-orange-50 text-orange-700 ring-orange-200",
                      full: "bg-emerald-50 text-emerald-700 ring-emerald-200",
                    }[fillState];
                    return (
                      <button
                        key={category.role}
                        onClick={() => setSelectedCategory(category.role)}
                        className="text-left rounded-xl border border-slate-200 dark:border-border/60 bg-white dark:bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ring-1 ${category.cls}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${hasAvailable ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                            {hasAvailable ? `${category.available} available` : "Not available"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-900 dark:text-foreground">{category.label}</p>
                        {category.services.length > 0 ? (
                          <p className="mt-1 text-xs text-slate-600 dark:text-muted-foreground">
                            Needed for {category.services.join(", ")}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-600 dark:text-muted-foreground">
                            Available on this date
                          </p>
                        )}
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-muted-foreground">
                          {category.isRequired && (
                            <span className={`rounded-full px-2 py-0.5 font-semibold ring-1 ${fillCls}`}>
                              {category.assigned}/{category.required} assigned
                            </span>
                          )}
                          <span>{category.available} available</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
                )
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-border px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to categories
                  </button>
                  {!categoryPhotographers.length ? (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-border py-10 text-center">
                      <Camera className="h-7 w-7 text-slate-300 dark:text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-muted-foreground">No photographers in this category.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categoryPhotographers.map((photo) => {
                        const conflict = getPhotographerConflict(photo, selectedDay, draftBooking);
                        const assignedIds = getAssignedIdsForDay(draftBooking, selectedDay.day);
                        const isAlreadyAssigned = assignedIds.includes(photo.id || photo._id);
                        const isDayFilled = selectedDayRemainingServices.length === 0;
                        const isUnavailable = !!conflict || isAlreadyAssigned || isDayFilled;
                        const unavailableText = isAlreadyAssigned ? "Already assigned to this day" : conflict ? "Not available" : "All services assigned";
                        return (
                          <div key={photo.id} className={`flex items-center gap-3 p-3.5 border rounded-xl transition-all ${isUnavailable ? "border-slate-200 dark:border-border/60 bg-slate-50/80 dark:bg-slate-900/40 opacity-60" : "border-slate-200 dark:border-border/60 bg-white dark:bg-card hover:border-primary/20"}`}>
                            {photo.avatar ? (
                              <img src={photo.avatar} alt={photo.name} className="h-10 w-10 rounded-xl object-cover shrink-0" />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                                {(photo.name || "?").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-foreground truncate">{photo.name}</p>
                                {isUnavailable && <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                              </div>
                              <p className="text-xs text-slate-400 dark:text-muted-foreground/70 truncate">{getRoleLabel(photo.role)} - {photo.city}</p>
                              {isUnavailable && (
                                <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                  <AlertCircle className="h-3 w-3 shrink-0" /> {unavailableText}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => !isUnavailable && openAssignmentDialog(photo)}
                              disabled={isUnavailable}
                              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isUnavailable ? "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500" : "bg-primary hover:bg-primary/90 text-white"}`}
                            >
                              {isAlreadyAssigned ? "Assigned" : isDayFilled ? "Filled" : conflict ? "Not available" : "Assign"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-border dark:bg-card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Data Handover</h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-muted-foreground">Assigned photographers and drive receiving status.</p>
              </div>
              <HardDrive className="h-5 w-5 text-primary" />
            </div>

            {!assignedPhotographers.length ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-border dark:text-muted-foreground">
                Assign photographers before adding data handover.
              </div>
            ) : (
              <div className="space-y-3">
                {assignedPhotographers.map((photo) => {
                  const photographerId = getPhotoId(photo);
                  const entry = getHandoverEntry(booking, photographerId);
                  const form = handoverForms[photographerId] || { driveType: "A", receivedBy: "", note: "", copiedToPC: false };
                  return (
                    <div key={photographerId} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-border dark:bg-slate-900/20">
                      <div className="grid gap-4 xl:grid-cols-[minmax(240px,0.75fr)_minmax(0,1.25fr)]">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            {photo?.avatar ? (
                              <img src={photo.avatar} alt={photo.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                {(photo?.name || "?").slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900 dark:text-foreground">{photo?.name || photographerId}</p>
                              <p className="truncate text-xs text-slate-400 dark:text-muted-foreground">{getRoleLabel(photo?.role)}</p>
                            </div>
                          </div>

                          <div className="mt-3">
                            {entry?.drives?.length ? (
                              <div className="space-y-2">
                                {entry.drives.map((drive, driveIndex) => (
                                  <div key={drive._id || `${photographerId}-${drive.driveType}-${driveIndex}`} className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/60">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                      <div>
                                        <p className="font-semibold">Drive {drive.driveType} received by {drive.receivedBy || "-"}</p>
                                        <p className="mt-0.5 text-emerald-600 dark:text-emerald-400">{formatDateValue(drive.handedOverDate)}</p>
                                      </div>
                                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${drive.copiedToPC === true ? "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-900/70" : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/70"}`}>
                                        {drive.copiedToPC === true ? "Copied to PC" : "PC copy pending"}
                                      </span>
                                    </div>
                                    {drive.note && (
                                      <div className="mt-2 rounded-md bg-white/70 px-2 py-1.5 text-slate-600 ring-1 ring-emerald-100 dark:bg-slate-950/30 dark:text-slate-300 dark:ring-emerald-900/40">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Note</p>
                                        <p className="mt-0.5 whitespace-pre-line break-words leading-relaxed">{drive.note}</p>
                                      </div>
                                    )}
                                    <label className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                                      <input
                                        type="checkbox"
                                        checked={drive.copiedToPC === true}
                                        disabled={updateDataHandover.isPending || !(drive._id || drive.id)}
                                        onChange={(event) => handleCopiedToPCChange(photographerId, drive, event.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                                      />
                                      Data copied to admin PC
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 dark:bg-red-950/30 dark:text-red-300 dark:ring-red-900/60">
                                Data not handover
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="grid gap-3 sm:grid-cols-3">
                            <label className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-muted-foreground">Drive</span>
                            <select
                              value={form.driveType}
                              onChange={(e) => handleHandoverChange(photographerId, "driveType", e.target.value)}
                              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border dark:bg-card dark:text-foreground"
                            >
                              {DRIVE_TYPES.map((drive) => (
                                <option key={drive} value={drive}>Drive {drive}</option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-muted-foreground">Received By</span>
                            <input
                              value={form.receivedBy}
                              onChange={(e) => handleHandoverChange(photographerId, "receivedBy", e.target.value)}
                              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border dark:bg-card dark:text-foreground"
                              placeholder="Receiver name"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-muted-foreground">Note</span>
                            <input
                              value={form.note}
                              onChange={(e) => handleHandoverChange(photographerId, "note", e.target.value)}
                              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-border dark:bg-card dark:text-foreground"
                              placeholder="Optional note"
                            />
                          </label>
                          <label className="flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 dark:border-border dark:bg-card dark:text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={form.copiedToPC === true}
                              onChange={(e) => handleHandoverChange(photographerId, "copiedToPC", e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            Copied to PC
                          </label>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={(event) => handleDataHandoverSubmit(event, photographerId)}
                              disabled={updateDataHandover.isPending}
                              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                              <HardDrive className="h-4 w-4" /> Save
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Booking Data</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Type</p>
                <p className="font-semibold capitalize text-slate-900 dark:text-foreground">{booking.type || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Status</p>
                <p className="font-semibold capitalize text-slate-900 dark:text-foreground">{booking.status || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Work</p>
                <p className="font-semibold capitalize text-slate-900 dark:text-foreground">{booking.workStatus?.replaceAll("_", " ") || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Payment</p>
                <p className="font-semibold capitalize text-slate-900 dark:text-foreground">{booking.payment?.status || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Created</p>
                <p className="font-semibold text-slate-900 dark:text-foreground">{formatDateTimeValue(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Updated</p>
                <p className="font-semibold text-slate-900 dark:text-foreground">{formatDateTimeValue(booking.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-3">Assignments</h3>
            <button
              onClick={saveAssignments}
              disabled={assignPhotographer.isPending || !requiredPhotographerCount}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" /> {assignPhotographer.isPending ? "Saving..." : "Save Assignments"}
            </button>
            <p className="mt-2 text-xs text-slate-500 dark:text-muted-foreground">
              {selectedPhotographerCount}/{requiredPhotographerCount} photographers selected. Save once after all services are covered.
            </p>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Customer Information</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary">{getInitials(customer.name)}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-foreground text-sm">{customer.name}</p>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Customer</p>
              </div>
            </div>
            <div className="space-y-3">
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2.5 text-sm text-primary hover:text-primary">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" /> {customer.email}
              </a>
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" /> {customer.phone}
              </a>
              <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                {formatDateValue(firstEvent.date, "MMMM d, yyyy")}
              </div>
              <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" /> {firstEvent.location || "-"}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Services</h3>
            <div className="space-y-3">
              {booking.events?.map((event) => (
                <div key={event.day} className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-700 dark:text-foreground">Day {event.day}</p>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground">{formatDateValue(event.date)} | {event.location || "No location saved"}</p>
                    </div>
                    <span className="text-xs text-slate-400">{event.services?.length || 0} services</span>
                  </div>
                  <div className="space-y-1">
                    {event.services?.length ? event.services.map((item, index) => {
                      const serviceName = getServiceName(item);
                      const role = getServiceRole(item);
                      const showRole = shouldShowRoleLabel(serviceName, role);
                      return (
                        <div key={`${event.day}-${index}`} className="rounded-lg bg-white p-2 text-xs text-slate-600 dark:bg-card dark:text-muted-foreground">
                          <div className="flex items-start justify-between gap-3">
                            <span className="min-w-0 break-words font-medium">{serviceName}</span>
                            {showRole && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-900 dark:text-muted-foreground">{getRoleLabel(role)}</span>}
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-slate-400">
                            <span>Qty {item.quantity || 1}</span>
                            <span>{getServicePriceType(item) || "price"} {formatCurrency(getServicePrice(item), settings.currency)}</span>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-xs text-slate-400 dark:text-muted-foreground">No services selected</p>
                    )}
                  </div>
                </div>
              ))}
              {booking.addons?.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-muted-foreground mb-2">Add-ons</p>
                  <div className="space-y-1">
                    {booking.addons.map((addon, index) => (
                      <div key={index} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-900/50 dark:text-muted-foreground">
                        <div className="flex items-center justify-between gap-3">
                          <span className="min-w-0 break-words">{addon.serviceId?.name || addon.serviceId}</span>
                          <span className="shrink-0">x {addon.quantity || 1}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">{addon.serviceId?.priceType || "price"} {formatCurrency(addon.serviceId?.price || 0, settings.currency)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <form onSubmit={handleDiscountSubmit} className="mt-3 space-y-3 border-t border-slate-100 pt-3 dark:border-border">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 dark:text-muted-foreground">Estimate</span>
                    <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(baseEstimate || 0, settings.currency)}</span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center justify-between gap-3 text-emerald-700 dark:text-emerald-300">
                      <span>Discount ({booking.discountPercentage}%)</span>
                      <span className="font-semibold">-{formatCurrency(booking.discountAmount || 0, settings.currency)}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    disabled={booking.status === "confirmed"}
                    placeholder="Discount %"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-slate-100 disabled:text-slate-400 dark:border-border dark:bg-card dark:text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={updateBookingPrice.isPending || booking.status === "confirmed"}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updateBookingPrice.isPending ? "Saving" : "Apply"}
                  </button>
                </div>
                {booking.status === "confirmed" && (
                  <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Discount is locked after booking confirmation.</p>
                )}
                <div className="flex justify-between items-center border-t border-slate-100 pt-3 dark:border-border">
                  <span className="text-sm font-semibold text-slate-900 dark:text-foreground">Total</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-foreground">{formatCurrency(displayTotal || 0, settings.currency)}</span>
                </div>
              </form>
            </div>
          </div>

          <form onSubmit={handleWorkStatusSubmit} className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Work Status</h3>
            <div className="space-y-3">
              <select
                value={workStatus || booking.workStatus || "pending"}
                onChange={(e) => setWorkStatus(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border dark:bg-card dark:text-foreground"
              >
                <option value="pending">Pending</option>
                <option value="editing">Editing</option>
                <option value="edited">Edited</option>
                <option value="delivery_pending">Delivery pending</option>
                <option value="delivered">Delivered</option>
              </select>
              <button
                type="submit"
                disabled={updateWorkStatus.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
              >
                <CheckCircle className="h-4 w-4" /> {updateWorkStatus.isPending ? "Updating..." : "Update Work Status"}
              </button>
            </div>
          </form>

          <form onSubmit={handleClientPaymentSubmit} className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Client Payment</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Total</p>
                <p className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(displayTotal, settings.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Paid</p>
                <p className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(booking.payment?.paidAmount || 0, settings.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-muted-foreground/70">Remaining</p>
                <p className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(booking.payment?.remainingAmount || 0, settings.currency)}</p>
              </div>
            </div>
            {booking.payment?.history?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4 dark:border-border">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-muted-foreground/70">Payment History</p>
                <div className="space-y-2">
                  {booking.payment.history.map((item, index) => (
                    <div key={index} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600 dark:bg-slate-900/50 dark:text-muted-foreground">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-slate-900 dark:text-foreground">{formatCurrency(item.amount || 0, settings.currency)}</span>
                        <span className="capitalize">{item.paymentMethod || "-"}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">{formatDateTimeValue(item.date)} | {item.transactionId || "No transaction ID"}</p>
                      {item.note && <p className="mt-1 text-[11px]">{item.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 space-y-3">
              <input
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                placeholder="Amount"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border dark:bg-card dark:text-foreground"
                required
              />
              <input
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                placeholder="Transaction ID"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border dark:bg-card dark:text-foreground"
              />
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border dark:bg-card dark:text-foreground"
              >
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
              </select>
              <input
                value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                placeholder="Note"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border dark:bg-card dark:text-foreground"
              />
              <button
                type="submit"
                disabled={updateClientPayment.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Wallet className="h-4 w-4" /> {updateClientPayment.isPending ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={!!assigningPhotographer} onOpenChange={(open) => !open && setAssigningPhotographer(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Photographer Assignment</DialogTitle>
            <DialogDescription className="pt-1">
              Assign <span className="font-semibold text-slate-900 dark:text-foreground">{assigningPhotographer?.name || "this photographer"}</span> to{" "}
              <span className="font-semibold text-slate-900 dark:text-foreground">Day {selectedDay?.day || ""}</span> {selectedDay ? `(${format(new Date(selectedDay.date), "MMMM d, yyyy")})` : ""}.
            </DialogDescription>
          </DialogHeader>
          {assigningPhotographer && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-border/60">
                {assigningPhotographer.avatar ? (
                  <img src={assigningPhotographer.avatar} alt={assigningPhotographer.name} className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                    {(assigningPhotographer.name || "?").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-foreground">{assigningPhotographer.name}</p>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground">{getRoleLabel(assigningPhotographer.role)} - {assigningPhotographer.city}</p>
                </div>
              </div>
              <div className="grid gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Pay amount</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={assignmentPayAmount}
                    onChange={(event) => setAssignmentPayAmount(event.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-border dark:bg-card dark:text-foreground"
                    placeholder="Photographer amount"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-foreground">
                Photographer payment will use this amount for this booking assignment.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssigningPhotographer(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={confirmAssignment} disabled={assignPhotographer.isPending} className="rounded-xl bg-primary hover:bg-primary/90">
              {assignPhotographer.isPending ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
