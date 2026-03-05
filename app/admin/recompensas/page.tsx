"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase/client";
import AuthButton from "../../components/AuthButton";

type Shop = { id: string; slug: string; name: string };

type Reward = {
  id: string;
  title: string;
  description: string | null;
  cost_points: number;
  is_active: boolean;
};

type Redemption = {
  id: string;
  status: string;
  created_at: string;
  reward_title: string;
  reward_cost: number;
  customer_id: string;
};

export default function AdminRewardsPage() {
  const [shop, setShop] = useState<Shop | null>(null);

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [costPoints, setCostPoints] = useState(10);
  const [isActive, setIsActive] = useState(true);

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

  async function load() {
    setLoading(true);
    setMsg("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = `/login?next=/admin/recompensas`;
      return;
    }

    const s = await loadShopFromLastSlug();
    if (!s) {
      setMsg("Visite uma barbearia (/[slug]) primeiro para definir a loja atual.");
      setLoading(false);
      return;
    }
    setShop(s);

    const [{ data: rData, error: rErr }, { data: dData, error: dErr }] = await Promise.all([
      supabase.rpc("admin_list_rewards", { _shop_id: s.id }),
      supabase.rpc("admin_list_redemptions", { _shop_id: s.id }),
    ]);

    if (rErr) {
      console.error(rErr);
      setMsg(rErr.message);
      setRewards([]);
    } else setRewards((rData ?? []) as Reward[]);

    if (dErr) {
      console.error(dErr);
      setMsg((prev) => prev || dErr.message);
      setRedemptions([]);
    } else setRedemptions((dData ?? []) as Redemption[]);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCostPoints(10);
    setIsActive(true);
  }

  function startEdit(r: Reward) {
    setEditingId(r.id);
    setTitle(r.title);
    setDescription(r.description ?? "");
    setCostPoints(r.cost_points);
    setIsActive(r.is_active);
  }

  async function saveReward() {
    setMsg("");
    if (!shop) return;

    if (!title.trim()) return setMsg("Título é obrigatório.");
    if (costPoints <= 0) return setMsg("Custo em pontos deve ser > 0.");

    const { data, error } = await supabase.rpc("admin_upsert_reward", {
      _shop_id: shop.id,
      _id: editingId,
      _title: title.trim(),
      _description: description.trim() || null,
      _cost_points: costPoints,
      _is_active: isActive,
    });

    if (error) {
      console.error(error);
      setMsg(error.message);
      return;
    }

    setMsg(`✅ Salvo! ID: ${data}`);
    await load();
    startCreate();
  }

  async function setRedemptionStatus(id: string, status: string) {
    setMsg("");

    const { error } = await supabase.rpc("admin_set_redemption_status", {
      _redemption_id: id,
      _status: status,
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
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin • Recompensas</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>{shop ? shop.name : ""}</p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AuthButton nextPath="/admin/recompensas" />
          <Link href="/admin" style={{ textDecoration: "none" }}>
            ← Admin
          </Link>
        </div>
      </header>

      {msg ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          {msg}
        </div>
      ) : null}

      {/* Form */}
      <div style={{ marginTop: 14, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{editingId ? "Editar recompensa" : "Nova recompensa"}</h2>
          <button
            type="button"
            onClick={startCreate}
            style={{ height: 36, padding: "0 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
          >
            Limpar
          </button>
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div>
            <label><b>Título</b></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", height: 42, marginTop: 6 }} />
          </div>

          <div>
            <label><b>Descrição</b></label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", height: 42, marginTop: 6 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label><b>Custo (pontos)</b></label>
              <input
                type="number"
                value={costPoints}
                onChange={(e) => setCostPoints(Number(e.target.value))}
                style={{ width: "100%", height: 42, marginTop: 6 }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
              <input
                id="active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <label htmlFor="active"><b>Ativo</b></label>
            </div>
          </div>

          <button
            type="button"
            onClick={saveReward}
            style={{ height: 44, borderRadius: 10, border: "1px solid #ddd", cursor: "pointer", fontWeight: 700 }}
          >
            Salvar recompensa
          </button>
        </div>
      </div>

      {/* Rewards list */}
      <div style={{ marginTop: 14 }}>
        <h2>Recompensas</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {rewards.length === 0 ? (
            <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
              Nenhuma recompensa cadastrada.
            </div>
          ) : (
            rewards.map((r) => (
              <div key={r.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{r.title}</div>
                    <div style={{ opacity: 0.8 }}>{r.description ?? ""}</div>
                    <div style={{ marginTop: 6 }}>
                      Custo: <b>{r.cost_points}</b> • Ativo: <b>{String(r.is_active)}</b>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => startEdit(r)}
                    style={{ height: 38, padding: "0 12px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Redemptions */}
      <div style={{ marginTop: 18 }}>
        <h2>Pedidos de resgate</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {redemptions.length === 0 ? (
            <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
              Nenhum pedido ainda.
            </div>
          ) : (
            redemptions.map((d) => (
              <div key={d.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{d.reward_title}</div>
                    <div style={{ opacity: 0.8 }}>
                      {d.reward_cost} pts • {new Date(d.created_at).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      Status: <b>{d.status}</b>
                    </div>
                    <div style={{ marginTop: 6, opacity: 0.8 }}>
                      Cliente: {d.customer_id}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
                    <button
                      type="button"
                      onClick={() => setRedemptionStatus(d.id, "approved")}
                      style={{ height: 38, padding: "0 10px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                    >
                      Aprovar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRedemptionStatus(d.id, "rejected")}
                      style={{ height: 38, padding: "0 10px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                    >
                      Rejeitar
                    </button>
                    <button
                      type="button"
                      onClick={() => setRedemptionStatus(d.id, "fulfilled")}
                      style={{ height: 38, padding: "0 10px", borderRadius: 10, border: "1px solid #ddd", cursor: "pointer" }}
                    >
                      Entregue
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}