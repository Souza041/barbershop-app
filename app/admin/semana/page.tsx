"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import AuthButton from "@/components/AuthButton";
import AdminLayout from "@/components/admin/AdminLayout";
import GlassCard from "@/components/ui/GlassCard";

type Shop = { id: string; slug: string; name: string };

type Row = {
  day: string; // yyyy-mm-dd
  total_appointments: number;
  total_done: number;
  unique_customers: number;
  revenue_cents: number;
  points_generated: number;
};

function toBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Dom,1=Seg...
  const diff = (day === 0 ? -6 : 1) - day; // ajusta pra segunda
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function fmtDayLabel(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function WeeklyBarChart({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.revenue_cents || 0));

  return (
    <GlassCard>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>Faturamento por dia</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10, alignItems: "end" }}>
        {rows.map((r) => {
          const h = Math.round(((r.revenue_cents || 0) / max) * 120); // 0..120px
          return (
            <div key={r.day} style={{ display: "grid", gap: 6, justifyItems: "center" }}>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{toBRL(r.revenue_cents || 0)}</div>

              <div
                title={`${r.day} • ${toBRL(r.revenue_cents || 0)}`}
                style={{
                  width: "100%",
                  height: 130,
                  display: "flex",
                  alignItems: "end",
                  borderRadius: 10,
                  border: "1px solid #f0f0f0",
                  padding: 6,
                }}
              >
                <div
                  style={{
                    height: h,
                    width: "100%",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "#f7f7f7",
                  }}
                />
              </div>

              <div style={{ fontSize: 12, opacity: 0.8 }}>{fmtDayLabel(r.day)}</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", borderRadius: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}

export default function AdminWeekPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [weekStart, setWeekStart] = useState(() => {
    const monday = startOfWeekMonday(new Date());
    return monday.toISOString().slice(0, 10); // yyyy-mm-dd
  });

  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const homeHref = useMemo(() => {
    const last = typeof window !== "undefined" ? localStorage.getItem("last_shop_slug") : null;
    return last ? `/${last}` : "/";
  }, []);

  async function loadShopFromLastSlug() {
    const last = localStorage.getItem("last_shop_slug");
    if (!last) return null;

    const { data, error } = await supabase
      .from("shops")
      .select("id,slug,name")
      .eq("slug", last)
      .single();

    if (error) {
      console.error(error);
      return null;
    }
    return data as Shop;
  }

  const totals = useMemo(() => {
    const t = rows.reduce(
      (acc, r) => {
        acc.total_appointments += r.total_appointments || 0;
        acc.total_done += r.total_done || 0;
        acc.revenue_cents += r.revenue_cents || 0;
        acc.points_generated += r.points_generated || 0;
        return acc;
      },
      {
        total_appointments: 0,
        total_done: 0,
        revenue_cents: 0,
        points_generated: 0,
      }
    );
    return t;
  }, [rows]);

  async function load() {
    setLoading(true);
    setMsg("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = `/login?next=/admin/semana`;
      return;
    }

    const s = await loadShopFromLastSlug();
    if (!s) {
      setMsg("Não achei a barbearia (visite /[slug] primeiro).");
      setLoading(false);
      return;
    }
    setShop(s);

    const { data, error } = await supabase.rpc("admin_weekly_metrics", {
      _shop_id: s.id,
      _start_day: weekStart,
      _days: 7,
    });

    if (error) {
      console.error(error);
      setMsg(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;

  return (
    <AdminLayout>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0 }}>Admin • Semana</h1>
            <p style={{ marginTop: 6, opacity: 0.8 }}>{shop ? shop.name : ""}</p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <AuthButton nextPath="/admin/semana" />
            <Link href="/admin" style={{ textDecoration: "none" }}>← Admin</Link>
            <Link href={homeHref} style={{ textDecoration: "none" }}>Home</Link>
          </div>
        </header>

        <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
          <label>
            <b>Semana (segunda):</b>{" "}
            <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
          </label>

          <button
            onClick={load}
            style={{ height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
          >
            Recarregar
          </button>
        </div>

        {msg ? (
          <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
            {msg}
          </div>
        ) : null}

        <div style={{ marginTop: 16 }}>
          <WeeklyBarChart rows={rows} />
        </div>

        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <MetricCard label="Agendamentos (semana)" value={totals.total_appointments} />
          <MetricCard label="Concluídos (semana)" value={totals.total_done} />
          <MetricCard label="Faturamento (semana)" value={toBRL(totals.revenue_cents)} />
          <MetricCard label="Pontos gerados" value={totals.points_generated} />
        </div>

        <GlassCard>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Detalhe por dia</div>
          <div style={{ display: "grid", gap: 8 }}>
            {rows.map((r) => (
              <div key={r.day} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ opacity: 0.8 }}>{fmtDayLabel(r.day)}</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "end" }}>
                  <span><b>{r.total_appointments}</b> ag</span>
                  <span><b>{r.total_done}</b> done</span>
                  <span><b>{r.unique_customers}</b> clientes</span>
                  <span><b>{r.points_generated}</b> pts</span>
                  <span><b>{toBRL(r.revenue_cents)}</b></span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </AdminLayout>
  );
}