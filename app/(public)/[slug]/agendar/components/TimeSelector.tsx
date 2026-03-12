function makeSlots() {

  const times:string[]=[];

  for(let h=9;h<19;h++){

    times.push(`${h}:00`);
    times.push(`${h}:30`);

  }

  return times;

}

export default function TimeSelector({
  date,
  setDate,
  selectedTime,
  setSelectedTime
}:any){

  const slots = makeSlots();

  return(

    <div>

      <b>Data</b>

      <input
        type="date"
        value={date}
        onChange={e=>setDate(e.target.value)}
        style={{width:"100%",height:44,marginTop:6}}
      />

      <b style={{display:"block",marginTop:20}}>
        Horários
      </b>

      <div
        style={{
          marginTop:10,
          display:"grid",
          gridTemplateColumns:"repeat(4,1fr)",
          gap:10
        }}
      >

        {slots.map((t)=>{

          const selected = selectedTime === t;

          return(

            <button
              key={t}
              onClick={()=>setSelectedTime(t)}
              style={{
                height:44,
                borderRadius:10,
                border:selected?"1px solid #fff":"1px solid #333",
                background:selected?"#fff":"#111",
                color:selected?"#000":"#fff"
              }}
            >

              {t}

            </button>

          );

        })}

      </div>

    </div>

  );

}