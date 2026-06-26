import { useMemo, useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@shared/utils/admin";
import { useToast } from "@shared/hooks/use-toast";
import { useSettings } from "@admin/services/SettingsContext";
import {
  useGetPayments,
  useGetPhotographers,
  useGetPaymentsByMonth,
  useGetPaymentsByPhotographer,
  useGetUnpaidPayments,
  useUpdatePhotographerPayment,
  useGetBookings,
} from "@admin/services/api";
import { Input } from "@admin/components/ui/input";
import { Button } from "@admin/components/ui/button";
import { Skeleton } from "@admin/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@admin/components/ui/dialog";
import { CalendarDays, CreditCard, History, Search, Wallet } from "lucide-react";

const monthValue = () => new Date().toISOString().slice(0, 7);

const STATUS_STYLE = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  partial: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  overdue: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const getPhotographer = (payment) => payment.photographerId || {};
const getPhotographerId = (photographer) => photographer?._id || photographer?.id || photographer;
const getId = (value) => value?._id || value?.id || value || "";
const getBookedMonths = (photographer) => (
  [...new Set((photographer?.bookedDates || [])
    .map((date) => String(date).slice(0, 7))
    .filter((date) => /^\d{4}-\d{2}$/.test(date)))]
    .sort((a, b) => b.localeCompare(a))
);
const getPhotographerWorkSummary = (bookings = [], photographerId, month, fallbackRate = 0) => {
  const workItems = [];
  bookings.forEach((booking) => {
    (booking.assigned || []).forEach((assign) => {
      const event = (booking.events || []).find((item) => item.day === assign.day);
      if (!event?.date || !String(event.date).startsWith(month)) return;
      (assign.assignments || []).forEach((assignment) => {
        if (getId(assignment.photographerId) !== photographerId) return;
        const amount = Number(assignment.payAmount) > 0 ? Number(assignment.payAmount) : Number(fallbackRate || 0);
        workItems.push({ amount, date: event.date });
      });
    });
  });
  const workDates = new Set(workItems.map((item) => item.date).filter(Boolean));
  return {
    totalAmount: workItems.reduce((sum, item) => sum + item.amount, 0),
    totalDays: workDates.size,
  };
};
const getAssignmentMonths = (bookings = [], photographerId) => {
  const months = bookings.flatMap((booking) => (
    (booking.assigned || []).flatMap((assign) => {
      const hasPhotographer = (assign.assignments || []).some((assignment) => getId(assignment.photographerId) === photographerId);
      if (!hasPhotographer) return [];
      const event = (booking.events || []).find((item) => item.day === assign.day);
      return event?.date ? [String(event.date).slice(0, 7)] : [];
    })
  )).filter((date) => /^\d{4}-\d{2}$/.test(date));

  return [...new Set(months)].sort((a, b) => b.localeCompare(a));
};
const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "MMM d, yyyy h:mm a");
};
const getTransactionsText = (payment) => (
  payment.transactions || []
).map((item) => [
  item.transactionId,
  item.paymentMethod,
  item.type,
  item.amount,
  formatDateTime(item.date),
].filter(Boolean).join(" ")).join(" ");
const getPaymentSearchText = (payment) => {
  const photographer = getPhotographer(payment);
  return [
    photographer.name,
    photographer.email,
    photographer.phone,
    payment.month,
    payment.status,
    payment.note,
    payment.totalDays,
    payment.perDayRate,
    payment.totalAmount,
    payment.advancePaid,
    payment.remainingAmount,
    getTransactionsText(payment),
  ].filter(Boolean).join(" ").toLowerCase();
};

