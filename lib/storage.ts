import { supabase } from "@/lib/supabase/client";

export async function getGallery(shopId: string) {

  const { data, error } = await supabase
    .storage
    .from("gallery")
    .list(shopId);

  if (error || !data) {
    console.log(error);
    return [];
  }

  return data.map((file) =>
    `https://xocurponcumwyadzhsqr.supabase.co/storage/v1/object/public/gallery/${shopId}/${file.name}`
  );
}