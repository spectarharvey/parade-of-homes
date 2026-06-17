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

const KEY = "mcbia_poh_v1";
const clone = (d: DB): DB => JSON.parse(JSON.stringify(d));

interface ToastContextValue {
  toast: (msg: string) => void;
}
const ToastCtx = createContext<ToastContextValue>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

interface StoreContextValue {
  db: DB;
  ready: boolean;
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
  addUser: (u: User) => void;
  addSubmission: (s: Submission) => void;
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
  adminLogin: (pw: string) => boolean;
  adminLogout: () => void;
}

const StoreCtx = createContext<StoreContextValue | null>(null);

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within <AppProvider>");
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(() => clone(SEED));
  const [ready, setReady] = useState(false);
  const [visited, setVisited] = useState<string[]>([]);
  const [route, setRoute] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

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

  // hydrate from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as DB) : null;
      if (parsed && parsed.homes) setDb(parsed);
    } catch {
      /* ignore */
    }
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
    setIsAdmin(sessionStorage.getItem("poh_admin") === "1");
    setReady(true);
  }, []);

  // persist db
  const persist = useCallback((next: DB) => {
    setDb(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  // mutate helper: receives a draft clone, mutates it, persists
  const mutate = useCallback(
    (fn: (draft: DB) => void) => {
      setDb((prev) => {
        const draft = clone(prev);
        fn(draft);
        try {
          localStorage.setItem(KEY, JSON.stringify(draft));
        } catch {
          /* ignore */
        }
        return draft;
      });
    },
    []
  );

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
      visitors: db.users.length,
      builders: db.builders.length,
    }),
    [db]
  );

  // public mutations
  const checkIn = useCallback(
    (id: string) => {
      if (visited.includes(id)) return;
      persistVisited([...visited, id]);
      mutate((d) => {
        const h = d.homes.find((x) => x.id === id);
        if (h) h.checkins++;
      });
    },
    [visited, persistVisited, mutate]
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
      mutate((d) => {
        const h = d.homes.find((x) => x.id === id);
        if (!h) return;
        h.rating = +(((h.rating * h.ratings) + val) / (h.ratings + 1)).toFixed(2);
        h.ratings++;
      });
    },
    [mutate]
  );

  const addUser = useCallback(
    (u: User) => mutate((d) => void d.users.push(u)),
    [mutate]
  );

  const addSubmission = useCallback(
    (s: Submission) => mutate((d) => void d.submissions.unshift(s)),
    [mutate]
  );

  // admin mutations
  const removeHome = useCallback(
    (id: string) =>
      mutate((d) => {
        d.homes = d.homes.filter((h) => h.id !== id);
      }),
    [mutate]
  );

  const toggleFeatureHome = useCallback(
    (id: string) =>
      mutate((d) => {
        const h = d.homes.find((x) => x.id === id);
        if (h) h.featured = !h.featured;
      }),
    [mutate]
  );

  const setFeaturedBuilder = useCallback(
    (id: string) =>
      mutate((d) => {
        d.builders.forEach((b) => (b.featured = false));
        const b = d.builders.find((x) => x.id === id);
        if (b) b.featured = true;
      }),
    [mutate]
  );

  const saveBuilderAd = useCallback(
    (id: string, ad: string) =>
      mutate((d) => {
        const b = d.builders.find((x) => x.id === id);
        if (b) b.ad = ad;
      }),
    [mutate]
  );

  const approveSubmission = useCallback(
    (id: string) =>
      mutate((d) => {
        const s = d.submissions.find((x) => x.id === id);
        if (s) s.status = "approved";
      }),
    [mutate]
  );

  const rejectSubmission = useCallback(
    (id: string) =>
      mutate((d) => {
        const s = d.submissions.find((x) => x.id === id);
        if (s) s.status = "rejected";
      }),
    [mutate]
  );

  const sendNotification = useCallback(
    (n: NotificationItem) => mutate((d) => void d.notifications.unshift(n)),
    [mutate]
  );

  const saveSettings = useCallback(
    (target: number, prize: string) =>
      mutate((d) => {
        d.contest.target = target;
        d.contest.prize = prize;
      }),
    [mutate]
  );

  const resetDB = useCallback(() => {
    persist(clone(SEED));
  }, [persist]);

  const adminLogin = useCallback((pw: string) => {
    if (pw === "parade2025") {
      setIsAdmin(true);
      try {
        sessionStorage.setItem("poh_admin", "1");
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    try {
      sessionStorage.setItem("poh_admin", "0");
    } catch {
      /* ignore */
    }
  }, []);

  const value: StoreContextValue = {
    db,
    ready,
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
