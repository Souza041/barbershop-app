export default function ClientsList({ clients }: any) {

  return (

    <div
      style={{
        background: "#0f0f0f",
        border: "1px solid #1d1d1d",
        borderRadius: 12,
        padding: 20
      }}
    >

      <h3>Clientes recentes</h3>

      {clients.map((c: any) => (

        <div
          key={c.id}
          style={{
            padding: "10px 0",
            borderBottom: "1px solid #1d1d1d"
          }}
        >

          <b>{c.name}</b>

          <div style={{ opacity: 0.6 }}>
            {c.phone}
          </div>

        </div>

      ))}

    </div>

  );
}