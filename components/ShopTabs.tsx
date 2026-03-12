export default function ShopTabs({ active, setActive }) {

  const tabs = [
    "services",
    "professionals",
    "loyalty",
    "bundles",
    "reviews"
  ];

  return (
    <div className="flex gap-6 border-b border-zinc-800 pb-2">

      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`
            capitalize pb-2
            ${active === tab
              ? "border-b-2 border-blue-500 text-white"
              : "text-zinc-400"}
          `}
        >
          {tab}
        </button>
      ))}

    </div>
  );
}