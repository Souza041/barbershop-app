import Hero from "@/components/shop/Hero";
import Stats from "@/components/shop/Stats";
import FeaturedServices from "@/components/shop/FeaturedServices";
import Barbers from "@/components/shop/Barbers";
import Gallery from "@/components/shop/Gallery";
import FooterCTA from "@/components/shop/FooterCTA";
import { supabase } from "@/lib/supabase/client";
import { getGallery } from "@/lib/storage";

export default async function ShopPage({ params }: any) {

  const { slug } = await params;

  // buscar barbearia
  const { data: shop } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .single();

  // 🚨 proteção contra null
  if (!shop) {
    return <div style={{ padding: 40 }}>Barbearia não encontrada</div>;
  }
  
  // agora sim podemos buscar services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("shop_id", shop.id)
    .eq("is_active", true);

  const { data: barbers } = await supabase
    .from("barbers")
    .select("*")
    .eq("shop_id", shop.id)
    .eq("is_active", true);

  const featuredServices = services ?? [];
  const featuredBarbers = barbers ?? [];
  const gallery = await getGallery(shop.id);
  

  const minServicePrice =
    services?.length ? Math.min(...services.map((s) => s.price_cents)) : null;

  const avgDuration =
    services?.length
      ? Math.round(
          services.reduce((acc, s) => acc + s.duration_min, 0) /
            services.length
        )
      : null;

  const todayInfo = { label: "Hoje" };

  

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#fff" }}>

      <Hero shop={shop} />

      <Stats
        services={services}
        barbers={barbers}
        minServicePrice={minServicePrice}
        avgDuration={avgDuration}
        todayInfo={todayInfo}
      />

      <div style={{ padding: "22px 16px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 18 }}>

          <FeaturedServices services={featuredServices} slug={shop.slug} />

          <Barbers barbers={featuredBarbers} />

          <Gallery gallery={gallery} />

          <FooterCTA slug={shop.slug} shopName={shop.name} />

        </div>
      </div>

    </div>
  );
}