"use client";

import { flushSync } from "react-dom";
import { useEffect, useMemo, useState } from "react";
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
  updateBillPaidRow,
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
  const [previousUnit, setPreviousUnit] = useState(1480);
  const [currentUnit, setCurrentUnit] = useState("");
  const [baseRent, setBaseRent] = useState(2200);
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

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.id === selectedTenantId) ?? tenants[0],
    [selectedTenantId, tenants]
  );

  const currentUnitValue = numberValue(currentUnit);
  const hasCurrentUnit = currentUnit.trim().length > 0;
  const usedUnit = hasCurrentUnit ? Math.max(currentUnitValue - previousUnit, 0) : 0;
  const electricityAmount = usedUnit * UNIT_RATE;
  const totalAmount = baseRent + electricityAmount;

  const message = useMemo(() => {
    return [
      `Kiraydar Bill - ${selectedTenant.name}`,
      `Month: ${month}`,
      `Previous unit: ${previousUnit}`,
      `Current unit: ${hasCurrentUnit ? currentUnitValue : ""}`,
      `Used unit: ${usedUnit}`,
      `Electricity: ${usedUnit} x ${UNIT_RATE} = ${electricityAmount} Rs`,
      `Home rent: ${baseRent} Rs`,
      `Total amount: ${baseRent} + ${electricityAmount} = ${totalAmount} Rs`
    ].join("\n");
  }, [
    baseRent,
    currentUnitValue,
    electricityAmount,
    hasCurrentUnit,
    month,
    previousUnit,
    selectedTenant.name,
    totalAmount,
    usedUnit
  ]);

  const whatsappUrl = useMemo(() => {
    const cleanedPhone = selectedTenant.phone.replace(/[^\d]/g, "");
    const text = encodeURIComponent(message);
    return cleanedPhone
      ? `https://wa.me/${cleanedPhone}?text=${text}`
      : `https://wa.me/?text=${text}`;
  }, [message, selectedTenant.phone]);

  const billsByTenant = useMemo(() => {
    return tenants.map((tenant) => ({
      tenant,
      bills: bills.filter((bill) => bill.tenantId === tenant.id).sort(sortBills)
    }));
  }, [bills, tenants]);

  const selectedTenantBills = useMemo(
    () => bills.filter((bill) => bill.tenantId === selectedTenant.id).sort(sortBills),
    [bills, selectedTenant.id]
  );

  const selectedTenantLatestBill = useMemo(
    () => latestBillForTenant(bills, selectedTenant.id),
    [bills, selectedTenant.id]
  );

  const monthlyBills = useMemo(
    () => bills.filter((bill) => bill.month === collectionMonth),
    [bills, collectionMonth]
  );

  const monthlySummary = useMemo(
    () =>
      monthlyBills.reduce(
        (summary, bill) => ({
          rent: summary.rent + bill.baseRent,
          electricity: summary.electricity + bill.electricityAmount,
          total: summary.total + bill.totalAmount
        }),
        { rent: 0, electricity: 0, total: 0 }
      ),
    [monthlyBills]
  );

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
            setSelectedTenantId(saved.tenants[0].id);
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

  useEffect(() => {
    setPreviousUnit(selectedTenantLatestBill?.currentUnit ?? selectedTenant.previousUnit);
    setBaseRent(selectedTenant.baseRent);
    setCurrentUnit("");
  }, [selectedTenant, selectedTenantLatestBill]);

  useEffect(() => {
    const resetPrintTenant = () => setPrintTenantId(null);
    window.addEventListener("afterprint", resetPrintTenant);
    return () => window.removeEventListener("afterprint", resetPrintTenant);
  }, []);

  function handleClearForm() {
    setCurrentUnit("");
    setPreviousUnit(selectedTenantLatestBill?.currentUnit ?? selectedTenant?.previousUnit ?? 0);
    setMonth(currentMonth());
  }

  async function updateTenant(changes) {
    const previousTenants = tenants;
    setTenants((current) =>
      current.map((tenant) =>
        tenant.id === selectedTenantId ? { ...tenant, ...changes } : tenant
      )
    );

    if (!isDbConfigured) return;

    try {
      const updatedTenant = await updateTenantRow(selectedTenantId, changes);
      setTenants((current) =>
        current.map((tenant) => (tenant.id === updatedTenant.id ? updatedTenant : tenant))
      );
    } catch (error) {
      setTenants(previousTenants);
      window.alert(`Could not update kiraydar in database.\n\n${error.message}`);
    }
  }

  function updateBaseRent(value) {
    const parsedValue = numberValue(value);
    setBaseRent(parsedValue);
    updateTenant({ baseRent: parsedValue });
  }

  async function addTenant() {
    const nextId = tenants.reduce((maxId, tenant) => Math.max(maxId, tenant.id), 0) + 1;
    const tenant = {
      name: `Kiraydar ${nextId}`,
      phone: "",
      baseRent: 2200,
      previousUnit: 0
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
    if (!hasCurrentUnit) return;

    const bill = {
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
      paid: false
    };

    let savedBill = {
      ...bill,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };

    if (isDbConfigured) {
      try {
        savedBill = await createBill(bill);
        await updateTenantRow(selectedTenant.id, {
          baseRent,
          previousUnit: currentUnitValue
        });
      } catch (error) {
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

    if (isDbConfigured) {
      try {
        const updatedBill = await updateBillPaidRow(billId, !targetBill.paid);
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
        bill.id === billId ? { ...bill, paid: !bill.paid } : bill
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
      />

      <section className="grid grid-cols-[260px_minmax(0,1fr)_330px] gap-5 max-[1120px]:grid-cols-[230px_minmax(0,1fr)] max-[960px]:grid-cols-1 max-[470px]:gap-3 print:hidden">
        <TenantList
          onAddTenant={addTenant}
          onSelectTenant={setSelectedTenantId}
          selectedTenantId={selectedTenantId}
          tenants={tenants}
        />

        <BillForm
          baseRent={baseRent}
          currentUnit={currentUnit}
          currentUnitValue={currentUnitValue}
          electricityAmount={electricityAmount}
          hasCurrentUnit={hasCurrentUnit}
          month={month}
          onBaseRentChange={updateBaseRent}
          onClearForm={handleClearForm}
          onCurrentUnitChange={setCurrentUnit}
          onDeleteTenant={() => deleteTenant(selectedTenant)}
          onMonthChange={setMonth}
          onPreviousUnitChange={setPreviousUnit}
          onTenantChange={updateTenant}
          onSaveBill={saveBill}
          previousUnit={previousUnit}
          selectedTenant={selectedTenant}
          selectedTenantBills={selectedTenantBills}
          totalAmount={totalAmount}
          unitRate={UNIT_RATE}
          usedUnit={usedUnit}
          whatsappUrl={whatsappUrl}
        />

        <MessagePreview message={message} />
      </section>

      <TenantRecords
        billsByTenant={billsByTenant}
        openTenantRecordId={openTenantRecordId}
        onClearTenantBills={clearTenantBills}
        onDeleteBill={deleteBill}
        onPrintTenantHistory={printTenantHistory}
        onToggleBillPaid={toggleBillPaid}
        onToggleTenantDetails={(tenantId) =>
          setOpenTenantRecordId((current) => (current === tenantId ? null : tenantId))
        }
        printTenantId={printTenantId}
      />
    </main>
  );
}
