"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase/client";
import AuthButton from "../../../components/AuthButton";
import ComboBox from "../../../components/ComboBox";

type Shop = {
  id: string;
  name: string;
  slug: string;
};

type Barber = {
  id: string;
  display_name: string;
};

type Service = {
  id: string;
  name: string;
  duration_min: number;
  price_cents: number;
};

type BarberHours = {
  weekday: number;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
  is_closed: boolean;
};

function toBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function makeSlots(startHour = 9, endHour = 19, stepMin = 30) {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      slots.push(`${pad2(h)}:${pad2(m)}`);
    }
  }
  return slots;
}

function overlaps(slotStart: Date, slotEnd: Date, busyStart: Date, busyEnd: Date) {
  // [start, end) overlap
  return slotStart < busyEnd && busyStart < slotEnd;
}

export default function SchedulePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [shop, setShop] = useState<Shop | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(""); // yyyy-mm-dd
  const [selectedTime, setSelectedTime] = useState(""); // hh:mm
  const [busy, setBusy] = useState<{ start_at: string; end_at: string }[]>([]);
  const [msg, setMsg] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [hours, setHours] = useState<BarberHours | null>(null);

  const startAtISO = useMemo(() => {
    if (!date || !selectedTime) return "";
    return new Date(`${date}T${selectedTime}:00`).toISOString();
  }, [date, selectedTime]);

  useEffect(() => {
    if (!slug) return;

    (async () => {
      setLoading(true);
      setMsg("");

      // 1) shop
      const { data: shopData, error: shopErr } = await supabase
        .from("shops")
        .select("id,name,slug")
        .eq("slug", slug)
        .single();

      if (shopErr) {
        console.error(shopErr);
        setShop(null);
        setLoading(false);
        return;
      }

      setShop(shopData);

      // 2) barbers + services
      const [{ data: bData, error: bErr }, { data: sData, error: sErr }] =
        await Promise.all([
          supabase
            .from("barbers")
            .select("id,display_name")
            .eq("shop_id", shopData.id)
            .eq("is_active", true),
          supabase
            .from("services")
            .select("id,name,duration_min,price_cents")
            .eq("shop_id", shopData.id)
            .eq("is_active", true),
        ]);

      if (bErr) console.error(bErr);
      if (sErr) console.error(sErr);

      setBarbers(bData ?? []);
      setServices(sData ?? []);
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!barberId || !date) {
      setHours(null);
      return;
    }

    const weekday = new Date(date + "T00:00:00").getDay(); // 0..6

    (async () => {
      const { data, error } = await supabase
        .from("barber_hours")
        .select("weekday,start_time,end_time,break_start,break_end,is_closed")
        .eq("barber_id", barberId)
        .eq("weekday", weekday)
        .single();

      if (error) {
        console.error(error);
        setHours(null);
        return;
      }

      setHours(data);
    })();
  }, [barberId, date]);

  function toMinutes(hhmm: string) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  useEffect(() => {
    if (shop?.slug) localStorage.setItem("last_shop_slug", shop.slug);
  }, [shop?.slug]);

  useEffect(() => {
  if (!barberId || !date) {
    setBusy([]);
    return;
  }

  (async () => {
    const { data, error } = await supabase.rpc("get_busy_slots", {
      _barber_id: barberId,
      _day: date, // date input já vem yyyy-mm-dd
    });

    if (error) {
      console.error(error);
      setBusy([]);
      return;
    }

    setBusy(data ?? []);
  })();
}, [barberId, date]);

useEffect(() => {
  setSelectedTime("");
}, [barberId, serviceId, date]);

  async function handleBook() {
    setMsg("");

    if (!slug) return;
    if (!barberId) return setMsg("Selecione um barbeiro.");
    if (!serviceId) return setMsg("Selecione um serviço.");
    if (!startAtISO) return setMsg("Escolha um horário.");

    // 🔐 checa login AQUI
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = `/login?next=/${slug}/agendar`;
      return;
    }

    await supabase.auth.updateUser({
      data: {
        name: customerName,
        phone: customerPhone,
      },
    });

    const { data, error } = await supabase.rpc("create_appointment", {
      _barber_id: barberId,
      _service_id: serviceId,
      _start_at: startAtISO,
    });

    if (error) {
      console.error(error);
      setMsg(`Erro ao agendar: ${error.message}`);
      return;
    }

    setMsg(`✅ Agendado com sucesso! ID: ${data}`);
  }

    const selectStyle: React.CSSProperties = {
      width: "100%",
      height: 44,
      marginTop: 6,
      borderRadius: 10,
      border: "1px solid #333",
      background: "#0f0f0f",
      color: "#fff",
    };

    const barberOptions = barbers.map((b) => ({
      value: b.id,
      label: b.display_name,
    }));

    const serviceOptions = services.map((s) => ({
      value: s.id,
      label: `${s.name} • ${s.duration_min}min • ${toBRL(s.price_cents)}`,
    }));

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;
  if (!shop) return <div style={{ padding: 16 }}>Barbearia não encontrada.</div>;

  return (
    <div style={{ padding: 16, maxWidth: 760, margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Agendar</h1>
          <p style={{ marginTop: 6, opacity: 0.8 }}>{shop.name}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <AuthButton nextPath={`/${shop.slug}/agendar`} />

          <Link 
            href="/meus-agendamentos" 
            style={{ 
              textDecoration: "none",
              border: "1px solid #ddd",
              padding: "0 14px",
              borderRadius: 10,
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              fontWeight: 600, 
            }}
          >
            Meus agendamentos
          </Link>
          
          <Link href={`/${shop.slug}`} style={{ textDecoration: "none" }}>
            ← Voltar
          </Link>
        </div>
      </header>

      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        <div>
          <ComboBox
            id="barber"
            label="Barbeiro"
            value={barberId}
            options={barberOptions}
            onChange={(v) => setBarberId(v)}
            placeholder="Selecione..."
            clearable
          />
          
        </div>

        <div>
          <ComboBox
            id="service"
            label="Serviço"
            value={serviceId}
            options={serviceOptions}
            onChange={(v) => setServiceId(v)}
            placeholder="Selecione..."
            clearable
          />
        
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label htmlFor="date">
              <b>Data</b>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", height: 44, marginTop: 6 }}
            />
          </div>

          <div>
            <label>
              <b>Horário</b>
            </label>

            {hours?.is_closed ? (
              <p style={{ marginTop: 8, opacity: 0.75}}>
                Esse barbeiro não atende nesse dia.
              </p>
            ) : null}

            {!barberId || !serviceId || !date ? (
              <p style={{ marginTop: 8, opacity: 0.75 }}>
                Selecione barbeiro, serviço e data para ver os horários disponíveis.
              </p>
            ) : (
              <div 
                style={{ 
                  marginTop: 10, 
                  display: "grid", 
                  gridTemplateColumns: "repeat(4, 1fr)", 
                  gap: 10 
                }}
              >
                {makeSlots(9, 19, 30).map((t) => {
                  const slotStart = new Date(`${date}T${t}:00`);
                  // duração do serviço
                  const svc = services.find((s) => s.id === serviceId);
                  const dur = svc?.duration_min ?? 30;

                  const slotEnd = new Date(slotStart.getTime() + dur * 60_000);

                  // BLOQUEIO POR EXPEDIENTE
                  if (!hours || hours.is_closed) return null;

                  const tMin = toMinutes(t);
                  const startMin = toMinutes(hours.start_time);
                  const endMin = toMinutes(hours.end_time);

                  // horário inicial do slot precisa estar dentro do expediente
                  if (tMin < startMin || tMin >= endMin) return null;

                  // pausa (se existir)
                  if (hours.break_start && hours.break_end) {
                    const bStart = toMinutes(hours.break_start);
                    const bEnd = toMinutes(hours.break_end);
                    if (tMin >= bStart && tMin < bEnd) return null;
                  }

                  const isBusy = busy.some((b) =>
                    overlaps(slotStart, slotEnd, new Date(b.start_at), new Date(b.end_at))
                  );

                  const selected = selectedTime === t;

                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={isBusy}
                      onClick={() => setSelectedTime(t)}
                      style={{
                        height: 44,
                        borderRadius: 10,
                        border: selected ? "1px solid #fff" : "1px solid #2a2a2a",
                        cursor: isBusy ? "not-allowed" : "pointer",
                        opacity: isBusy ? 0.35 : 1,
                        fontWeight: 700,
                        
                        background: selected ? "#ffffff" : "#121212",
                        color: selected ? "#000000" : "#ffffff",

                        transition: "all .15s ease",
                      }}
                      title={isBusy ? "Horário indisponível" : "Selecionar"}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <label>
            <b>Seu nome</b>
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ width: "100%", height: 44, marginTop: 6 }}
          />
        </div>

        <div>
          <label>
            <b>Telefone</b>
          </label>
          <input
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={{ width: "100%", height: 44, marginTop: 6 }}
          />
        </div>

        <button
          onClick={handleBook}
          style={{
            height: 46,
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Confirmar agendamento
        </button>

        {msg ? (
          <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 10 }}>
            {msg}
          </div>
        ) : null}
      </div>
    </div>
  );
}
