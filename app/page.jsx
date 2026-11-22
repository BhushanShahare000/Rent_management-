"use client";

import { flushSync } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { BillForm } from "./components/BillForm";
import { CollectionSummary } from "./components/CollectionSummary";
import { LoginForm } from "./components/LoginForm";
import { MessagePreview } from "./components/MessagePreview";
import { TenantList } from "./components/TenantList";
import { TenantRecords } from "./components/TenantRecords";
import {
  createBill,
  createTenant,
  deleteBillRow,
  deleteBillsForTenant,
  deleteTenantRow,
  loadRentData,
  markAllPaidForTenant,
  updateBillPaidRow,
  updateBillRow,
  updateTenantRow
} from "./lib/rentRepository";
import {
  STORAGE_KEY,
  UNIT_RATE,
  currentMonth,
  defaultTenants,
  latestBillForTenant,
  numberValue,
  sortBills
} from "./lib/rent";
import { getAppConfig, getStoredSession, signIn, signOut } from "./lib/authClient";

const THEME_KEY = "kiraydar-theme";

export default function Home() {
  const [tenants, setTenants] = useState(defaultTenants);
  const [bills, setBills] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState(1);
  const [month, setMonth] = useState(currentMonth());
  const [collectionMonth, setCollectionMonth] = useState(currentMonth());
  const [previousUnit, setPreviousUnit] = useState(0);
  const [currentUnit, setCurrentUnit] = useState("");
  const [baseRent, setBaseRent] = useState(2200);
  const [paidAmount, setPaidAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [editingBillId, setEditingBillId] = useState(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [printTenantId, setPrintTenantId] = useState(null);
  const [openTenantRecordId, setOpenTenantRecordId] = useState(null);
  const [theme, setTheme] = useState("light");
  const [hasLoadedTheme, setHasLoadedTheme] = useState(false);
  const [isDbConfigured, setIsDbConfigured] = useState(true);
  const [session, setSession] = useState(null);
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");

  const saveTimeoutRef = useRef(null);

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0],
    [selectedTenantId, tenants]
  );

  const currentUnitValue = numberValue(currentUnit);
  const hasCurrentUnit = currentUnit.trim().length > 0;
  const usedUnit = hasCurrentUnit ? Math.max(currentUnitValue - previousUnit, 0) : 0;
  const electricityAmount = usedUnit * UNIT_RATE;
  // Total bill strictly Rent + Electricity (Balance is NOT added into total amount)
  const totalAmount = baseRent + electricityAmount;

  const tenantPendingBills = useMemo(
    () => bills.filter((bill) => bill.tenantId === selectedTenant?.id && !bill.paid),
    [bills, selectedTenant?.id]
  );

  const tenantPendingRent = useMemo(
    () => tenantPendingBills.reduce((sum, bill) => sum + bill.baseRent, 0),
    [tenantPendingBills]
  );

  const tenantPendingBalance = useMemo(
    () => tenantPendingBills.reduce((sum, bill) => sum + (bill.balance || bill.totalAmount), 0),
    [tenantPendingBills]
  );

  const tenantDuesMap = useMemo(() => {
    const map = {};
    for (const bill of bills) {
      if (!bill.paid) {
        map[bill.tenantId] = (map[bill.tenantId] || 0) + (bill.balance || bill.totalAmount);
      }
    }
    return map;
  }, [bills]);

  const message = useMemo(() => {
    const formattedDueDate =
      dueDate || `${month}-${String(selectedTenant?.dueDay || 5).padStart(2, "0")}`;
    const paidVal = paidAmount.trim() === "" ? 0 : numberValue(paidAmount);
    const balVal = numberValue(balance);

    return [
      `Kiraydar Bill - ${selectedTenant?.name ?? "Tenant"}`,
      `Month: ${month}`,
      `Rent Due Date: ${formattedDueDate}`,
      `--------------------------------`,
      `Previous unit: ${previousUnit}`,
      `Current unit: ${hasCurrentUnit ? currentUnitValue : ""}`,
      `Used unit: ${usedUnit}`,
      `Electricity: ${usedUnit} x ${UNIT_RATE} = ${electricityAmount} Rs`,
      `Home rent: ${baseRent} Rs`,
      `Total Bill: ${totalAmount} Rs`,
      `--------------------------------`,
      `Amount Paid: ${paidVal} Rs`,
      `Remaining Balance: ${balVal} Rs`,
      `--------------------------------`,
      balVal > 0 ? `Status: ${balVal} Rs Pending` : `Status: Paid (Clear)`
    ].join("\n");
  }, [
    balance,
    baseRent,
    currentUnitValue,
    dueDate,
    electricityAmount,
    hasCurrentUnit,
    month,
    paidAmount,
    previousUnit,
    selectedTenant?.dueDay,
    selectedTenant?.name,
    totalAmount,
    usedUnit
  ]);

  const whatsappUrl = useMemo(() => {
    const cleanedPhone = (selectedTenant?.phone ?? "").replace(/[^\d]/g, "");
    const text = encodeURIComponent(message);
    return cleanedPhone
      ? `https://wa.me/${cleanedPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;
  }, [message, selectedTenant?.phone]);

  const billsByTenant = useMemo(() => {
    return tenants.map((tenant) => ({
      tenant,
      bills: bills.filter((bill) => bill.tenantId === tenant.id).sort(sortBills)
    }));
  }, [bills, tenants]);

  const selectedTenantBills = useMemo(
    () => bills.filter((bill) => bill.tenantId === selectedTenant?.id).sort(sortBills),
    [bills, selectedTenant?.id]
  );

  const selectedTenantLatestBill = useMemo(
    () => (selectedTenant ? latestBillForTenant(bills, selectedTenant.id) : null),
    [bills, selectedTenant]
  );

  const monthlyBills = useMemo(
    () => bills.filter((bill) => bill.month === collectionMonth),
    [bills, collectionMonth]
  );

  const monthlySummary = useMemo(() => {
    return monthlyBills.reduce(
      (summary, bill) => {
        const isPaid = bill.paid;
        const bBalance = bill.balance ?? (isPaid ? 0 : bill.totalAmount);
        const bPaid = bill.paidAmount ?? (isPaid ? bill.totalAmount : 0);

        return {
          rent: summary.rent + bill.baseRent,
          electricity: summary.electricity + bill.electricityAmount,
          total: summary.total + bill.totalAmount,
          paidTotal: summary.paidTotal + bPaid,
          pendingRent: summary.pendingRent + (!isPaid ? bill.baseRent : 0),
          pendingTotal: summary.pendingTotal + bBalance,
          pendingCount: summary.pendingCount + (!isPaid ? 1 : 0),
          paidCount: summary.paidCount + (isPaid ? 1 : 0)
        };
      },
      {
        rent: 0,
        electricity: 0,
        total: 0,
        paidTotal: 0,
        pendingRent: 0,
        pendingTotal: 0,
        pendingCount: 0,
        paidCount: 0
      }
    );
  }, [monthlyBills]);

  const allTimeTotal = useMemo(
    () => bills.reduce((total, bill) => total + bill.totalAmount, 0),
    [bills]
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
    setHasLoadedTheme(true);

    getAppConfig()
      .then((cfg) => {
        setIsDbConfigured(cfg.isDatabaseConfigured);
        if (cfg.isDatabaseConfigured) {
          const savedSession = getStoredSession();
          setSession(savedSession);
        }
      })
      .catch((error) => {
        console.error("Failed to load app config:", error);
      })
      .finally(() => {
        setHasCheckedSession(true);
      });
  }, []);

  useEffect(() => {
    if (isDbConfigured && !session) {
      setHasLoadedStorage(false);
      return;
    }

    async function loadData() {
      if (isDbConfigured) {
        try {
          const saved = await loadRentData();
          if (saved.tenants?.length) {
            setTenants(saved.tenants);
            const firstId = saved.tenants[0].id;
            setSelectedTenantId(firstId);
            const latest = latestBillForTenant(saved.bills || [], firstId);
            setPreviousUnit(latest?.currentUnit ?? saved.tenants[0].previousUnit ?? 0);
            setBaseRent(saved.tenants[0].baseRent ?? 2200);
            const pending = (saved.bills || [])
              .filter((b) => b.tenantId === firstId && !b.paid)
              .reduce((sum, b) => sum + (b.balance || b.totalAmount), 0);
            setBalance(pending);
            const day = saved.tenants[0].dueDay || 5;
            setDueDate(`${currentMonth()}-${String(day).padStart(2, "0")}`);
          }
          if (saved.bills) {
            setBills(saved.bills);
          }
          setHasLoadedStorage(true);
          return;
        } catch (error) {
          console.error("Database load failed. Falling back to localStorage.", error);
          window.alert(`Database load failed:\n\n${error.message}`);
        }
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHasLoadedStorage(true);
        return;
      }

      try {
        const saved = JSON.parse(raw);
        if (saved.tenants?.length) {
          setTenants(saved.tenants);
          setSelectedTenantId(saved.tenants[0].id);
        }
        if (saved.bills?.length) setBills(saved.bills);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHasLoadedStorage(true);
      }
    }

    loadData();
  }, [isDbConfigured, session]);

  useEffect(() => {
    if (!hasLoadedTheme) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [hasLoadedTheme, theme]);

  useEffect(() => {
    if (!hasLoadedStorage || isDbConfigured) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ tenants, bills }));
  }, [bills, isDbConfigured, hasLoadedStorage, tenants]);

  // When changing selected tenant, update previous unit, rent, due date and balance
  useEffect(() => {
    if (!hasLoadedStorage) return;
    const tenant = tenants.find((t) => t.id === selectedTenantId) ?? tenants[0];
    if (!tenant) return;
    const latestBill = latestBillForTenant(bills, tenant.id);
    setPreviousUnit(latestBill?.currentUnit ?? tenant.previousUnit ?? 0);
    setBaseRent(tenant.baseRent ?? 2200);
    setCurrentUnit("");
    setEditingBillId(null);
    setPaidAmount("");
    const day = tenant.dueDay || 5;
    setDueDate(`${month}-${String(day).padStart(2, "0")}`);
    const pending = bills
      .filter((b) => b.tenantId === tenant.id && !b.paid)
      .reduce((sum, b) => sum + (b.balance || b.totalAmount), 0);
    setBalance(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTenantId, hasLoadedStorage]);

  useEffect(() => {
    const resetPrintTenant = () => setPrintTenantId(null);
    window.addEventListener("afterprint", resetPrintTenant);
    return () => window.removeEventListener("afterprint", resetPrintTenant);
  }, []);

  function handleClearForm() {
    setCurrentUnit("");
    setEditingBillId(null);
    setPreviousUnit(selectedTenantLatestBill?.currentUnit ?? selectedTenant?.previousUnit ?? 0);
    setMonth(currentMonth());
    const day = selectedTenant?.dueDay || 5;
    setDueDate(`${currentMonth()}-${String(day).padStart(2, "0")}`);
    setPaidAmount("");
    setBalance(0);
  }

  function handleClearBalance() {
    setBalance(0);
    setPaidAmount(String(totalAmount));
  }

  function handlePaidAmountChange(val) {
    setPaidAmount(val);
    if (val.trim() === "") {
      setBalance(totalAmount);
    } else {
      const p = numberValue(val);
      setBalance(Math.max(totalAmount - p, 0));
    }
  }

  function handleBalanceChange(val) {
    setBalance(val);
    if (val.trim() === "") {
      setPaidAmount(String(totalAmount));
    } else {
      const b = numberValue(val);
      setPaidAmount(String(Math.max(totalAmount - b, 0)));
    }
  }

  function handleQuickSetPaid(mode) {
    if (mode === "full") {
      setPaidAmount(String(totalAmount));
      setBalance(0);
    } else if (mode === "unpaid") {
      setPaidAmount("0");
      setBalance(totalAmount);
    }
  }

  function handleMonthChange(newMonth) {
    setMonth(newMonth);
    const day = selectedTenant?.dueDay || 5;
    setDueDate(`${newMonth}-${String(day).padStart(2, "0")}`);
  }

  function handleEditBill(bill) {
    setSelectedTenantId(bill.tenantId);
    setMonth(bill.month);
    setPreviousUnit(bill.previousUnit);
    setCurrentUnit(String(bill.currentUnit));
    setBaseRent(bill.baseRent);
    setPaidAmount(String(bill.paidAmount || (bill.paid ? bill.totalAmount : 0)));
    setBalance(bill.balance || 0);
    setDueDate(bill.dueDate || "");
    setEditingBillId(bill.id);
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  async function handleClearPendingDues() {
    if (!selectedTenant) return;
    if (
      !window.confirm(
        `Mark all pending bills as paid for ${selectedTenant.name} (₹${tenantPendingBalance})?`
      )
    ) {
      return;
    }

    if (isDbConfigured) {
      try {
        await markAllPaidForTenant(selectedTenant.id);
      } catch (err) {
        window.alert(`Could not update bills in database:\n\n${err.message}`);
        return;
      }
    }

    setBills((current) =>
      current.map((b) =>
        b.tenantId === selectedTenant.id
          ? { ...b, paid: true, balance: 0, paidAmount: b.totalAmount }
          : b
      )
    );
    setBalance(0);
  }

  function updateTenant(changes) {
    setTenants((current) => {
      const updated = current.map((tenant) =>
        tenant.id === selectedTenantId ? { ...tenant, ...changes } : tenant
      );
      const target = updated.find((t) => t.id === selectedTenantId);
      if (target && isDbConfigured) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          updateTenantRow(target.id, {
            name: target.name,
            phone: target.phone,
            baseRent: target.baseRent,
            previousUnit: target.previousUnit,
            dueDay: target.dueDay
          }).catch((err) => {
            console.error("Background tenant update failed:", err);
          });
        }, 800);
      }
      return updated;
    });
  }

  function updateBaseRent(value) {
    const parsedValue = numberValue(value);
    setBaseRent(parsedValue);
    updateTenant({ baseRent: parsedValue });
  }

  function updatePreviousUnit(value) {
    const parsedValue = numberValue(value);
    setPreviousUnit(parsedValue);
    updateTenant({ previousUnit: parsedValue });
  }

  async function addTenant() {
    const nextId = tenants.reduce((maxId, tenant) => Math.max(maxId, tenant.id), 0) + 1;
    const tenant = {
      name: `Kiraydar ${nextId}`,
      phone: "",
      baseRent: 2200,
      previousUnit: 0,
      dueDay: 5
    };

    if (isDbConfigured) {
      try {
        const savedTenant = await createTenant(tenant);
        setTenants((current) => [...current, savedTenant]);
        setSelectedTenantId(savedTenant.id);
      } catch (error) {
        window.alert(`Could not add kiraydar in database.\n\n${error.message}`);
      }
      return;
    }

    setTenants((current) => [...current, { ...tenant, id: nextId }]);
    setSelectedTenantId(nextId);
  }

  async function deleteTenant(tenant) {
    if (tenants.length <= 1) {
      window.alert("Keep at least one kiraydar.");
      return;
    }

    const tenantBills = bills.filter((bill) => bill.tenantId === tenant.id);
    const confirmMessage =
      tenantBills.length > 0
        ? `Delete ${tenant.name} and ${tenantBills.length} saved bill records?`
        : `Delete ${tenant.name}?`;

    if (!window.confirm(confirmMessage)) return;

    if (isDbConfigured) {
      try {
        await deleteTenantRow(tenant.id);
      } catch (error) {
        window.alert(`Could not delete kiraydar in database.\n\n${error.message}`);
        return;
      }
    }

    setTenants((current) => {
      const remaining = current.filter((item) => item.id !== tenant.id);
      if (tenant.id === selectedTenantId) {
        setSelectedTenantId(remaining[0]?.id ?? 0);
      }
      return remaining;
    });
    setBills((current) => current.filter((bill) => bill.tenantId !== tenant.id));
  }

  async function saveBill() {
    if (!hasCurrentUnit) {
      window.alert("Please enter current meter reading.");
      return;
    }

    if (currentUnitValue < previousUnit) {
      const confirmSave = window.confirm(
        `Current unit (${currentUnitValue}) is less than previous unit (${previousUnit}). Do you still want to save this bill?`
      );
      if (!confirmSave) return;
    }

    setIsSaving(true);

    const paidVal = paidAmount.trim() === "" ? 0 : numberValue(paidAmount);
    const balanceVal = numberValue(balance);
    const finalDueDate =
      dueDate || `${month}-${String(selectedTenant?.dueDay || 5).padStart(2, "0")}`;

    const billPayload = {
      tenantId: selectedTenant.id,
      tenantName: selectedTenant.name,
      month,
      previousUnit,
      currentUnit: currentUnitValue,
      usedUnit,
      unitRate: UNIT_RATE,
      electricityAmount,
      baseRent,
      totalAmount,
      paidAmount: paidVal,
      balance: balanceVal,
      dueDate: finalDueDate,
      paid: balanceVal <= 0
    };

    if (editingBillId) {
      // Update existing bill
      if (isDbConfigured) {
        try {
          const updated = await updateBillRow(editingBillId, billPayload);
          setBills((current) =>
            current.map((b) => (b.id === editingBillId ? updated : b))
          );
        } catch (error) {
          setIsSaving(false);
          window.alert(`Could not update bill in database.\n\n${error.message}`);
          return;
        }
      } else {
        setBills((current) =>
          current.map((b) => (b.id === editingBillId ? { ...b, ...billPayload } : b))
        );
      }
      setEditingBillId(null);
      setCurrentUnit("");
      setSaveFeedback(`✓ Bill updated for ${selectedTenant.name} (${month})`);
    } else {
      // Create new bill
      let savedBill = {
        ...billPayload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };

      if (isDbConfigured) {
        try {
          savedBill = await createBill(billPayload);
          await updateTenantRow(selectedTenant.id, {
            name: selectedTenant.name,
            phone: selectedTenant.phone,
            baseRent,
            previousUnit: currentUnitValue,
            dueDay: selectedTenant.dueDay || 5
          });
        } catch (error) {
          setIsSaving(false);
          window.alert(`Could not save bill in database.\n\n${error.message}`);
          return;
        }
      }

      setBills((current) => [savedBill, ...current]);
      setTenants((current) =>
        current.map((tenant) =>
          tenant.id === selectedTenant.id
            ? { ...tenant, baseRent, previousUnit: currentUnitValue }
            : tenant
        )
      );
      setPreviousUnit(currentUnitValue);
      setCurrentUnit("");
      setBalance(0);
      setPaidAmount("");
      setSaveFeedback(`✓ Bill saved for ${selectedTenant.name} (${month}) - ₹${totalAmount}`);
    }

    setIsSaving(false);
    setTimeout(() => setSaveFeedback(""), 4500);
  }

  async function deleteBill(billId) {
    if (!window.confirm("Delete this saved bill?")) return;

    if (isDbConfigured) {
      try {
        await deleteBillRow(billId);
      } catch (error) {
        window.alert(`Could not delete bill in database.\n\n${error.message}`);
        return;
      }
    }

    setBills((current) => current.filter((bill) => bill.id !== billId));
  }

  async function toggleBillPaid(billId) {
    const targetBill = bills.find((bill) => bill.id === billId);
    if (!targetBill) return;

    const nextPaid = !targetBill.paid;

    if (isDbConfigured) {
      try {
        const updatedBill = await updateBillPaidRow(billId, nextPaid);
        setBills((current) =>
          current.map((bill) => (bill.id === billId ? updatedBill : bill))
        );
      } catch (error) {
        window.alert(`Could not update paid status in database.\n\n${error.message}`);
      }
      return;
    }

    setBills((current) =>
      current.map((bill) =>
        bill.id === billId
          ? {
              ...bill,
              paid: nextPaid,
              balance: nextPaid ? 0 : bill.totalAmount,
              paidAmount: nextPaid ? bill.totalAmount : 0
            }
          : bill
      )
    );
  }

  async function clearTenantBills(tenant) {
    if (!window.confirm(`Delete all saved bills for ${tenant.name}?`)) return;

    if (isDbConfigured) {
      try {
        await deleteBillsForTenant(tenant.id);
      } catch (error) {
        window.alert(`Could not clear bills in database.\n\n${error.message}`);
        return;
      }
    }

    setBills((current) => current.filter((bill) => bill.tenantId !== tenant.id));
  }

  function printTenantHistory(tenantId) {
    flushSync(() => {
      setPrintTenantId(tenantId);
    });
    window.print();
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setIsSigningIn(true);

    try {
      const nextSession = await signIn(loginEmail, loginPassword);
      setSession(nextSession);
      setLoginPassword("");
    } catch (error) {
      setLoginError(error.message);
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setSession(null);
    setTenants(defaultTenants);
    setBills([]);
    setSelectedTenantId(1);
  }

  if (!isDbConfigured && process.env.NODE_ENV === "production") {
    return (
      <main className="mx-auto flex min-h-screen w-[min(620px,calc(100%_-_32px))] items-center py-8 text-[#17211c] dark:text-[#eef7f2]">
        <section className="w-full rounded-lg border border-[#dce4dd] bg-white p-6 shadow-[0_18px_40px_rgba(28,42,35,0.09)] dark:border-[#2f4439] dark:bg-[#18231e] dark:shadow-none">
          <p className="mb-1.5 text-[13px] font-bold uppercase text-[#b7472a] dark:text-[#ff9f87]">
            Database setup missing
          </p>
          <h1 className="m-0 text-2xl font-bold leading-tight">Database is not configured</h1>
          <p className="mb-0 mt-4 text-sm font-bold leading-6 text-[#66736c] dark:text-[#b7c8bf]">
            Add DATABASE_URL in Vercel Production environment variables, then redeploy without build cache.
          </p>
        </section>
      </main>
    );
  }

  if (!hasCheckedSession) {
    return (
      <main className="mx-auto flex min-h-screen w-[min(520px,calc(100%_-_32px))] items-center justify-center py-8 text-[#17211c] dark:text-[#eef7f2]">
        <p className="m-0 text-sm font-bold text-[#66736c] dark:text-[#b7c8bf]">Checking login...</p>
      </main>
    );
  }

  if (isDbConfigured && !session) {
    return (
      <LoginForm
        email={loginEmail}
        error={loginError}
        isDarkTheme={theme === "dark"}
        isLoading={isSigningIn}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
        onToggleTheme={toggleTheme}
        password={loginPassword}
      />
    );
  }

  return (
    <main className="mx-auto w-[min(1420px,calc(100%_-_32px))] py-7 pb-10 max-[780px]:w-[min(100%_-_20px,1420px)] max-[780px]:pt-4 max-[470px]:w-[calc(100%_-_16px)] print:w-full print:p-0">
      <AppHeader
        isDarkTheme={theme === "dark"}
        onSignOut={isDbConfigured ? handleSignOut : null}
        onToggleTheme={toggleTheme}
        tenantCount={tenants.length}
      />

      <CollectionSummary
        allTimeTotal={allTimeTotal}
        collectionMonth={collectionMonth}
        monthlyBillsCount={monthlyBills.length}
        monthlySummary={monthlySummary}
        onCollectionMonthChange={setCollectionMonth}
        tenantDuesMap={tenantDuesMap}
        tenants={tenants}
      />

      <section className="grid grid-cols-[260px_minmax(0,1fr)_330px] gap-5 max-[1120px]:grid-cols-[230px_minmax(0,1fr)] max-[960px]:grid-cols-1 max-[470px]:gap-3 print:hidden">
        <TenantList
          onAddTenant={addTenant}
          onSelectTenant={setSelectedTenantId}
          selectedTenantId={selectedTenantId}
          tenantDuesMap={tenantDuesMap}
          tenants={tenants}
        />

        <BillForm
          balance={balance}
          baseRent={baseRent}
          currentUnit={currentUnit}
          currentUnitValue={currentUnitValue}
          dueDay={selectedTenant?.dueDay ?? 5}
          dueDate={dueDate}
          electricityAmount={electricityAmount}
          hasCurrentUnit={hasCurrentUnit}
          isSaving={isSaving}
          month={month}
          onBalanceChange={handleBalanceChange}
          onBaseRentChange={updateBaseRent}
          onClearBalance={handleClearBalance}
          onClearForm={handleClearForm}
          onClearPendingDues={handleClearPendingDues}
          onCurrentUnitChange={setCurrentUnit}
          onDeleteTenant={() => deleteTenant(selectedTenant)}
          onDueDayChange={(val) => {
            const day = Number(val) || 5;
            setDueDate(`${month}-${String(day).padStart(2, "0")}`);
          }}
          onDueDateChange={setDueDate}
          onMonthChange={handleMonthChange}
          onPaidAmountChange={handlePaidAmountChange}
          onPreviousUnitChange={updatePreviousUnit}
          onQuickSetPaid={handleQuickSetPaid}
          onSaveBill={saveBill}
          onTenantChange={updateTenant}
          paidAmount={paidAmount}
          previousUnit={previousUnit}
          saveFeedback={saveFeedback}
          selectedTenant={selectedTenant}
          selectedTenantBills={selectedTenantBills}
          tenantPendingBalance={tenantPendingBalance}
          tenantPendingRent={tenantPendingRent}
          totalAmount={totalAmount}
          usedUnit={usedUnit}
          whatsappUrl={whatsappUrl}
        />

        <MessagePreview message={message} />
      </section>

      <TenantRecords
        billsByTenant={billsByTenant}
        onClearTenantBills={clearTenantBills}
        onDeleteBill={deleteBill}
        onEditBill={handleEditBill}
        onPrintTenantHistory={printTenantHistory}
        onToggleBillPaid={toggleBillPaid}
        onToggleTenantDetails={(tenantId) =>
          setOpenTenantRecordId((current) => (current === tenantId ? null : tenantId))
        }
        openTenantRecordId={openTenantRecordId}
        printTenantId={printTenantId}
      />
    </main>
  );
}
