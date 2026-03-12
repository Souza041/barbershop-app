type HeroProps = {
  shop: any
}

export default function Hero({ shop }: HeroProps) {

  const heroImage =
    "https://xocurponcumwyadzhsqr.supabase.co/storage/v1/object/public/gallery/aa476288-225e-4df7-8e08-172b575179a0/hero.jpg";

  return (

    <div
      style={{
        position: "relative",
        height: 320,
        overflow: "hidden",
        borderBottom: "1px solid #1d1d1d"
      }}
    >

      {/* Imagem */}

      <img
        src={heroImage}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "brightness(0.6)"
        }}
      />

      {/* Conteúdo */}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 980,
          margin: "0 auto",
          padding: "40px 16px",
          color: "#fff"
        }}
      >

        <h1
          style={{
            fontSize: 34,
            fontWeight: 900
          }}
        >
          {shop.name}
        </h1>

        <p style={{ opacity: 0.8 }}>
          {shop.address ?? "Endereço não informado"}
        </p>

        <div style={{ marginTop: 20 }}>

          <a
            href={`/${shop.slug}/agendar`}
            style={{
              background: "#fff",
              color: "#000",
              padding: "12px 20px",
              borderRadius: 10,
              fontWeight: 800,
              textDecoration: "none"
            }}
          >
            Agendar agora
          </a>

        </div>

      </div>

    </div>

  )
}