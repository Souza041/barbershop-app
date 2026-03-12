export default function ServiceCard({ service, selected, onClick }: any) {

  return (

    <div
      onClick={onClick}
      style={{
        padding: 18,
        borderRadius: 12,
        border: selected ? "2px solid #fff" : "1px solid #333",
        background: "#111",
        cursor: "pointer",
        transition: "0.2s"
      }}
    >

      <div style={{ fontSize: 18, fontWeight: 700 }}>
        {service.name}
      </div>

      <div style={{ opacity: 0.7 }}>
        {service.duration_min} min
      </div>

      <div style={{ marginTop: 4 }}>
        R$ {(service.price_cents / 100).toFixed(2)}
      </div>

    </div>

  );

}