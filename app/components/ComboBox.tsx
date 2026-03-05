"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = { value: string; label: string };

export default function ComboBox(props: {
  id?: string;
  label?: string; // agora pode ser opcional
  placeholder?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  clearable?: boolean;
}) {
  const {
    id,
    label,
    placeholder = "Selecione...",
    value,
    options,
    onChange,
    disabled,
    clearable = false,
  } = props;

  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return options;
    return options.filter((o) => o.label.toLowerCase().includes(qq));
  }, [options, q]);

  // Quando abre: reset highlight e foca input
  useEffect(() => {
    if (!open) return;
    setActiveIndex(filtered.length > 0 ? 0 : -1);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quando filtra: mantém highlight dentro do range
  useEffect(() => {
    if (!open) return;
    setActiveIndex((prev) => {
      if (filtered.length === 0) return -1;
      if (prev < 0) return 0;
      if (prev >= filtered.length) return filtered.length - 1;
      return prev;
    });
  }, [filtered, open]);

  // Fecha ao clicar fora
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Scroll pro item ativo (quando navega com setas)
  useEffect(() => {
    if (!open) return;
    if (!listRef.current) return;
    if (activeIndex < 0) return;

    const el = listRef.current.querySelector<HTMLButtonElement>(
      `[data-idx="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function selectOption(opt: Option) {
    onChange(opt.value);
    setOpen(false);
    setQ("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      if (!disabled) setOpen(true);
      return;
    }

    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setQ("");
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) selectOption(opt);
      return;
    }

    if (e.key === "Tab") {
      // deixa tab seguir fluxo normal, só fecha
      setOpen(false);
      return;
    }
  }

  return (
    <div ref={wrapperRef} style={{ display: "grid", gap: 6 }}>
      {label ? (
        <label htmlFor={id} style={{ fontWeight: 800 }}>
          {label}
        </label>
      ) : null}

      <div style={{ position: "relative" }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((v) => !v);
          }}
          onKeyDown={onKeyDown}
          style={{
            width: "100%",
            height: 44,
            borderRadius: 12,
            border: "1px solid #2a2a2a",
            background: disabled ? "#0d0d0d" : "#121212",
            color: disabled ? "#666" : "#fff",
            padding: "0 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <span style={{ opacity: selected ? 1 : 0.7 }}>
            {selected ? selected.label : placeholder}
          </span>

          <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {clearable && value ? (
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange("");
                }}
                title="Limpar"
                style={{
                  width: 22,
                  height: 22,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 999,
                  border: "1px solid #2a2a2a",
                  opacity: 0.9,
                }}
              >
                ×
              </span>
            ) : null}
            <span style={{ opacity: 0.7 }}>▾</span>
          </span>
        </button>

        {open ? (
          <div
            style={{
              position: "absolute",
              zIndex: 50,
              top: 48,
              left: 0,
              right: 0,
              borderRadius: 12,
              border: "1px solid #2a2a2a",
              background: "#0f0f0f",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ padding: 10, borderBottom: "1px solid #222" }}>
              <input
                id={id}
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Pesquisar..."
                style={{
                  width: "100%",
                  height: 38,
                  borderRadius: 10,
                  border: "1px solid #2a2a2a",
                  background: "#121212",
                  color: "#fff",
                  padding: "0 10px",
                  outline: "none",
                }}
              />
            </div>

            <div
              ref={listRef}
              style={{ maxHeight: 240, overflow: "auto" }}
            >
              {filtered.length === 0 ? (
                <div style={{ padding: 12, opacity: 0.75 }}>Nada encontrado.</div>
              ) : (
                filtered.map((o, idx) => {
                  const isSel = o.value === value;
                  const isActive = idx === activeIndex;

                  return (
                    <button
                      key={o.value}
                      type="button"
                      data-idx={idx}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => selectOption(o)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        background: isActive ? "#1b1b1b" : isSel ? "#161616" : "transparent",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontWeight: isSel ? 900 : 600 }}>{o.label}</span>
                      {isSel ? <span style={{ opacity: 0.8 }}>✓</span> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}