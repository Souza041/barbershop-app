import Link from "next/link";

export default function FooterCTA({ slug, shopName }: any) {

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        border: "1px solid #1d1d1d",
        background: "#0f0f0f",
        marginTop: 20
      }}
    >

      <div style={{ fontSize: 20, fontWeight: 900 }}>
        Pronto para agendar?
      </div>

      <div style={{ opacity: 0.7 }}>
        Garanta seu horário na {shopName}
      </div>

      <Link
        href={`/${slug}/agendar`}
        style={{
          marginTop: 14,
          display: "inline-block",
          padding: "10px 16px",
          borderRadius: 10,
          background: "#fff",
          color: "#000",
          fontWeight: 800,
          textDecoration: "none"
        }}
      >
        Agendar agora
      </Link>

    </div>
  );
}