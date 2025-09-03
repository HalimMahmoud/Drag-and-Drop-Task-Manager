import { DragEvent, MouseEventHandler, useState } from "react";
import { state } from "@/lib/store";
import { twMerge } from "tailwind-merge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Menu from "../Menu";
import Description from "./Description";
import Footer from "./Footer";
import { ContainerProps, TasksIDsProps } from "@/lib/types";
import AddEdit from "../AddEdit";

export default function Task({
  container,
  item,
}: {
  container: ContainerProps;
  item: TasksIDsProps;
}) {
  const [droppable, setDroppable] = useState(true);
  const onDragStart = (
    e: DragEvent<HTMLDivElement>,
    container: string,
    item: string
  ) => {
    e.currentTarget.classList.add("dragging");
    state.setDraggableItem(item);
    state.setOldContainer(container);
    setDroppable(false);
  };
  const onDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("dragging");
    state.replaceItemByItem();
    state.reset();

    setDroppable(true);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("over");
  };
  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("over");
    state.setFinalDestination(
      e.currentTarget.getAttribute("data-container") ?? ""
    );
    state.setDroppableItem(e.currentTarget.getAttribute("data-item") ?? "");
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("over");
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("over");
  };

  const c = twMerge(
    `${
      state.editMode && "draggable"
    } rounded-sm border bg-card text-card-foreground ${
      state.variantWidth[item.width - 1]
    } shadow shrink-0 bg-${state.colors[item.color]}-300`
  );

  return (
    <Card
      className={c}
      // draggable item
      onDragStart={
        state.editMode
          ? (e) => onDragStart(e, container.id, item.id)
          : undefined
      }
      onDragEnd={state.editMode ? onDragEnd : undefined}
      // droppable item
      onDragEnter={state.editMode && droppable ? onDragEnter : undefined}
      onDragOver={state.editMode && droppable ? onDragOver : undefined}
      onDragLeave={state.editMode && droppable ? onDragLeave : undefined}
      // end
      onDrop={onDrop}
      draggable={state.editMode}
      data-container={container.id}
      data-item={item.id}
    >
      <CardHeader className="px-2.5 py-1.5 ">
        <CardTitle className=" flex items-center justify-between">
          <div className="line-clamp-1 text-base"> {item.title}</div>
          {state.editMode && (
            <AddEdit
              isEmployee={false}
              isAdd={false}
              container={container.id}
              task={item.id}
            >
              <Menu container={container.id} task={item.id} />
            </AddEdit>
          )}
        </CardTitle>

        <Description container={container} item={item} />
      </CardHeader>
      <CardContent className="px-2.5 pb-0 line-clamp-6 text-xs">
        {item.content}
      </CardContent>
      {state.editMode && <Footer container={container} item={item} />}
    </Card>
  );
}
