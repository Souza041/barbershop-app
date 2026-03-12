"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

const shopId = "aa476288-225e-4df7-8e08-172b575179a0";

export default function AdminGallery() {

  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function loadImages() {

    const { data } = await supabase
      .storage
      .from("gallery")
      .list(shopId);

    if (!data) return;

    const urls = data.map(
      (file) =>
        `https://xocurponcumwyadzhsqr.supabase.co/storage/v1/object/public/gallery/${shopId}/${file.name}`
    );

    setImages(urls);
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function uploadImage(e: any) {

    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const filePath = `${shopId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("gallery")
      .upload(filePath, file);

    if (!error) {
      loadImages();
    }

    setUploading(false);
  }

  async function deleteImage(url: string) {

    const name = url.split("/").pop();

    if (!name) return;

    await supabase.storage
      .from("gallery")
      .remove([`${shopId}/${name}`]);

    loadImages();
  }

  return (
    <div style={{ padding: 30, maxWidth: 1000 }}>

      <h1 style={{ fontSize: 28, fontWeight: 900 }}>
        Galeria da Barbearia
      </h1>

      {/* Upload */}

      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept="image/*"
          onChange={uploadImage}
        />
      </div>

      {uploading && (
        <p style={{ marginTop: 10 }}>
          Enviando imagem...
        </p>
      )}

      {/* Grid de imagens */}

      <div
        style={{
          marginTop: 30,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16
        }}
      >

        {images.map((url) => (

          <div
            key={url}
            style={{
              border: "1px solid #1d1d1d",
              borderRadius: 12,
              overflow: "hidden",
              background: "#0f0f0f"
            }}
          >

            <img
              src={url}
              style={{
                width: "100%",
                height: 160,
                objectFit: "cover"
              }}
            />

            <div style={{ padding: 10 }}>

              <button
                onClick={() => deleteImage(url)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "#ff4444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Excluir
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}