import { proxy } from "valtio";
import { v4 as id } from "uuid";
import { toast } from "@/components/ui/use-toast";

export const tasks = [
  { title: "Fleet Support", id: id(), width: 1, color: 1, content: "" },
  { title: "MDAZ", id: id(), width: 1, color: 1, content: "" },
  { title: "Maadi", id: id(), width: 1, color: 1, content: "" },
  { title: "6 October", id: id(), width: 1, color: 1, content: "" },
  { title: "Giza", id: id(), width: 1, color: 1, content: "" },
  { title: "Heliopolis", id: id(), width: 1, color: 1, content: "" },
  { title: "Nasr City", id: id(), width: 1, color: 1, content: "" },
  { title: "Alex", id: id(), width: 1, color: 1, content: "" },
];
export const containers = [
  { name: "Halim", color: 3, id: id(), tasksIDs: [...tasks.slice(0, 4)] },
  { name: "Ali", color: 3, id: id(), tasksIDs: [...tasks.slice(4)] },
];

export const state = proxy({
  list: [...containers],
  oldContainer: "",
  finalDestination: "",
  draggableItem: "",
  droppableItem: "",
  editMode: true,
  colors: [
    "slate",
    "gray",
    "zinc",
    "neutral",
    "stone",
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
  ],
  variantWidth: [""],
  time: [""],
  gridLimit: 12,
  createWidthVariant: (limit: number) => {
    let variantWidth: string[] = [];
    for (let i = 1; i <= limit; i++) {
      variantWidth.push(`basis-[${(i / limit) * 100}%]`);
    }
    state.variantWidth = variantWidth;
  },
  calculateTime24: (from: number, range: number) => {
    const array: string[] = [];

    for (let index = 0; index < range; index++) {
      array[index] = `${
        // if the starting hour contain 1-digit only "from 1 to 9" add leading zero "ex: 1 to be 01:00"
        // if the starting hour contain 2-digits don't add to it
        (from + index >= 10 ? "" : "0") +
        // if the starting hour contain 2-digit and following hours will be start from 00:00 again
        // (ex: starting hour is 22:00 so at 12 hours interval the following hours will be 23:00, 24:00,25:00 etc.)
        // so remove another 24hours from to repeat the cycle and add the leading zero if needed again
        (from + index >= 24
          ? (from + index - 24 >= 10 ? "" : "0") + (from + index - 24)
          : from + index)
      }:00`;
    }
    state.time = array;
  },
  calculateTime12: (from: number, range: number, day: boolean) => {
    const array = [];

    for (let index = 0; index < range; index++) {
      array[index] = `${
        // if the starting hour contain 1-digit only "from 1 to 9" add leading zero "ex: 1 to be 01:00"
        // if the starting hour contain 2-digits 10:00 and 11:00 or it is 0 already means that 12:00 don't add to it
        (from + index === 0 || from + index >= 10 ? "" : "0") +
        // if following hours will be start repeat new cycle one of the array will get to 12:00
        // (ex. hour is 10:00PM so there are 11:00PM, then 12:00AM, then 01:00AM etc.)
        // so remove another 12hours to repeat the cycle and add the leading zero if needed again
        (from + index > 12
          ? (from + index - 12 >= 10 ? "" : "0") + (from + index - 12 || 12)
          : from + index || 12)
      }:00 ${day && from + index < 12 ? "AM" : "PM"}`;
    }

    state.time = array;
  },
  toggleEditMode: () => {
    state.editMode = !state.editMode;
  },
  reset: () => {
    (state.finalDestination = ""),
      (state.oldContainer = ""),
      (state.draggableItem = ""),
      (state.droppableItem = "");
  },
  replaceItemByItem: () => {
    // the new index in final destination (the index of the item that crashed with)
    const collidedIndex = getTaskIndex(
      state.finalDestination,
      state.droppableItem
    );

    //oldIndexSame and newIndexSame in the same container
    const oldIndexSame = getTaskIndex(state.oldContainer, state.draggableItem);
    const newIndexSame = getTaskIndex(state.oldContainer, state.droppableItem);
    // direction is rtl => returns 0 and is ltr => returns 1
    // index needs adjustment in case of 1 due to removal of the element (due to mutation in the array)
    // const direction = oldIndexSame > newIndexSame ? 0 : 1;

    // remove the item from the old container and add it to memory for later use (removing a dragged item decreasing the length of the array -1)
    // this also reassure that moving inside the same contatiner, the container is below 12 items every time even if it's fully occuptied
    // (makes a room to replace, not to add more) - aka 2 cups, red cup has juice and blue cup has tea / now you can put tea in red and juice in blue
    // but dragging from another container to a 12-item full container stop you (because array didn't get -1) and skip to else condition
    const removedItem = state.list[
      getContainerIndex(state.oldContainer)
    ].tasksIDs.splice(
      getTaskIndex(state.oldContainer, state.draggableItem),
      1
    )[0];

    // check if destination container's length is less than 12 cols (number of tasks and their width could hold more or not)
    if (
      getContainerLength(state.finalDestination) + removedItem.width <=
      state.gridLimit
    ) {
      // after been removed, add it to new container
      state.list[getContainerIndex(state.finalDestination)].tasksIDs.splice(
        // if we don't have index ( index === -1 / < 0 means we don't squees it between old items in new container yet)
        collidedIndex < 0
          ? // aka; we are dragging to new container in blank area (no colluison), so please put it at the end
            state.list[getContainerIndex(state.finalDestination)].tasksIDs
              .length
          : // had colluison, please put it at the index of item that has colluide with
            collidedIndex,
        // don't remove any item (splice now like push but pushes in a specific positon of colluison)
        0,
        // add the dragged item which was kept in memory
        removedItem
      );
    } else {
      // final distination is fully occupied and dragged item is return back to its position
      if (
        getContainerLength(state.finalDestination) + removedItem.width >
        state.gridLimit
      ) {
        state.list[getContainerIndex(state.oldContainer)].tasksIDs.splice(
          oldIndexSame, // return item back to its postion becasue the new container is already full
          0,
          // add the dragged item which was kept in memory
          removedItem
        );
      }
      // case is bad, notify the user
      toast({
        variant: "destructive",
        description: "You can't move tasks to the container",
      });
    }
  },
  setOldContainer: (value: string) => {
    state.oldContainer = value;
  },
  setFinalDestination: (value: string) => {
    state.finalDestination = value;
  },
  setDraggableItem: (value: string) => {
    state.draggableItem = value;
  },
  setDroppableItem: (value: string) => {
    state.droppableItem = value;
  },
  addNewContainer: (name: string, color: number = 1) => {
    state.list.push({ name, color, id: id(), tasksIDs: [] });
  },
  deleteContainer: (container: string) => {
    state.list.splice(getContainerIndex(container), 1);
  },
  editTask: (
    title: string,
    content: string,
    color: number,
    container: string,
    taskID: string
  ) => {
    state.list[getContainerIndex(container)].tasksIDs[
      getTaskIndex(container, taskID)
    ].title = title;

    state.list[getContainerIndex(container)].tasksIDs[
      getTaskIndex(container, taskID)
    ].content = content;

    state.list[getContainerIndex(container)].tasksIDs[
      getTaskIndex(container, taskID)
    ].color = color;
  },

  editContainer: (name: string, color: number, container: string) => {
    state.list[getContainerIndex(container)].name = name;

    state.list[getContainerIndex(container)].color = color;
  },
  deleteTask: (container: string, taskID: string) => {
    state.list[getContainerIndex(container)].tasksIDs.splice(
      getTaskIndex(container, taskID),
      1
    );
  },

  moreWidth: (container: string, taskID: string) => {
    if (getContainerLength(container) < state.gridLimit) {
      ++state.list[getContainerIndex(container)].tasksIDs[
        getTaskIndex(container, taskID)
      ].width;
    } else {
      toast({
        variant: "destructive",
        description: "You can't enlarge the task anymore",
      });
    }
  },
  lessWidth: (container: string, taskID: string) => {
    if (
      state.list[getContainerIndex(container)].tasksIDs[
        getTaskIndex(container, taskID)
      ].width > 1
    ) {
      --state.list[getContainerIndex(container)].tasksIDs[
        getTaskIndex(container, taskID)
      ].width;
    } else {
      toast({
        variant: "destructive",
        description: "You can't reduce the task anymore",
      });
    }
  },

  moveRight: (container: string, taskID: string) => {
    const rearranged = reorder(
      state.list[getContainerIndex(container)].tasksIDs,
      getTaskIndex(container, taskID),
      getTaskIndex(container, taskID) ===
        state.list[getContainerIndex(container)].tasksIDs.length - 1
        ? 0
        : getTaskIndex(container, taskID) + 1
    );

    state.list[getContainerIndex(container)].tasksIDs = rearranged;
  },
  moveLeft: (container: string, taskID: string) => {
    const rearranged = reorder(
      state.list[getContainerIndex(container)].tasksIDs,
      getTaskIndex(container, taskID),
      getTaskIndex(container, taskID) === 0
        ? state.list[getContainerIndex(container)].tasksIDs.length
        : getTaskIndex(container, taskID) - 1
    );

    state.list[getContainerIndex(container)].tasksIDs = rearranged;
  },
  addNewTask: (
    container: string,
    title: string = "Empty Task",
    content: string = "",
    color: number = 0
  ) => {
    if (getContainerLength(container) < state.gridLimit) {
      state.list[getContainerIndex(container)].tasksIDs.push({
        title,
        id: id(),
        width: 1,
        color,
        content,
      });
    } else {
      toast({
        variant: "destructive",
        description: "You can't add more tasks",
      });
    }
  },
});

const reorder = (array: typeof tasks, from: number, to: number) => {
  const cloned = [...array];
  const item = array[from];

  cloned.splice(from, 1);

  cloned.splice(to, 0, item);
  return cloned;
};

export const getContainerIndex = (container: string) => {
  return state.list.findIndex((x) => x.id === container);
};

export const getTaskIndex = (container: string, taskID: string) => {
  return state.list[getContainerIndex(container)].tasksIDs.findIndex(
    (x) => x.id === taskID
  );
};

export const getContainerLength = (container: string) => {
  return state.list[getContainerIndex(container)].tasksIDs.reduce<number>(
    (a, b) => a + b.width,
    0
  );
};

export const getContainerLengthToIndex = (
  container: string,
  stopIndex: number
) => {
  return state.list[getContainerIndex(container)].tasksIDs
    .slice(0, stopIndex)
    .reduce<number>((a, b) => a + b.width, 0);
};
