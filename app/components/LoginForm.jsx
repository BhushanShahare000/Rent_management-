import { LockKeyhole } from "lucide-react";

export function LoginForm({
  email,
  error,
  isDarkTheme,
  isLoading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleTheme,
  password
}) {
  return (
    <main className="mx-auto flex min-h-screen w-[min(520px,calc(100%_-_32px))] items-center py-8 max-[470px]:w-[calc(100%_-_16px)]">
      <section className="w-full rounded-lg border border-[#dce4dd] bg-white p-6 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[470px]:p-4">
        <div className="mb-6 flex items-start justify-between gap-4 max-[420px]:flex-col">
          <div>
            <p className="mb-1.5 text-[13px] font-bold uppercase text-[#16724f] dark:text-[#8fd8b7]">
              Private owner access
            </p>
            <h1 className="m-0 text-3xl font-bold leading-tight text-[#17211c] dark:text-[#eef7f2] max-[420px]:text-2xl">
              Rent Management
            </h1>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#dce4dd] bg-[#f8faf9] px-3 text-sm font-bold text-[#17211c] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2]"
            onClick={onToggleTheme}
            type="button"
          >
            {isDarkTheme ? "Light" : "Dark"}
          </button>
        </div>

        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf]">
            Email
            <input
              className="min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white px-[13px] text-[#17211c] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2]"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </label>
          <label className="grid gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf]">
            Password
            <input
              className="min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white px-[13px] text-[#17211c] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2]"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
            />
          </label>

          {error ? (
            <p className="m-0 rounded-lg bg-[#f6ece8] p-3 text-sm font-bold text-[#b7472a] dark:bg-[#3a1f18] dark:text-[#ff9f87]">
              {error}
            </p>
          ) : null}

          <button
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#17211c] px-4 font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#eef7f2] dark:text-[#101713]"
            disabled={isLoading}
            type="submit"
          >
            <LockKeyhole size={18} />
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
