import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  auth,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOutUser,
  subscribeWatchlist,
  addWatchlistItem,
  removeWatchlistItem,
  subscribeInvestigationNotes,
  addInvestigationNote,
  deleteInvestigationNote,
  WatchlistItem,
  InvestigationNote,
  FirestoreUserProfile,
  WatchedWallet,
  subscribeWatchedWallets,
  addWatchedWallet,
  removeWatchedWallet,
} from "../lib/firebase";

const DEFAULT_WATCHED_WALLETS: WatchedWallet[] = [
  {
    id: "WW-SEED-1",
    userId: "local",
    address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    label: "Satoshi Genesis Vault",
    category: "WHALE",
    riskScore: 12,
    notes: "Original Bitcoin genesis block address. High historical interest.",
    pinnedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    balanceBtc: 50.0,
    txCount: 4210,
    lastActive: "Recent Micro-Dust",
  },
  {
    id: "WW-SEED-2",
    userId: "local",
    address: "1FzWLWTHRiYsK2Au8Yh55TVxK9YoVmqLF3",
    label: "Darknet Mixer Aggregator Cluster",
    category: "MIXER",
    riskScore: 94,
    notes: "Repeated peel-chain outputs and unhosted liquidity pool hops.",
    pinnedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    balanceBtc: 34.82,
    txCount: 187,
    lastActive: "14 mins ago",
  },
  {
    id: "WW-SEED-3",
    userId: "local",
    address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo",
    label: "Binance Cold Storage Top Tier",
    category: "EXCHANGE",
    riskScore: 28,
    notes: "Institutional omnibus reserve wallet. High throughput monitoring.",
    pinnedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    balanceBtc: 248590.12,
    txCount: 68412,
    lastActive: "1 min ago",
  },
  {
    id: "WW-SEED-4",
    userId: "local",
    address: "1Lbcfr7sAHTD9CpdQo3GQbXMZx9fTVupW1",
    label: "Mule Account (Flagged AML Pattern)",
    category: "SUSPECT",
    riskScore: 88,
    notes: "Sudden high-velocity dispersion following dormant period.",
    pinnedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    balanceBtc: 8.45,
    txCount: 43,
    lastActive: "2 hours ago",
  },
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  watchlist: WatchlistItem[];
  notes: InvestigationNote[];
  watchedWallets: WatchedWallet[];
  addToWatchlist: (item: Omit<WatchlistItem, "id" | "userId" | "addedAt">) => Promise<string>;
  removeFromWatchlist: (id: string) => Promise<void>;
  addNote: (note: Omit<InvestigationNote, "id" | "userId" | "userEmail" | "createdAt">) => Promise<string>;
  deleteNote: (id: string) => Promise<void>;
  isWatchlisted: (entityId: string) => boolean;
  addWatchedWalletItem: (wallet: Omit<WatchedWallet, "id" | "userId" | "pinnedAt">) => Promise<string>;
  removeWatchedWalletItem: (id: string) => Promise<void>;
  isWalletPinned: (address: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [notes, setNotes] = useState<InvestigationNote[]>([]);
  const [watchedWallets, setWatchedWallets] = useState<WatchedWallet[]>(() => {
    try {
      const saved = localStorage.getItem("bitflow_watched_wallets");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not read local watched wallets:", e);
    }
    return DEFAULT_WATCHED_WALLETS;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Watchlist for the current user
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }
    const unsub = subscribeWatchlist(user.uid, (items) => {
      setWatchlist(items);
    });
    return () => unsub();
  }, [user]);

  // Listen to Firestore Case Notes for the current user
  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }
    const unsub = subscribeInvestigationNotes(user.uid, (items) => {
      setNotes(items);
    });
    return () => unsub();
  }, [user]);

  // Listen to Firestore Watched Wallets for the current user
  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem("bitflow_watched_wallets");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWatchedWallets(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn(e);
      }
      setWatchedWallets(DEFAULT_WATCHED_WALLETS);
      return;
    }

    const unsub = subscribeWatchedWallets(user.uid, (items) => {
      if (items.length > 0) {
        setWatchedWallets(items);
      } else {
        setWatchedWallets(DEFAULT_WATCHED_WALLETS);
      }
    });
    return () => unsub();
  }, [user]);

  // Sync unauthenticated changes to localStorage
  useEffect(() => {
    if (!user && watchedWallets.length > 0) {
      try {
        localStorage.setItem("bitflow_watched_wallets", JSON.stringify(watchedWallets));
      } catch (e) {
        console.warn(e);
      }
    }
  }, [user, watchedWallets]);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      return await firebaseSignInWithGoogle();
    } catch (err: any) {
      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request" ||
        err?.code === "auth/popup-blocked" ||
        err?.message?.includes("auth/popup-closed-by-user") ||
        err?.message?.includes("popup-closed-by-user")
      ) {
        return null;
      }
      console.error("Authentication failed:", err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.error("Sign out failed:", err);
      throw err;
    }
  };

  const addToWatchlist = async (
    item: Omit<WatchlistItem, "id" | "userId" | "addedAt">
  ): Promise<string> => {
    if (!user) {
      throw new Error("Must be signed in with Google to add to Firestore Watchlist.");
    }
    return await addWatchlistItem({
      ...item,
      userId: user.uid,
      addedAt: new Date().toISOString(),
    });
  };

  const removeFromWatchlist = async (id: string): Promise<void> => {
    if (!user) return;
    await removeWatchlistItem(id);
  };

  const addNote = async (
    note: Omit<InvestigationNote, "id" | "userId" | "userEmail" | "createdAt">
  ): Promise<string> => {
    if (!user) {
      throw new Error("Must be signed in with Google to save investigation notes to Firestore.");
    }
    return await addInvestigationNote({
      ...note,
      userId: user.uid,
      userEmail: user.email || "",
      createdAt: new Date().toISOString(),
    });
  };

  const deleteNote = async (id: string): Promise<void> => {
    if (!user) return;
    await deleteInvestigationNote(id);
  };

  const isWatchlisted = (entityId: string): boolean => {
    return watchlist.some(
      (w) => w.entityId.toLowerCase() === entityId.toLowerCase()
    );
  };

  const addWatchedWalletItem = async (
    wallet: Omit<WatchedWallet, "id" | "userId" | "pinnedAt">
  ): Promise<string> => {
    const docId = `WW-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newWallet: WatchedWallet = {
      ...wallet,
      id: docId,
      userId: user ? user.uid : "local",
      pinnedAt: new Date().toISOString(),
    };

    if (user) {
      try {
        await addWatchedWallet({
          ...wallet,
          userId: user.uid,
          pinnedAt: newWallet.pinnedAt,
        });
      } catch (err) {
        console.error("Failed to add watched wallet to Firestore:", err);
      }
    }

    setWatchedWallets((prev) => [
      newWallet,
      ...prev.filter((w) => w.address.toLowerCase() !== wallet.address.toLowerCase()),
    ]);
    return docId;
  };

  const removeWatchedWalletItem = async (id: string): Promise<void> => {
    if (user) {
      try {
        await removeWatchedWallet(id);
      } catch (err) {
        console.error("Failed to remove watched wallet from Firestore:", err);
      }
    }
    setWatchedWallets((prev) => prev.filter((w) => w.id !== id));
  };

  const isWalletPinned = (address: string): boolean => {
    return watchedWallets.some(
      (w) => w.address.toLowerCase() === address.toLowerCase()
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
        watchlist,
        notes,
        watchedWallets,
        addToWatchlist,
        removeFromWatchlist,
        addNote,
        deleteNote,
        isWatchlisted,
        addWatchedWalletItem,
        removeWatchedWalletItem,
        isWalletPinned,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
