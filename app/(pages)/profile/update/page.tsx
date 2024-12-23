"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useContextHook } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { GetSkills, GetSkillByUserId } from "@/app/_actions/SkillAction";
import {
  GetInterests,
  GetInterestByUserId,
} from "@/app/_actions/InterestAction";
import { UpdateUser } from "@/app/_actions/UserAction";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

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
  bio: z.string().optional(),
  skills: z.array(z.string()).nonempty({ message: "At least Select 1 Skill" }), // Changed to string array
  interests: z
    .array(z.string())
    .nonempty({ message: "At least Select 1 Interest" }), // Changed to string array
});

const UpdateProfileForm = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<Skill[] | null>(null);
  const [availableInterests, setAvailableInterests] = useState<
    Interest[] | null
  >(null);
  const [userSkills, setUserSkills] = useState<Skill[] | null>(null);
  const [userInterests, setUserInterests] = useState<Interest[] | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const { user, setUser, authenticated } = useContextHook();

  useEffect(() => {
    if (!authenticated) {
      router.push("/login");
    }
  }, [authenticated, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      skills: [],
      interests: [],
    },
  });

  // Add early return for unauthenticated state
  if (!authenticated) {
    return null; // Return null initially to prevent flash of content
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  useEffect(() => {
    const fetchAvailableData = async () => {
      try {
        const [skillsData, interestsData] = await Promise.all([
          GetSkills(),
          GetInterests(),
        ]);

        setAvailableSkills(skillsData);
        setAvailableInterests(interestsData);
      } catch (error) {
        toast({
          title: "Error loading available options",
          description: "Failed to load skills and interests",
          variant: "destructive",
        });
      }
    };

    fetchAvailableData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const [userSkillsData, userInterestsData] = await Promise.all([
          GetSkillByUserId(user.id),
          GetInterestByUserId(user.id),
        ]);

        setUserSkills(userSkillsData);
        setUserInterests(userInterestsData);

        // Convert number IDs to strings for the form
        form.reset({
          name: user.name || "",
          bio: user.bio || "",
          skills: userSkillsData?.map((skill) => skill.id.toString()) || [],
          interests:
            userInterestsData?.map((interest) => interest.id.toString()) || [],
        });
      } catch (error) {
        toast({
          title: "Error loading user data",
          description: "Failed to load your skills and interests",
          variant: "destructive",
        });
      } finally {
        setPageLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) return;

    try {
      // Convert string IDs back to numbers for the API
      const result = await UpdateUser(user.id, {
        name: values.name,
        bio: values.bio,
        skills: values.skills.map(Number),
        interests: values.interests.map(Number),
      });

      if (result) {
        setUser(result.user);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated",
        });
        router.push("/profile");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  if (!user?.id) {
    return (
      <div className="flex items-center justify-center p-8">
        Please login to update your profile
      </div>
    );
  }
  return (
    <div className="w-[90%] mx-auto p-6 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-6 ">Update Profile</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-[80%] mx-auto"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="skills"
            render={() => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {availableSkills?.map((skill) => (
                      <FormField
                        key={skill.id}
                        control={form.control}
                        name="skills"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={skill.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    skill.id.toString()
                                  )}
                                  onCheckedChange={(checked) => {
                                    const value = skill.id.toString();
                                    return checked
                                      ? field.onChange([...field.value, value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (val) => val !== value
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {skill.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interests"
            render={() => (
              <FormItem>
                <FormLabel>Interests</FormLabel>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {availableInterests?.map((interest) => (
                      <FormField
                        key={interest.id}
                        control={form.control}
                        name="interests"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={interest.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    interest.id.toString()
                                  )}
                                  onCheckedChange={(checked) => {
                                    const value = interest.id.toString();
                                    return checked
                                      ? field.onChange([...field.value, value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (val) => val !== value
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {interest.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="px-5 py-6">
            <span className="text-base font-semibold"> Update Profile</span>
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UpdateProfileForm;
