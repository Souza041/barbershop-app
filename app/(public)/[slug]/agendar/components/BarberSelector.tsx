import ComboBox from "@/components/ComboBox";

export default function BarberSelector({ barbers, barberId, setBarberId }: any) {

  const options = barbers.map((b:any) => ({
    value: b.id,
    label: b.display_name
  }));

  return (

    <ComboBox
      id="barber"
      label="Barbeiro"
      value={barberId}
      options={options}
      onChange={(v:any)=>setBarberId(v)}
      placeholder="Selecione..."
      clearable
    />

  );

}