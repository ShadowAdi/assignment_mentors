"use client";
import { GetInterestByUserId } from "@/app/_actions/InterestAction";
import {
  GetNotificationOfUser,
  MarkNotificationAsRead,
} from "@/app/_actions/NotificationAction";
import {
  CancelMentorShipConnection,
  CancelMentorShipConnectionByMentor,
  GetActiveMentorships,
  GetPendingRequests,
  ReceivedRequest,
} from "@/app/_actions/SentRequestAction";
import { GetSkillByUserId } from "@/app/_actions/SkillAction";
import {
  GetMenteeBasedOnUser,
  GetMentorsBasedOnUser,
} from "@/app/_actions/UserAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
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
import { RequestStatus } from "@/lib/types";
import {
  MentorshipConnection,
  MentorshipRequest,
  Notification,
  User,
  UserRole,
} from "@prisma/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
type SkillType = {
  id: number;
  name: string;
};

type InterestsType = {
  id: number;
  name: string;
};

const Profile = () => {
  const { authenticated, user } = useContextHook();

  const [activeConnections, setActiveConnections] = useState<
    (MentorshipConnection & {
      mentor: { id: number; name: string; email: string; role: UserRole };
      mentee: { id: number; name: string; email: string; role: UserRole };
    })[]
  >([]);
  const [notification, setNotification] = useState<Notification[] | null>(null);
  const [userMentors, setUserMentors] = useState<
    (MentorshipConnection & User)[]
  >([]);
  const [userMentees, setUserMentees] = useState<
    (MentorshipConnection & User)[]
  >([]);
  const [pendingConnections, setPendingConnections] = useState<
    (MentorshipRequest & {
      sender: {
        id: number;
        name: string;
        email: string;
      };
    })[]
  >([]);
  const [userSkills, setUserSkills] = useState<SkillType[]>([]);
  const [userInterests, setUserInterests] = useState<InterestsType[]>([]);

  const { toast } = useToast();
  const GetNotifications = async (uderId: number) => {
    const data = await GetNotificationOfUser(uderId);
    setNotification(data);
  };
  const GetPendingRequestsProfile = async (userId: number) => {
    const data = await GetPendingRequests(userId);
    if (!data.success) {
      toast({
        title: "Request to Get Pending Request Failed",
        variant: "destructive",
      });
      setPendingConnections([]);
    }
    setPendingConnections(data.PendingMentorshipsRequests);
  };
  const GetActiveConnections = async (userId: number) => {
    try {
      const data = await GetActiveMentorships(userId);
      if (!data.success) {
        toast({
          title: "Get Error in Active mentorships",
          variant: "destructive",
        });
      }
      setActiveConnections(data.GetActiveMentorships);
    } catch (error) {
      toast({
        title: "Get Error in Active mentorships: " + error,
        variant: "destructive",
      });
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

  useEffect(() => {
    if (user && user.id) {
      GetNotifications(user.id);
      GetPendingRequestsProfile(user.id);
      GetActiveConnections(user.id);

      if (user.role === "MENTEE") {
        GetMentorshipsProfile(user.id);
      } else if (user.role === "MENTOR") {
        GetMenteesProfile(user.id);
      }
    }
  }, [
    user,
    GetNotifications,
    GetPendingRequestsProfile,
    GetActiveConnections,
    GetMentorshipsProfile,
    GetMenteesProfile,
  ]);

  useEffect(() => {
    if (user) {
      if (user.role === "MENTEE") {
        GetMentorshipsProfile(user.id);
      } else if (user.role === "MENTOR") {
        GetMenteesProfile(user.id);
      }
    }
  }, [user]);

  const CancelMentorsipMentee = async (
    senderId: number,
    receiverId: number
  ) => {
    try {
      const { success, message } = await CancelMentorShipConnection(
        senderId,
        receiverId
      );

      if (success) {
        console.log(message); // Replace with UI feedback (e.g., a toast notification)
      } else {
        console.error("Failed to cancel mentorship connection:", message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      // Show error to the user (e.g., toast notification or modal)
    }
  };

  const CancelMentorship = async (senderId: number, receiverId: number) => {
    try {
      const { success, message, connection } =
        await CancelMentorShipConnectionByMentor(senderId, receiverId);

      if (success) {
        toast({
          title: "Mentorship Cancelled",
          description: message,
        });
      } else {
        console.error("Failed to cancel mentorship connection:", message);
        toast({
          title: "Mentorship Cancelled Failed",
          description: message,
        });
      }
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast({
        title: "Mentorship Cancelled Failed",
        description: error.message,
      });
      // Handle error (e.g., show notification)
    }
  };

  const ConnectionRequest = async (
    status: RequestStatus, // Your application's RequestStatus
    senderId: number,
    currentUserId: number
  ) => {
    const { message, success, request } = await ReceivedRequest(
      senderId,
      status, // Cast here
      currentUserId
    );

    if (!success) {
      toast({
        title: "Request Declined",
        description: message,
        variant: "destructive",
      });
    }

    toast({
      title: "Request Sent",
      description: message,
    });

    if (user && user.id) {
      GetPendingRequests(user.id);
    }
  };

  const NotificationRead = async (notificationId: number) => {
    const notified = await MarkNotificationAsRead(notificationId);
    if (user && user.id) {
      GetNotifications(user.id);
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

  useEffect(() => {
    if (user && user.id) {
      GetUserSkills(user.id);
      GetUserInterests(user.id);
    }
  }, [user]);
  if (!authenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null; // Prevent rendering
  }

  return (
    <main className="flex flex-col items-center w-full min-h-screen   gap-5   justify-start">
      <h1 className=" text-xl font-semibold">Your Profile</h1>
      <div className="flex flex-col gap-3 my-5">
        <h3 className="text-lg font-semibold ">Name: {user?.name}</h3>
        <h3 className="text-lg font-semibold ">Email: {user?.email}</h3>
        <p className="text-base ">{user?.bio}</p>
        <Badge className="w-auto py-2 cursor-pointer flex items-center justify-center">
          <span className="text-lg font-medium uppercase">
            Role: {user?.role}
          </span>
        </Badge>
      </div>
      <div className="flex gap-4 my-5  items-center justify-around w-[50%] ">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex flex-col cursor-pointer gap-1 items-center">
              <h1 className="text-primary text-xl font-bold ">Notifications</h1>
              <h4 className="text-purple-500 text-lg font-bold">
                {notification?.length}
              </h4>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Notifications</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col  gap-3 items-start ">
              {notification?.map((notif, i) => {
                return (
                  <div key={i} className="flex gap-3 items-center">
                    <p className="text-sm ">{notif.content}</p>
                    {!notif.isRead && (
                      <Button
                        className="cursor-pointer text-sm font-normal"
                        onClick={() => NotificationRead(notif.id)}
                      >
                        Read
                      </Button>
                    )}
                    {notif.type && (
                      <Badge className="cursor-pointer text-sm  font-normal">
                        {notif.type}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex flex-col cursor-pointer gap-1 items-center">
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
        </div>

        {user && user?.role === "MENTOR" && (
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
      <hr className="border-b w-[80%] border-black" />
      <Tabs
        defaultValue={user && user.role === "MENTOR" ? "pending" : "active"}
        className="w-[80%] flex items-center my-5 flex-col justify-center mx-auto rounded-sm"
      >
        <TabsList className="mb-3 flex w-full">
          {user && user?.role === "MENTOR" && (
            <TabsTrigger className="flex-1" value="pending">
              Pending Connections
            </TabsTrigger>
          )}
          <TabsTrigger className="flex-1" value="active">
            Active Connections
          </TabsTrigger>
        </TabsList>
        {user && user.role === "MENTOR" && (
          <TabsContent
            className="flex flex-col gap-3 items-center "
            value="pending"
          >
            {pendingConnections && pendingConnections.length >= 1 ? (
              <div className="flex flex-col gap-3 ">
                {pendingConnections.map((connection, i) => {
                  return (
                    <Card
                      key={i}
                      className="cursor-pointer border-b border-b-slate-500 p-3 items-center flex gap-3"
                    >
                      <CardTitle>Mentorship Request</CardTitle>
                      <CardDescription>
                        This Request Was Send By {connection.sender.name}
                      </CardDescription>
                      <CardFooter className="flex items-center gap-3 justify-center p-0">
                        <Badge className="rounded-none px-2 py-2">
                          {connection.status}
                        </Badge>
                        {user && user.id && (
                          <Button
                            onClick={() =>
                              ConnectionRequest(
                                RequestStatus.ACCEPTED,
                                connection.id, // Ensure this is correct
                                user?.id // Ensure this is correct
                              )
                            }
                          >
                            Accept
                          </Button>
                        )}
                        {user && user.id && (
                          <Button
                            onClick={() =>
                              ConnectionRequest(
                                RequestStatus.DECLINED,
                                connection.id, // Correct this if needed
                                user?.id // Ensure this is correct
                              )
                            }
                          >
                            Reject
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex my-3 flex-col gap-3">
                <h4 className="text-lg font-medium ">No Pending Connections</h4>
              </div>
            )}
          </TabsContent>
        )}
        <TabsContent className="flex flex-col gap-3" value="active">
          {activeConnections.length >= 1 ? (
            <div className="flex flex-col gap-3 ">
              {activeConnections.map((connection, i) => {
                return (
                  <Card
                    key={i}
                    className="p-4 flex flex-col  items-start gap-3"
                  >
                    <CardTitle>Connections</CardTitle>
                    <div className="flex flex-col px-0 gap-4 items-start">
                      <div className="flex gap-3 items-center">
                        <h3 className="text-lg font-semibold">Mentor</h3>
                        <div className="flex  flex-col items-start">
                          <span className="text-base ">
                            {connection.mentor.name}
                          </span>
                          <span className="text-xs ">
                            {connection.mentor.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-center">
                        <h3 className="text-lg font-semibold">Mentee</h3>
                        <div className="flex  flex-col items-start">
                          <span className="text-base ">
                            {connection.mentee.name}
                          </span>
                          <span className="text-xs ">
                            {connection.mentee.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    {user && user.role !== "MENTOR" ? (
                      <Button
                        onClick={() =>
                          CancelMentorsipMentee(
                            connection.menteeId,
                            connection.mentorId
                          )
                        }
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          CancelMentorship(
                            connection.mentorId,
                            connection.menteeId
                          )
                        }
                      >
                        Cancel
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex my-3 flex-col gap-3">
              <h4 className="text-lg font-medium ">No Active Connections</h4>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Profile;
