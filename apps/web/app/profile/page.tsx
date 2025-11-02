"use client";

import { useState, useEffect } from "react";
import { IUser } from "@/shared/types/user.interface";
import { apiFetch } from "@/api/api-fetch-client";

export default function UserProfile() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = await apiFetch<IUser>("/users/me", {
          method: "GET",
        });

        if (error) {
          throw new Error(error);
        }
        setUser(user);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  return <div>{JSON.stringify(user)}</div>;
}
