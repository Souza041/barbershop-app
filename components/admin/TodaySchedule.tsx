export default function TodaySchedule({ appointments }: any) {

  return (

    <div
      style={{
        background: "#0f0f0f",
        border: "1px solid #1d1d1d",
        borderRadius: 12,
        padding: 20
      }}
    >

      <h3>Agenda de hoje</h3>

      {appointments.map((a: any) => (

        <div
          key={a.id}
          style={{
            padding: "10px 0",
            borderBottom: "1px solid #1d1d1d"
          }}
        >

          <b>{a.time}</b> — {a.service}

          <div style={{ opacity: 0.6 }}>
            {a.client}
          </div>

        </div>

      ))}

    </div>

  );
}