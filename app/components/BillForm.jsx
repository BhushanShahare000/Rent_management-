import {
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Loader2,
  MessageCircle,
  RotateCcw,
  Save,
  Trash2,
  X
} from "lucide-react";
import { UNIT_RATE, getTenantReminder, rupees } from "../lib/rent";

const inputClass =
  "min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white px-[13px] text-[#17211c] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2] dark:placeholder:text-[#718078] focus:border-[#16724f] focus:outline focus:outline-[3px] focus:outline-[rgba(22,114,79,0.14)]";
const labelClass = "grid gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf]";

export function BillForm({
  balance = 0,
  baseRent,
  currentUnit,
  currentUnitValue,
  dueDay = 5,
  dueDate = "",
  electricityAmount,
  hasCurrentUnit,
  isSaving = false,
  month,
  onBalanceChange,
  onBaseRentChange,
  onClearBalance,
  onClearForm,
  onClearPendingDues,
  onCurrentUnitChange,
  onDeleteTenant,
  onDueDayChange,
  onDueDateChange,
  onMonthChange,
  onPaidAmountChange,
  onPreviousUnitChange,
  onQuickSetPaid,
  onSaveBill,
  onTenantChange,
  paidAmount = 0,
  previousUnit,
  saveFeedback = "",
  selectedTenant,
  selectedTenantBills = [],
  tenantPendingBalance = 0,
  tenantPendingRent = 0,
  totalAmount,
  usedUnit,
  whatsappUrl
}) {
  const isUnitDecreasing = hasCurrentUnit && currentUnitValue < previousUnit;
  const balanceNum = Number(balance) || 0;
  const paidNum = Number(paidAmount) || 0;
  const reminder = getTenantReminder(selectedTenant, tenantPendingBalance);

  return (
    <section className="rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[780px]:p-4 print:hidden">
      <div className="mb-4 flex items-center justify-between gap-[9px] max-[780px]:flex-col max-[780px]:items-start">
        <div className="flex items-center gap-[9px]">
          <Calendar size={18} className="text-[#16724f] dark:text-[#8fd8b7]" />
          <h2 className="m-0 text-lg text-[#17211c] dark:text-[#eef7f2]">Monthly Bill & Due Date</h2>
        </div>
        <div className="flex items-center gap-2">
          {onClearForm ? (
            <button
              className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#dce4dd] bg-[#f8faf9] px-2.5 text-[13px] font-bold text-[#66736c] transition hover:bg-[#eef4f1] hover:text-[#17211c] dark:border-[#365044] dark:bg-[#101713] dark:text-[#b7c8bf] dark:hover:bg-[#1b2a22]"
              onClick={onClearForm}
              title="Clear all fields"
              type="button"
            >
              <RotateCcw size={14} />
              Clear Fields
            </button>
          ) : null}
          <span className="whitespace-nowrap rounded-full bg-[#eef4f1] px-2.5 py-[7px] text-[13px] font-bold text-[#66736c] dark:bg-[#21382f] dark:text-[#b7c8bf]">
            {selectedTenantBills?.length ?? 0} saved
          </span>
        </div>
      </div>

      {/* Reminder Banner */}
      <div
        className={`mb-4 flex items-center justify-between gap-3 rounded-lg border p-3 text-sm ${reminder.color}`}
      >
        <div className="flex items-center gap-2 font-bold">
          <Clock size={16} />
          <span>
            Reminder: Rent collection for {selectedTenant?.name || "Kiraydar"} is set for the{" "}
            <strong>{selectedTenant?.dueDay || dueDay}th</strong> of every month.
          </span>
        </div>
        <span className="whitespace-nowrap rounded-md border border-current/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wide">
          {reminder.label}
        </span>
      </div>

      {saveFeedback ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-[#eaf5ef] p-3 text-sm font-bold text-[#0f5e3f] dark:bg-[#1b3327] dark:text-[#8fd8b7]">
          <CheckCircle2 size={18} />
          <span>{saveFeedback}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3.5 max-[780px]:grid-cols-1">
        <label className={labelClass}>
          Kiraydar name
          <input
            className={inputClass}
            placeholder="Tenant name"
            value={selectedTenant?.name ?? ""}
            onChange={(event) =>
              onTenantChange ? onTenantChange({ name: event.target.value }) : null
            }
          />
        </label>

        <label className={labelClass}>
          WhatsApp number
          <input
            className={inputClass}
            inputMode="tel"
            placeholder="Example: 919876543210"
            value={selectedTenant?.phone ?? ""}
            onChange={(event) =>
              onTenantChange ? onTenantChange({ phone: event.target.value }) : null
            }
          />
        </label>

        <label className={labelClass}>
          Month
          <input
            className={inputClass}
            type="month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
          />
        </label>

        <label className={labelClass}>
          Rent Due Day (1 - 31 of month)
          <div className="relative flex items-center">
            <input
              className={inputClass}
              inputMode="numeric"
              max="31"
              min="1"
              placeholder="5"
              type="number"
              value={selectedTenant?.dueDay ?? dueDay}
              onChange={(event) => {
                const val = Number(event.target.value);
                if (onDueDayChange) onDueDayChange(val);
                if (onTenantChange) onTenantChange({ dueDay: val });
              }}
            />
            <span className="absolute right-3 pointer-events-none text-xs font-bold text-[#66736c] dark:text-[#b7c8bf]">
              th of month
            </span>
          </div>
        </label>

        <label className={labelClass}>
          Payment Reminder / Due Date
          <input
            className={inputClass}
            type="date"
            value={dueDate}
            onChange={(event) => onDueDateChange(event.target.value)}
          />
        </label>

        <label className={labelClass}>
          Home rent (₹)
          <input
            className={inputClass}
            inputMode="numeric"
            placeholder="2200"
            value={baseRent}
            onChange={(event) => onBaseRentChange(event.target.value)}
          />
        </label>

        <label className={labelClass}>
          Previous unit
          <input
            className={inputClass}
            inputMode="numeric"
            placeholder="0"
            value={previousUnit}
            onChange={(event) => onPreviousUnitChange(event.target.value)}
          />
        </label>

        <label className={labelClass}>
          Current unit
          <input
            className={`${inputClass} ${
              isUnitDecreasing
                ? "border-[#b7472a] focus:border-[#b7472a] focus:outline-[#b7472a]/20"
                : ""
            }`}
            inputMode="numeric"
            placeholder="Enter this month reading"
            value={currentUnit}
            onChange={(event) => onCurrentUnitChange(event.target.value)}
          />
          {isUnitDecreasing ? (
            <span className="text-[11px] font-normal text-[#b7472a] dark:text-[#ff9f87]">
              Warning: Current unit is lower than previous ({previousUnit}).
            </span>
          ) : null}
        </label>
      </div>

      {/* Bill Calculation Cards */}
      <div className="my-[18px] grid grid-cols-3 gap-3 max-[1120px]:grid-cols-1">
        <div className="grid min-h-24 min-w-0 gap-1 rounded-lg border border-[#d8e5ef] bg-[#f6f9fb] p-3 dark:border-[#365044] dark:bg-[#121b17]">
          <span className="text-[12px] font-bold text-[#66736c] dark:text-[#b7c8bf]">Used Units</span>
          <strong className="break-words text-[24px] leading-tight text-[#2f5f9f] dark:text-[#8fb9ee]">
            {usedUnit}
          </strong>
          <small className="text-[11px] text-[#66736c] dark:text-[#b7c8bf]">
            {hasCurrentUnit ? currentUnitValue : "-"} - {previousUnit}
          </small>
        </div>
        <div className="grid min-h-24 min-w-0 gap-1 rounded-lg border border-[#d8e5ef] bg-[#f6f9fb] p-3 dark:border-[#365044] dark:bg-[#121b17]">
          <span className="text-[12px] font-bold text-[#66736c] dark:text-[#b7c8bf]">Electricity</span>
          <strong className="break-words text-[24px] leading-tight text-[#2f5f9f] dark:text-[#8fb9ee]">
            {rupees(electricityAmount)}
          </strong>
          <small className="text-[11px] text-[#66736c] dark:text-[#b7c8bf]">
            {usedUnit} units × ₹{UNIT_RATE}
          </small>
        </div>
        <div className="grid min-h-24 min-w-0 gap-1 rounded-lg border border-[#10211c] bg-[#10211c] p-3 text-white">
          <span className="text-[12px] font-bold text-[#cbd9d2]">Total Bill Amount</span>
          <strong className="break-words text-[24px] leading-tight text-white">
            {rupees(totalAmount)}
          </strong>
          <small className="text-[11px] text-[#cbd9d2]">
            Rent ₹{baseRent} + Bijli ₹{electricityAmount}
          </small>
        </div>
      </div>

      {/* Physical Payment & Remaining Balance Section */}
      <div className="mb-4 rounded-lg border border-[#e2e8e5] bg-[#f8faf9] p-4 dark:border-[#365044] dark:bg-[#121b17]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#17211c] dark:text-[#eef7f2]">
            <Coins size={16} className="text-[#16724f] dark:text-[#8fd8b7]" />
            <span>Payment Received & Balance Due</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className="cursor-pointer rounded bg-[#eaf5ef] px-2 py-1 text-xs font-bold text-[#0f5e3f] transition hover:bg-[#d8edd0] dark:bg-[#21382f] dark:text-[#8fd8b7]"
              onClick={() => (onQuickSetPaid ? onQuickSetPaid("full") : null)}
              type="button"
            >
              ✓ Full Paid (₹{totalAmount})
            </button>
            <button
              className="cursor-pointer rounded bg-[#fff2ee] px-2 py-1 text-xs font-bold text-[#b7472a] transition hover:bg-[#fbdcd5] dark:bg-[#321712] dark:text-[#ff9f87]"
              onClick={() => (onQuickSetPaid ? onQuickSetPaid("unpaid") : null)}
              type="button"
            >
              ₹0 (Unpaid)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 max-[780px]:grid-cols-1">
          <label className={labelClass}>
            <span>Amount Paid Physically (₹)</span>
            <input
              className={`${inputClass} font-bold text-[#0f5e3f] dark:text-[#8fd8b7]`}
              inputMode="numeric"
              placeholder="e.g. 2000"
              value={paidAmount}
              onChange={(event) =>
                onPaidAmountChange ? onPaidAmountChange(event.target.value) : null
              }
            />
            <span className="text-[11px] font-normal text-[#66736c] dark:text-[#b7c8bf]">
              How much tenant physically paid you in cash/online
            </span>
          </label>

          <label className={labelClass}>
            <div className="flex items-center justify-between">
              <span>Remaining Balance / Dues (₹)</span>
              {balanceNum > 0 ? (
                <button
                  className="cursor-pointer text-xs font-bold text-[#b7472a] hover:underline dark:text-[#ff9f87]"
                  onClick={onClearBalance}
                  type="button"
                >
                  Clear to ₹0
                </button>
              ) : null}
            </div>
            <div className="relative flex items-center">
              <input
                className={`${inputClass} pr-[75px] ${
                  balanceNum > 0
                    ? "border-[#b7472a] font-bold text-[#b7472a] dark:border-[#f2a899] dark:text-[#ff9f87]"
                    : "font-bold text-[#16724f] dark:text-[#8fd8b7]"
                }`}
                inputMode="numeric"
                placeholder="0"
                value={balance}
                onChange={(event) =>
                  onBalanceChange ? onBalanceChange(event.target.value) : null
                }
              />
              {balanceNum > 0 ? (
                <button
                  className="absolute right-2 inline-flex h-8 items-center justify-center gap-1 rounded bg-[#f6ece8] px-2.5 text-xs font-bold text-[#b7472a] transition hover:bg-[#edd8d2] dark:bg-[#3a1f18] dark:text-[#ff9f87]"
                  onClick={onClearBalance}
                  title="Click to clear balance"
                  type="button"
                >
                  <X size={14} />
                  Clear
                </button>
              ) : null}
            </div>
            <span className="text-[11px] font-normal text-[#66736c] dark:text-[#b7c8bf]">
              {balanceNum === 0
                ? "✓ No remaining balance (Fully Paid)"
                : `₹${balanceNum} remaining to be collected`}
            </span>
          </label>
        </div>
      </div>

      {/* Status Details Bar */}
      <div className="mb-[18px] grid grid-cols-4 gap-2.5 rounded-lg border border-[#dce4dd] bg-[#fbfcfb] p-3 dark:border-[#365044] dark:bg-[#121b17] max-[960px]:grid-cols-2 max-[500px]:grid-cols-1">
        <div className="grid gap-1">
          <span className="text-xs font-bold uppercase text-[#66736c] dark:text-[#b7c8bf]">
            Last saved unit
          </span>
          <strong className="text-lg text-[#17211c] dark:text-[#eef7f2]">
            {selectedTenant?.previousUnit ?? 0}
          </strong>
        </div>
        <div className="grid gap-1">
          <span className="text-xs font-bold uppercase text-[#66736c] dark:text-[#b7c8bf]">
            Rent Due Day
          </span>
          <strong className="text-lg text-[#16724f] dark:text-[#8fd8b7]">
            {selectedTenant?.dueDay || dueDay}th of month
          </strong>
        </div>
        <div className="grid gap-1">
          <span className="text-xs font-bold uppercase text-[#66736c] dark:text-[#b7c8bf]">
            Pending Rent
          </span>
          <strong
            className={`text-lg ${
              tenantPendingRent > 0
                ? "text-[#b7472a] dark:text-[#ff9f87]"
                : "text-[#16724f] dark:text-[#8fd8b7]"
            }`}
          >
            {tenantPendingRent > 0 ? rupees(tenantPendingRent) : "₹0 (Clear)"}
          </strong>
        </div>
        <div className="grid gap-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#66736c] dark:text-[#b7c8bf]">
              Total Pending Dues
            </span>
            {tenantPendingBalance > 0 && onClearPendingDues ? (
              <button
                className="cursor-pointer text-[11px] font-bold text-[#16724f] hover:underline dark:text-[#8fd8b7]"
                onClick={onClearPendingDues}
                title="Mark all pending bills paid"
                type="button"
              >
                Clear All
              </button>
            ) : null}
          </div>
          <strong
            className={`text-lg ${
              tenantPendingBalance > 0
                ? "text-[#b67518] dark:text-[#f0c36d]"
                : "text-[#16724f] dark:text-[#8fd8b7]"
            }`}
          >
            {tenantPendingBalance > 0 ? rupees(tenantPendingBalance) : "₹0 (Clear)"}
          </strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#17211c] px-4 font-bold text-white no-underline transition hover:-translate-y-px hover:bg-[#25352e] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#eef7f2] dark:text-[#101713] dark:hover:bg-white max-[470px]:w-full"
          disabled={!hasCurrentUnit || isSaving}
          onClick={onSaveBill}
          type="button"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? "Saving..." : "Save bill"}
        </button>
        <a
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#16724f] px-4 font-bold text-white no-underline transition hover:-translate-y-px hover:bg-[#12583d] max-[470px]:w-full"
          href={whatsappUrl}
          target="_blank"
        >
          <MessageCircle size={18} />
          Send WhatsApp
        </a>
        <button
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#f6ece8] px-4 font-bold text-[#b7472a] no-underline transition hover:-translate-y-px hover:bg-[#edd8d2] dark:bg-[#3a1f18] dark:text-[#ff9f87] dark:hover:bg-[#4d281f] max-[470px]:w-full"
          onClick={onDeleteTenant}
          type="button"
        >
          <Trash2 size={18} />
          Delete kiraydar
        </button>
      </div>
    </section>
  );
}
