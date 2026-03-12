"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";

const shopId = "aa476288-225e-4df7-8e08-172b575179a0";

export default function ServicosPage() {

  const [services, setServices] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  async function loadServices() {

    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("shop_id", shopId);

    if (data) setServices(data);
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function createService() {

    if (!name || !price || !duration) {
      alert("Preencha todos os campos");
      return;
    }

    const { error } = await supabase
      .from("services")
      .insert({
        shop_id: shopId,
        name: name,
        price_cents: Number(price) * 100,
        duration_min: Number(duration),
        is_active: true
      });

    if (error) {
      console.log("Erro:", error);
      alert("Erro ao criar serviço");
      return;
    }

    setName("");
    setPrice("");
    setDuration("");

    loadServices();
  }

  async function deleteService(id: string) {

    await supabase
      .from("services")
      .delete()
      .eq("id", id);

    loadServices();
  }

  return (

    <AdminLayout>

      <h1 style={{ fontSize: 28, fontWeight: 900 }}>
        Serviços
      </h1>

      {/* Criar serviço */}

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 10,
          flexWrap: "wrap"
        }}
      >

        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Preço (R$)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Duração (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <button onClick={createService}>
          Criar
        </button>

      </div>

      {/* Lista */}

      <div style={{ marginTop: 30 }}>

        {services.map((s) => (

          <div
            key={s.id}
            style={{
              padding: 14,
              border: "1px solid #1d1d1d",
              borderRadius: 10,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between"
            }}
          >

            <div>

              <b>{s.name}</b>

              <div style={{ opacity: 0.6 }}>

                R$ {(s.price_cents / 100).toFixed(2)} • {s.duration_min} min

              </div>

            </div>

            <button
              onClick={() => deleteService(s.id)}
              style={{
                background: "#ff4444",
                border: "none",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 6
              }}
            >
              Excluir
            </button>

          </div>

        ))}

      </div>

    </AdminLayout>

  );
}