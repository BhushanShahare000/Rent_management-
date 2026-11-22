import { Calendar, UserPlus, UserRound } from "lucide-react";
import { getTenantReminder, rupees } from "../lib/rent";

export function TenantList({
  onAddTenant,
  onSelectTenant,
  selectedTenantId,
  tenantDuesMap = {},
  tenants
}) {
  return (
    <aside className="self-start rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[780px]:p-4 print:hidden">
      <div className="mb-4 flex items-center justify-between gap-[9px] max-[780px]:flex-row">
        <div className="flex items-center gap-[9px]">
          <UserRound size={18} />
          <h2 className="m-0 text-lg text-[#17211c] dark:text-[#eef7f2]">Kiraydar</h2>
        </div>
        <button
          className="inline-flex aspect-square min-h-11 w-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#eaf5ef] font-bold text-[#0f5e3f] transition hover:-translate-y-px dark:bg-[#21382f] dark:text-[#8fd8b7]"
          onClick={onAddTenant}
          title="Add kiraydar"
          type="button"
        >
          <UserPlus size={18} />
        </button>
      </div>
      <div className="grid gap-2 max-[960px]:grid-cols-3 max-[780px]:grid-cols-2 max-[560px]:grid-cols-1">
        {tenants.map((tenant) => {
          const due = tenantDuesMap[tenant.id] || 0;
          const isSelected = tenant.id === selectedTenantId;
          const reminder = getTenantReminder(tenant, due);

          return (
            <button
              className={`flex min-h-[58px] cursor-pointer items-center justify-between gap-2 rounded-lg border px-3.5 text-left text-[#17211c] transition hover:-translate-y-px hover:border-[#16724f] dark:bg-[#101713] dark:text-[#eef7f2] dark:hover:border-[#8fd8b7] ${
                isSelected
                  ? "border-[#16724f] bg-[linear-gradient(135deg,#eaf5ef,#f6fbf8)] font-bold text-[#0f5e3f] dark:border-[#8fd8b7] dark:bg-[linear-gradient(135deg,#163126,#101713)] dark:text-[#8fd8b7]"
                  : "border-[#dce4dd] bg-white dark:border-[#365044]"
              }`}
              key={tenant.id}
              onClick={() => onSelectTenant(tenant.id)}
              type="button"
            >
              <div className="flex min-w-0 flex-col">
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {tenant.name}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-[#66736c] dark:text-[#b7c8bf]">
                  <Calendar size={11} />
                  Due {tenant.dueDay || 5}th
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {due > 0 ? (
                  <span className="rounded bg-[#fff2ee] px-1.5 py-0.5 text-[11px] font-bold text-[#b7472a] dark:bg-[#321712] dark:text-[#ff9f87]">
                    Due {rupees(due)}
                  </span>
                ) : (
                  <small className="text-[#66736c] dark:text-[#b7c8bf]">
                    {rupees(tenant.baseRent)}
                  </small>
                )}
                {reminder.status === "today" ? (
                  <span className="rounded bg-[#eaf5ef] px-1.5 py-0.5 text-[10px] font-bold text-[#0f5e3f] dark:bg-[#1b3327] dark:text-[#8fd8b7]">
                    🔔 Due Today
                  </span>
                ) : reminder.status === "overdue" && due > 0 ? (
                  <span className="rounded bg-[#fff2ee] px-1.5 py-0.5 text-[10px] font-bold text-[#b7472a] dark:bg-[#321712] dark:text-[#ff9f87]">
                    ⚠️ Overdue
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
