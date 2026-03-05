"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";
import AuthButton from "../../components/AuthButton";
import { Rowdies } from "next/font/google";

type Shop = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
};

type Service = {
  id: string;
  name: string;
  duration_min: number;
  price_cents: number;
  is_active: boolean;
};

type Barber = {
  id: string;
  display_name: string;
  is_active: boolean;
};

function toBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function ShopPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayInfo, setTodayInfo] = useState<{ label: string; sub: string } | null>(null);
  const [gallery, setGallery] = useState<string[]>([]);

  async function loadTodayInfo(shopId: string) {
    try {
      const weekday = new Date().getDay();

      const { data: hoursData, error: hErr } = await supabase
        .from("barber_hours")
        .select("start_time,end_time,is_closed,barbers!inner(shop_id,is_active)")
        .eq("weekday", weekday)
        .eq("barbers.shop_id", shopId)
        .eq("barbers.is_active", true);
      
      if (hErr) {
        console.error("Hours query error:", hErr);
        setTodayInfo(null);
        return;
      }

      const latest = (hoursData ?? [])
        .map((r: any) => r.end_time as string)
        .sort()
        .at(-1);

      setTodayInfo({
        label: "Hoje",
        sub: latest ? `aberto até ${latest.slice(0, 5)}` : "consulte no agendar",
      });
    } catch (e) {
      console.error("Today info error:", e);
      setTodayInfo(null);
    }
  }

  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);

      // 1) Shop
      const { data: shopData, error: shopErr } = await supabase
        .from("shops")
        .select("id,name,slug,phone,address")
        .eq("slug", slug)
        .single();

      if (shopErr || !shopData) {
        console.error("Shop query error:", shopErr);
        setShop(null);
        setServices([]);
        setBarbers([]);
        setTodayInfo(null);
        setGallery([]);
        setLoading(false);
        return;
      }

      setShop(shopData);

      await loadTodayInfo(shopData.id);

      // 2) Services + Barbers
      const [{ data: svcData, error: svcErr }, { data: barbData, error: barbErr }] =
        await Promise.all([
          supabase
            .from("services")
            .select("id,name,duration_min,price_cents,is_active")
            .eq("shop_id", shopData.id)
            .eq("is_active", true)
            .order("price_cents", { ascending: true }),
          supabase
            .from("barbers")
            .select("id,display_name,is_active")
            .eq("shop_id", shopData.id)
            .eq("is_active", true)
            .order("display_name", { ascending: true }),
        ]);

      if (svcErr) console.error("Services query error:", svcErr);
      if (barbErr) console.error("Barbers query error:", barbErr);
      

      setServices((svcData ?? []) as Service[]);
      setBarbers((barbData ?? []) as Barber[]);

      // ✅ 4) Galeria (Supabase Storage)
      try {
        const { data: files, error: gErr} = await supabase.storage
          .from("shop-gallery")
          .list(shopData.id, { limit: 12, sortBy: { column: "name", oder: "asc"} });
        
        if (gErr) {
          console.error("Gallerry list error:", gErr);
          setGallery([]);
        } else {
          const urls = 
            (files ?? [])
              .filter((f) => f.name && !f.name.endsWith("/"))
              .map((f) => {
                const path = `${shopData.id}/${f.name}`;
                const {data} = supabase.storage.from("shop-gallery").getPublicUrl(path);
                return data.publicUrl;
              });
          
          setGallery(urls);
        }
      } catch (e) {
        console.error(e);
        setGallery([]);
      }

      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!shop?.id) return;

    const channel = supabase
      .channel("appointments-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: 'appointments',
          filter: `shop_id=eq.$shop.id`,
        },
        () => {
          // recarrega dados quando algo muda
          console.log("Realtime: appointments changed");
          loadShopData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shop?.id]);

  useEffect(() => {
    if (shop?.slug) localStorage.setItem("last_shop_slug", shop.slug);
  }, [shop?.slug]);

  const featuredServices = useMemo(() => services.slice(0, 3), [services]);
  const featuredBarbers = useMemo(() => barbers.slice(0, 3), [barbers]);

  // estatísticas “reais-ish”
  const minServicePrice = useMemo(() => {
    if (services.length === 0) return null;
    return services.reduce((min, s) => Math.min(min, s.price_cents), services[0].price_cents);
  }, [services]);

  const avgDuration = useMemo(() => {
    if (services.length === 0) return null;
    const sum = services.reduce((acc, s) => acc + (s.duration_min ?? 0), 0);
    return Math.round(sum / services.length);
  }, [services]);

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;
  if (!shop) return <div style={{ padding: 16 }}>Barbearia não encontrada.</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff" }}>
      {/* HERO */}
      <div
        style={{
          padding: "28px 16px",
          borderBottom: "1px solid #1d1d1d",
          background:
            "radial-gradient(1000px 400px at 20% -10%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(800px 300px at 90% 0%, rgba(255,255,255,0.06), transparent 55%)",
        }}
      >
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "grid", gap: 6, minWidth: 260 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    border: "1px solid #2a2a2a",
                    background: "#121212",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                  }}
                  title="Logo"
                >
                  💈
                </div>
                <div>
                  <h1 style={{ margin: 0, fontSize: 26, letterSpacing: -0.3 }}>{shop.name}</h1>
                  <div style={{ opacity: 0.75, fontSize: 14 }}>
                    {shop.address ?? "Endereço não informado"} • {shop.phone ?? "Telefone não informado"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                <Badge text="Agendamento online" />
                <Badge text="Pagamento na loja" />
                <Badge text="Pontos / fidelidade" />
              </div>

              <p style={{ margin: "14px 0 0", opacity: 0.85, lineHeight: 1.5, maxWidth: 560 }}>
                Corte, barba e combos — com barbeiros selecionados e horários disponíveis em poucos cliques.
              </p>
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <AuthButton nextPath={`/${shop.slug}`} />

              <LinkButton href="/meus-agendamentos" variant="ghost">
                Meus agendamentos
              </LinkButton>

              <LinkButton href={`/${shop.slug}/agendar`} variant="primary">
                Agendar agora
              </LinkButton>
            </div>
          </header>

          {/* STATS */}
          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10,
            }}
          >
            <Stat title="Serviços" value={String(services.length)} sub="ativos" />
            <Stat title="Barbeiros" value={String(barbers.length)} sub="disponíveis" />
            <Stat
              title="A partir de"
              value={minServicePrice !== null ? toBRL(minServicePrice) : "—"}
              sub="preço mínimo"
            />
            <Stat title="Duração média" value={avgDuration !== null ? `${avgDuration}min` : "—"} sub="(aprox.)" />
            <Stat
              title="Horários"
              value={todayInfo?.label ?? "Hoje"}
              sub={todayInfo?.sub ?? "consulte no agendar"}
            />
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div style={{ padding: "22px 16px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 18 }}>
          {/* SESSÃO 1 */}
          <Section title="Serviços em destaque" subtitle="Os mais procurados da casa.">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {featuredServices.length === 0 ? (
                <>
                  <Card title="Sem serviços cadastrados" meta="Cadastre em /admin para aparecer aqui." />
                  <Card title="—" meta="—" />
                  <Card title="—" meta="—" />
                </>
              ) : (
                featuredServices.map((s) => (
                  <Card
                    key={s.id}
                    title={s.name}
                    meta={`${s.duration_min}min • ${toBRL(s.price_cents)}`}
                  />
                ))
              )}
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <LinkButton href={`/${shop.slug}/agendar`} variant="outline">
                Ver horários e agendar →
              </LinkButton>

              <LinkButton href={`/${shop.slug}/agendar`} variant="ghost">
                Ver todos os serviços →
              </LinkButton>
            </div>
          </Section>

          {/* SESSÃO 2 */}
          <Section title="Barbeiros" subtitle="Escolha quem vai te atender.">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {featuredBarbers.length === 0 ? (
                <>
                  <PersonCard name="Sem barbeiros ativos" role="Ative em /admin para aparecer aqui." />
                  <PersonCard name="—" role="—" />
                  <PersonCard name="—" role="—" />
                </>
              ) : (
                featuredBarbers.map((b) => (
                  <PersonCard key={b.id} name={b.display_name} role="Disponível para agendar" />
                ))
              )}
            </div>
          </Section>

          {/* SESSÃO 3 */}
          <Section title="Galeria" subtitle="Alguns trabalhos recentes.">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {gallery.length === 0 ? (
                <>
                  <MediaBox />
                  <MediaBox />
                  <MediaBox />
                </>
              ) : (
                gallery.slice(0, 9).map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Foto da barbearia"
                    style={{
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                      borderRadius: 16,
                      border: "1px solid #1d1d1d",
                    }}
                  />
                ))
              )}
            </div>
            <div style={{ marginTop: 10, opacity: 0.7 }}>
              (Depois a gente pluga Supabase Storage e carrega fotos reais)
            </div>
          </Section>

          {/* FOOTER CTA */}
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid #1d1d1d",
              background: "#0f0f0f",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>Pronto pra garantir seu horário?</div>
              <div style={{ opacity: 0.75 }}>Leva menos de 1 minuto.</div>
            </div>
            <LinkButton href={`/${shop.slug}/agendar`} variant="primary">
              Agendar agora
            </LinkButton>
          </div>

          <div style={{ opacity: 0.5, fontSize: 12, paddingBottom: 14 }}>
            © {new Date().getFullYear()} {shop.name}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Helpers (fora do componente) ---------- */

