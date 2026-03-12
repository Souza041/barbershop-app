import Link from "next/link";

export default function AdminLayout({ children }: any) {

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}

      <div
        style={{
          width: 240,
          background: "#0f0f0f",
          borderRight: "1px solid #1d1d1d",
          padding: 20
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

      <div style={{ flex: 1, padding: 30 }}>
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
        borderRadius: 8,
        textDecoration: "none",
        color: "#fff",
        background: "#151515"
      }}
    >
      {children}
    </Link>
  );

}