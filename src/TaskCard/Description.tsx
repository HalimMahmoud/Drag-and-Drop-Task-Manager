import { getContainerLengthToIndex, getTaskIndex, state } from "@/lib/store";
// import { calculateTime12 } from "@/lib/time";
import { ContainerProps, TasksIDsProps } from "@/lib/types";
import { CardDescription } from "@/components/ui/card";

export default function Description({
  container,
  item,
}: {
  container: ContainerProps;
  item: TasksIDsProps;
}) {
  // related to header
  //initial timestamp 12 or 24 hour system
  //bug 1
  //add one hour more to adjust to # from to in the discription #
  return (
    <CardDescription className="text-xs">
      {`${
        state.time[
          getContainerLengthToIndex(
            container.id,
            getTaskIndex(container.id, item.id)
          )
        ]
      } | ${
        state.time[
          getContainerLengthToIndex(
            container.id,
            getTaskIndex(container.id, item.id)
          ) + item.width
        ]
      }`}
    </CardDescription>
  );
}
