"use client";
import {
  GetMenteeBasedOnUser,
  GetMentorsBasedOnUser,
} from "@/app/_actions/UserAction";
import Search from "@/components/shared/Search";
import UserSlider from "@/components/shared/UserSlider";
import { useContextHook } from "@/context/UserContext";
import { MentorshipConnection, User } from "@prisma/client";
import React, { useEffect, useState } from "react";

const HomePage = () => {
  const { user } = useContextHook();

  const [userMentors, setUserMentors] = useState<
    (MentorshipConnection & User)[]
  >([]);
  const [userMentees, setUserMentees] = useState<
    (MentorshipConnection & User)[]
  >([]);
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
      if (user.role === "MENTOR") {
        GetMenteesProfile(user.id);
      } else {
        GetMentorshipsProfile(user.id);
      }
    }
  }, [user]);

  return (
    <main className="flex flex-col items-center w-full min-h-screen   justify-start">
      <Search />
      <UserSlider type="MENTOR" userMentors={userMentors} />
      <UserSlider type="MENTEE" userMentees={userMentees} />
    </main>
  );
};

export default HomePage;
