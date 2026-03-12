export default function TimeSlot({ time, selected, onClick }: any) {

  return (

    <button
      onClick={onClick}
      style={{
        padding: "12px 16px",
        borderRadius: 10,
        border: selected ? "2px solid #fff" : "1px solid #333",
        background: "#111",
        color: "#fff",
        cursor: "pointer",
        fontSize: 16
      }}
    >

      {time}

    </button>

  );

}