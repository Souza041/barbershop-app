import Link from "next/link";

export default function AdminLayout({ children }: any) {

  return (

    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundImage: "url('/barber-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative"
      }}
    >

      {/* OVERLAY ESCURO */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.95))",
          backdropFilter: "blur(3px)"
        }}
      />

      {/* SIDEBAR */}

      <div
        style={{
          width: 240,
          background: "rgba(0,0,0,0.65)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          padding: 20,
          position: "relative",
          zIndex: 2,
          backdropFilter: "blur(8px)"
        }}
      >

        <h2 style={{ fontSize: 20, fontWeight: 900 }}>
          Barbearia Admin
        </h2>

        <nav
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >

          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/semana">Agenda da semana</NavLink>
          <NavLink href="/admin/recompensas">Recompensas</NavLink>
          <NavLink href="/admin/servicos">Serviços</NavLink>
          <NavLink href="/admin/barbeiros">Barbeiros</NavLink>

        </nav>

      </div>

      {/* CONTEÚDO */}

      <div
        style={{
          flex: 1,
          padding: 40,
          position: "relative",
          zIndex: 2,
          color: "#fff",
          maxWidth: 1400,
          margin: "0 auto",
          width: "100%"
        }}
      >
        {children}
      </div>

    </div>

  );

}

function NavLink({ href, children }: any) {

  return (
    <Link
      href={href}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        textDecoration: "none",
        color: "#fff",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.05)",
        transition: "all .15s ease"
      }}
    >
      {children}
    </Link>
  );

}