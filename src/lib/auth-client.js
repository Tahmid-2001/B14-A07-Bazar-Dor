'use client';
import { useState, useEffect } from "react";
import { createAuthClient } from "better-auth/react";

export const betterAuthClient = createAuthClient();

const SESSION_KEY = "bazardor_session_user";
const USERS_KEY = "bazardor_registered_users";

const notifyAuthChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("bazardor-auth-change"));
  }
};

export const authClient = {
  useSession: () => {
    const [session, setSession] = useState(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
      const loadSession = () => {
        try {
          const saved = localStorage.getItem(SESSION_KEY);
          setSession(saved ? { user: JSON.parse(saved) } : null);
        } catch (err) {
          setSession(null);
        }
        setIsPending(false);
      };

      loadSession();
      window.addEventListener("bazardor-auth-change", loadSession);
      window.addEventListener("storage", loadSession);
      return () => {
        window.removeEventListener("bazardor-auth-change", loadSession);
        window.removeEventListener("storage", loadSession);
      };
    }, []);

    return { data: session, isPending };
  },

  signUp: {
    email: async ({ name, email, password }) => {
      if (!name || !email || !password) {
        return { error: { message: "সবগুলো ঘর পূরণ করুন" } };
      }
      if (password.length < 8) {
        return { error: { message: "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে" } };
      }

      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { error: { message: "এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে" } };
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=008236&color=fff`,
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return { data: { user: newUser }, error: null };
    },
  },

  signIn: {
    email: async ({ email, password }) => {
      if (!email || !password) {
        return { error: { message: "ইমেইল এবং পাসওয়ার্ড দিন" } };
      }

      const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!found) {
        return { error: { message: "ভুল ইমেইল অথবা পাসওয়ার্ড!" } };
      }

      const sessionUser = {
        id: found.id,
        name: found.name,
        email: found.email,
        image: found.image,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      notifyAuthChange();
      return { data: { user: sessionUser }, error: null };
    },

    social: async ({ provider }) => {
      const socialUser =
        provider === "google"
          ? {
              id: "google-user-1",
              name: "John Doe",
              email: "johndoe@gmail.com",
              image: "https://ui-avatars.com/api/?name=John+Doe&background=008236&color=fff",
            }
          : {
              id: "github-user-1",
              name: "John Doe",
              email: "johndoe.github@gmail.com",
              image: "https://ui-avatars.com/api/?name=John+Doe&background=24292e&color=fff",
            };

      localStorage.setItem(SESSION_KEY, JSON.stringify(socialUser));
      notifyAuthChange();
      return { data: { user: socialUser }, error: null };
    },
  },

  updateUser: async ({ name }) => {
    if (!name || !name.trim()) {
      return { error: { message: "সঠিক নাম লিখুন" } };
    }
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) {
      return { error: { message: "লগইন করা নেই" } };
    }

    const currentUser = JSON.parse(saved);
    const updatedUser = {
      ...currentUser,
      name: name.trim(),
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=008236&color=fff`,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const updatedUsers = users.map((u) =>
      u.email === currentUser.email ? { ...u, name: name.trim() } : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

    notifyAuthChange();
    return { data: { user: updatedUser }, error: null };
  },

  signOut: async () => {
    localStorage.removeItem(SESSION_KEY);
    notifyAuthChange();
    return { data: true, error: null };
  },
};