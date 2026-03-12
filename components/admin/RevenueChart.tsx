"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RevenueChart({ data }: any) {

  return (

    <div
      style={{
        width: "100%",
        height: 260,
        background: "#0f0f0f",
        borderRadius: 12,
        border: "1px solid #1d1d1d",
        padding: 20
      }}
    >

      <h3 style={{ marginBottom: 10 }}>
        Faturamento últimos dias
      </h3>

      <ResponsiveContainer width="100%" height="80%">

        <LineChart data={data}>

          <XAxis dataKey="day" stroke="#aaa" />

          <YAxis stroke="#aaa" />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#ffffff"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );
}