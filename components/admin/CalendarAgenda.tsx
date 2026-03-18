import { FunctionRegion } from "@supabase/supabase-js"
import { serverHooks } from "next/dist/server/app-render/entry-base";
import { Fragment } from "react";

type Appointment = {
  id: string
  start_at: string
  barber_id: string
  barber_name: string
  service_name: string
}

type Barber = {
  id: string
  name: string
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function makeSlots(start = 9, end = 19) {
  const slots:string[] = []

  for (let h=start; h<end; h++) {
    slots.push(`${String(h).padStart(2,"0")}:00`)
    slots.push(`${String(h).padStart(2,"0")}:30`)
  }

  return slots
}

function serviceColor(name:string){

  if(!name) return "#1f1f1f"

  const n = name.toLowerCase()

  if(n.includes("corte")) return "#2563eb"
  if(n.includes("barba")) return "#16a34a"
  if(n.includes("combo")) return "#9333ea"

  return "#444"
}


export default function CalendarAgenda({
  barbers,
  appointments
}:{
  barbers:Barber[]
  appointments:Appointment[]
}){

  const slots = makeSlots()

  const appointmentMap = new Map();

  appointments.forEach((a) => {

    const time = formatTime(a.start_at);

    const key = `${time}_${a.barber_id}`;

    appointmentMap.set(key, a);

   });


  return (

    <div
      style={{
        background:"rgba(0,0,0,0.55)",
        backdropFilter:"blur(10px)",
        borderRadius:16,
        border:"1px solid rgba(255,255,255,0.08)",
        padding:24
      }}
    >

      <h2 style={{fontSize:20,fontWeight:800,marginBottom:20}}>
        Agenda do dia
      </h2>

      <div
        style={{
          display:"grid",
          gridTemplateColumns:`80px repeat(${barbers.length},1fr)`,
          gap:8
        }}
      >

        <div></div>

        {barbers.map(b=>(
          <div 
            key={b.id}
            style={{
                fontWeight:700,
                textAlign:"center",
                paddingBottom:8,
                borderBottom:"1px solid rgba(255,255,255,0,08)"
            }}
          >
            {b.name}
          </div>
        ))}

        {slots.map(slot=>{

          return(
            <Fragment key={slot}>

              <div key={slot} style={{opacity:.7}}>
                {slot}
              </div>

              {barbers.map(barber=>{

                const ap = appointmentMap.get(`${slot}_${barber.id}`);

                return(

                  <div
                    key={barber.id+slot}
                    style={{
                      minHeight:46,
                      borderRadius:10,
                      border:"1px solid rgba(255,255,255,0,05)",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      fontSize:13,
                      transition:"all .15s ease",
                      cursor: ap ? "pointer" : "default",

                      background: ap
                       ? "linear-gradient(135deg,#1f1f1f,#2a2a2a"
                       : "rgba(255,255,255,0,02)"
                    }}
                  >

                    {ap && (
                        <div
                            style={{
                                width:"100%",
                                height:"100%",
                                borderRadius:8,
                                background:serviceColor(ap.service_name),
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                fontWeight:600,
                                fontSize:12
                            }}
                        >
                            {ap.service_name}
                        </div>
                    )}

                  </div>

                )

              })}

            </Fragment>
          )

        })}

      </div>

    </div>

  )

}