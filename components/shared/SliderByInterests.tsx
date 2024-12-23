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
import { GetUsersByInterests } from "@/app/_actions/UserAction";
import { SkillType } from "@/app/_actions/SkillAction";
import { Badge } from "../ui/badge";
import {
  GetInterestByUserId,
  InterestType,
} from "@/app/_actions/InterestAction";
import { SentRequests } from "@/app/_actions/SentRequestAction";
import { useContextHook } from "@/context/UserContext";
import { Button } from "../ui/button";
import { User } from "@prisma/client";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const SliderByInterests = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const { authenticated, user } = useContextHook();
  const [interestsId, setInterestId] = useState<InterestType[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Send request logic
  const SendRequestForMentorship = async (
    currentUserId: number,
    targetUserId: number,
    targetUserRole: string
  ) => {
    try {
      setLoading(true);
      if (
        (user && user.role === "MENTOR" && targetUserRole === "MENTOR") ||
        (user && user.role === "MENTEE" && targetUserRole === "MENTOR")
      ) {
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
    } finally {
      setLoading(false);
    }
  };

  const getInterestBasedOnCurrentUser = async () => {
    if (authenticated && user) {
      const data = await GetInterestByUserId(user.id);
      if (data) {
        setInterestId(data); // Store the interests of the current user
      }
    }
  };

  useEffect(() => {
    getInterestBasedOnCurrentUser();
  }, [user]);

  const getUsersWithSameInterests = async () => {
    if (interestsId && interestsId.length > 0) {
      setLoading(true);
      try {
        const interestIds = interestsId.map((interest) => interest.id);

        // Fetch the users based on interests
        const usersWithSameInterests = await GetUsersByInterests(interestIds);

        if (usersWithSameInterests) {
          // Flatten users and remove duplicates based on user ID
          const allUsers = usersWithSameInterests.flatMap((interest) =>
            interest.users.map((userInterest) => userInterest.user)
          );

          // Remove duplicates based on user ID
          const uniqueUsers = allUsers.filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.id === value.id)
          );

          setUsers(uniqueUsers); // Set users without duplicates
        }
      } catch (error) {
        console.error("Error fetching users with the same interests:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getUsersWithSameInterests();
  }, [interestsId]);

  return (
    <div className="flex flex-col items-start gap-5 w-full py-4">
      <h1 className="text-xl font-semibold">Interests</h1>
      {loading ? (
        <div className="w-full my-2 flex gap-4">
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
          No User With Same Interest As You Available
        </h1>
      )}
    </div>
  );
};

export default SliderByInterests;
