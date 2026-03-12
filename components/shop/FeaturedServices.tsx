import Link from "next/link";
import { toBRL } from "@/lib/format";

export default function FeaturedServices({ services, slug }: any) {

  return (
    <section>

      <h2 style={{ fontSize: 22, fontWeight: 900 }}>
        Serviços
      </h2>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12
        }}
      >

        {services.map((s: any) => (

          <Link
            key={s.id}
            href={`/${slug}/agendar`}
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid #1d1d1d",
              background: "#121212",
              textDecoration: "none",
              color: "#fff"
            }}
          >

            <div style={{ fontWeight: 900 }}>
              {s.name}
            </div>

            <div style={{ opacity: 0.7 }}>
              {s.duration_min} min
            </div>

            <div style={{ marginTop: 6 }}>
              {toBRL(s.price_cents)}
            </div>

          </Link>

        ))}

      </div>

    </section>
  );
}