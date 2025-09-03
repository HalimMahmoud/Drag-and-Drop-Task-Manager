import { DialogTrigger } from "@/components/ui/dialog";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { state } from "@/lib/store";
import {
  Cross1Icon,
  DotsVerticalIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";
import Delete from "./Delete";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Menu({
  container,
  task,
}: {
  container: string;
  task: string;
}) {
  return (
    <Delete container={container} task={task} isEmpolyee={false}>

      <Menubar className="w-fit h-fit p-0 shadow-none rounded-full border-0	bg-transparent">
        <MenubarMenu>
          <MenubarTrigger className="w-fit h-fit p-1 rounded-full bg-background">
            <DotsVerticalIcon className="h-3 w-3" />
          </MenubarTrigger>
          <MenubarContent>
            <DialogTrigger asChild>
              <MenubarItem>
                Edit Task
                <MenubarShortcut>
                  <Pencil2Icon className="h-3 w-3" />
                </MenubarShortcut>
              </MenubarItem>
            </DialogTrigger>
            <AlertDialogTrigger asChild>
              <MenubarItem >
                Delete Task
                <MenubarShortcut>
                  <Cross1Icon className="h-3 w-3" />
                </MenubarShortcut>
              </MenubarItem>
            </AlertDialogTrigger>

          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </Delete>

  );
}
