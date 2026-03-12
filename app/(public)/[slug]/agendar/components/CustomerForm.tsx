import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function CustomerForm({
  barberId,
  service,
  date,
  selectedTime
}:any){

  const [name,setName]=useState("");
  const [phone,setPhone]=useState("");
  const [msg,setMsg]=useState("");

  async function book(){

    if(!barberId || !service || !date || !selectedTime){
      setMsg("Preencha tudo");
      return;
    }

    const start = new Date(`${date}T${selectedTime}:00`).toISOString();

    const {error}=await supabase.rpc("create_appointment",{
      _barber_id: barberId,
      _service_id: service.id,
      _start_at: start
    });

    if(error){
      setMsg("Erro ao agendar");
      return;
    }

    setMsg("Agendado com sucesso");

  }

  return(

    <div style={{display:"grid",gap:12}}>

      <input
        style={{ border: "1px solid #ffffff9f", borderRadius: 8}}
        placeholder="Seu nome"
        value={name}
        onChange={e=>setName(e.target.value)}
      />

      <input
        style={{ border: "1px solid #ffffff9f", borderRadius: 8}}
        placeholder="Telefone"
        value={phone}
        onChange={e=>setPhone(e.target.value)}
      />

      <button onClick={book}>
        Confirmar agendamento
      </button>

      {msg && <p>{msg}</p>}

    </div>

  );

}