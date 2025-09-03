import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { state } from "@/lib/store";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { ContainerProps, TasksIDsProps } from "@/lib/types";

export default function Footer({
  container,
  item,
}: {
  container: ContainerProps;
  item: TasksIDsProps;
}) {
  return (
    <CardFooter className="flex mt-auto justify-between px-6 py-3">
      <Button
        variant="secondary"
        size="icon"
        className="w-fit h-fit rounded-full"
        onClick={() => state.moreWidth(container.id, item.id)}
      >
        <PlusIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="w-fit h-fit rounded-full"
        onClick={() => state.lessWidth(container.id, item.id)}
      >
        <MinusIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="w-fit h-fit rounded-full"
        onClick={() => state.moveLeft(container.id, item.id)}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="w-fit h-fit rounded-full"
        onClick={() => state.moveRight(container.id, item.id)}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </CardFooter>
  );
}
