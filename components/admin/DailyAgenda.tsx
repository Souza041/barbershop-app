type Appointment = {
  id: string
  start_at: string
  barber_name: string
  service_name: string
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function DailyAgenda({ appointments }: { appointments: Appointment[] }) {

  return (

    <div
      style={{
        border: "1px solid #333",
        borderRadius: 12,
        padding: 16,
        background: "#0f0f0f"
      }}
    >

      <h2 style={{ fontSize: 18, marginBottom: 12 }}>
        Agenda de Hoje
      </h2>

      {appointments.length === 0 && (
        <p style={{ opacity: .6 }}>
          Nenhum agendamento hoje
        </p>
      )}

      <div style={{ display: "grid", gap: 10 }}>

        {appointments.map((a) => (

          <div
            key={a.id}
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr 1fr",
              padding: 10,
              borderRadius: 8,
              background: "#161616"
            }}
          >

            <b>{formatTime(a.start_at)}</b>

            <span>{a.barber_name}</span>

            <span style={{ opacity: .8 }}>
              {a.service_name}
            </span>

          </div>

        ))}

      </div>

    </div>

  );
}