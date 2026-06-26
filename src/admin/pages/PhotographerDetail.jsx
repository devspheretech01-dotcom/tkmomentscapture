import { Link, useNavigate, useParams } from "react-router-dom";
import { useDeletePhotographer, useGetBookings, useGetPaymentsByPhotographer, useGetPhotographer, useGetRoleSources, useUpdatePhotographer } from "@admin/services/api";
import { ADD_NEW_ROLE_VALUE, getRoleLabel, getRoleOptions, normalizeRoleValue } from "@admin/services/roles";
import { Skeleton } from "@admin/components/ui/skeleton";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useToast } from "@shared/hooks/use-toast";
import { MapPin, Mail, Phone, Calendar, ChevronLeft, Edit, Save, Trash2, Wallet } from "lucide-react";

const STATUS_CONFIG = {
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
  inactive: { label: "Inactive", cls: "bg-red-50 text-red-700 ring-1 ring-red-200", dot: "bg-red-500" },
};
const getPhotoId = (photo) => photo?._id || photo?.id || photo;
const getService = (item) => item?.serviceId || item?.service || item;
const getServiceName = (item) => {
  const service = getService(item);
  return service?.name || service || "Service";
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
const getAssignedPhotoRefs = (booking, day) => {
  const assigned = booking.assigned?.find((item) => item.day === day);
  if (Array.isArray(assigned?.assignments)) {
    return assigned.assignments.map((item) => item.photographerId);
  }
  const photographers = assigned?.photographerIds || assigned?.photographerId || [];
  return Array.isArray(photographers) ? photographers : [photographers];
};
const getServiceId = (item) => {
  const service = getService(item);
  return service?._id || service?.id || (typeof service === "string" ? service : "") || item?.serviceId || item?.service || "";
};
const getAssignedServiceIdsForPhoto = (booking, day, photographerId) => {
  const assigned = booking.assigned?.find((item) => item.day === day);
  if (!Array.isArray(assigned?.assignments)) return [];
  return assigned.assignments
    .filter((item) => getPhotoId(item.photographerId) === photographerId)
    .map((item) => getServiceId(item.serviceId))
    .filter(Boolean);
};
const getAssignedEntriesForPhoto = (booking, day, photographerId) => {
  const assigned = booking.assigned?.find((item) => item.day === day);
  if (!Array.isArray(assigned?.assignments)) return [];
  return assigned.assignments.filter((item) => getPhotoId(item.photographerId) === photographerId);
};
const MONTHS = [
  { value: "all", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];
const getYearValue = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? String(date).slice(0, 4) : String(parsed.getFullYear());
};
const getMonthValue = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? String(date).slice(5, 7) : String(parsed.getMonth() + 1).padStart(2, "0");
};
const matchesMonthYear = (date, month, year) => {
  const monthMatch = month === "all" || getMonthValue(date) === month;
  const yearMatch = year === "all" || getYearValue(date) === year;
  return monthMatch && yearMatch;
};
const formatMoney = (amount) => Number(amount || 0).toLocaleString("en-IN");

