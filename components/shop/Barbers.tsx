export default function Barbers({ barbers }: any) {
  return (
    <section>
      <h2 style={{ fontSize: 22, fontWeight: 800 }}>Profissionais</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 14,
          marginTop: 12,
        }}
      >
        {barbers.map((b: any) => (
          <div
            key={b.id}
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid #1f1f1f",
              background: "#111",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#222",
                margin: "0 auto",
                marginBottom: 10,
              }}
            />

            <div style={{ fontWeight: 700 }}>{b.display_name}</div>

            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Barbeiro profissional
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}