"use client";

import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-[min(520px,calc(100%_-_32px))] items-center py-8 max-[470px]:w-[calc(100%_-_16px)]">
      <section className="w-full rounded-xl border border-[#dce4dd] bg-white p-7 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[470px]:p-5">
        <div className="mb-6 flex items-start justify-between gap-4 max-[420px]:flex-col">
          <div>
            <p className="mb-1 text-[13px] font-bold uppercase tracking-wider text-[#16724f] dark:text-[#8fd8b7]">
              Private owner access
            </p>
            <h1 className="m-0 text-3xl font-bold leading-tight text-[#17211c] dark:text-[#eef7f2] max-[420px]:text-2xl">
              Rent Management
            </h1>
          </div>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#dce4dd] bg-[#f8faf9] px-3.5 text-sm font-bold text-[#17211c] transition hover:bg-[#eef4f1] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2] dark:hover:bg-[#1b2a22]"
            onClick={onToggleTheme}
            type="button"
          >
            {isDarkTheme ? "Light" : "Dark"}
          </button>
        </div>

        <form className="grid gap-4.5" onSubmit={onSubmit}>
          <label className="grid gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf]">
            Email Address
            <input
              autoComplete="email"
              autoFocus
              className="min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white px-[13px] text-[#17211c] placeholder:text-[#99a69f] focus:border-[#16724f] focus:outline focus:outline-[3px] focus:outline-[rgba(22,114,79,0.14)] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2] dark:placeholder:text-[#6a7c73]"
              placeholder="e.g. owner@kiraydar.com"
              required
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
            />
          </label>

          <label className="grid gap-[7px] text-[13px] font-bold text-[#66736c] dark:text-[#b7c8bf]">
            Password
            <div className="relative flex items-center">
              <input
                autoComplete="current-password"
                className="min-h-[46px] w-full rounded-lg border border-[#dce4dd] bg-white pl-[13px] pr-[44px] text-[#17211c] placeholder:text-[#99a69f] focus:border-[#16724f] focus:outline focus:outline-[3px] focus:outline-[rgba(22,114,79,0.14)] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2] dark:placeholder:text-[#6a7c73]"
                placeholder="Enter your password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
              />
              <button
                className="absolute right-2.5 inline-flex h-8 w-8 items-center justify-center rounded-md border-0 bg-transparent text-[#66736c] transition hover:bg-black/5 hover:text-[#17211c] dark:text-[#b7c8bf] dark:hover:bg-white/10 dark:hover:text-[#eef7f2]"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                title={showPassword ? "Hide password" : "Show password"}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error ? (
            <p className="m-0 rounded-lg bg-[#f6ece8] p-3 text-sm font-bold text-[#b7472a] dark:bg-[#3a1f18] dark:text-[#ff9f87]">
              {error}
            </p>
          ) : null}

          <button
            className="mt-2 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#17211c] px-4 font-bold text-white transition hover:bg-[#25352e] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#eef7f2] dark:text-[#101713] dark:hover:bg-white"
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
