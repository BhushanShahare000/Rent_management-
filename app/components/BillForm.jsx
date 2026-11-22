import {
  Calculator,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RotateCcw,
  Save,
  Trash2
} from "lucide-react";
import { UNIT_RATE, rupees } from "../lib/rent";

const inputClass =
  "min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white px-[13px] text-[#17211c] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2] dark:placeholder:text-[#718078] focus:border-[#16724f] focus:outline focus:outline-[3px] focus:outline-[rgba(22,114,79,0.14)]";
const labelClass = "grid gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf]";

export function BillForm({
  baseRent,
  currentUnit,
  currentUnitValue,
  electricityAmount,
  hasCurrentUnit,
  isSaving = false,
  month,
  onBaseRentChange,
  onClearForm,
  onCurrentUnitChange,
  onDeleteTenant,
  onMonthChange,
  onPreviousUnitChange,
  onSaveBill,
  onTenantChange,
  previousUnit,
  saveFeedback = "",
  selectedTenant,
  selectedTenantBills = [],
  totalAmount,
  usedUnit,
  whatsappUrl
}) {
  const isUnitDecreasing = hasCurrentUnit && currentUnitValue < previousUnit;

  return (
    <section className="rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[780px]:p-4 print:hidden">
      <div className="mb-4 flex items-center justify-between gap-[9px] max-[780px]:flex-col max-[780px]:items-start">
        <div className="flex items-center gap-[9px]">
          <Calculator size={18} />
          <h2 className="m-0 text-lg text-[#17211c] dark:text-[#eef7f2]">Monthly Bill</h2>
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

      <div className="my-[18px] grid grid-cols-3 gap-3 max-[1120px]:grid-cols-1">
        <div className="grid min-h-28 min-w-0 gap-1.5 rounded-lg border border-[#d8e5ef] bg-[#f6f9fb] p-3.5 dark:border-[#365044] dark:bg-[#121b17]">
          <span className="text-[13px] text-[#66736c] dark:text-[#b7c8bf]">Used Units</span>
          <strong className="break-words text-[28px] leading-none text-[#2f5f9f] dark:text-[#8fb9ee] max-[470px]:text-[22px]">
            {usedUnit}
          </strong>
          <small className="text-[13px] text-[#66736c] dark:text-[#b7c8bf]">
            {hasCurrentUnit ? currentUnitValue : "-"} - {previousUnit}
          </small>
        </div>
        <div className="grid min-h-28 min-w-0 gap-1.5 rounded-lg border border-[#d8e5ef] bg-[#f6f9fb] p-3.5 dark:border-[#365044] dark:bg-[#121b17]">
          <span className="text-[13px] text-[#66736c] dark:text-[#b7c8bf]">Electricity</span>
          <strong className="break-words text-[28px] leading-none text-[#2f5f9f] dark:text-[#8fb9ee] max-[470px]:text-[22px]">
            {rupees(electricityAmount)}
          </strong>
          <small className="text-[13px] text-[#66736c] dark:text-[#b7c8bf]">
            {usedUnit} units × ₹{UNIT_RATE}
          </small>
        </div>
        <div className="grid min-h-28 min-w-0 gap-1.5 rounded-lg border border-[#10211c] bg-[#10211c] p-3.5">
          <span className="text-[13px] text-[#cbd9d2]">Total Amount</span>
          <strong className="break-words text-[28px] leading-none text-white max-[470px]:text-[22px]">
            {rupees(totalAmount)}
          </strong>
          <small className="text-[13px] text-[#cbd9d2]">
            Rent ₹{baseRent} + Bijli ₹{electricityAmount}
          </small>
        </div>
      </div>

      <div className="mb-[18px] grid grid-cols-3 gap-2.5 rounded-lg border border-[#dce4dd] bg-[#fbfcfb] p-3 dark:border-[#365044] dark:bg-[#121b17] max-[780px]:grid-cols-1">
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
            Saved records
          </span>
          <strong className="text-lg text-[#17211c] dark:text-[#eef7f2]">
            {selectedTenantBills?.length ?? 0}
          </strong>
        </div>
        <div className="grid gap-1">
          <span className="text-xs font-bold uppercase text-[#66736c] dark:text-[#b7c8bf]">
            Latest bill amount
          </span>
          <strong className="text-lg text-[#17211c] dark:text-[#eef7f2]">
            {selectedTenantBills?.[0] ? rupees(selectedTenantBills[0].totalAmount) : rupees(0)}
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
