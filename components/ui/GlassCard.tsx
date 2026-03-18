export default function GlassCard({ children }: any) {

  return (
    <div
      style={{
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(10px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 20
      }}
    >
      {children}
    </div>
  );

}