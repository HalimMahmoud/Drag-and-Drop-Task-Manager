import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { state } from "@/lib/store";
import { ReactNode } from "react";

export default function Delete({
    children,
    isEmpolyee,
    container,
    task,
}: {
    children: ReactNode;
    isEmpolyee: boolean;
    container: string;
    task?: string;
}) {
    return (
        <AlertDialog>
            {children}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this{" "}
                        {isEmpolyee ? "task" : "employee"}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                        onClick={() =>
                            task
                                ? state.deleteTask(container, task)
                                : state.deleteContainer(container)
                        }
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
