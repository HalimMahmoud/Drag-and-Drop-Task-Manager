import { MouseEvent } from "react";
import { useSnapshot } from "valtio";
import {
  getContainerLength,
  getContainerLengthToIndex,
  state,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Cross1Icon,
  Pencil1Icon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { DialogTrigger } from "@/components/ui/dialog";
import Task from "./TaskCard/Task";
import AddEdit from "./AddEdit";
import Delete from "./Delete";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ScrollAreaHorizontalDemo } from "./ScrollExample";

state.createWidthVariant(state.gridLimit);

export default function Body() {
  const snap = useSnapshot(state);

  const onDragEnter = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    snap.setFinalDestination(
      e.currentTarget.getAttribute("data-container") ?? ""
    );
    snap.setDroppableItem(e.currentTarget.getAttribute("data-item") ?? "");
  };

  const onDragEnd = () => {
    snap.reset();
  };

  const onDragOver = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="bg-white divide-y divide-gray-200">
      {snap.list.map((container) => (
        <div
          key={container.id}
          className={`h-56 bg-${
            snap.colors[container.color]
          }-100 text-left text-sm font-medium text-gray-500 grid grid-cols-12 gap-1`}
        >
          <div className="my-auto indent-1 px-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="flex justify-center py-5"> {container.name}</div>
            {snap.editMode && (
              <div className="flex justify-evenly p">
                {snap.editMode && (
                  <AddEdit
                    isEmployee={true}
                    isAdd={false}
                    container={container.id}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="float-right rounded-full p-2 h-fit	w-fit"
                      >
                        <Pencil1Icon className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                  </AddEdit>
                )}

                <Delete container={container.id} isEmpolyee={true}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="secondary"
                      className="float-right rounded-full p-2 h-fit	w-fit"
                    >
                      <Cross1Icon className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                </Delete>
              </div>
            )}
          </div>

          <ScrollArea
            className={`col-span-11 list py-2 h-full whitespace-nowrap`}
            key={container.id}
            data-container={container.id}
            onDragEnter={snap.editMode ? onDragEnter : undefined}
            onDragOver={snap.editMode ? onDragOver : undefined}
            onDragEnd={snap.editMode ? onDragEnd : undefined}
          >
            {/* grid grid-cols-${snap.gridLimit} gap-2 w-full h-full`} */}
            <div className={`media-display h-full flex gap-2 flex-nowrap`}>
              {container.tasksIDs?.map((item) => (
                <Task container={container} key={item.id} item={item} />
              ))}
              {snap.editMode && getContainerLength(container.id) < 12 && (
                <div
                  className={`${state.variantWidth[0]} rounded-sm border bg-card text-card-foreground shadow flex items-center justify-center shrink-0`}
                >
                  <AddEdit
                    isEmployee={false}
                    isAdd={true}
                    container={container.id}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="float-right  p-2 h-full w-full"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                  </AddEdit>
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ))}

      {/* <ScrollAreaHorizontalDemo /> */}
    </div>
  );
}
