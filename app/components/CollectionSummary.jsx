import { UNIT_RATE, rupees } from "../lib/rent";

export function CollectionSummary({
  allTimeTotal,
  collectionMonth,
  monthlyBillsCount,
  monthlySummary,
  onCollectionMonthChange
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

  return (
    <section className="mb-5 rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[780px]:p-4 print:hidden">
      <div className="mb-4 flex items-end justify-between gap-[18px] max-[780px]:flex-col max-[780px]:items-stretch">
        <div>
          <p className="mb-1.5 text-[13px] font-bold uppercase tracking-normal text-[#16724f] dark:text-[#8fd8b7]">
            Collection summary
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
                  ? "text-[#b7472a]/80 dark:text-[#ff9f87]/80"
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
