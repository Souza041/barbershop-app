"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client"; // ajuste o path se necessário

export default function AuthButton({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.session?.user?.email ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();

    // força refresh de UI e evita ficar preso no estado
    const last = typeof window !== "undefined" ? localStorage.getItem("last_shop_slug") : null;
    window.location.href = last ? `/${last}` : "/";
  }

  if (loading) return null;

  if (!email) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(nextPath)}`}
        style={{
          border: "1px solid #ddd",
          padding: "10px 14px",
          borderRadius: 10,
          cursor: "pointer",
          height: 44,
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          fontWeight: 700,
          color: "#fff",
        }}
      >
        Entrar
      </Link>
    );
  }

  return (
    <button
      onClick={signOut}
      style={{
        border: "1px solid #ddd",
        padding: "10px 14px",
        borderRadius: 10,
        cursor: "pointer",
        height: 44,
        background: "transparent",
        color: "#fff",
        fontWeight: 700,
      }}
      title={email}
    >
      Sair
    </button>
  );
}