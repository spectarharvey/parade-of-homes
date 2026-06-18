"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SEED } from "./seed";
import type {
  DB,
  Home,
  NotificationItem,
  Submission,
  User,
} from "./types";

const clone = (d: DB): DB => JSON.parse(JSON.stringify(d));

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return res.json();
}

interface ToastContextValue {
  toast: (msg: string) => void;
}
const ToastCtx = createContext<ToastContextValue>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

interface StoreContextValue {
  db: DB;
  ready: boolean;
  role: "ADMIN" | "BUILDER" | null;
  // selectors
  builder: (id: string) => DB["builders"][number] | undefined;
  nbhd: (id: string) => DB["neighborhoods"][number] | undefined;
  home: (id: string) => Home | undefined;
  liveStats: () => {
    homes: number;
    checkins: number;
    visitors: number;
    builders: number;
  };
  // session
  visited: string[];
  route: string[];
  isAdmin: boolean;
  // public mutations
  checkIn: (id: string) => void;
  toggleRoute: (id: string) => void;
  removeRouteStop: (id: string) => void;
  clearRoute: () => void;
  rateHome: (id: string, val: number) => void;
  addUser: (u: User) => Promise<void>;
  addSubmission: (s: Submission) => Promise<void>;
  // admin mutations
  removeHome: (id: string) => void;
  toggleFeatureHome: (id: string) => void;
  setFeaturedBuilder: (id: string) => void;
  saveBuilderAd: (id: string, ad: string) => void;
  approveSubmission: (id: string) => void;
  rejectSubmission: (id: string) => void;
  sendNotification: (n: NotificationItem) => void;
  saveSettings: (target: number, prize: string) => void;
  resetDB: () => void;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;
}

