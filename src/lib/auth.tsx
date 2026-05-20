"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createSupabaseBrowser } from "./supabase-browser";

export interface UserProfile {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loadingAuth: boolean;
  isEmailConfirmed: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
  saveProfile: (data: Omit<UserProfile, "id">) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const supabase = createSupabaseBrowser();

  const isEmailConfirmed = !!user?.email_confirmed_at;

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser ?? null);
      if (currentUser) fetchProfile(currentUser.id);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const saveProfile = useCallback(async (data: Omit<UserProfile, "id">) => {
    if (!user) return;
    await supabase.from("profiles").upsert({
      id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    });
    await fetchProfile(user.id);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, profile, loadingAuth, isEmailConfirmed,
      isAuthModalOpen, openAuthModal, closeAuthModal,
      logout, saveProfile, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
