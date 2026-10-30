"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTable } from "./TableProvider";
import { listOrders, requestCall, TableApiError, type CallKind, type TableCall, type TableSession } from "@/lib/tableApi";

/** Savatdagi qator: mahsulot yoki set (backend ikkalasini ham `product_uuid` deb oladi). */
export interface CartLine {
  uuid: string;
  name: string;
  /** Ko'rsatish uchun taxminiy narx; yakuniy narxni server hisoblaydi (quote) */
  price: number;
  image?: string;
  /** TO'LANADIGAN son */
  qty: number;
}

export type CartItem = Omit<CartLine, "qty">;

const MAX_QTY = 50;

interface CartApi {
  /** Savat faqat haqiqiy (tekshirilgan) stol rejimida ishlaydi */
  enabled: boolean;
  lines: CartLine[];
  count: number;
  estimate: number;
  add: (item: CartItem, qty?: number) => void;
  setQty: (uuid: string, qty: number) => void;
  clear: () => void;
  qtyOf: (uuid: string) => number;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  ordersOpen: boolean;
  setOrdersOpen: (v: boolean) => void;
  /** Shu qurilmadan berilgan buyurtmalar (stol ro'yxatida "Sizniki" belgisi uchun) */
  mine: ReadonlySet<string>;
  rememberOrder: (uuid: string) => void;
  /**
   * Serverdagi joriy seansni bildiramiz. Seans almashgan bo'lsa (oldingi mehmon hisobi yopilgan) "Sizniki"
   * belgilari tozalanadi. Qaytaradi: oldin seans bo'lib, endi yopilganmi.
   */
  syncSession: (session: TableSession | null) => boolean;
  /** Stolning faol chaqiruvlari (ofitsiant / hisob) */
  calls: TableCall[];
  setCalls: (c: TableCall[]) => void;
  callBusy: boolean;
  /** Oxirgi chaqiruv xatosi (internet yo'q, juda ko'p so'rov…) */
  callError: string | null;
  sendCall: (kind: CallKind) => Promise<void>;
}

const CartContext = createContext<CartApi>({
  enabled: false,
  lines: [],
  count: 0,
  estimate: 0,
  add: () => {},
  setQty: () => {},
  clear: () => {},
  qtyOf: () => 0,
  cartOpen: false,
  setCartOpen: () => {},
  ordersOpen: false,
  setOrdersOpen: () => {},
  mine: new Set(),
  rememberOrder: () => {},
  syncSession: () => false,
  calls: [],
  setCalls: () => {},
  callBusy: false,
  callError: null,
  sendCall: async () => {},
});

export const useCart = () => useContext(CartContext);

const cartKey = (tableUuid: string) => `qr-cart:${tableUuid}`;
const mineKey = (tableUuid: string) => `qr-mine:${tableUuid}`;
const sessionKey = (tableUuid: string) => `qr-session:${tableUuid}`;

