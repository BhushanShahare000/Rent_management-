"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";

export function MessagePreview({ message }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <aside className="self-start rounded-lg border border-[#dce4dd] bg-white p-5 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none max-[1120px]:col-span-full max-[960px]:col-auto max-[780px]:p-4 print:hidden">
      <div className="mb-4 flex items-center justify-between gap-[9px]">
        <div className="flex items-center gap-[9px]">
          <MessageCircle size={18} />
          <h2 className="m-0 text-lg text-[#17211c] dark:text-[#eef7f2]">WhatsApp Message</h2>
        </div>
        <button
          className="inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-lg border border-[#dce4dd] bg-[#f8faf9] px-2.5 text-[13px] font-bold text-[#17211c] transition hover:bg-[#eef4f1] dark:border-[#365044] dark:bg-[#101713] dark:text-[#eef7f2] dark:hover:bg-[#1b2a22]"
          onClick={handleCopy}
          title="Copy message to clipboard"
          type="button"
        >
          {copied ? <Check size={14} className="text-[#16724f] dark:text-[#8fd8b7]" /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <pre className="mt-3.5 min-h-[300px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#10211c] p-3.5 text-[13px] leading-normal text-[#eef8f2] dark:bg-[#0b100d] dark:text-[#e7f4ed] max-[780px]:min-h-[220px]">
        {message}
      </pre>
    </aside>
  );
}
