type GalleryProps = {
  gallery: string[]
}

export default function Gallery({ gallery }: GalleryProps) {

  if (!gallery || gallery.length === 0) {
    return (
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900 }}>
          Galeria
        </h2>

        <p style={{ opacity: 0.6 }}>
          Nenhuma imagem cadastrada ainda.
        </p>
      </section>
    );
  }

  return (
    <section style={{ marginTop: 40 }}>

      <h2 style={{ fontSize: 22, fontWeight: 900 }}>
        Galeria
      </h2>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))",
          gap: 12
        }}
      >

        {gallery.map((url) => (

          <img
            key={url}
            src={url}
            alt="Imagem da barbearia"
            style={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: 12,
              border: "1px solid #1d1d1d"
            }}
          />

        ))}

      </div>

    </section>
  );
}