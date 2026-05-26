import { UserPlus, UserRound } from "lucide-react";
import { rupees } from "../lib/rent";

export function TenantList({ onAddTenant, onSelectTenant, selectedTenantId, tenants }) {
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
        {tenants.map((tenant) => (
          <button
            className={`flex min-h-[50px] cursor-pointer items-center justify-between rounded-lg border bg-white px-3.5 text-left text-[#17211c] transition hover:-translate-y-px hover:border-[#16724f] dark:bg-[#101713] dark:text-[#eef7f2] dark:hover:border-[#8fd8b7] ${
              tenant.id === selectedTenantId
                ? "border-[#16724f] bg-[linear-gradient(135deg,#eaf5ef,#f6fbf8)] font-bold text-[#0f5e3f] dark:border-[#8fd8b7] dark:bg-[linear-gradient(135deg,#163126,#101713)] dark:text-[#8fd8b7]"
                : "border-[#dce4dd] dark:border-[#365044]"
            }`}
            key={tenant.id}
            onClick={() => onSelectTenant(tenant.id)}
            type="button"
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">{tenant.name}</span>
            <small className="text-[#66736c] dark:text-[#b7c8bf]">{rupees(tenant.baseRent)}</small>
          </button>
        ))}
      </div>
    </aside>
  );
}
