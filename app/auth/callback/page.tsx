"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    (async () => {
      await supabase.auth.getSession();

      const next = sp.get("next") ?? "/";
      router.replace(next);
    })();
  }, [router, sp]);

  return <div style={{ padding: 16 }}>Finalizando login...</div>;
}