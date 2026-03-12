export default function Input(props: any) {

  return (

    <input
      {...props}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 10,
        border: "1px solid #333",
        background: "#111",
        color: "#fff",
        fontSize: 16
      }}
    />

  );

}