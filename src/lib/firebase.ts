import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocFromServer,
} from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";

export const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Initialize Firestore with specific databaseId and long-polling auto-detection for proxy/sandboxed environments
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfigData.firestoreDatabaseId || "(default)"
);

// Standard Operation Types for Firestore Error Reporting
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot (mandated by Firebase skill)
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("the client is offline") ||
        error.message.includes("unavailable") ||
        error.message.includes("Could not reach Cloud Firestore backend"))
    ) {
      console.warn("Firestore client connection: operating in resilient offline/cached mode until backend is reached.");
    } else {
      console.warn("Firestore connection check:", error);
    }
  }
}
testConnection();

// Auth Helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync or create user profile in Firestore
    if (result.user) {
      await syncUserProfileToFirestore(result.user);
    }
    return result.user;
  } catch (error: any) {
    if (
      error?.code === "auth/popup-closed-by-user" ||
      error?.code === "auth/cancelled-popup-request" ||
      error?.code === "auth/popup-blocked" ||
      error?.message?.includes("auth/popup-closed-by-user") ||
      error?.message?.includes("popup-closed-by-user")
    ) {
      // User closed or dismissed the sign-in popup without completing authentication
      return null;
    }
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
}

// User Profile Firestore Synchronization
export interface FirestoreUserProfile {
  uid: string;
  fullName: string;
  email: string;
  photoURL: string;
  employeeId?: string;
  role?: string;
  department?: string;
  lastLoginAt: string;
  createdAt: string;
}

export async function syncUserProfileToFirestore(user: User): Promise<void> {
  if (!user || !user.uid) return;
  const userRef = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();
    if (!snap.exists()) {
      const newProfile: FirestoreUserProfile = {
        uid: user.uid,
        fullName: user.displayName || "SOC Investigator",
        email: user.email || "",
        photoURL: user.photoURL || "",
        employeeId: "EMP-SOC-" + user.uid.substring(0, 5).toUpperCase(),
        role: "AML & Forensic Intelligence Analyst",
        department: "Cybercrime Financial Investigation Taskforce",
        lastLoginAt: now,
        createdAt: now,
      };
      await setDoc(userRef, newProfile);
    } else {
      await setDoc(
        userRef,
        {
          lastLoginAt: now,
          fullName: user.displayName || snap.data()?.fullName || "SOC Investigator",
          photoURL: user.photoURL || snap.data()?.photoURL || "",
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error("Failed to sync user profile to Firestore:", err);
  }
}

// Watchlist Item Model
export interface WatchlistItem {
  id: string;
  userId: string;
  entityId: string;
  entityName: string;
  category: string;
  reason: string;
  flaggedBtcAmount: number;
  addedAt: string;
}

// Watchlist Operations
export function subscribeWatchlist(
  userId: string,
  onUpdate: (items: WatchlistItem[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }
  const q = query(collection(db, "watchlistItems"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: WatchlistItem[] = [];
      snapshot.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as WatchlistItem);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
      onUpdate(items);
    },
    (err) => {
      console.error("Firestore Watchlist subscription error:", err);
      if (onError) onError(err);
    }
  );
}

export async function addWatchlistItem(item: Omit<WatchlistItem, "id">): Promise<string> {
  const docId = `WL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const itemRef = doc(db, "watchlistItems", docId);
  const data: WatchlistItem = {
    ...item,
    id: docId,
    addedAt: item.addedAt || new Date().toISOString(),
  };
  try {
    await setDoc(itemRef, data);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `watchlistItems/${docId}`);
  }
}

export async function removeWatchlistItem(docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "watchlistItems", docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `watchlistItems/${docId}`);
  }
}

// Investigation Case Notes Model
export interface InvestigationNote {
  id: string;
  userId: string;
  userEmail: string;
  targetAccount: string;
  targetName: string;
  classification: "SCAMMER" | "GENUINE" | "UNDER_REVIEW";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  findings: string;
  evidenceUrls?: string;
  createdAt: string;
  updatedAt?: string;
}

// Investigation Case Notes Operations
export function subscribeInvestigationNotes(
  userId: string,
  onUpdate: (notes: InvestigationNote[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }
  const q = query(collection(db, "investigationNotes"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const notes: InvestigationNote[] = [];
      snapshot.forEach((d) => {
        notes.push({ id: d.id, ...d.data() } as InvestigationNote);
      });
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(notes);
    },
    (err) => {
      console.error("Firestore Investigation Notes subscription error:", err);
      if (onError) onError(err);
    }
  );
}

export async function addInvestigationNote(note: Omit<InvestigationNote, "id">): Promise<string> {
  const noteId = `NOTE-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const noteRef = doc(db, "investigationNotes", noteId);
  const data: InvestigationNote = {
    ...note,
    id: noteId,
    createdAt: note.createdAt || new Date().toISOString(),
  };
  try {
    await setDoc(noteRef, data);
    return noteId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `investigationNotes/${noteId}`);
  }
}

export async function deleteInvestigationNote(noteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "investigationNotes", noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `investigationNotes/${noteId}`);
  }
}

// Watched Wallets Model for Quick Dashboard Surveillance
export interface WatchedWallet {
  id: string;
  userId: string;
  address: string;
  label: string;
  category: "SUSPECT" | "EXCHANGE" | "WHALE" | "MIXER" | "GENUINE" | "CUSTOM";
  riskScore: number;
  notes?: string;
  pinnedAt: string;
  balanceBtc?: number;
  txCount?: number;
  lastActive?: string;
}

export function subscribeWatchedWallets(
  userId: string,
  onUpdate: (wallets: WatchedWallet[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }
  const q = query(collection(db, "watchedWallets"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const wallets: WatchedWallet[] = [];
      snapshot.forEach((d) => {
        wallets.push({ id: d.id, ...d.data() } as WatchedWallet);
      });
      wallets.sort((a, b) => new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime());
      onUpdate(wallets);
    },
    (err) => {
      console.error("Firestore Watched Wallets subscription error:", err);
      if (onError) onError(err);
    }
  );
}

export async function addWatchedWallet(wallet: Omit<WatchedWallet, "id">): Promise<string> {
  const docId = `WW-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const walletRef = doc(db, "watchedWallets", docId);
  const data: WatchedWallet = {
    ...wallet,
    id: docId,
    pinnedAt: wallet.pinnedAt || new Date().toISOString(),
  };
  try {
    await setDoc(walletRef, data);
    return docId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `watchedWallets/${docId}`);
  }
}

export async function removeWatchedWallet(docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "watchedWallets", docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `watchedWallets/${docId}`);
  }
}
