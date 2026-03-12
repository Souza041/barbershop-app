"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import PageContainer from "@/components/ui/PageContainer";
import BarberSelector from "./components/BarberSelector";
import ServiceSelector from "./components/ServiceSelector";
import TimeSelector from "./components/TimeSelector";
import CustomerForm from "./components/CustomerForm";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function SchedulePage() {

  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [shop, setShop] = useState<any>(null);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [barberId, setBarberId] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {

    if (!slug) return;

    (async () => {

      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .single();

      setShop(shopData);

      const { data: b } = await supabase
        .from("barbers")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("is_active", true);

      const { data: s } = await supabase
        .from("services")
        .select("*")
        .eq("shop_id", shopData.id)
        .eq("is_active", true);

      setBarbers(b ?? []);
      setServices(s ?? []);
      setLoading(false);

    })();

  }, [slug]);

  if (loading) return <div>Carregando...</div>;
  if (!shop) return <div>Barbearia não encontrada</div>;

  return (

    <PageContainer>

      <header
      
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap"
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800 }}>
            Agendar horário
          </h1>

          <p style={{ opacity: .7 }}>
            {shop.name}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

          <AuthButton nextPath={`/${shop.slug}/agendar`} />
          
          <Link
            href="/meus-agendamentos"
            style={{
              textDecoration: "none",
              border: "1px solid #fff",
              padding: "0 14px",
              borderRadius: 8,
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              fontWeight: 600
            }}
          >
            Meus agendamentos
          </Link>

          <Link
            href={`/${shop.slug}`}
            style={{ textDecoration: "none", opacity: .9 }}
          >
            ← Voltar
          </Link>

        </div>
      </header>
      <div style={{ marginTop: 20, display: "grid", gap: 20 }}>

        <BarberSelector
          barbers={barbers}
          barberId={barberId}
          setBarberId={setBarberId}
        />

        <ServiceSelector
          services={services}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
        />

        <TimeSelector
          barberId={barberId}
          service={selectedService}
          date={date}
          setDate={setDate}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        />

        <CustomerForm
          barberId={barberId}
          service={selectedService}
          date={date}
          selectedTime={selectedTime}
        />

      </div>

    </PageContainer>

  );
}