import { Bell, Calendar, Clock } from "lucide-react";
import { getTenantReminder, rupees } from "../lib/rent";

export function CollectionSummary({
  allTimeTotal,
  collectionMonth,
  monthlyBillsCount,
  monthlySummary,
  onCollectionMonthChange,
  tenants = [],
  tenantDuesMap = {}
}) {
  const cards = [
    {
      label: "Kiraydars Billed",
      value: `${monthlyBillsCount} billed`,
      note: `${monthlySummary.paidCount || 0} paid • ${monthlySummary.pendingCount || 0} pending`,
      featured: false,
      className: "border-t-[#16724f]"
    },
    {
      label: "Total Rent",
      value: rupees(monthlySummary.rent),
      note: `Billed for ${collectionMonth}`,
      featured: false,
      className: "border-t-[#16724f]"
    },
    {
      label: "Pending Rent",
      value: rupees(monthlySummary.pendingRent || 0),
      note: `${monthlySummary.pendingCount || 0} unpaid kiraydar rent`,
      featured: (monthlySummary.pendingRent || 0) > 0,
      className: "border-t-[#b7472a]"
    },
    {
      label: "Pending Bills",
      value: rupees(monthlySummary.pendingTotal || 0),
      note: "Rent + Bijli pending",
      featured: (monthlySummary.pendingTotal || 0) > 0,
      className: "border-t-[#b67518]"
    },
    {
      label: "Collected Amount",
      value: rupees(monthlySummary.paidTotal || 0),
      note: "Total paid this month",
      featured: false,
      className: "border-t-[#16724f]"
    }
  ];

  const dueTodayTenants = tenants.filter((t) => {
    const rem = getTenantReminder(t, tenantDuesMap[t.id] || 0);
    return rem.status === "today";
  });

  const overdueTenants = tenants.filter((t) => {
    const rem = getTenantReminder(t, tenantDuesMap[t.id] || 0);
    return rem.status === "overdue" && (tenantDuesMap[t.id] || 0) > 0;
  });

  return (
    <section className="mb-5 rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[780px]:p-4 print:hidden">
      <div className="mb-4 flex items-end justify-between gap-[18px] max-[780px]:flex-col max-[780px]:items-stretch">
        <div>
          <p className="mb-1.5 text-[13px] font-bold uppercase tracking-normal text-[#16724f] dark:text-[#8fd8b7]">
            Collection summary & reminders
          </p>
          <h2 className="m-0 text-lg text-[#17211c] dark:text-[#eef7f2]">
            Total amount of kiraydars
          </h2>
        </div>
        <label className="grid min-w-[180px] gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf] max-[780px]:min-w-0">
          Month
          <input
            className="min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white px-[13px] text-[#17211c] focus:border-[#16724f] focus:outline focus:outline-[3px] focus:outline-[rgba(22,114,79,0.14)] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2]"
            type="month"
            value={collectionMonth}
            onChange={(event) => onCollectionMonthChange(event.target.value)}
          />
        </label>
      </div>

      {/* Due Date Reminders Banner */}
      {(dueTodayTenants.length > 0 || overdueTenants.length > 0) ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-[#f0c36d] bg-[#fffcf0] p-3 text-sm text-[#8a5b10] dark:border-[#54401c] dark:bg-[#251e10] dark:text-[#f8d48b]">
          <Bell size={16} className="shrink-0 text-[#b67518] dark:text-[#f0c36d]" />
          <div className="flex flex-wrap items-center gap-2 font-medium">
            {dueTodayTenants.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded bg-[#eaf5ef] px-2 py-0.5 text-xs font-bold text-[#0f5e3f] dark:bg-[#1b3327] dark:text-[#8fd8b7]">
                🔔 Due Today: {dueTodayTenants.map((t) => t.name).join(", ")}
              </span>
            ) : null}
            {overdueTenants.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded bg-[#fff2ee] px-2 py-0.5 text-xs font-bold text-[#b7472a] dark:bg-[#321712] dark:text-[#ff9f87]">
                ⚠️ Overdue: {overdueTenants.map((t) => `${t.name} (${t.dueDay}th)`).join(", ")}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-5 gap-3 max-[1200px]:grid-cols-3 max-[780px]:grid-cols-2 max-[500px]:grid-cols-1">
        {cards.map((card) => (
          <div
            className={`grid min-h-[108px] min-w-0 gap-[7px] rounded-lg border border-t-4 p-3.5 ${
              card.featured
                ? "border-[#f2d4cd] border-t-[#b7472a] bg-[#fff8f6] dark:border-[#4d251d] dark:border-t-[#ff9f87] dark:bg-[#20120f]"
                : `bg-[#f8faf9] dark:border-[#324a3f] dark:bg-[#121b17] ${card.className}`
            }`}
            key={card.label}
          >
            <span
              className={`text-[13px] font-bold ${
                card.featured
                  ? "text-[#b7472a] dark:text-[#ff9f87]"
                  : "text-[#66736c] dark:text-[#b7c8bf]"
              }`}
            >
              {card.label}
            </span>
            <strong
              className={`break-words text-2xl leading-tight max-[470px]:text-[22px] ${
                card.featured
                  ? "text-[#b7472a] dark:text-[#ff9f87]"
                  : "text-[#17211c] dark:text-[#eef7f2]"
              }`}
            >
              {card.value}
            </strong>
            <small
              className={`text-[12px] ${
                card.featured
                  ? "text-[#b7472a] dark:text-[#ff9f87]"
                  : "text-[#66736c] dark:text-[#b7c8bf]"
              }`}
            >
              {card.note}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
