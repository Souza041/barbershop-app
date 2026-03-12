export default function PageContainer({ children }: any) {

  return (

    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        backgroundImage: "url('/barber-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      {/* overlay escuro */}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85))",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* conteúdo */}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 20px",
          color: "#fff",
        }}
      >

        {children}

      </div>

    </div>

  );

}