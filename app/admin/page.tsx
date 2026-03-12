import AdminLayout from "@/components/admin/AdminLayout";
import RevenueChart from "@/components/admin/RevenueChart";
import ClientsList from "@/components/admin/ClientsList";
import TodaySchedule from "@/components/admin/TodaySchedule";

export default function AdminPage() {

  const revenueData = [
    { day: "Seg", revenue: 300 },
    { day: "Ter", revenue: 450 },
    { day: "Qua", revenue: 500 },
    { day: "Qui", revenue: 650 },
    { day: "Sex", revenue: 900 },
    { day: "Sab", revenue: 1200 }
  ];

  const clients = [
    { id: 1, name: "João", phone: "11999999999" },
    { id: 2, name: "Pedro", phone: "11988888888" }
  ];

  const appointments = [
    { id: 1, time: "09:00", service: "Corte", client: "João" },
    { id: 2, time: "10:00", service: "Barba", client: "Pedro" }
  ];

  return (

    <AdminLayout>

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

        <Card title="Agendamentos hoje" value="12" />
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