function Badge({ text }: { text: string }) {
  return (
    <span
      style={{
        fontSize: 12,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #2a2a2a",
        background: "#121212",
        opacity: 0.9,
      }}
    >
      {text}
    </span>
  );
}

function Stat({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 14,
        border: "1px solid #1d1d1d",
        background: "#0f0f0f",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.7 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 900, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        padding: 16,
        borderRadius: 16,
        border: "1px solid #1d1d1d",
        background: "#0f0f0f",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
          <div style={{ opacity: 0.7, marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>{children}</div>
    </section>
  );
}

function Card({ title, meta }: { title: string; meta: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid #1d1d1d",
        background: "#121212",
      }}
    >
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ opacity: 0.75, marginTop: 6 }}>{meta}</div>
    </div>
  );
}

function PersonCard({ name, role }: { name: string; role: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        border: "1px solid #1d1d1d",
        background: "#121212",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          border: "1px solid #2a2a2a",
          background: "#0f0f0f",
          display: "grid",
          placeItems: "center",
          fontWeight: 900,
        }}
      >
        👤
      </div>
      <div>
        <div style={{ fontWeight: 900 }}>{name}</div>
        <div style={{ opacity: 0.7, fontSize: 13 }}>{role}</div>
      </div>
    </div>
  );
}

function MediaBox() {
  return (
    <div
      style={{
        height: 110,
        borderRadius: 16,
        border: "1px solid #1d1d1d",
        background: "linear-gradient(135deg, #151515, #0f0f0f)",
      }}
    />
  );
}

function LinkButton({
  href,
  children,
  variant = "outline",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
}) {
  const base: React.CSSProperties = {
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    fontWeight: 800,
    border: "1px solid #2a2a2a",
    background: "#121212",
    color: "#fff",
  };

  const stylesByVariant: Record<string, React.CSSProperties> = {
    primary: { background: "#ffffff", color: "#000", border: "1px solid #ffffff" },
    outline: { background: "transparent", color: "#fff" },
    ghost: { background: "transparent", color: "#fff", border: "1px solid transparent", opacity: 0.9 },
  };

  return (
    <Link href={href} style={{ ...base, ...(stylesByVariant[variant] ?? {}) }}>
      {children}
    </Link>
  );
}