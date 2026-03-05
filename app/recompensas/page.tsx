"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase/client";
import AuthButton from "../components/AuthButton";

type Reward = {
  id: string;
  title: string;
  description: string | null;
  cost_points: number;
};

type LedgerRow = { points: number };

export default function RewardsPage() {
  const [homeHref, setHomeHref] = useState("/");
  const [shopId, setShopId] = useState<string | null>(null);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setMsg("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = `/login?next=/recompensas`;
      return;
    }

    const last = localStorage.getItem("last_shop_slug");
    if (last) setHomeHref(`/${last}`);

    if (!last) {
      setMsg("Visite uma barbearia (/[slug]) primeiro para carregar recompensas.");
      setLoading(false);
      return;
    }

    const { data: shopData, error: shopErr } = await supabase
      .from("shops")
      .select("id,slug")
      .eq("slug", last)
      .single();

    if (shopErr) {
      console.error(shopErr);
      setMsg(`Não encontrei a barbearia pelo slug: ${last}`);
      setLoading(false);
      return;
    }

    setShopId(shopData.id);

    // saldo
    const { data: led, error: ledErr } = await supabase
      .from("loyalty_ledger")
      .select("points");

    if (ledErr) console.error(ledErr);

    const sum = ((led ?? []) as LedgerRow[]).reduce((acc, r) => acc + (r.points ?? 0), 0);
    setBalance(sum);

    // recompensas ativas (select é público, RLS já filtra is_active)
    const { data: rData, error: rErr } = await supabase
      .from("rewards")
      .select("id,title,description,cost_points")
      .eq("shop_id", shopData.id)
      .eq("is_active", true)
      .order("cost_points", { ascending: true });

    if (rErr) {
      console.error(rErr);
      setMsg(rErr.message);
      setRewards([]);
    } else {
      setRewards((rData ?? []) as Reward[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function redeem(rewardId: string) {
    setMsg("");

    const { data, error } = await supabase.rpc("redeem_reward", {
      _reward_id: rewardId,
    });

    if (error) {
      console.error(error);
      setMsg(error.message);
      return;
    }

    setMsg(`✅ Pedido enviado! Código: ${data}`);
    await load();
  }

  const canSee = useMemo(() => !!shopId, [shopId]);

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;

  return (
    <div style={{ padding: 16, maxWidth: 760, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Recompensas</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Saldo: <b>{balance}</b> pontos
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AuthButton nextPath="/recompensas" />
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

      {!canSee ? null : (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {rewards.length === 0 ? (
            <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
              Sem recompensas cadastradas ainda.
            </div>
          ) : (
            rewards.map((r) => {
              const disabled = balance < r.cost_points;
              return (
                <div key={r.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{r.title}</div>
                      <div style={{ opacity: 0.8 }}>{r.description ?? ""}</div>
                      <div style={{ marginTop: 6 }}>
                        Custo: <b>{r.cost_points}</b> pts
                      </div>
                    </div>

                    <button
                      onClick={() => redeem(r.id)}
                      disabled={disabled}
                      style={{
                        height: 40,
                        padding: "0 12px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? 0.5 : 1,
                        fontWeight: 600,
                        alignSelf: "start",
                      }}
                      title={disabled ? "Saldo insuficiente" : "Pedir resgate"}
                    >
                      Resgatar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}