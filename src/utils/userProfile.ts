export interface UserProfile {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  organizationalRole: string;
  department: string;
  clearanceLevel: string;
  workstationId: string;
  badgeRef: string;
  jurisdiction: string;
  dutyShift: string;
  lastUpdated: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  employeeId: "EMP-SOC-2026-007",
  fullName: "Shanmukh Vardha",
  email: "shanmukhvardha123@gmail.com",
  phone: "+91 98450 12345",
  organizationalRole: "Lead SOC & AML Forensics Investigator",
  department: "Financial Intelligence & Cyber Defense Division",
  clearanceLevel: "Level 3 - Top Secret (Autonomous Syndicate Freeze Authority)",
  workstationId: "WS-HYD-SOC-NODE-01",
  badgeRef: "BADGE-2026-ALPHA-88",
  jurisdiction: "FIU-IND / FATF Global Standards (IN/SG/AE)",
  dutyShift: "24/7 Global Surveillance (Shift Alpha)",
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY = "bitflow_user_profile_session";

export function loadUserProfile(): UserProfile {
  try {
    // Check sessionStorage first, then localStorage
    const sessionData = sessionStorage.getItem(STORAGE_KEY);
    if (sessionData) {
      return { ...DEFAULT_USER_PROFILE, ...JSON.parse(sessionData) };
    }
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      return { ...DEFAULT_USER_PROFILE, ...JSON.parse(localData) };
    }
  } catch (err) {
    console.error("Failed to load user profile from storage:", err);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    const updated = {
      ...profile,
      lastUpdated: new Date().toISOString(),
    };
    const serialized = JSON.stringify(updated);
    sessionStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_KEY, serialized);

    // Dispatch a custom event so other components (e.g. Header) update reactively
    window.dispatchEvent(new CustomEvent("user-profile-updated", { detail: updated }));
  } catch (err) {
    console.error("Failed to persist user profile:", err);
  }
}