const StoreCtx = createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within <AppProvider>");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Seed data is the initial paint; replaced by live API data on mount.
  const [db, setDb] = useState<DB>(() => clone(SEED));
  const [visitorsCount, setVisitorsCount] = useState<number>(SEED.users.length);
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "BUILDER" | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [route, setRoute] = useState<string[]>([]);

  const isAdmin = role === "ADMIN";

  // toast
  const [toastMsg, setToastMsg] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2600);
  }, []);

  const refetchPublic = useCallback(async () => {
    try {
      const s = await api("/api/state");
      setDb((prev) => ({
        ...prev,
        contest: s.contest,
        builders: s.builders,
        neighborhoods: s.neighborhoods,
        homes: s.homes,
        sponsors: s.sponsors,
        faqs: s.faqs,
      }));
      setVisitorsCount(s.visitorsCount ?? 0);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refetchAdmin = useCallback(async (asAdmin: boolean) => {
    if (!asAdmin) {
      setDb((prev) => ({ ...prev, users: [], submissions: [], notifications: [] }));
      return;
    }
    try {
      const a = await api("/api/admin/state");
      setDb((prev) => ({
        ...prev,
        users: a.users,
        submissions: a.submissions,
        notifications: a.notifications,
      }));
    } catch {
      /* not authorized */
    }
  }, []);

  // initial hydrate
  useEffect(() => {
    (async () => {
      try {
        setVisited(JSON.parse(sessionStorage.getItem("poh_visited") || "[]"));
      } catch {
        /* ignore */
      }
      try {
        setRoute(JSON.parse(sessionStorage.getItem("poh_route") || "[]"));
      } catch {
        /* ignore */
      }
      let currentRole: "ADMIN" | "BUILDER" | null = null;
      try {
        const me = await api("/api/auth/me");
        currentRole = me.session?.role ?? null;
        setRole(currentRole);
      } catch {
        /* ignore */
      }
      // If the database isn't reachable yet, keep the seed fallback and don't crash.
      try {
        await Promise.all([
          refetchPublic(),
          refetchAdmin(currentRole === "ADMIN"),
        ]);
      } catch (e) {
        console.warn("Could not load live data (is the database configured?):", e);
      }
      setReady(true);
    })();
  }, [refetchPublic, refetchAdmin]);

  const persistVisited = useCallback((next: string[]) => {
    setVisited(next);
    try {
      sessionStorage.setItem("poh_visited", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const persistRoute = useCallback((next: string[]) => {
    setRoute(next);
    try {
      sessionStorage.setItem("poh_route", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  // selectors
  const builder = useCallback(
    (id: string) => db.builders.find((b) => b.id === id),
    [db]
  );
  const nbhd = useCallback(
    (id: string) => db.neighborhoods.find((n) => n.id === id),
    [db]
  );
  const home = useCallback(
    (id: string) => db.homes.find((h) => h.id === id),
    [db]
  );
  const liveStats = useCallback(
    () => ({
      homes: db.homes.length,
      checkins: db.homes.reduce((s, h) => s + h.checkins, 0),
      visitors: visitorsCount,
      builders: db.builders.length,
    }),
    [db, visitorsCount]
  );

  // ---- public mutations ----
  const checkIn = useCallback(
    (id: string) => {
      if (visited.includes(id)) return;
      persistVisited([...visited, id]);
      api(`/api/homes/${id}/checkin`, { method: "POST" })
        .then(() => refetchPublic())
        .catch(() => {});
    },
    [visited, persistVisited, refetchPublic]
  );

  const toggleRoute = useCallback(
    (id: string) => {
      persistRoute(
        route.includes(id) ? route.filter((x) => x !== id) : [...route, id]
      );
    },
    [route, persistRoute]
  );

  const removeRouteStop = useCallback(
    (id: string) => persistRoute(route.filter((x) => x !== id)),
    [route, persistRoute]
  );

  const clearRoute = useCallback(() => persistRoute([]), [persistRoute]);

  const rateHome = useCallback(
    (id: string, val: number) => {
      api(`/api/homes/${id}/rate`, {
        method: "POST",
        body: JSON.stringify({ val }),
      })
        .then(() => refetchPublic())
        .catch(() => {});
    },
    [refetchPublic]
  );

  const addUser = useCallback(
    async (u: User) => {
      await api("/api/register", {
        method: "POST",
        body: JSON.stringify({
          first: u.first,
          last: u.last,
          email: u.email,
          phone: u.phone,
          zip: u.zip,
          sms: u.sms,
        }),
      });
      await refetchPublic();
      await refetchAdmin(isAdmin);
    },
    [refetchPublic, refetchAdmin, isAdmin]
  );

  const addSubmission = useCallback(
    async (s: Submission) => {
      await api("/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          builder: s.builder,
          home: s.home,
          nb: s.nb,
          style: s.style,
          price: s.price,
          beds: s.beds,
          baths: s.baths,
          sqft: s.sqft,
          contact: s.contact,
        }),
      });
      await refetchAdmin(isAdmin);
    },
    [refetchAdmin, isAdmin]
  );

  // ---- admin mutations ----
  const removeHome = useCallback(
    (id: string) => {
      api(`/api/admin/homes/${id}`, { method: "DELETE" })
        .then(() => Promise.all([refetchPublic(), refetchAdmin(true)]))
        .catch((e) => toast(e.message));
    },
    [refetchPublic, refetchAdmin, toast]
  );

  const toggleFeatureHome = useCallback(
    (id: string) => {
      api(`/api/admin/homes/${id}/feature`, { method: "POST" })
        .then(() => refetchPublic())
        .catch((e) => toast(e.message));
    },
    [refetchPublic, toast]
  );

  const setFeaturedBuilder = useCallback(
    (id: string) => {
      api(`/api/admin/builders/${id}/feature`, { method: "POST" })
        .then(() => refetchPublic())
        .catch((e) => toast(e.message));
    },
    [refetchPublic, toast]
  );

  const saveBuilderAd = useCallback(
    (id: string, ad: string) => {
      api(`/api/admin/builders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ad }),
      })
        .then(() => refetchPublic())
        .catch((e) => toast(e.message));
    },
    [refetchPublic, toast]
  );

  const approveSubmission = useCallback(
    (id: string) => {
      api(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      })
        .then(() => refetchAdmin(true))
        .catch((e) => toast(e.message));
    },
    [refetchAdmin, toast]
  );

  const rejectSubmission = useCallback(
    (id: string) => {
      api(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "rejected" }),
      })
        .then(() => refetchAdmin(true))
        .catch((e) => toast(e.message));
    },
    [refetchAdmin, toast]
  );

  const sendNotification = useCallback(
    (n: NotificationItem) => {
      api("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify({ type: n.type, msg: n.msg, audience: n.audience }),
      })
        .then(() => refetchAdmin(true))
        .catch((e) => toast(e.message));
    },
    [refetchAdmin, toast]
  );

  const saveSettings = useCallback(
    (target: number, prize: string) => {
      api("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ target, prize }),
      })
        .then(() => refetchPublic())
        .catch((e) => toast(e.message));
    },
    [refetchPublic, toast]
  );

  const resetDB = useCallback(() => {
    api("/api/admin/reset", { method: "POST" })
      .then(() => Promise.all([refetchPublic(), refetchAdmin(true)]))
      .catch((e) => toast(e.message));
  }, [refetchPublic, refetchAdmin, toast]);

  const adminLogin = useCallback(
    async (email: string, password: string) => {
      try {
        const r = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setRole(r.role);
        await refetchAdmin(r.role === "ADMIN");
        return true;
      } catch {
        return false;
      }
    },
    [refetchAdmin]
  );

  const adminLogout = useCallback(() => {
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setRole(null);
    setDb((prev) => ({ ...prev, users: [], submissions: [], notifications: [] }));
  }, []);

  const value: StoreContextValue = {
    db,
    ready,
    role,
    builder,
    nbhd,
    home,
    liveStats,
    visited,
    route,
    isAdmin,
    checkIn,
    toggleRoute,
    removeRouteStop,
    clearRoute,
    rateHome,
    addUser,
    addSubmission,
    removeHome,
    toggleFeatureHome,
    setFeaturedBuilder,
    saveBuilderAd,
    approveSubmission,
    rejectSubmission,
    sendNotification,
    saveSettings,
    resetDB,
    adminLogin,
    adminLogout,
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      <StoreCtx.Provider value={value}>
        {children}
        <div className={"toast" + (toastShow ? " show" : "")}>
          <span>{toastMsg}</span>
        </div>
      </StoreCtx.Provider>
    </ToastCtx.Provider>
  );
}
