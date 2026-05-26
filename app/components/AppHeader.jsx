import { Building2, LogOut, Moon, Sun } from "lucide-react";

export function AppHeader({ isDarkTheme, onSignOut, onToggleTheme, tenantCount }) {
  return (
    <section className="relative mb-5 flex min-h-[132px] items-center justify-between gap-[18px] overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,#13251f_0%,#17392e_58%,#245642_100%)] p-6 text-white shadow-[0_18px_40px_rgba(28,42,35,0.09)] after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-[linear-gradient(90deg,#8fd8b7,#f0c36d,#77a9e5)] after:content-[''] max-[780px]:min-h-0 max-[780px]:flex-col max-[780px]:items-start max-[780px]:p-5 max-[470px]:mb-3 max-[470px]:p-4 print:hidden">
      <div>
        <p className="mb-1.5 text-[13px] font-bold uppercase tracking-normal text-[#8fd8b7]">
          Private owner access
        </p>
        <h1 className="m-0 text-3xl leading-none sm:text-4xl lg:text-[46px]">Rent Management</h1>
      </div>
      <div className="flex flex-wrap items-center gap-2 max-[470px]:grid max-[470px]:w-full max-[470px]:grid-cols-1">
        <div className="inline-flex min-h-[42px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-4 text-white">
          <Building2 size={18} />
          <span>{tenantCount} kiraydars</span>
        </div>
        <button
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 font-bold text-white transition hover:bg-white/15"
          onClick={onToggleTheme}
          title="Change theme"
          type="button"
        >
          {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDarkTheme ? "Light" : "Dark"}</span>
        </button>
        {onSignOut ? (
          <button
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 font-bold text-white transition hover:bg-white/15"
            onClick={onSignOut}
            type="button"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
