import ServiceCard from "@/components/ServiceCard";

export default function ServiceSelector({
  services,
  selectedService,
  setSelectedService
}: any) {

  return (

    <div>

      <b>Serviços</b> 
      
      <div>
        <b style={{fontSize:18}}>Escolha um serviço</b>
      </div>

      <div
        style={{
          marginTop: 10,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 12
        }}
        
      >

        
        {services.map((s:any)=>(
          <ServiceCard
            key={s.id}
            service={s}
            selected={selectedService?.id === s.id}
            onClick={()=>setSelectedService(s)}
          />
        ))}

      </div>

    </div>

  );

}