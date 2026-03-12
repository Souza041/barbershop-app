type Props = {
  service: any
  selected: boolean
  onClick: () => void
}

function toBRL(cents:number){
  return (cents/100).toLocaleString("pt-BR",{
    style:"currency",
    currency:"BRL"
  });
}

export default function ServiceCard({
  service,
  selected,
  onClick
}:Props){

  return(

    <div
      onClick={onClick}
      style={{
        padding:16,
        borderRadius:12,
        border:selected?"2px solid #fff":"1px solid #333",
        background:"#111",
        cursor:"pointer",
        transition:"all .15s ease"
      }}
    >

      <div style={{fontWeight:700,fontSize:16}}>
        {service.name}
      </div>

      <div style={{opacity:.7,fontSize:13}}>
        {service.duration_min} min
      </div>

      <div style={{marginTop:6,color:"#22c55e",fontWeight:600}}>
        {toBRL(service.price_cents)}
      </div>

    </div>

  )

}