function read<T>(store: Storage | undefined, key: string, fallback: T): T {
  try {
    const raw = store?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(store: Storage | undefined, key: string, value: unknown) {
  try {
    store?.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode: savat faqat shu sahifa uchun */
  }
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const table = useTable();
  const tableUuid = table.status === "ok" ? table.tableUuid : null;

  const [lines, setLines] = useState<CartLine[]>([]);
  const [mine, setMine] = useState<ReadonlySet<string>>(new Set());
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const loadedFor = useRef<string | null>(null);
  const [calls, setCalls] = useState<TableCall[]>([]);
  const [callBusy, setCallBusy] = useState(false);
  const [callError, setCallError] = useState<string | null>(null);
  const token = table.status === "ok" ? table.token : null;

  // Stol aniqlangach saqlangan savatni tiklaymiz (sahifa yangilansa yo'qolmasin)
  useEffect(() => {
    if (!tableUuid) {
      loadedFor.current = null;
      setLines([]);
      return;
    }
    setLines(read<CartLine[]>(sessionStorage, cartKey(tableUuid), []));
    setMine(new Set(read<string[]>(localStorage, mineKey(tableUuid), [])));
    loadedFor.current = tableUuid;
  }, [tableUuid]);

  useEffect(() => {
    if (tableUuid && loadedFor.current === tableUuid) write(sessionStorage, cartKey(tableUuid), lines);
  }, [lines, tableUuid]);

  const add = useCallback((item: CartItem, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.uuid === item.uuid);
      if (i === -1) return [...prev, { ...item, qty: Math.min(qty, MAX_QTY) }];
      return prev.map((l, idx) => (idx === i ? { ...l, price: item.price, qty: Math.min(l.qty + qty, MAX_QTY) } : l));
    });
  }, []);

  const setQty = useCallback((uuid: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.uuid !== uuid) : prev.map((l) => (l.uuid === uuid ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const rememberOrder = useCallback(
    (uuid: string) => {
      setMine((prev) => {
        const next = new Set(prev).add(uuid);
        if (tableUuid) write(localStorage, mineKey(tableUuid), [...next].slice(-30));
        return next;
      });
    },
    [tableUuid],
  );

  const syncSession = useCallback(
    (session: TableSession | null): boolean => {
      if (!tableUuid) return false;
      const known = read<string | null>(localStorage, sessionKey(tableUuid), null);
      if (!session) return known !== null;
      if (known !== session.uuid) {
        // Yangi seans: oldingi mehmonning buyurtmalari endi bu qurilmaniki emas
        write(localStorage, sessionKey(tableUuid), session.uuid);
        if (known !== null) {
          write(localStorage, mineKey(tableUuid), []);
          setMine(new Set());
        }
      }
      return false;
    },
    [tableUuid],
  );

  const sendCall = useCallback(
    async (kind: CallKind) => {
      if (!tableUuid || !token) return;
      setCallBusy(true);
      setCallError(null);
      try {
        const r = await requestCall({ tableUuid, token }, kind);
        setCalls(r.calls);
      } catch (e) {
        setCallError(e instanceof TableApiError ? e.message : "Chaqirib bo'lmadi. Qayta urinib ko'ring.");
      } finally {
        setCallBusy(false);
      }
    },
    [tableUuid, token],
  );

  // Chaqiruv kutilayotgan bo'lsa (xodim hali "Boraman" demagan) holatni tez-tez so'raymiz, keyin to'xtaymiz
  const hasPending = calls.some((c) => c.status === "PENDING");
  useEffect(() => {
    if (!tableUuid || !token || !hasPending) return;
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      listOrders({ tableUuid, token })
        .then((d) => setCalls(d.calls))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [tableUuid, token, hasPending]);

  // Sahifa ochilganda (yoki yangilanganda) mavjud faol chaqiruvlarni tiklaymiz
  useEffect(() => {
    if (!tableUuid || !token) {
      setCalls([]);
      return;
    }
    listOrders({ tableUuid, token })
      .then((d) => {
        setCalls(d.calls);
        syncSession(d.session);
      })
      .catch(() => {});
  }, [tableUuid, token, syncSession]);

  const value = useMemo<CartApi>(
    () => ({
      enabled: table.status === "ok",
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      estimate: lines.reduce((s, l) => s + l.qty * l.price, 0),
      add,
      setQty,
      clear,
      qtyOf: (uuid: string) => lines.find((l) => l.uuid === uuid)?.qty ?? 0,
      cartOpen,
      setCartOpen,
      ordersOpen,
      setOrdersOpen,
      mine,
      rememberOrder,
      syncSession,
      calls,
      setCalls,
      callBusy,
      callError,
      sendCall,
    }),
    [table.status, lines, add, setQty, clear, cartOpen, ordersOpen, mine, rememberOrder, syncSession, calls, callBusy, callError, sendCall],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
