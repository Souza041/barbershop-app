"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";

const shopId = "aa476288-225e-4df7-8e08-172b575179a0";

export default function BarbeirosPage() {

  const [barbers, setBarbers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  async function loadBarbers() {

    const { data } = await supabase
      .from("barbers")
      .select("*")
      .eq("shop_id", shopId);

    if (data) setBarbers(data);
  }

  useEffect(() => {
    loadBarbers();
  }, []);

  async function createBarber() {

    if (!name) return;

    await supabase.from("barbers").insert({
      shop_id: shopId,
      display_name: name,
      bio: bio,
      is_active: true
    });

    setName("");
    setBio("");

    loadBarbers();
  }

  async function deleteBarber(id: string) {

    await supabase
      .from("barbers")
      .delete()
      .eq("id", id);

    loadBarbers();
  }

  return (

    <AdminLayout>

      <h1 style={{ fontSize: 28, fontWeight: 900 }}>
        Barbeiros
      </h1>

      {/* Criar barbeiro */}

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
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <button onClick={createBarber}>
          Criar
        </button>

      </div>

      {/* Lista */}

      <div style={{ marginTop: 30 }}>

        {barbers.map((b) => (

          <div
            key={b.id}
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

              <b>{b.display_name}</b>

              <div style={{ opacity: 0.6 }}>
                {b.bio}
              </div>

            </div>

            <button
              onClick={() => deleteBarber(b.id)}
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