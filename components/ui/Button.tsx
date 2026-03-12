export default function Button({ children, ...props }: any) {

  return (

    <button
      {...props}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: 10,
        border: "none",
        background: "#fff",
        color: "#000",
        fontWeight: 700,
        fontSize: 16,
        cursor: "pointer"
      }}
    >

      {children}

    </button>

  );

}