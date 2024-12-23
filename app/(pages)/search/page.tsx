"use client";
import {
  GetInterestByUserId,
  InterestType,
} from "@/app/_actions/InterestAction";
import { SentRequests } from "@/app/_actions/SentRequestAction";
import { GetSkillByUserId, SkillType } from "@/app/_actions/SkillAction";
import { GetUsers } from "@/app/_actions/UserAction";
import Search from "@/components/shared/Search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContextHook } from "@/context/UserContext";
import { UserRole } from "@/lib/types";
import { User } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

const SearchPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { authenticated, user } = useContextHook();
  const [userSkills, setUserSkills] = useState<Record<number, SkillType[]>>({});
  const [userInterests, setUserInterests] = useState<
    Record<number, InterestType[]>
  >({});
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("searchQuery") || "";
  const skillsFilter: number[] = searchParams.get("skillsFilter")
    ? searchParams.get("skillsFilter")!.split(",").map(Number)
    : [];
  const interestsFilter: number[] = searchParams.get("interestsFilter")
    ? searchParams.get("interestsFilter")!.split(",").map(Number)
    : [];
  const roleParam = searchParams.get("role") || "";
  const role: UserRole | undefined =
    roleParam === UserRole.MENTOR || roleParam === UserRole.MENTEE
      ? (roleParam as UserRole)
      : undefined;

  const getUsers = async () => {
    try {
      const { users } = await GetUsers(
        searchQuery,
        skillsFilter,
        interestsFilter,
        "name",
        "asc",
        1,
        10,
        role
      );
      setUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getUsers();
  }, [searchQuery, skillsFilter, interestsFilter, role]);

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
        console.log("Request Sent:", response);
      } else {
        console.error("Cannot send request: Invalid role combination.");
      }
    } catch (error) {
      console.error("Error sending mentorship request:", error);
    }
  };

  // Fetch skills and interests in parallel
  const fetchUserDetails = async () => {
    try {
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
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      fetchUserDetails();
    }
    setLoading(false);
  }, [users]);
  useEffect(() => {
    if (!authenticated && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [authenticated]);


  return (
    <main className="flex flex-col items-center w-full min-h-screen justify-start">
      <Search />
      <Suspense
        fallback={<Skeleton className="w-full h-[100px] bg-gray-300" />}
      >
        <div className="flex flex-col w-full gap-3 items-start justify-normal my-5">
          <h1 className="text-lg font-semibold">Searched Data</h1>
          {!loading ? (
            <div className="grid grid-cols-1 w-full py-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {users.length > 0 &&
                users.map((userFromArray) => {
                  return (
                    <Card
                      key={userFromArray.id}
                      className="flex flex-col items-start gap-1 p-5"
                    >
                      <CardTitle className="text-2xl font-bold">
                        {userFromArray.name}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {userFromArray.email}
                      </CardDescription>
                      <CardContent className="text-start p-0 py-1 flex flex-col items-start">
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
                              className="text-xs font-normal cursor-pointer"
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
                              className="text-xs font-normal cursor-pointer"
                            >
                              {interest.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      {userFromArray.id !== user?.id &&
                        user &&
                        user.role &&
                        user.role === "MENTEE" && (
                          <Button
                            onClick={
                              () =>
                                SendRequestForMentorship(
                                  user.id,
                                  user.id,
                                  user.role
                                ) // Pass the role of the target user
                            }
                            className=" px-3 py-1 rounded mt-2"
                          >
                            Send Mentorship Request
                          </Button>
                        )}
                      {userFromArray.id !== user?.id &&
                        user &&
                        user.role &&
                        user.role === "MENTOR" && (
                          <Button
                            onClick={() =>
                              SendRequestForMentorship(
                                user.id,
                                user.id,
                                user.role
                              )
                            }
                            className=" px-3 py-1 rounded mt-2"
                          >
                            Send Collaboration Request
                          </Button>
                        )}
                    </Card>
                  );
                })}
              {users.length === 0 && (
                <div className="flex">
                  <h4>No Items Available</h4>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 w-full py-4 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="w-[200px] bg-slate-800/50 h-[100px] rounded-md" />
              <Skeleton className="w-[200px] bg-slate-800/50 h-[100px] rounded-md" />
              <Skeleton className="w-[200px] bg-slate-800/50 h-[100px] rounded-md" />
              <Skeleton className="w-[200px] bg-slate-800/50 h-[100px] rounded-md" />
            </div>
          )}
        </div>
      </Suspense>
    </main>
  );
};

export default SearchPage;
