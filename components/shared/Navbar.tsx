"use client";
import { useContextHook } from "@/context/UserContext";
import React from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { CreateSkill } from "@/app/_actions/SkillAction";
import { useToast } from "@/hooks/use-toast";
import { CreateInterest } from "@/app/_actions/InterestAction";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { PlusIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
const formSchema = z.object({
  name: z.string().max(50, { message: "Name must be less than 50 characters" }),
});

const interestFormSchema = z.object({
  name: z.string().max(50, { message: "Name must be less than 50 characters" }),
});

const Navbar = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });
  const interestForm = useForm<z.infer<typeof interestFormSchema>>({
    resolver: zodResolver(interestFormSchema),
    defaultValues: {
      name: "",
    },
  });
  const pathName = usePathname();
  const { authenticated, user, setUser, setIsAuthenticated } = useContextHook();
  const { toast } = useToast();

  const createSkill = async (name: string) => {
    try {
      const newSkill = await CreateSkill(name);
      toast({
        title: "New Skill Created",
        description: `${newSkill?.name} Created Successfully`,
      });
    } catch (error) {
      console.log("Error of: ", error);
      toast({
        title: "Failed To Created",
        description: `Got an error while creating Skill ${error}`,
      });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    createSkill(values.name);
  }

  function onInterestSubmit(values: z.infer<typeof formSchema>) {
    createInterest(values.name);
  }

  const createInterest = async (name: string) => {
    try {
      const newInterest = await CreateInterest(name);
      toast({
        title: "New Interest Created",
        description: `${newInterest?.name} Created Successfully`,
      });
    } catch (error) {
      console.log("Error of: ", error);
      toast({
        title: "Failed To Created",
        description: `Got an error while creating Interest ${error}`,
      });
    }
  };
  return (
    <nav className="flex   justify-between items-center  w-full">
      <Link href={"/"}>
        <h1 className="text-primary dark:text-primary-foreground text-4xl font-bold">
          Alpha
        </h1>
      </Link>

      {!authenticated ? (
        <div className="flex gap-4 items-center">
          <Link href={"/login"}>
            {" "}
            <Button className="px-12 py-6 rounded-full" variant={"default"}>
              <span className="text-lg font-semibold ">Mentor</span>
            </Button>
          </Link>
          <Link href={"/login"}>
            {" "}
            <Button className="px-12 py-6 rounded-full bg-slate-100 hover:bg-slate-200 text-black ">
              <span className="text-lg font-semibold ">Mentee</span>
            </Button>
          </Link>{" "}
        </div>
      ) : (
        <div className="flex gap-7 items-center mr-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="px-12 py-6 rounded-full" variant={"default"}>
                <span className="text-lg font-semibold">Profile</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="font-bold text-lg">
                Hi, {user?.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={"/profile"}>
                <DropdownMenuItem
                  className={`cursor-pointer rounded ${
                    pathName.includes("/profile") && "underline"
                  } `}
                >
                  <span> Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href={"/home"}>
                <DropdownMenuItem
                  className={`cursor-pointer rounded ${
                    pathName.includes("/home") && "underline"
                  } `}
                >
                  <span> Home</span>
                </DropdownMenuItem>
              </Link>

              <Link href={"/profile/update"}>
                <DropdownMenuItem
                  className={`cursor-pointer rounded ${
                    pathName.includes("/profile/update") && "underline"
                  } `}
                >
                  <span>Update</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className={`cursor-pointer rounded  `}
                onClick={() => {
                  localStorage.removeItem("token");
                  setIsAuthenticated(false);
                  setUser(null);
                  window.location.href = "/login";
                }}
              >
                <span> Logout</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className={`cursor-pointer rounded  `}
                onClick={() => {}}
              >
                <span> Create Interest</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger className="flex gap-2 items-center" asChild>
              <Button
                variant={"secondary"}
                className="flex gap-3 py-2 px-5 items-center "
              >
                <span>Create Skill</span>
                <PlusIcon />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle></DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Python" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>

              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger className="flex gap-2 items-center" asChild>
              <Button
                variant={"secondary"}
                className="flex gap-3 py-2 px-5 items-center "
              >
                <span>Create Interest</span>
                <PlusIcon />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  <span>Interest</span>
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onInterestSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest</FormLabel>
                        <FormControl>
                          <Input placeholder="Machine Learning" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Submit</Button>
                </form>
              </Form>

              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
