"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import AuthButton from "@/components/AuthButton";

type Item = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  barbers: { display_name: string } | null;
  services: { name: string; price_cents: number } | null;
};

function toBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MyAppointmentsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [homeHref, setHomeHref] = useState("/");
  
  async function load() {
    setLoading(true);
    setMsg("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = `/login?next=/meus-agendamentos`;
      return;
    }

    const { data, error } = await supabase
      .from("appointments")
      .select("id,start_at,end_at,status, barbers(display_name), services(name,price_cents)")
      .order("start_at", { ascending: true });

    if (error) {
      console.error(error);
      setMsg(`Erro ao carregar: ${error.message}`);
      setItems([]);
    } else {
      setItems((data ?? []) as Item[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const last = localStorage.getItem("last_shop_slug");
    if (last) setHomeHref(`/${last}`);
  }, []);

  async function cancel(id: string) {
    setMsg("");

    // usa RPC com regra de 2h (se você rodou o SQL)
    const { error } = await supabase.rpc("cancel_my_appointment", { _id: id });

    if (error) {
      console.error(error);
      setMsg(error.message);
      return;
    }

    setMsg("✅ Cancelado com sucesso.");
    await load();
  }

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;

  return (
    <div style={{ padding: 16, maxWidth: 760, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Meus agendamentos</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>Acompanhe e cancele seus horários.</p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <AuthButton nextPath="/meus-agendamentos" />
          <Link href={homeHref} style={{ textDecoration: "none" }}>
            ← Home
          </Link>
        </div>
      </header>

      {msg ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {items.length === 0 ? (
          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
            Você ainda não tem agendamentos.
          </div>
        ) : (
          items.map((a) => {
            const start = new Date(a.start_at);
            const end = new Date(a.end_at);
            const canCancel = a.status === "confirmed";

            return (
              <div key={a.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div><b>Serviço:</b> {a.services?.name ?? "-"}</div>
                    <div><b>Barbeiro:</b> {a.barbers?.display_name ?? "-"}</div>
                    <div>
                      <b>Quando:</b> {start.toLocaleString()} até {end.toLocaleTimeString()}
                    </div>
                    <div><b>Valor:</b> {a.services ? toBRL(a.services.price_cents) : "-"}</div>
                    <div><b>Status:</b> {a.status}</div>
                  </div>

                  {canCancel ? (
                    <button
                      onClick={() => cancel(a.id)}
                      style={{
                        height: 40,
                        padding: "0 12px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        cursor: "pointer",
                        alignSelf: "start",
                      }}
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}