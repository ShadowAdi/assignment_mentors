"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";
import { LoginUser } from "@/app/_actions/UserAction";
import { useContextHook } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(3, { message: "Password Should Be More than 3" }),
});
const Login = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { setUser, setIsAuthenticated, authenticated } = useContextHook();

  if (authenticated) {
    window.location.href = "/home";
  }

  const loginUser = async (email: string, password: string) => {
    const { success, User, message, token } = await LoginUser(email, password);
    if (!success) {
      toast({
        title: "Error in Logging In",
        description: message,
      });
    } else {
      if (token) {
        toast({
          title: "User Logged In",
        });
        const getOldToken = localStorage.getItem("token");
        if (getOldToken) {
          localStorage.removeItem("token");
        }
        if (token) {
          localStorage.setItem("token", token);
        }
        if (User) {
          setIsAuthenticated(true);
          setUser(User);
          router.push("/home");
        }
      }
    }
  };

  useEffect(() => {
    setPageLoading(false);
  }, []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    loginUser(values.email, values.password);
  }
  return (
    <section className="flex flex-col gap-8 items-center w-screen h-screen justify-center">
      <h1 className="text-4xl font-bold ">Login</h1>

      {!pageLoading ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 w-[60%] mb-7 "
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      className="px-3 py-4 w-full   border-black"
                      placeholder="shadowshukla76@gmail.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display Email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Passwrod</FormLabel>
                  <FormControl>
                    <Input
                      className="px-3 py-4 w-full   border-black"
                      placeholder="***"
                      type="password"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="rounded-full px-9 py-4 " type="submit">
              <span className="text-lg font-semibold">Submit</span>
            </Button>
          </form>
        </Form>
      ) : (
        <div className="items-center  flex flex-col justify-center w-2/3">
          <Skeleton className="w-full bg-slate-800/50 h-[100px] my-3" />
          <Skeleton className="w-full bg-slate-800/50 h-[100px] my-3" />
        </div>
      )}
      <div className="flex gap-2 items-end ">
        <span className=" text-lg">Don{"'"}t Have an Account?</span>
        <Link href={"/register"} className="text-primary text-lg underline">
          Register
        </Link>
      </div>
    </section>
  );
};

export default Login;
