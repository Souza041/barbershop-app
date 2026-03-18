import AdminLayout from "@/components/admin/AdminLayout";
import RevenueChart from "@/components/admin/RevenueChart";
import ClientsList from "@/components/admin/ClientsList";
import TodaySchedule from "@/components/admin/TodaySchedule";
import { supabase } from "@/lib/supabase/client";
import DailyAgenda from "@/components/admin/DailyAgenda";
import CalendarAgenda from "@/components/admin/CalendarAgenda";

export default async function AdminPage() {

  const shopId = "aa476288-225e-4df7-8e08-172b575179a0";

  const { data } = await supabase
    .from("appointments")
    .select(`
      id,
      start_at,
      services(name),
      barbers(display_name)
    `)
    .eq("shop_id", shopId)
    .gte("start_at", new Date().toISOString().slice(0,10))
    .order("start_at", { ascending: true });

  const { data: barbers } = await supabase
      .from("barbers")
      .select("id, display_namem")
      .eq("shop_id", shopId)
      .eq("is_active", true)

  const appointments = (data ?? []).map((a:any) => ({
    id: a.id,
    start_at: a.start_at,
    barber_id: a.barbers?.id,
    barber_name: a.barbers?.display_name,
    service_name: a.services?.name
  }));

  const revenueData = [
    { day: "Seg", revenue: 300 },
    { day: "Ter", revenue: 450 },
    { day: "Qua", revenue: 500 },
    { day: "Qui", revenue: 650 },
    { day: "Sex", revenue: 900 },
    { day: "Sab", revenue: 1200 }
  ];

  const barberList = (barbers ?? []).map(b => ({
    id: b.id,
    name: b.display_name
  }))

  const clients = [
    { id: 1, name: "João", phone: "11999999999" },
    { id: 2, name: "Pedro", phone: "11988888888" }
  ];

  return (

    <AdminLayout>

      <p style={{ opacity: .6, marginTop: 4 }}>
        Painel da barbearia
      </p>

      <h1 style={{ fontSize: 32, fontWeight: 900 }}>
        Dashboard
      </h1>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16
        }}
      >

        <Card title="Agendamentos hoje" value={appointments.length} />
        <Card title="Faturamento hoje" value="R$540" />
        <Card title="Clientes atendidos" value="9" />

      </div>

      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20
        }}
      >

        <CalendarAgenda
          barbers={(barberList)} 
          appointments={appointments} 
        />

        <RevenueChart data={revenueData} />

        <TodaySchedule appointments={appointments} />

      </div>

      <div style={{ marginTop: 20 }}>
        <ClientsList clients={clients} />
      </div>

    </AdminLayout>

  );
}

function Card({ title, value }: any) {

  return (

    <div
      style={{
        padding: 20,
        borderRadius: 12,
        border: "1px solid #1d1d1d",
        background: "#0f0f0f"
      }}
    >

      <div style={{ opacity: 0.7 }}>
        {title}
      </div>

      <div style={{ fontSize: 26, fontWeight: 900 }}>
        {value}
      </div>

    </div>

  );
}