export default function PhotographerDetail() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: apiPhotographer, isLoading } = useGetPhotographer(id, { query: { enabled: !!id } });
  const { data: bookings = [], isLoading: isBookingsLoading } = useGetBookings();
  const { data: payments = [], isLoading: isPaymentsLoading } = useGetPaymentsByPhotographer(id, { query: { enabled: !!id } });
  const roleSources = useGetRoleSources();
  const roleOptions = useMemo(() => getRoleOptions(roleSources), [roleSources.photographers, roleSources.services]);
  const updatePhotographer = useUpdatePhotographer();
  const deletePhotographer = useDeletePhotographer();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [newRole, setNewRole] = useState("");
  const [bookingMonth, setBookingMonth] = useState("all");
  const [bookingYear, setBookingYear] = useState("all");
  const [paymentMonth, setPaymentMonth] = useState("all");
  const [paymentYear, setPaymentYear] = useState("all");

  const photographer = apiPhotographer;
  const bookedAssignments = useMemo(() => {
    if (!photographer) return [];
    const photographerId = photographer.id || photographer._id;
    return bookings.flatMap((booking) => (
      (booking.events || []).flatMap((event) => {
        const isAssigned = getAssignedPhotoRefs(booking, event.day).some((photo) => getPhotoId(photo) === photographerId);
        if (!isAssigned) return [];
        const assignedServiceIds = getAssignedServiceIdsForPhoto(booking, event.day, photographerId);
        const assignedEntries = getAssignedEntriesForPhoto(booking, event.day, photographerId);
        const services = assignedServiceIds.length
          ? (event.services || []).filter((service) => assignedServiceIds.includes(getServiceId(service)))
          : (event.services || []).filter((service) => getServiceRole(service) === photographer.role);
        const amount = assignedEntries.reduce((sum, entry) => {
          const customAmount = Number(entry.payAmount);
          return sum + (Number.isFinite(customAmount) && customAmount > 0 ? customAmount : Number(photographer.perDayRate || 0));
        }, 0);
        return [{
          id: `${booking.id}-${event.day}`,
          bookingId: booking.bookingId || booking.id,
          customer: booking.customer || {},
          date: event.date,
          location: event.location,
          day: event.day,
          services,
          amount: amount || photographer.perDayRate || 0,
          status: booking.status || "pending",
        }];
      })
    )).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  }, [bookings, photographer]);
  const bookingYears = useMemo(() => {
    const years = bookedAssignments.map((item) => getYearValue(item.date)).filter(Boolean);
    return ["all", ...new Set(years)].sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : Number(b) - Number(a)));
  }, [bookedAssignments]);
  const filteredBookedAssignments = useMemo(() => (
    bookedAssignments.filter((item) => matchesMonthYear(item.date, bookingMonth, bookingYear))
  ), [bookedAssignments, bookingMonth, bookingYear]);
  const paymentYears = useMemo(() => {
    const years = payments.map((item) => String(item.month || "").slice(0, 4)).filter(Boolean);
    return ["all", ...new Set(years)].sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : Number(b) - Number(a)));
  }, [payments]);
  const filteredPayments = useMemo(() => (
    payments.filter((payment) => {
      const month = String(payment.month || "").slice(5, 7);
      const year = String(payment.month || "").slice(0, 4);
      return (paymentMonth === "all" || month === paymentMonth) && (paymentYear === "all" || year === paymentYear);
    })
  ), [payments, paymentMonth, paymentYear]);
  const bookedTotal = filteredBookedAssignments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const paymentTotal = filteredPayments.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const paidTotal = filteredPayments.reduce((sum, item) => sum + Number(item.advancePaid || 0), 0);
  const remainingTotal = filteredPayments.reduce((sum, item) => sum + Number(item.remainingAmount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }
  if (!photographer) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-card py-16 text-center text-sm text-muted-foreground dark:border-border">
        Photographer not found.
      </div>
    );
  }

  const sc = photographer.isActive ? STATUS_CONFIG.active : STATUS_CONFIG.inactive;

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to update this photographer?")) return;
    const form = new FormData(e.currentTarget);
    const role = (selectedRole || photographer.role) === ADD_NEW_ROLE_VALUE ? normalizeRoleValue(newRole) : (selectedRole || photographer.role);
    if (!role) {
      toast({ title: "Role required", description: "Select a role or add a new one." });
      return;
    }

    const payload = new FormData();
    payload.append("name", form.get("name"));
    payload.append("email", form.get("email"));
    payload.append("phone", form.get("phone"));
    payload.append("city", form.get("city"));
    payload.append("role", role);
    payload.append("isActive", String(form.get("isActive") === "true"));
    payload.append("perDayRate", String(Number(form.get("perDayRate") || photographer.perDayRate || 0)));

    const avatar = form.get("avatar");
    if (avatar instanceof File && avatar.size > 0) payload.append("avatar", avatar);

    updatePhotographer.mutate({
      id,
      data: payload,
    }, {
      onSuccess: () => {
        setIsEditing(false);
        toast({ title: "Photographer Updated", description: "Profile changes saved." });
      },
      onError: (err) => toast({ title: "Update failed", description: err.message }),
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Are you sure you want to delete this photographer?")) return;
    deletePhotographer.mutate(id, {
      onSuccess: () => {
        toast({ title: "Photographer Deleted", description: "Profile removed." });
        navigate("/admin/photographers");
      },
      onError: (err) => toast({ title: "Delete failed", description: err.message }),
    });
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/photographers" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-muted-foreground hover:text-slate-700 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Photographers
      </Link>

      <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {photographer.avatar ? (
              <img src={photographer.avatar} alt={photographer.name} className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-100 shadow-md" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary ring-1 ring-slate-100 shadow-md">
                {(photographer.name || "?").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-foreground">{photographer.name}</h1>
              <p className="text-slate-500 dark:text-muted-foreground mt-0.5">{getRoleLabel(photographer.role)}</p>
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${sc.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                {sc.label}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsEditing((value) => !value)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-border/60 text-sm font-medium text-slate-700 dark:text-muted-foreground hover:bg-slate-50 dark:bg-slate-900/50 transition-all">
            <Edit className="h-4 w-4" /> Edit Profile
          </button>
          <button onClick={handleDelete} disabled={deletePhotographer.isPending} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-all">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          </div>
        </div>
      </div>

      {isEditing && (
        <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm md:grid-cols-2">
          <input name="name" defaultValue={photographer.name} className="h-10 rounded-xl border border-border bg-card px-3 text-sm" placeholder="Name" required />
          <input name="avatar" type="file" accept="image/*" className="h-10 rounded-xl border border-border bg-card px-3 text-sm" />
          <input name="email" defaultValue={photographer.email} className="h-10 rounded-xl border border-border bg-card px-3 text-sm" placeholder="Email" required />
          <input name="phone" defaultValue={photographer.phone} className="h-10 rounded-xl border border-border bg-card px-3 text-sm" placeholder="Phone" required />
          <input name="city" defaultValue={photographer.city} className="h-10 rounded-xl border border-border bg-card px-3 text-sm" placeholder="City" required />
          <select name="role" value={selectedRole || photographer.role} onChange={(e) => setSelectedRole(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm">
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
            <option value={ADD_NEW_ROLE_VALUE}>Add new role</option>
          </select>
          {(selectedRole || photographer.role) === ADD_NEW_ROLE_VALUE && (
            <input value={newRole} onChange={(e) => setNewRole(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm" placeholder="New role" required />
          )}
          <select name="isActive" defaultValue={String(photographer.isActive)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <input name="perDayRate" type="number" defaultValue={photographer.perDayRate || ""} className="h-10 rounded-xl border border-border bg-card px-3 text-sm" placeholder="Per day rate" />
          <button disabled={updatePhotographer.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 md:col-span-2">
            <Save className="h-4 w-4" /> {updatePhotographer.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-4">Contact Info</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <a href={`mailto:${photographer.email}`} className="text-primary hover:underline truncate">{photographer.email}</a>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 dark:text-muted-foreground">{photographer.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-slate-700 dark:text-muted-foreground">{photographer.city}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-border shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-border sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Booked Details</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-muted-foreground">Calculated by per day rate: {formatMoney(photographer.perDayRate)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={bookingMonth} onChange={(e) => setBookingMonth(e.target.value)} className="h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground">
                {MONTHS.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
              </select>
              <select value={bookingYear} onChange={(e) => setBookingYear(e.target.value)} className="h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground">
                {bookingYears.map((year) => <option key={year} value={year}>{year === "all" ? "All Years" : year}</option>)}
              </select>
            </div>
          </div>
          {isBookingsLoading ? (
            <div className="p-5">
              <Skeleton className="h-32 rounded-xl" />
            </div>
          ) : filteredBookedAssignments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-border dark:bg-slate-900/30 dark:text-muted-foreground">
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Client Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Booked Service</th>
                    <th className="px-4 py-3 text-left font-semibold">Location</th>
                    <th className="px-4 py-3 text-right font-semibold">Earning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-border/60">
                  {filteredBookedAssignments.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-100 px-2.5 py-1 font-semibold text-slate-900">
                          <Calendar className="h-3.5 w-3.5 text-yellow-700" />
                          {item.date ? format(new Date(item.date), "dd-MM-yyyy") : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-foreground">{item.customer.name || "-"}</p>
                        <p className="text-xs text-slate-400">{item.bookingId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {item.services.length ? item.services.map((service, index) => (
                            <span key={`${item.id}-${index}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-900 dark:text-muted-foreground">
                              {getServiceName(service)}
                            </span>
                          )) : <span className="text-xs text-slate-400">No service for this role</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-muted-foreground">{item.location || "-"}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatMoney(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-right text-sm font-bold text-slate-900 dark:border-border dark:bg-slate-900/30 dark:text-foreground">
                Assignment pay total: {formatMoney(bookedTotal)}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-border/60">
              {!photographer.bookedDates?.length || bookedAssignments.length ? (
                <p className="px-5 py-6 text-sm text-slate-400 dark:text-muted-foreground/70 text-center">No booked details match this filter.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[720px] w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-border dark:bg-slate-900/30 dark:text-muted-foreground">
                        <th className="px-4 py-3 text-left font-semibold">Date</th>
                        <th className="px-4 py-3 text-left font-semibold">Client Name</th>
                        <th className="px-4 py-3 text-left font-semibold">Booked Service</th>
                        <th className="px-4 py-3 text-right font-semibold">Earning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-border/60">
                      {photographer.bookedDates.map((date) => (
                        <tr key={date} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-yellow-100 px-2.5 py-1 font-semibold text-slate-900">
                              <Calendar className="h-3.5 w-3.5 text-yellow-700" />
                              {date ? format(new Date(date), "dd-MM-yyyy") : "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-foreground">-</td>
                          <td className="px-4 py-3 text-slate-400">Booking detail not linked</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatMoney(photographer.perDayRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-border dark:bg-card">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-foreground">
              <Wallet className="h-4 w-4 text-primary" /> Payment Details
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-muted-foreground">Photographer payment records and transactions.</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)} className="h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground">
              {MONTHS.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
            </select>
            <select value={paymentYear} onChange={(e) => setPaymentYear(e.target.value)} className="h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground">
              {paymentYears.map((year) => <option key={year} value={year}>{year === "all" ? "All Years" : year}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-5 dark:border-border sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
            <p className="text-xs text-slate-500 dark:text-muted-foreground">Total Amount</p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-foreground">{formatMoney(paymentTotal)}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
            <p className="text-xs text-emerald-700 dark:text-emerald-300">Paid</p>
            <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{formatMoney(paidTotal)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20">
            <p className="text-xs text-amber-700 dark:text-amber-300">Remaining</p>
            <p className="mt-1 text-lg font-bold text-amber-700 dark:text-amber-300">{formatMoney(remainingTotal)}</p>
          </div>
        </div>

        {isPaymentsLoading ? (
          <div className="p-5">
            <Skeleton className="h-36 rounded-xl" />
          </div>
        ) : filteredPayments.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-border dark:bg-slate-900/30 dark:text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Month</th>
                  <th className="px-4 py-3 text-right font-semibold">Days</th>
                  <th className="px-4 py-3 text-right font-semibold">Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-right font-semibold">Paid</th>
                  <th className="px-4 py-3 text-right font-semibold">Remaining</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-border/60">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id || payment._id || payment.month} className="align-top hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-foreground">{payment.month || "-"}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-muted-foreground">{payment.totalDays || 0}</td>
                    <td className="px-4 py-3 text-right text-slate-600 dark:text-muted-foreground">{formatMoney(payment.perDayRate)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-foreground">{formatMoney(payment.totalAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">{formatMoney(payment.advancePaid)}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-700">{formatMoney(payment.remainingAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-700 dark:bg-slate-900 dark:text-muted-foreground">
                        {payment.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {payment.transactions?.length ? (
                        <div className="space-y-1.5">
                          {payment.transactions.map((transaction, index) => (
                            <div key={`${payment.month}-${index}`} className="rounded-lg bg-slate-50 px-2 py-1.5 text-xs text-slate-600 dark:bg-slate-900/50 dark:text-muted-foreground">
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-semibold text-slate-900 dark:text-foreground">{formatMoney(transaction.amount)}</span>
                                <span className="capitalize">{transaction.paymentMethod || "-"}</span>
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-400">
                                {transaction.date ? format(new Date(transaction.date), "dd-MM-yyyy") : "-"} | {transaction.transactionId || "No transaction ID"} | {transaction.type || "advance"}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No transactions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-slate-400 dark:text-muted-foreground/70">No payment details match this filter.</p>
        )}
      </div>
    </div>
  );
}