export default function Payments() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const [mode, setMode] = useState("all");
  const [month, setMonth] = useState(monthValue());
  const [photographerId, setPhotographerId] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [form, setForm] = useState({
    photographerId: "",
    month: monthValue(),
    paymentDate: new Date().toISOString().slice(0, 10),
    transactionId: "",
    paymentMethod: "upi",
    note: "",
  });

  const { data: allPayments = [], isLoading } = useGetPayments();
  const { data: unpaidPayments = [], isLoading: isUnpaidLoading } = useGetUnpaidPayments();
  const { data: monthPayments = [], isLoading: isMonthLoading } = useGetPaymentsByMonth(month, { query: { enabled: mode === "month" && !!month, retry: false } });
  const { data: photographerPayments = [], isLoading: isPhotographerLoading } = useGetPaymentsByPhotographer(photographerId, { query: { enabled: mode === "photographer" && !!photographerId, retry: false } });
  const { data: photographers = [] } = useGetPhotographers();
  const { data: bookings = [] } = useGetBookings();
  const updatePayment = useUpdatePhotographerPayment();

  const selectedPaymentPhotographer = photographers.find((p) => getPhotographerId(p) === form.photographerId);
  const selectedFilterPhotographer = photographers.find((p) => getPhotographerId(p) === photographerId);
  const paymentMonths = [...new Set([
    ...getBookedMonths(selectedPaymentPhotographer),
    ...getAssignmentMonths(bookings, form.photographerId),
  ])].sort((a, b) => b.localeCompare(a));
  const allBookedMonths = [...new Set([
    ...photographers.flatMap(getBookedMonths),
    ...photographers.flatMap((photographer) => getAssignmentMonths(bookings, getPhotographerId(photographer))),
  ])].sort((a, b) => b.localeCompare(a));
  const filterMonths = mode === "month" ? allBookedMonths : [...new Set([
    ...getBookedMonths(selectedFilterPhotographer),
    ...getAssignmentMonths(bookings, photographerId),
  ])].sort((a, b) => b.localeCompare(a));
  const workSummary = getPhotographerWorkSummary(
    bookings,
    form.photographerId,
    form.month,
    selectedPaymentPhotographer?.perDayRate || 0
  );
  const expectedDays = workSummary.totalDays;
  const expectedTotal = workSummary.totalAmount;
  const existingPaymentForForm = allPayments.find((payment) => {
    const photographer = getPhotographer(payment);
    return form.photographerId && form.month &&
      (getPhotographerId(photographer) === form.photographerId || getPhotographerId(payment.photographerId) === form.photographerId) &&
      payment.month === form.month;
  });
  const payableAmount = existingPaymentForForm
    ? Math.max(existingPaymentForForm.remainingAmount || 0, 0)
    : expectedTotal;

  const sourcePayments = mode === "unpaid"
    ? unpaidPayments
    : mode === "month"
      ? monthPayments
      : mode === "photographer"
        ? photographerPayments
        : allPayments;

  const payments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sourcePayments.filter((payment) => {
      if (!query) return true;
      return getPaymentSearchText(payment).includes(query);
    }).sort((a, b) => {
      if (sort === "oldest") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sort === "month") return (b.month || "").localeCompare(a.month || "");
      if (sort === "total_high") return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sort === "paid_high") return (b.advancePaid || 0) - (a.advancePaid || 0);
      if (sort === "remaining_high") return (b.remainingAmount || 0) - (a.remainingAmount || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [sourcePayments, search, sort]);

  const loading = isLoading || (mode === "unpaid" && isUnpaidLoading) || (mode === "month" && isMonthLoading) || (mode === "photographer" && isPhotographerLoading);

  const handleModeChange = (value) => {
    setMode(value);
    if (value !== "photographer") setPhotographerId("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\d{4}-\d{2}$/.test(form.month)) {
      toast({ title: "Invalid month", description: "Month format must be YYYY-MM." });
      return;
    }

    if (!form.paymentDate) {
      toast({ title: "Payment date required", description: "Select the actual payment date." });
      return;
    }

    if (!payableAmount || payableAmount <= 0) {
      toast({ title: "Nothing to pay", description: "No payable amount found for this booked month." });
      return;
    }

    if (!window.confirm(`Pay ${formatCurrency(payableAmount, settings.currency)} for booked month ${form.month}?`)) return;

    updatePayment.mutate({
      photographerId: form.photographerId,
      month: form.month,
      amountPaid: payableAmount,
      transactionId: form.transactionId.trim(),
      paymentMethod: form.paymentMethod,
      type: "remaining",
      paymentDate: form.paymentDate,
      note: [`Payment date: ${form.paymentDate}`, form.note.trim()].filter(Boolean).join(" | "),
    }, {
      onSuccess: () => {
        toast({ title: "Payment Updated", description: "Booked month total was paid and monthly totals recalculated." });
        setForm({ ...form, transactionId: "", note: "" });
      },
      onError: (err) => toast({ title: "Payment failed", description: err.message }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-foreground">Photographer Payments</h1>
          <p className="text-sm text-slate-500 dark:text-muted-foreground mt-0.5">{payments.length} payment records</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.85fr)_minmax(0,0.9fr)]">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Photographer</label>
            <select value={form.photographerId} onChange={(e) => setForm({ ...form, photographerId: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm" required>
              <option value="">Photographer</option>
              {photographers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Payment Date</label>
            <Input type="date" value={form.paymentDate} onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Booked Month</label>
            <select
              value={paymentMonths.includes(form.month) ? form.month : ""}
              onChange={(e) => e.target.value && setForm({ ...form, month: e.target.value })}
              className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              disabled={!paymentMonths.length}
            >
              <option value="">{paymentMonths.length ? "Select booked month" : "No booked months"}</option>
              {paymentMonths.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.75fr)]">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Payable Amount</label>
            <Input value={formatCurrency(payableAmount || 0, settings.currency)} readOnly className="font-semibold" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Transaction ID</label>
            <Input value={form.transactionId} onChange={(e) => setForm({ ...form, transactionId: e.target.value })} placeholder="TXN123458" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Method</label>
            <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm">
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Note</label>
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Third Payment" />
          </div>
          <div className="flex items-end">
            <Button disabled={updatePayment.isPending} className="h-10 w-full bg-primary hover:bg-primary/90 md:w-auto">
              <Wallet className="h-4 w-4" /> {updatePayment.isPending ? "Saving..." : "Update"}
            </Button>
          </div>
        </div>
        {selectedPaymentPhotographer && (
          <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900/40 dark:text-muted-foreground sm:grid-cols-4">
            <span>Current rate: <b>{formatCurrency(selectedPaymentPhotographer.perDayRate || 0, settings.currency)}</b></span>
            <span>{form.month} days: <b>{expectedDays || 0}</b></span>
            <span>Assignment total: <b>{formatCurrency(expectedTotal, settings.currency)}</b></span>
            <span>Pay now: <b>{formatCurrency(payableAmount || 0, settings.currency)}</b></span>
          </div>
        )}
      </form>

      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            ["all", "All Payments"],
            ["unpaid", "Unpaid / Partial"],
            ["month", "By Month"],
            ["photographer", "By Photographer"],
          ].map(([value, label]) => (
            <button key={value} onClick={() => handleModeChange(value)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === value ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className={`grid grid-cols-1 gap-2 ${
          mode === "month"
            ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)]"
            : mode === "photographer"
              ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.8fr)]"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.35fr)]"
        }`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, month, status, txn, amount..." className="pl-9" />
          </div>
          {mode === "month" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
              <select
                value={filterMonths.includes(month) ? month : ""}
                onChange={(e) => e.target.value && setMonth(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm"
                disabled={!filterMonths.length}
              >
                <option value="">{filterMonths.length ? "Select booked month" : "No booked months"}</option>
                {filterMonths.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          )}
          {mode === "photographer" && (
            <select value={photographerId} onChange={(e) => setPhotographerId(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm">
              <option value="">Select photographer</option>
              {photographers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-xl border border-border bg-card px-3 text-sm">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="month">Month</option>
            <option value="total_high">Total High</option>
            <option value="paid_high">Paid High</option>
            <option value="remaining_high">Remaining High</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/30">
              <tr className="border-b border-border/60">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Photographer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Month</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Days</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Rate</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Paid</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Remaining</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-5 py-4"><Skeleton className="h-8 w-full" /></td></tr>
                ))
              ) : !payments.length ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-muted-foreground">
                    <CreditCard className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    No payment records found.
                  </td>
                </tr>
              ) : payments.map((payment) => {
                const photographer = getPhotographer(payment);
                return (
                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{photographer.name || payment.photographerId}</p>
                      <p className="text-xs text-muted-foreground">{photographer.email || "-"}</p>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{payment.month}</td>
                    <td className="px-4 py-4 text-right">{payment.totalDays || 0}</td>
                    <td className="px-4 py-4 text-right">{formatCurrency(payment.perDayRate || 0, settings.currency)}</td>
                    <td className="px-4 py-4 text-right font-semibold">{formatCurrency(payment.totalAmount || 0, settings.currency)}</td>
                    <td className="px-4 py-4 text-right">{formatCurrency(payment.advancePaid || 0, settings.currency)}</td>
                    <td className="px-4 py-4 text-right">{formatCurrency(payment.remainingAmount || 0, settings.currency)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${STATUS_STYLE[payment.status] || STATUS_STYLE.pending}`}>{payment.status || "pending"}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)} className="h-8 gap-1 rounded-lg">
                        <History className="h-3.5 w-3.5" /> {payment.transactions?.length || 0}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              {getPhotographer(selectedPayment || {}).name || "Photographer"} - {selectedPayment?.month || ""}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm dark:bg-slate-900/40 sm:grid-cols-3">
                <span>Total: <b>{formatCurrency(selectedPayment.totalAmount || 0, settings.currency)}</b></span>
                <span>Remaining: <b>{formatCurrency(selectedPayment.remainingAmount || 0, settings.currency)}</b></span>
                <span>Locked rate: <b>{formatCurrency(selectedPayment.perDayRate || 0, settings.currency)}</b></span>
                <span>Working days: <b>{selectedPayment.totalDays || 0}</b></span>
              </div>
              {selectedPayment.workItems?.length > 0 && (
                <div className="rounded-xl border border-border">
                  <div className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assignment Pay Breakdown</div>
                  <div className="divide-y divide-border">
                    {selectedPayment.workItems.map((item, index) => (
                      <div key={`${item.bookingCode}-${index}`} className="grid gap-2 px-4 py-2 text-xs sm:grid-cols-[1fr_1fr_auto]">
                        <span>{item.date || "-"}</span>
                        <span>{item.serviceName || "Service"} {item.bookingCode ? `(${item.bookingCode})` : ""}</span>
                        <span className="text-right font-semibold">{formatCurrency(item.amount || 0, settings.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!selectedPayment.transactions?.length ? (
                <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">No transactions saved.</p>
              ) : selectedPayment.transactions.map((item, index) => (
                <div key={index} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{formatCurrency(item.amount || 0, settings.currency)}</p>
                      <p className="text-xs text-muted-foreground">{item.transactionId || "No transaction ID"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-slate-100 px-2 py-1 capitalize dark:bg-slate-900">{item.paymentMethod || "-"}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-1 capitalize dark:bg-slate-900">{item.type || "advance"}</span>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" /> {formatDateTime(item.date)}
                  </p>
                </div>
              ))}
              {selectedPayment.note && (
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-900/40">{selectedPayment.note}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
