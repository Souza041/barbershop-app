"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";
import AuthButton from "../components/AuthButton";

type Row = {
  id: string;
  points: number;
  reason: string;
  created_at: string;
};

export default function MyPointsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [homeHref, setHomeHref] = useState("/");

  useEffect(() => {
    const last = localStorage.getItem("last_shop_slug");
    if (last) setHomeHref(`/${last}`);
  }, []);

  const balance = useMemo(() => rows.reduce((acc, r) => acc + r.points, 0), [rows]);

  async function load() {
    setLoading(true);
    setMsg("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = `/login?next=/meus-pontos`;
      return;
    }

    const { data, error } = await supabase
      .from("loyalty_ledger")
      .select("id,points,reason,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMsg(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as Row[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;

  return (
    <div style={{ padding: 16, maxWidth: 760, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Meus pontos</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Saldo atual: <b>{balance}</b> pontos
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AuthButton nextPath="/meus-pontos" />
          <Link href={homeHref} style={{ textDecoration: "none" }}>← Home</Link>
        </div>
      </header>

      {msg ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {rows.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
            Sem pontos ainda. Finalize um serviço pra ganhar.
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div><b>{r.points > 0 ? `+${r.points}` : r.points}</b> pontos</div>
                  <div style={{ opacity: 0.8 }}>{r.reason}</div>
                </div>
                <div style={{ opacity: 0.8 }}>
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}