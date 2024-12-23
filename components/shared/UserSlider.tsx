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
import { GetMentees, GetMentors } from "@/app/_actions/UserAction";
import { MentorshipConnection, User } from "@prisma/client";
import { GetSkillByUserId, SkillType } from "@/app/_actions/SkillAction";
import { Badge } from "../ui/badge";
import {
  GetInterestByUserId,
  InterestType,
} from "@/app/_actions/InterestAction";
import { SentRequests } from "@/app/_actions/SentRequestAction";
import { useContextHook } from "@/context/UserContext";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const UserSlider = ({
  type,
  userMentors,
  userMentees,
}: {
  type: string;
  userMentors?: (MentorshipConnection & User)[];
  userMentees?: (MentorshipConnection & User)[];
}) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { authenticated, user } = useContextHook();
  const [userSkills, setUserSkills] = useState<Record<number, SkillType[]>>({});
  const [userInterests, setUserInterests] = useState<
    Record<number, InterestType[]>
  >({});

  // Determine connection status
  const getConnectionStatus = (targetUser: User) => {
    // If user is a MENTOR
    if (user?.role === "MENTOR") {
      // Check if this mentee is already connected
      const isConnected = userMentees?.some(
        (connection) => connection.menteeId === targetUser.id
      );
      return isConnected ? "Connected" : null;
    }

    // If user is a MENTEE
    if (user?.role === "MENTEE") {
      // Check if this mentor is already connected
      const isConnected = userMentors?.some(
        (connection) => connection.mentorId === targetUser.id
      );
      return isConnected ? "Connected" : "Send Request";
    }

    return null;
  };

  // Send request logic
  const SendRequestForMentorship = async (
    currentUserId: number,
    targetUserId: number,
    targetUserRole: string
  ) => {
    try {
      // Only mentees can send requests to mentors
      if (user?.role === "MENTEE" && targetUserRole === "MENTOR") {
        const response = await SentRequests(currentUserId, targetUserId);
        toast({
          title: "Request Was Sent",
          description: `Your Request is ${response.status}`,
        });
      } else {
        toast({
          title: "Invalid Request",
          description: "Only mentees can send requests to mentors.",
          variant: "destructive",
        });
        console.error(
          "Cannot send request: Only mentees can send requests to mentors."
        );
      }
    } catch (error) {
      console.error("Error sending mentorship request:", error);
      toast({
        title: "Request Failed",
        description: "Unable to send mentorship request.",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = type === "MENTOR" ? await GetMentors() : await GetMentees();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch skills and interests in parallel
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const skillsPromises = users.map((user) => GetSkillByUserId(user.id));
      const interestsPromises = users.map((user) =>
        GetInterestByUserId(user.id)
      );

      const skillsResults = await Promise.all(skillsPromises);
      const interestsResults = await Promise.all(interestsPromises);

      const skillsMap: Record<number, SkillType[]> = {};
      const interestsMap: Record<number, InterestType[]> = {};
      users.forEach((user, i) => {
        skillsMap[user.id] = skillsResults[i] || [];
        interestsMap[user.id] = interestsResults[i] || [];
      });

      setUserSkills(skillsMap);
      setUserInterests(interestsMap);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [type]);

  useEffect(() => {
    if (users.length > 0) {
      fetchUserDetails();
    }
  }, [users]);

  return (
    <div className="flex flex-col items-start gap-5 w-full py-4">
      <h1 className="text-xl font-semibold">{type}</h1>
      {loading ? (
        <div className="w-full my-2 flex gap-3">
          <Skeleton className="w-[300px] h-[200px]" />
          <Skeleton className="w-[300px] h-[200px]" />
          <Skeleton className="w-[300px] h-[200px]" />
          <Skeleton className="w-[300px] h-[200px]" />
        </div>
      ) : users.length > 0 ? (
        <div className="w-full my-2">
          <Carousel opts={{ align: "start" }}>
            <CarouselContent>
              {users.map((userFromArray) => {
                const connectionStatus = getConnectionStatus(userFromArray);

                return (
                  <CarouselItem
                    key={userFromArray.id}
                    className="md:basis-1/2 lg:basis-1/3"
                  >
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
                        <h5 className="text-[14px] font-semibold mt-1">
                          Skills
                        </h5>
                        <div className="w-full flex gap-2 flex-wrap">
                          {userSkills[userFromArray.id]?.map((skill) => (
                            <Badge
                              key={skill.id}
                              className="text-xs font-normal"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                        <h5 className="text-[14px] font-semibold mt-1">
                          Interests
                        </h5>
                        <div className="w-full flex gap-2 flex-wrap">
                          {userInterests[userFromArray.id]?.map((interest) => (
                            <Badge
                              key={interest.id}
                              className="text-xs font-normal"
                            >
                              {interest.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      {userFromArray.id !== user?.id &&
                        user &&
                        user.role &&
                        connectionStatus === "Send Request" && (
                          <Button
                            onClick={() =>
                              SendRequestForMentorship(
                                user.id, // currentUserId
                                userFromArray.id, // targetUserId
                                userFromArray.role // targetUserRole
                              )
                            }
                            className="px-3 py-1 rounded mt-2 "
                          >
                            Send Mentorship Request
                          </Button>
                        )}
                      {connectionStatus === "Connected" && (
                        <Button
                        disabled
                        variant={"outline"}
                          className="px-3 py-1 border border-black/20 bg-slate-100
                           text-black 
                          cursor-pointer rounded mt-2 "
                          
                        >
                          Connected
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
        <h1 className="text-xl font-semibold">No {type} Available</h1>
      )}
    </div>
  );
};

export default UserSlider;
