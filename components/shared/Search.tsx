"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { GetSkills } from "@/app/_actions/SkillAction";
import { GetInterests } from "@/app/_actions/InterestAction";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { SearchCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  searchQuery: z.string().optional(),
  role: z.enum(["MENTOR", "MENTEE"]),
  skillsFilter: z.array(z.number()),
  interestsFilter: z.array(z.number()),
});
type Skill = {
  id: number;
  name: string;
};

type Interest = {
  id: number;
  name: string;
};
const Search = () => {
  const [skillLoading, setSkillLoading] = useState(false);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [interests, setInterests] = useState<Interest[] | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchSkills = async () => {
      setSkillLoading(true);
      const skillsOrNull = await GetSkills();
      setSkills(skillsOrNull);
      setSkillLoading(false);
    };

    const fetchInterests = async () => {
      setInterestsLoading(true);
      const interestsOrNull = await GetInterests();
      setInterests(interestsOrNull);
      setInterestsLoading(false);
    };
    fetchSkills();
    fetchInterests();
  }, []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "MENTEE",
      skillsFilter: [],
      interestsFilter: [],
      searchQuery: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Create a URLSearchParams object to properly encode parameters
    const params = new URLSearchParams();

    // Add non-empty parameters
    if (values.searchQuery) {
      params.append("searchQuery", values?.searchQuery);
    }

    if (values.skillsFilter && values.skillsFilter?.length > 0) {
      params.append("skillsFilter", values.skillsFilter.join(","));
    }

    if (values.interestsFilter && values.interestsFilter.length > 0) {
      params.append("interestsFilter", values.interestsFilter.join(","));
    }

    // Add role parameter
    params.append("role", values.role);

    // Navigate to the search page with parameters
    router.push(`/search/?${params.toString()}`);
  }
  return (
    <div className="flex my-6 items-center bg-white  justify-around w-full rounded-full px-4  shadow-sm shadow-purple-400">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex items-center w-full justify-around gap-7 flex-1 py-2"
        >
          <FormField
            control={form.control}
            name="searchQuery"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Search"
                    className="
            h-full px-5 py-3 border-b-2 border-transparent 
            focus:border-primary hover:border-primary 
            focus-visible:outline-none focus-visible:ring-0 
          "
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
              <FormItem className=" flex-[0.2] ">
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="h-full focus-visible:ring-0 focus-visible:outline-none outline-none ">
                      <SelectItem className="cursor-pointer" value="MENTOR">
                        Mentor
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="MENTEE">
                        Mentee
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skillsFilter"
            render={({ field }) => (
              <FormItem className="flex-[0.4] ">
                <FormControl>
                  <Select>
                    <SelectTrigger>Select Skills</SelectTrigger>
                    <SelectContent>
                      {!skillLoading ? (
                        <div className="flex flex-col gap-2 p-4 ">
                          {skills &&
                            skills.length > 0 &&
                            skills.map((skill, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 rounded-md p-2"
                              >
                                <Checkbox
                                  className="w-8 h-8 rounded"
                                  checked={field.value.includes(skill.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...field.value,
                                        skill.id,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (id) => id !== skill.id
                                        )
                                      );
                                    }
                                  }}
                                />
                                <span className="text-lg font-medium">
                                  {skill.name}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 p-4 ">
                          <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 rounded-md p-2 flex-col">
                            <Skeleton className="w-full py-4" />
                            <Skeleton className="w-full py-4" />
                          </div>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interestsFilter"
            render={({ field }) => (
              <FormItem className="flex-[0.4] ">
                <FormControl>
                  <Select>
                    <SelectTrigger>Select Interests</SelectTrigger>
                    <SelectContent>
                      {!interestsLoading ? (
                        <div className="flex flex-col gap-2 p-4 ">
                          {interests &&
                            interests.length > 0 &&
                            interests.map((interest, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 rounded-md p-2"
                              >
                                <Checkbox
                                  className="w-8 h-8 rounded"
                                  checked={field.value.includes(interest.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([
                                        ...field.value,
                                        interest.id,
                                      ]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          (id) => id !== interest.id
                                        )
                                      );
                                    }
                                  }}
                                />
                                <span className="text-lg font-medium">
                                  {interest.name}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 p-4 ">
                          <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-100 rounded-md p-2 flex-col">
                            <Skeleton className="w-full py-4" />
                            <Skeleton className="w-full py-4" />
                          </div>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant={"default"}>
            <SearchCheckIcon size={20} />
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Search;
