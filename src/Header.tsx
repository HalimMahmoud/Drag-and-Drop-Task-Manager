import { ScrollBar } from "@/components/ui/scroll-area";
import { state } from "@/lib/store";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useEffect } from "react";
import { useSnapshot } from "valtio";

//initial timestamp 12 or 24 hour system
//bug 1
//add one hour more to adjust to # from to in the discription #

export default function Header() {
  const snap = useSnapshot(state);

  useEffect(() => {
    snap.calculateTime12(8, snap.gridLimit + 1, true);
  }, [snap.gridLimit]);
  return (
    <div className="bg-gray-50">
      <div className="grid grid-cols-12 gap-1 h-14">
        <div className="flex justify-between items-center my-auto indent-1 px-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Name
        </div>
        <ScrollArea
          className={`col-span-11 w-full whitespace-nowrap rounded-md border`}
        >
          <div className="flex gap-2 flex-nowrap">
            {snap.time.slice(0, snap.gridLimit).map((x, i) => (
              <div
                key={i}
                className={`${snap.variantWidth[0]} shrink-0 py-3 my-auto text-left indent-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-l-2 border-l-slate-300`}
              >
                {x}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
