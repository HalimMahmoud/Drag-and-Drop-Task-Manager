import { Button } from "@/components/ui/button";
import { state } from "@/lib/store";
import { MinusIcon, PlusIcon } from "@radix-ui/react-icons";
import React from "react";
import { useSnapshot } from "valtio";

export default function GridLimiter() {
  const snap = useSnapshot(state);
  function onClick(adjustment: number) {
    state.gridLimit = Math.max(1, Math.min(30, state.gridLimit + adjustment));
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={() => onClick(-1)}
        disabled={snap.gridLimit <= 1}
      >
        <MinusIcon className="h-4 w-4" />
        <span className="sr-only">Decrease</span>
      </Button>
      <div className="flex-1 text-center">
        <div className="text-5xl font-bold tracking-tighter">
          {snap.gridLimit}
        </div>
        <div className="text-[0.70rem] uppercase text-muted-foreground">
          Items
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={() => onClick(1)}
        disabled={snap.gridLimit >= 30}
      >
        <PlusIcon className="h-4 w-4" />
        <span className="sr-only">Increase</span>
      </Button>
    </div>
  );
}
