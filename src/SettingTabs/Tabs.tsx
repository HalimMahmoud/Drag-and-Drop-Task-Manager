import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "./DateRangePicker";

export function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="hours">Hours</TabsTrigger>
        <TabsTrigger value="days">Days</TabsTrigger>
        <TabsTrigger value="weeks">Weeks</TabsTrigger>
        <TabsTrigger value="months">Months</TabsTrigger>
        <TabsTrigger value="years">Years</TabsTrigger>
      </TabsList>
      <TabsContent value="hours"></TabsContent>
      <TabsContent value="days">Days</TabsContent>
      <TabsContent value="weeks">Weeks</TabsContent>
      <TabsContent value="months">
        <CalendarDateRangePicker />
      </TabsContent>
      <TabsContent value="years">Years</TabsContent>
    </Tabs>
  );
}
