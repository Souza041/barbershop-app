import { toBRL } from "@/lib/format";

export default function Stats({
  services,
  barbers,
  minServicePrice,
  avgDuration,
  todayInfo
}: any) {

  return (
    <div style={{ padding: 16 }}>

      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10
        }}
      >

        <Stat title="Serviços" value={services.length} />
        <Stat title="Barbeiros" value={barbers.length} />
        <Stat title="Preço mínimo" value={minServicePrice ? toBRL(minServicePrice) : "—"} />
        <Stat title="Duração média" value={avgDuration ?? "—"} />
        <Stat title="Hoje" value={todayInfo?.label ?? "Hoje"} />

      </div>

    </div>
  );
}

function Stat({ title, value }: any) {

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        border: "1px solid #1d1d1d",
        background: "#0f0f0f"
      }}
    >
      <div style={{ opacity: 0.7 }}>
        {title}
      </div>

      <div style={{ fontWeight: 900, fontSize: 18 }}>
        {value}
      </div>

    </div>
  );
}