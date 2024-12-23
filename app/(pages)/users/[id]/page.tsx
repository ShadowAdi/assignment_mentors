"use client";
import { GetInterestByUserId } from "@/app/_actions/InterestAction";
import { SentRequests } from "@/app/_actions/SentRequestAction";
import { GetSkillByUserId } from "@/app/_actions/SkillAction";
import {
  GetMenteeBasedOnUser,
  GetMentorsBasedOnUser,
  GetUser,
} from "@/app/_actions/UserAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContextHook } from "@/context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { MentorshipConnection, User } from "@prisma/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
type SkillType = {
  id: number;
  name: string;
};

type InterestsType = {
  id: number;
  name: string;
};
const UserPage = () => {
  const [getUser, setGetUser] = useState<User | null>(null);
  const { user, authenticated } = useContextHook();
  const { id } = useParams();
  const [userSkills, setUserSkills] = useState<SkillType[]>([]);
  const [userInterests, setUserInterests] = useState<InterestsType[]>([]);
  const [userMentors, setUserMentors] = useState<
    (MentorshipConnection & User)[]
  >([]);
  const [userMentees, setUserMentees] = useState<
    (MentorshipConnection & User)[]
  >([]);
  const { toast } = useToast();
  const GetUserProfile = async (userId: number) => {
    try {
      const data = await GetUser(userId);
      if (data) {
        setGetUser(data);
      }
    } catch (error) {
      console.log("Error: ", error);
      setGetUser(null);
    }
  };

  const GetUserSkills = async (userId: number) => {
    try {
      const userSkills = await GetSkillByUserId(userId);
      if (userSkills) {
        setUserSkills(userSkills);
      }
    } catch (error) {
      setUserSkills([]);
    }
  };

  const GetUserInterests = async (userId: number) => {
    try {
      const userInterests = await GetInterestByUserId(userId);
      if (userInterests) {
        setUserInterests(userInterests);
      }
    } catch (error) {
      setUserInterests([]);
    }
  };

  const GetMentorshipsProfile = async (userId: number) => {
    const data = await GetMentorsBasedOnUser(userId);
    const transformedData = data.map((connection) => ({
      ...connection,
      ...connection.mentor, // Spread mentor details
    }));
    setUserMentors(transformedData);
  };

  const GetMenteesProfile = async (userId: number) => {
    const data = await GetMenteeBasedOnUser(userId);
    const transformedData = data.map((connection) => ({
      ...connection,
      ...connection.mentee, // Spread mentee details
    }));
    setUserMentees(transformedData);
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

  useEffect(() => {
    if (id) {
      GetUserProfile(Number(id));
      GetUserSkills(Number(id));
      GetUserInterests(Number(id));
      GetMenteesProfile(Number(id));
      GetMentorshipsProfile(Number(id));
    }
  }, [id]);

  const isAlreadyConnected = () => {
    if (!user || !getUser) return false;

    // For a mentee viewing a mentor's profile
    if (user.role === "MENTEE" && getUser.role === "MENTOR") {
      return userMentees.some(
        (connection) =>
          connection.mentorId === getUser.id && connection.menteeId === user.id
      );
    }
    return false;
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen   gap-5   justify-start">
      <div className="flex flex-col gap-3 my-5">
        <h3 className="text-lg font-semibold ">Name: {getUser?.name}</h3>
        <h3 className="text-lg font-semibold ">Email: {getUser?.email}</h3>
        <p className="text-base ">{getUser?.bio}</p>
        <Badge className="w-auto py-2 cursor-pointer flex items-center justify-center">
          <span className="text-lg font-medium capitalize">
            Role: {getUser?.role}
          </span>
        </Badge>
        {user &&
          user.role === "MENTEE" &&
          getUser &&
          getUser.role === "MENTOR" && (
            <Button
              onClick={() =>
                SendRequestForMentorship(
                  user.id, // currentUserId
                  getUser.id, // targetUserId
                  getUser.role // targetUserRole
                )
              }
              className="w-auto py-2 cursor-pointer flex items-center justify-center"
              disabled={isAlreadyConnected()}
            >
              <span className="text-lg font-medium capitalize">
                {isAlreadyConnected()
                  ? "Already a Connection"
                  : "Send Mentorship Request"}
              </span>
            </Button>
          )}
      </div>
      <div className="flex my-5  items-center justify-center gap-7 w-[50%] ">
        {getUser && getUser?.role === "MENTEE" && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex flex-col cursor-pointer gap-1 items-center">
                <h1 className="text-primary text-xl font-bold ">Mentors</h1>
                <h4 className="text-purple-500 text-lg font-bold">
                  {userMentors.length}
                </h4>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mentors</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col  gap-3 items-center ">
                {userMentors?.map((userMents, i) => {
                  return (
                    <Link
                      href={`/profile/`}
                      key={i}
                      className="w-full bg-slate-300/60 p-3 rounded-sm"
                    >
                      <div className="flex gap-3 items-center w-full justify-between">
                        <div className="flex flex-col  items-start">
                          <span className="text-lg font-medium">
                            {userMents.name}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {userMents.email}
                          </span>
                        </div>
                        <Badge>{userMents?.role}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {getUser && getUser?.role === "MENTOR" && (
          <Dialog>
            <DialogTrigger asChild>
              <div className="flex flex-col cursor-pointer gap-1 items-center">
                <h1 className="text-primary text-xl font-bold ">Mentees</h1>
                <h4 className="text-purple-500 text-lg font-bold">
                  {userMentees.length}
                </h4>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mentees</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col  gap-3 items-center ">
                {userMentees?.map((userMents, i) => {
                  return (
                    <Link
                      href={`/profile/`}
                      key={i}
                      className="w-full bg-slate-300/60 p-3 rounded-sm"
                    >
                      <div className="flex gap-3 items-center w-full justify-between">
                        <div className="flex flex-col  items-start">
                          <span className="text-lg font-medium">
                            {userMents.name}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">
                            {userMents.email}
                          </span>
                        </div>
                        <Badge>{userMents.role}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Tabs
        defaultValue="skills"
        className="w-[80%] flex items-center my-5 flex-col justify-center mx-auto rounded-sm"
      >
        <TabsList className="mb-3 flex w-full">
          <TabsTrigger className="flex-1" value="skills">
            Skills
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex-1">
            Interests
          </TabsTrigger>
        </TabsList>
        <TabsContent className="flex  gap-3 items-start mt-2 " value="skills">
          {userSkills &&
            userSkills.map((userSkill, i) => {
              return (
                <Badge
                  className="px-4 py-3 rounded-full cursor-pointer hover:bg-purple-900"
                  key={i}
                >
                  <span className="text-base font-medium ">
                    {userSkill.name}
                  </span>
                </Badge>
              );
            })}
        </TabsContent>

        <TabsContent className="flex  gap-3 items-start mt-2" value="interests">
          {userInterests &&
            userInterests.map((userInterest, i) => {
              return (
                <Badge
                  className="px-4 py-3 rounded-full cursor-pointer hover:bg-purple-900"
                  key={i}
                >
                  <span className="text-base font-medium ">
                    {userInterest.name}
                  </span>
                </Badge>
              );
            })}
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default UserPage;
