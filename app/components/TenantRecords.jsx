import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Printer,
  Settings,
  Trash2
} from "lucide-react";
import { rupees } from "../lib/rent";

const actionClass =
  "inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border-0 px-2.5 text-[13px] font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 max-[780px]:w-full max-[780px]:justify-center";
const mobileFieldClass =
  "grid gap-1 rounded-lg border border-[#dce4dd] bg-[#fbfcfb] p-3 dark:border-[#365044] dark:bg-[#101713]";
const mobileLabelClass = "text-[11px] font-bold uppercase text-[#66736c] dark:text-[#b7c8bf]";
const mobileValueClass = "break-words text-sm font-bold text-[#17211c] dark:text-[#eef7f2]";

function whatsappHistoryUrl(tenant, bills) {
  const cleanedPhone = tenant.phone.replace(/[^\d]/g, "");
  const lines = [
    `${tenant.name} - Rent And Electricity Record`,
    ...bills.slice(0, 12).map(
      (bill) =>
        `${bill.month}: Units ${bill.usedUnit}, Electricity ${rupees(
          bill.electricityAmount
        )}, Rent ${rupees(bill.baseRent)}, Total ${rupees(bill.totalAmount)}, ${
          bill.paid ? "Paid" : "Pending"
        }`
    )
  ];
  const text = encodeURIComponent(lines.join("\n"));

  return cleanedPhone ? `https://wa.me/${cleanedPhone}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function TenantRecords({
  billsByTenant,
  openTenantRecordId,
  onClearTenantBills,
  onDeleteBill,
  onPrintTenantHistory,
  onToggleBillPaid,
  onToggleTenantDetails,
  printTenantId
}) {
  return (
    <section className="mt-[18px] rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[780px]:p-4 print:m-0 print:border-0 print:p-0 print:shadow-none">
      <div className="mb-4 flex items-center justify-between gap-[9px] max-[780px]:flex-col max-[780px]:items-start print:hidden">
        <div className="flex items-center gap-[9px]">
          <Settings size={18} />
          <h2 className="m-0 text-lg text-[#17211c] dark:text-[#eef7f2]">Kiraydar Records</h2>
        </div>
        <span className="whitespace-nowrap rounded-full bg-[#eef4f1] px-2.5 py-[7px] text-[13px] font-bold text-[#66736c] dark:bg-[#21382f] dark:text-[#b7c8bf] max-[470px]:w-full max-[470px]:whitespace-normal max-[470px]:text-center">
          Print latest 12 months per kiraydar
        </span>
      </div>
      <div className="grid gap-4 print:block">
        {billsByTenant.map(({ tenant, bills: tenantBills }) => {
          const isOpen = openTenantRecordId === tenant.id;
          const isPrintTarget = printTenantId === tenant.id;
          const paidCount = tenantBills.filter((bill) => bill.paid).length;
          const pendingCount = tenantBills.length - paidCount;

          return (
            <section
              className={`rounded-lg border border-[#dce4dd] bg-white p-[18px] hover:border-[#c9d8cf] dark:border-[#365044] dark:bg-[#121b17] dark:hover:border-[#527465] print:border-0 print:p-0 print:shadow-none ${
                isPrintTarget ? "print:block" : "print:hidden"
              }`}
              key={tenant.id}
            >
              <div className="mb-3.5 flex items-center justify-between gap-3 max-[780px]:flex-col max-[780px]:items-start print:mb-3.5 print:border-b print:border-[#222] print:pb-2.5">
                <div>
                  <h3 className="mb-1 text-[17px] text-[#17211c] dark:text-[#eef7f2]">{tenant.name}</h3>
                  <p className="m-0 text-[13px] text-[#66736c] dark:text-[#b7c8bf]">
                    {tenant.phone || "No WhatsApp number saved"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 max-[780px]:w-full max-[780px]:flex-col max-[780px]:items-start print:hidden">
                  <span className="whitespace-nowrap rounded-full bg-[#eaf5ef] px-2.5 py-[7px] text-[13px] font-bold text-[#0f5e3f] dark:bg-[#21382f] dark:text-[#8fd8b7] max-[780px]:w-full max-[780px]:text-center">
                    {tenantBills.length} bill{tenantBills.length === 1 ? "" : "s"}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-[#eaf5ef] px-2.5 py-[7px] text-[13px] font-bold text-[#0f5e3f] dark:bg-[#21382f] dark:text-[#8fd8b7] max-[780px]:w-full max-[780px]:text-center">
                    {paidCount} paid
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-[#fff6e7] px-2.5 py-[7px] text-[13px] font-bold text-[#b67518] dark:bg-[#3a2b12] dark:text-[#f0c36d] max-[780px]:w-full max-[780px]:text-center">
                    {pendingCount} pending
                  </span>
                  <button
                    className={`${actionClass} bg-[#eef4f1] text-[#17211c] dark:bg-[#21382f] dark:text-[#eef7f2]`}
                    disabled={tenantBills.length === 0}
                    onClick={() => onToggleTenantDetails(tenant.id)}
                    type="button"
                  >
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    View details
                  </button>
                  <button
                    className={`${actionClass} bg-[#edf3fb] text-[#2f5f9f] dark:bg-[#172b42] dark:text-[#8fb9ee]`}
                    disabled={tenantBills.length === 0}
                    onClick={() => onPrintTenantHistory(tenant.id)}
                    type="button"
                  >
                    <Printer size={16} />
                    Print 12
                  </button>
                  <a
                    className={`${actionClass} bg-[#eaf5ef] text-[#0f5e3f] no-underline dark:bg-[#21382f] dark:text-[#8fd8b7] ${
                      tenantBills.length === 0 ? "pointer-events-none opacity-50" : ""
                    }`}
                    href={tenantBills.length === 0 ? undefined : whatsappHistoryUrl(tenant, tenantBills)}
                    target="_blank"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                  <button
                    className={`${actionClass} bg-[#f6ece8] text-[#b7472a] dark:bg-[#3a1f18] dark:text-[#ff9f87]`}
                    disabled={tenantBills.length === 0}
                    onClick={() => onClearTenantBills(tenant)}
                    type="button"
                  >
                    <Trash2 size={16} />
                    Clear
                  </button>
                </div>
              </div>

              {tenantBills.length === 0 ? (
                <p className="m-0 text-[#66736c] dark:text-[#b7c8bf]">No bill saved for this kiraydar.</p>
              ) : isOpen || isPrintTarget ? (
                <div className="w-full overflow-x-auto overflow-y-hidden rounded-lg border border-[#dce4dd] dark:border-[#365044] [-webkit-overflow-scrolling:touch] max-[700px]:overflow-visible max-[700px]:border-0 print:overflow-visible">
                  <div className="mb-3 hidden print:block">
                    <h2 className="mb-1 text-xl">{tenant.name} - 12 Month Rent And Electricity Record</h2>
                    <p className="text-xs text-[#444] print:text-black">
                      Printed on {new Date().toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="hidden gap-3 max-[700px]:grid print:hidden">
                    {tenantBills.slice(0, 12).map((bill) => (
                      <article
                        className={`rounded-lg border p-3 ${
                          bill.paid
                            ? "border-[#b9dbc8] bg-[#fbfefc] dark:border-[#365044] dark:bg-[#122018]"
                            : "border-[#dce4dd] bg-white dark:border-[#365044] dark:bg-[#121b17]"
                        }`}
                        key={bill.id}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h4 className="m-0 text-base font-bold text-[#17211c] dark:text-[#eef7f2]">
                              {bill.month}
                            </h4>
                            <p className="m-0 text-[13px] text-[#66736c] dark:text-[#b7c8bf]">
                              {bill.usedUnit} units
                            </p>
                          </div>
                          <button
                            className={`inline-flex min-h-[34px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border-0 px-2.5 text-[13px] font-bold transition hover:-translate-y-px ${
                              bill.paid
                                ? "bg-[#eaf5ef] text-[#0f5e3f] dark:bg-[#21382f] dark:text-[#8fd8b7]"
                                : "bg-[#fff6e7] text-[#b67518] dark:bg-[#3a2b12] dark:text-[#f0c36d]"
                            }`}
                            onClick={() => onToggleBillPaid(bill.id)}
                            type="button"
                          >
                            <CheckCircle2 size={16} />
                            {bill.paid ? "Paid" : "Pending"}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 max-[420px]:grid-cols-1">
                          <div className={mobileFieldClass}>
                            <span className={mobileLabelClass}>Previous</span>
                            <strong className={mobileValueClass}>{bill.previousUnit}</strong>
                          </div>
                          <div className={mobileFieldClass}>
                            <span className={mobileLabelClass}>Current</span>
                            <strong className={mobileValueClass}>{bill.currentUnit}</strong>
                          </div>
                          <div className={mobileFieldClass}>
                            <span className={mobileLabelClass}>Electricity</span>
                            <strong className={mobileValueClass}>{rupees(bill.electricityAmount)}</strong>
                          </div>
                          <div className={mobileFieldClass}>
                            <span className={mobileLabelClass}>Rent</span>
                            <strong className={mobileValueClass}>{rupees(bill.baseRent)}</strong>
                          </div>
                          <div className="grid gap-1 rounded-lg border border-[#10211c] bg-[#10211c] p-3 max-[420px]:col-auto">
                            <span className="text-[11px] font-bold uppercase text-[#cbd9d2]">Total</span>
                            <strong className="break-words text-lg font-bold text-white">
                              {rupees(bill.totalAmount)}
                            </strong>
                          </div>
                          <button
                            className="inline-flex min-h-[58px] cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#f6ece8] px-3 text-sm font-bold text-[#b7472a] transition hover:-translate-y-px dark:bg-[#3a1f18] dark:text-[#ff9f87]"
                            onClick={() => onDeleteBill(bill.id)}
                            type="button"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  <table className="w-full min-w-[820px] border-collapse max-[700px]:hidden print:table print:min-w-0">
                    <thead>
                      <tr>
                        {[
                          "Month",
                          "Previous",
                          "Current",
                          "Units",
                          "Electricity",
                          "Rent",
                          "Total",
                          "Status"
                        ].map((heading) => (
                          <th
                            className="border-b border-[#dce4dd] bg-[#f4f7f5] px-2.5 py-[11px] text-left text-xs uppercase text-[#66736c] dark:border-[#365044] dark:bg-[#1b2a23] dark:text-[#b7c8bf] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black"
                            key={heading}
                          >
                            {heading}
                          </th>
                        ))}
                        <th className="border-b border-[#dce4dd] bg-[#f4f7f5] px-2.5 py-[11px] text-left text-xs uppercase text-[#66736c] dark:border-[#365044] dark:bg-[#1b2a23] dark:text-[#b7c8bf] print:hidden">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantBills.slice(0, 12).map((bill) => (
                        <tr className={bill.paid ? "bg-[#fbfefc] dark:bg-[#122018]" : "hover:bg-[#fbfcfb] dark:hover:bg-[#17231d]"} key={bill.id}>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">{bill.month}</td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">{bill.previousUnit}</td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">{bill.currentUnit}</td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">{bill.usedUnit}</td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">{rupees(bill.electricityAmount)}</td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">{rupees(bill.baseRent)}</td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">{rupees(bill.totalAmount)}</td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm text-[#17211c] dark:border-[#365044] dark:text-[#eef7f2] print:border print:border-[#222] print:p-[7px] print:text-xs print:text-black">
                            <button
                              className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border-0 px-2.5 text-[13px] font-bold transition hover:-translate-y-px print:hidden ${
                                bill.paid
                                  ? "bg-[#eaf5ef] text-[#0f5e3f] dark:bg-[#21382f] dark:text-[#8fd8b7]"
                                  : "bg-[#fff6e7] text-[#b67518] dark:bg-[#3a2b12] dark:text-[#f0c36d]"
                              }`}
                              onClick={() => onToggleBillPaid(bill.id)}
                              type="button"
                            >
                              <CheckCircle2 size={16} />
                              {bill.paid ? "Done" : "Mark paid"}
                            </button>
                            <span className="hidden print:inline">
                              {bill.paid ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="border-b border-[#dce4dd] px-2.5 py-[11px] text-sm dark:border-[#365044] print:hidden">
                            <button
                              className="inline-flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-lg border-0 bg-[#f6ece8] text-[#b7472a] transition hover:-translate-y-px dark:bg-[#3a1f18] dark:text-[#ff9f87]"
                              onClick={() => onDeleteBill(bill.id)}
                              title="Delete bill"
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="m-0 text-[#66736c] dark:text-[#b7c8bf]">Click View details to open monthly records.</p>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
