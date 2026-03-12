export default function BarberCard() {

  return (
    <div className="flex gap-4 p-4 bg-zinc-900 rounded-xl cursor-pointer">

      <img
        src="/barber.jpg"
        className="w-16 h-16 rounded-lg"
      />

      <div>

        <h3 className="font-semibold">
          Gabriel
        </h3>

        <p className="text-zinc-400 text-sm">
          No observation
        </p>

      </div>

    </div>
  );
}