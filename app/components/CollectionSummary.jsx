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
      label: "Kiraydars billed",
      value: monthlyBillsCount,
      note: collectionMonth,
      featured: false,
      className: "border-t-[#16724f]"
    },
    {
      label: "Total rent",
      value: rupees(monthlySummary.rent),
      note: "Only saved bills",
      featured: false,
      className: "border-t-[#16724f]"
    },
    {
      label: "Total electricity",
      value: rupees(monthlySummary.electricity),
      note: `Units x ${UNIT_RATE}`,
      featured: false,
      className: "border-t-[#2f5f9f]"
    },
    {
      label: "All saved total",
      value: rupees(allTimeTotal),
      note: "All months",
      featured: false,
      className: "border-t-[#b67518]"
    }
  ];

  return (
    <section className="mb-5 rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[780px]:p-4 print:hidden">
      <div className="mb-4 flex items-end justify-between gap-[18px] max-[780px]:flex-col max-[780px]:items-stretch">
        <div>
          <p className="mb-1.5 text-[13px] font-bold uppercase tracking-normal text-[#16724f] dark:text-[#8fd8b7]">
            Collection summary
          </p>
          <h2 className="m-0 text-lg text-[#17211c] dark:text-[#eef7f2]">Total amount of kiraydars</h2>
        </div>
        <label className="grid min-w-[180px] gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf] max-[780px]:min-w-0">
          Month
          <input
            className="min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white px-[13px] text-[#17211c] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2] focus:border-[#16724f] focus:outline focus:outline-[3px] focus:outline-[rgba(22,114,79,0.14)]"
            type="month"
            value={collectionMonth}
            onChange={(event) => onCollectionMonthChange(event.target.value)}
          />
        </label>
      </div>
      <div className="grid grid-cols-4 gap-3 max-[1120px]:grid-cols-2 max-[560px]:grid-cols-1">
        {cards.map((card) => (
          <div
            className={`grid min-h-[108px] min-w-0 gap-[7px] rounded-lg border border-t-4 p-3.5 ${
              card.featured
                ? "border-[#dce4dd] border-t-[#f0c36d] bg-[#f8faf9] dark:border-[#10211c] dark:bg-[#10211c]"
                : `bg-[#f8faf9] dark:border-[#324a3f] dark:bg-[#121b17] ${card.className}`
            }`}
            key={card.label}
          >
            <span className={card.featured ? "text-[13px] text-[#66736c] dark:text-white" : "text-[13px] text-[#66736c] dark:text-[#b7c8bf]"}>
              {card.label}
            </span>
            <strong className={card.featured ? "break-words text-2xl leading-tight text-[#17211c] dark:text-white max-[470px]:text-[22px]" : "break-words text-2xl leading-tight text-[#17211c] dark:text-[#eef7f2] max-[470px]:text-[22px]"}>
              {card.value}
            </strong>
            <small className={card.featured ? "text-[13px] text-[#66736c] dark:text-white" : "text-[13px] text-[#66736c] dark:text-[#b7c8bf]"}>
              {card.note}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}
