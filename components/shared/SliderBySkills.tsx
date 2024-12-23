import React, { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../ui/card";
import { GetUsersBySkills } from "@/app/_actions/UserAction";
import { User } from "@prisma/client";
import { GetSkillByUserId, SkillType } from "@/app/_actions/SkillAction";
import { SentRequests } from "@/app/_actions/SentRequestAction";
import { useContextHook } from "@/context/UserContext";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const SliderBySkillsInterests = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const { authenticated, user } = useContextHook();
  const [skillsId, setSkillsId] = useState<SkillType[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Send request logic
  const SendRequestForMentorship = async (
    currentUserId: number,
    targetUserId: number,
    targetUserRole: string // Add role as a parameter
  ) => {
    try {
      if (
        (user &&
          user.role &&
          user.role === "MENTOR" &&
          targetUserRole === "MENTOR") ||
        (user &&
          user.role &&
          user.role === "MENTEE" &&
          targetUserRole === "MENTOR")
      ) {
        // Send request only if the current user is a MENTOR and the target is a MENTOR
        // Or if the current user is a MENTEE and the target is a MENTOR
        const response = await SentRequests(currentUserId, targetUserId);
        toast({
          title: "Request Was Sent",
          description: `Your Response is still ${response.status}`,
        });
      } else {
        console.error("Cannot send request: Invalid role combination.");
      }
    } catch (error) {
      console.error("Error sending mentorship request:", error);
    }
  };

  const getSkillBasedOnCurrentUser = async () => {
    if (authenticated && user) {
      const data = await GetSkillByUserId(user.id);
      if (data) {
        setSkillsId(data); // Store the skills of the current user
      }
    }
  };

  useEffect(() => {
    getSkillBasedOnCurrentUser();
  }, [user]); // Run when the user changes

  const getUsersWithSameSkills = async () => {
    if (skillsId && skillsId.length > 0) {
      try {
        setLoading(true);
        const skillIds = skillsId.map((skill) => skill.id);

        // Fetch the skills with users
        const skillsWithUsers = await GetUsersBySkills(skillIds);

        if (skillsWithUsers) {
          // Flatten the list of users from all skills
          const allUsers = skillsWithUsers.flatMap(
            (skill) => skill.users.map((userSkill) => userSkill.user) // Access the 'user' field, now it's the full user object
          );

          // Set the users state
          setUsers(allUsers); // Now `setUsers` gets an array of User objects
        }
      } catch (error) {
        console.error("Error fetching users with the same skills:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getUsersWithSameSkills();
  }, [skillsId]);

  return (
    <div className="flex flex-col items-start gap-5 w-full py-4">
      <h1 className="text-xl font-semibold">Skills</h1>
      {loading ? (
        <div className="w-full my-2 flex gap-3">
          <Skeleton className="w-[300px] h-[200px]" />{" "}
          <Skeleton className="w-[300px] h-[200px]" />{" "}
          <Skeleton className="w-[300px] h-[200px]" />{" "}
          <Skeleton className="w-[300px] h-[200px]" />{" "}
        </div>
      ) : users.length > 0 ? (
        <div className="w-full my-2">
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {users
                .filter((userFromArray) => userFromArray.id !== user?.id) // Exclude current user
                .filter(
                  (value, index, self) =>
                    index === self.findIndex((t) => t.id === value.id)
                )
                .map((userFromArray, i) => {
                  return (
                    <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                      <Card className="flex flex-col items-start gap-1 p-3">
                        <CardTitle className="text-2xl font-bold">
                          {userFromArray.name}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {userFromArray.email}
                        </CardDescription>
                        <CardContent className="text-start p-0 py-2 flex flex-col items-start">
                          {userFromArray.bio && (
                            <p className="text-base">{userFromArray.bio}</p>
                          )}
                        </CardContent>
                        {userFromArray.id !== user?.id &&
                          user &&
                          user.role === "MENTEE" &&
                          userFromArray.role === "MENTOR" && (
                            <Button
                              onClick={() =>
                                SendRequestForMentorship(
                                  user.id,
                                  userFromArray.id,
                                  userFromArray.role
                                )
                              }
                              className="px-3 py-1 rounded mt-2"
                            >
                              Send Mentorship Request
                            </Button>
                          )}
                        {userFromArray.id !== user?.id &&
                          user &&
                          user.role === "MENTOR" &&
                          userFromArray.role === "MENTOR" && (
                            <Button
                              onClick={() =>
                                SendRequestForMentorship(
                                  user.id,
                                  userFromArray.id,
                                  userFromArray.role
                                )
                              }
                              className="px-3 py-1 rounded mt-2"
                            >
                              Send Collaboration Request
                            </Button>
                          )}
                      </Card>
                    </CarouselItem>
                  );
                })}
            </CarouselContent>
            {users.length > 0 && (
              <>
                <CarouselPrevious className="cursor-pointer" />
                <CarouselNext className="cursor-pointer" />
              </>
            )}
          </Carousel>
        </div>
      ) : (
        <h1 className="text-xl font-semibold">
          No User With Same Skill As you Avaiable
        </h1>
      )}
    </div>
  );
};

export default SliderBySkillsInterests;
