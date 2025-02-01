import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as Browser from "expo-web-browser";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { api } from "./api";

import { getBaseUrl } from "./base-url";
import { deleteToken, setToken } from "./session-store";

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name?: string;
  } | null;
  isAuthenticated: boolean;
  signIn: (credentials: { 
    email?: string; 
    password?: string;
    provider?: string;
    token?: string;
  }) => Promise<void>;
  signOut: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      signIn: async (credentials) => {
        try {
          let response;
          
          if (credentials.provider === "google") {
            response = await api.post("/auth/google", {
              token: credentials.token,
            });
          } else {
            response = await api.post("/auth/signin", {
              email: credentials.email,
              password: credentials.password,
            });
          }

          const { token, user } = response.data;

          set({
            token,
            user,
            isAuthenticated: true,
          });

          router.replace("/");
        } catch (error) {
          console.error("Sign in error:", error);
          throw error;
        }
      },
      signOut: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
        router.replace("/auth/signin");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useAuth = () => {
  const { token, user, isAuthenticated, signIn, signOut } = useAuthStore();
  return { token, user, isAuthenticated, signIn, signOut };
};

export const signIn = async () => {
  const signInUrl = `${getBaseUrl()}/api/auth/signin`;
  const redirectTo = Linking.createURL("/login");
  const result = await Browser.openAuthSessionAsync(
    `${signInUrl}?expo-redirect=${encodeURIComponent(redirectTo)}`,
    redirectTo,
  );

  if (result.type !== "success") return false;
  const url = Linking.parse(result.url);
  const sessionToken = String(url.queryParams?.session_token);
  if (!sessionToken) throw new Error("No session token found");

  setToken(sessionToken);

  return true;
};

export const useUser = () => {
  const { data: session } = api.auth.getSession.useQuery();
  return session?.user ?? null;
};

export const useSignIn = () => {
  const utils = api.useUtils();
  const router = useRouter();

  return async () => {
    const success = await signIn();
    if (!success) return;

    await utils.invalidate();
    router.replace("/");
  };
};

export const useSignOut = () => {
  const utils = api.useUtils();
  const signOut = api.auth.signOut.useMutation();
  const router = useRouter();

  return async () => {
    const res = await signOut.mutateAsync();
    if (!res.success) return;
    await deleteToken();
    await utils.invalidate();
    router.replace("/");
  };
};
