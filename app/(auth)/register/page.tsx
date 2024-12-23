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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { GetSkills } from "@/app/_actions/SkillAction";
import { GetInterests } from "@/app/_actions/InterestAction";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterUser } from "@/app/_actions/UserAction";
import { UserRole } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useContextHook } from "@/context/UserContext";

type Skill = {
  id: number;
  name: string;
};

type Interest = {
  id: number;
  name: string;
};

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email({ message: "Email Is Required" }),
  password: z.string().min(3, { message: "Password Should Be More than 3" }),
  bio: z.string().optional(),
  skills: z.array(z.number()).nonempty({ message: "Atleast Select 1 Skill" }),
  interests: z
    .array(z.number())
    .nonempty({ message: "Atleast Select 1 Interest" }),
  role: z.enum(["MENTOR", "MENTEE"]),
});

const Register = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [skillLoading, setSkillLoading] = useState(false);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [interests, setInterests] = useState<Interest[] | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const {authenticated}=useContextHook()

  if (authenticated) {
    window.location.href="/home"
  }

  const CreateUser = async (
    email: string,
    interests: number[],
    skills: number[],
    name: string,
    password: string,
    role: UserRole,
    bio?: string
  ) => {
    const user = await RegisterUser({
      email: email,
      interests: interests,
      skills: skills,
      bio: bio,
      name: name,
      password: password,
      role: role,
    });

    if (user === null) {
      toast({
        title: "Error Creating User",
        description: "Check Console To See Error",
        variant: "destructive",
      });
    }
    toast({
      title: "User Created",
    });
    router.push("/login");
  };

  useEffect(() => {
    const fetchSkills = async () => {
      setSkillLoading(true);
      const skillsOrNull = await GetSkills();
      setSkills(skillsOrNull);
      setSkillLoading(false);
    };

    const fetchInterests = async () => {
      setInterestsLoading(true);
      const interestOrNull = await GetInterests();
      setInterests(interestOrNull);
      setInterestsLoading(false);
    };
    setPageLoading(false);
    fetchSkills();
    fetchInterests();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      bio: "",
      role: "MENTEE",
      skills: [],
      interests: [],
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    CreateUser(
      values.email,
      values.interests,
      values.skills,
      values.name,
      values.password,
      values.role as UserRole,
      values.bio
    );
  }
  return (
    <section className="flex flex-col gap-8 pb-5 my-6 items-center w-screen h-auto justify-center">
      <h1 className="text-4xl font-bold mb-2">Register</h1>
      {!pageLoading ? (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-[60%] mb-7 "
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="px-3 py-4 w-full   border-black"
                      placeholder="Aditya"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="px-5 py-2 w-full  border-black"
                      placeholder="Good Bio"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
              
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="w-full ">
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MENTOR">Mentor</SelectItem>
                        <SelectItem value="MENTEE">Mentee</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>This is your public Role.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!skillLoading ? (
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <FormLabel>Skills</FormLabel>
                    <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-2 mt-4">
                      {skills &&
                        skills.length > 0 &&
                        skills.map((skill, i) => (
                          <div
                            key={skill.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={field.value.includes(skill.id)} // Check by ID
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, skill.id]); // Add skill ID
                                } else {
                                  field.onChange(
                                    field.value.filter((id) => id !== skill.id) // Remove skill ID
                                  );
                                }
                              }}
                            />
                            <span>{skill.name}</span>
                          </div>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="flex gap-5  items-center">
                <Skeleton className="w-[60px] bg-slate-400  h-[40px]" />
                <Skeleton className="w-[60px] bg-slate-400   h-[40px]" />
              </div>
            )}

            {!interestsLoading ? (
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <FormLabel>Interests</FormLabel>
                    <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-2 mt-4">
                      {interests &&
                        interests.length > 0 &&
                        interests.map((interest) => (
                          <div
                            key={interest.id}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              checked={field.value.includes(interest.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, interest.id]);
                                } else {
                                  field.onChange(
                                    field.value.filter((s) => s !== interest.id)
                                  );
                                }
                              }}
                            />
                            <span>{interest.name}</span>
                          </div>
                        ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="flex gap-5  items-center">
                <Skeleton className="w-[60px] bg-slate-400  h-[40px]" />
                <Skeleton className="w-[60px] bg-slate-400   h-[40px]" />
              </div>
            )}
            <Button className="rounded-full px-9 py-4 " type="submit">
              <span className="text-lg font-semibold">Submit</span>
            </Button>
          </form>
        </Form>
      ) : (
        <div className="items-center  flex flex-col justify-center w-2/3">
          <Skeleton className="w-full bg-slate-800/50 h-[100px] my-3" />
          <Skeleton className="w-full bg-slate-800/50 h-[100px] my-3" />
          <Skeleton className="w-full bg-slate-800/50 h-[100px] my-3" />
          <Skeleton className="w-full bg-slate-800/50 h-[100px] my-3" />
          <Skeleton className="w-full bg-slate-800/50 h-[100px] my-3" />
        </div>
      )}
      <div className="flex gap-2 items-end ">
        <span className=" text-lg">Already Have an Account?</span>
        <Link href={"/login"} className="text-primary text-lg underline">
          Login
        </Link>
      </div>
    </section>
  );
};

export default Register;
