import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
// UI elements used
import { getContainerIndex, getTaskIndex, state } from "@/lib/store";
import { FormEvent, useState } from "react";
// State pieces need
import { AddEditProps } from "@/lib/types";
// Prop types required

export default function AddEdit(props: AddEditProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { isEmployee, isAdd, children } = props;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const today = new Date(Date.now());

    const color = Number(data.get("color")?.toString()) ?? 1;

    const curr_date = today.getDate();
    const curr_month = today.getMonth() + 1; //Months are zero based
    const curr_year = today.getFullYear();

    if (isEmployee) {
      const { container } = props;

      const name = data.get("name")?.toString() ?? "";
      if (!isAdd && container) {
        state.editContainer(name, color, container);
      } else {
        state.addNewContainer(name, color);
      }

      toast({
        title: `Empolyee name: ${name} added succesfully`,
        description: `${curr_date} - ${curr_month} - ${curr_year}`,
      });
    } else {
      const { container, task } = props;

      const title = data.get("title")?.toString() ?? "";
      const content = data.get("content")?.toString() ?? "";
      if (!isAdd && container && task) {
        state.editTask(title, content, color, container, task);
      } else {
        state.addNewTask(container, title, content, color);
      }

      toast({
        title: `Task name: ${title} is ${isAdd ? "added" : "edited"
          } succesfully`,
        description: `${curr_date} - ${curr_month} - ${curr_year}`,
      });
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEmployee
              ? isAdd
                ? "Add a New Employee"
                : "Update an Existing Employee's Profile"
              : isAdd ? "Add a New Task" : "Update an Existing Task"}
          </DialogTitle>
          <DialogDescription>
            {isEmployee
              ? isAdd
                ? "Create a new employee profile"
                : "Edit employee's profile"
              : isAdd
                ? "Assign a new task to an employee"
                : "Edit task properties assigned to an employee"
            }
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-4 w-full gap-1.5">
            <Label
              htmlFor={isEmployee ? "name" : "title"}
              className="col-span-4"
            >
              Task Title
            </Label>
            <Input
              id={isEmployee ? "name" : "title"}
              name={isEmployee ? "name" : "title"}
              required
              placeholder="ex: Pedro Duarte"
              defaultValue={
                isEmployee
                  ? !isAdd && props.container
                    ? `${state.list[getContainerIndex(props.container)].name}`
                    : ""
                  : !isAdd && props.task
                    ? `${state.list[getContainerIndex(props.container)].tasksIDs[
                      getTaskIndex(props.container, props.task)
                    ].title
                    }`
                    : ""
              }
              className="col-span-4"
            />
            {!isEmployee && (
              <>
                <Label htmlFor="content" className="col-span-4">
                  Task Content
                </Label>
                <Textarea
                  placeholder="Type your guidance here."
                  className="col-span-4"
                  name="content"
                  id="content"
                  defaultValue={
                    !isAdd && props.task
                      ? `${state.list[getContainerIndex(props.container)]
                        .tasksIDs[getTaskIndex(props.container, props.task)]
                        .content
                      }`
                      : ""
                  }
                />
              </>
            )}

            <RadioGroup
              defaultValue={
                isEmployee
                  ? !isAdd && props.container
                    ? `${state.list[getContainerIndex(props.container)].color}`
                    : "0"
                  : !isAdd && props.task
                    ? `${state.list[getContainerIndex(props.container)].tasksIDs[
                      getTaskIndex(props.container, props.task)
                    ].color
                    }`
                    : "0"
              }
              name="color"
              className="col-span-4 grid grid-cols-6"
            >
              {state.colors.map((x, i) => (
                <div className="grid justify-items-center " key={i}>
                  <RadioGroupItem
                    value={i.toString()}
                    id={`${i}`}
                    className={`rounded-full bg-${x}-300 w-6 h-6`}
                  />
                  <Label htmlFor={`${i}`}>{x}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
