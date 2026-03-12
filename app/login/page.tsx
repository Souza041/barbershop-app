"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const sp = useSearchParams();
  const [sending, setSending] = useState(false);
  const [rateHits, setRateHits] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function sendMagicLink() {
    if (!email) return setMsg("Digite seu e-mail.");
    if (sending) return;
    if (cooldown > 0) return setMsg(`Aguarde ${cooldown}s para tentar de novo.`);

    setSending(true);
    setMsg("");

    const next = new URLSearchParams(window.location.search).get("next") ?? "/";
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {emailRedirectTo},
    });

    if (error) {
      const isRate = String(error.message).toLowerCase().includes("rate");
      if (isRate) {
        const hits = rateHits + 1;
        setRateHits(hits);

        const backoff = hits === 1 ? 60 : hits === 2 ? 120 : 300; // 1m, 2m, 5m
        setCooldown(backoff);

        setMsg(`Você pediu muitos links. Aguarde alguns minutos e tente novamente.`);
      } else {
        setMsg(`Erro: ${error.message}`);
        setCooldown(20); // evita spam por erro comum
      }

      setSending(false);
      return;
    }

    setRateHits(0);
    setCooldown(60);
    setMsg("✅ Link enviado! Verifique seu e-mail.");
    setSending(false);
  }

  return (
    <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
      <h1>Entrar</h1>
      <p style={{ opacity: 0.8 }}>
        Vamos enviar um link mágico pro seu e-mail. Sem senha.
      </p>

      <label><b>E-mail</b></label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@dominio.com"
        style={{ width: "100%", height: 44, marginTop: 6 }}
      />

      <button
        onClick={sendMagicLink}
        disabled={sending || cooldown > 0}
        style={{
          marginTop: 12,
          width: "100%",
          height: 46,
          borderRadius: 10,
          border: "1px solid #ddd",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {sending ? "Enviando..." : cooldown > 0 ? `Aguarde ${cooldown}s` : "Enviar link"}
      </button>

      {msg ? (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          ← Voltar
        </Link>
      </div>
    </div>
  );
}