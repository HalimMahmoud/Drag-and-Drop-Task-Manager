import { Toaster } from "@/components/ui/toaster";
import Header from "./Header";
import Body from "./Body";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSnapshot } from "valtio";
import { state } from "@/lib/store";
import { DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import AddEdit from "./AddEdit";
import SettingDialog from "./SettingTabs/SettingDialog";

function App() {
  const snap = useSnapshot(state);
  return (
    <div className="py-6 px-3 align-middle min-w-full">
      Day-to-Day Tasks
      <div className="flex items-center space-x-2">
        <Switch
          id="super-mode"
          checked={snap.editMode}
          onCheckedChange={() => snap.toggleEditMode()}
        />
        <Label htmlFor="super-mode">Supervisor Mode</Label>
      </div>
      <SettingDialog />
      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg min-w-full divide-y divide-gray-200">
        <Header />
        <Body />
      </div>
      <div className="flex justify-center p-5">
        {state.editMode && (
          <AddEdit isAdd={true} isEmployee={true}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="float-right rounded-full p-2 h-fit	w-fit"
              >
                <PlusIcon className="h-3 w-3" />
              </Button>
            </DialogTrigger>
          </AddEdit>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default App;
