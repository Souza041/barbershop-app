"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";
import AuthButton from "../components/AuthButton";
import type React from "react";

type Shop = { id: string; name: string; slug: string };
type Row = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  barber_name: string;
  service_name: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
};

type Metrics = {
  total_appointments: number;
  total_done: number;
  total_revenue_cents: number;
  unique_customers: number;
  points_generated: number;
};


export default function AdminPage() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const homeHref = useMemo(() => {
    const last = typeof window !== "undefined" ? localStorage.getItem("last_shop_slug") : null;
    return last ? `/${last}` : "/";
  }, []);

  async function loadShopFromLastSlug() {
    const last = localStorage.getItem("last_shop_slug");
    if (!last) return null;

    const { data, error } = await supabase
      .from("shops")
      .select("id,name,slug")
      .eq("slug", last)
      .single();

    if (error) {
      console.error(error);
      return null;
    }

    return data as Shop;
  }

  async function load() {
    setLoading(true);
    setMsg("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = `/login?next=/admin`;
      return;
    }

    const s = await loadShopFromLastSlug();
    if (!s) {
      setMsg("Não achei a barbearia (visite /[slug] primeiro).");
      setLoading(false);
      return;
    }
    setShop(s);

    const [{ data, error}, { data: mData, error: mErr}] = await Promise.all([
      supabase.rpc("admin_list_appointments", {_shop_id: s.id, _day: day}),
      supabase.rpc("admin_daily_metrics", {_shop_id: s.id, _day: day}),
    ]);

    if (mErr) {
      console.error(mErr);
    } else {
      setMetrics((mData?.[0] ?? null) as Metrics | null);
    }

    if (error) {
      console.error(error);
      setMsg(`Erro ao carregar agenda: ${error.message}`);
      setRows([]);
    } else {
      setRows((data ?? []) as Row[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  async function setStatus(id: string, status: string) {
    setMsg("");

    const { error } = await supabase.rpc("admin_set_appointment_status", {
      _appointment_id: id,
      _status: status,
    });

    if (error) {
      console.error(error);
      setMsg(error.message);
      return;
    }

    await load();
  }

  async function complete(id: string) {
    setMsg("");

    const { error } = await supabase.rpc("admin_complete_appointment", {
        _appointment_id: id,
    });

    if (error) {
        console.error(error);
        setMsg(error.message);
        return;
    }

    await load();
  }

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;

  return (
    <div style={{ padding: 16, maxWidth: 920, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            {shop ? `Agenda: ${shop.name}` : "Agenda"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AuthButton nextPath="/admin" />

          <Link href={homeHref} style={{ textDecoration: "none" }}>
            ← Voltar para a barbearia
          </Link>
        </div>
      </header>

      {metrics ? (
        <div
          style={{
            marginTop: 16,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
          }}
        >
          <MetricCard label="Agendamentos" value={metrics.total_appointments} />
          <MetricCard label="Concluídos" value={metrics.total_done} />
          <MetricCard label="Faturamento" value={toBRL(metrics.total_revenue_cents)} />
          <MetricCard label="Clientes únicos" value={metrics.unique_customers} />
          <MetricCard label="Pontos gerados" value={metrics.points_generated} />
        </div>
      ) : null}

      <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          <b>Dia:</b>{" "}
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
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

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {rows.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
            Sem agendamentos nesse dia.
          </div>
        ) : (
          rows.map((r) => {
            const start = new Date(r.start_at);
            const end = new Date(r.end_at);

            return (
              <div key={r.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div><b>{start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</b> –{" "}
                      {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div><b>Barbeiro:</b> {r.barber_name}</div>
                    <div><b>Serviço:</b> {r.service_name}</div>
                    <div style ={{ marginTop: 6, opacity: 0.9}}>
                      <div><b>Cliente:</b> {r.customer_name ?? "-"}</div>
                      <div><b>Email:</b> {r.customer_email ?? "-"}</div>
                      <div><b>Telefone:</b> {r.customer_phone ?? "-"}</div>
                    </div>
                    <div style={{ marginTop: 4}}><b>Status:</b> {r.status}</div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                    <button
                      onClick={() => complete(r.id)}
                      style={{ height: 38, padding: "0 10px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                    >
                      Done (+pontos)
                    </button>
                    <button
                      onClick={() => setStatus(r.id, "cancelled")}
                      style={{ height: 38, padding: "0 10px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 12,
        background: "#fff",
        color: "#000"
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>
        {value}
      </div>
    </div>
  );
}

function toBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}