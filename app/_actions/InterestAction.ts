"use server";

import { prisma } from "@/app/_actions/prisma";
import { Interest } from "@/lib/types";

export const GetInterests = async (): Promise<Interest[] | null> => {
  try {
    const interests = await prisma?.interest.findMany();
    return interests as Interest[];
  } catch (error) {
    console.log("Error In gettings interests");
    return null;
  }
};

export const CreateInterest = async (name: string) => {
  try {
    // Check if interest already exists
    const existingInterest = await prisma?.interest.findUnique({
      where: { name },
    });

    if (existingInterest) {
      return existingInterest;
    }

    // Create new interest if it doesn't exist
    const newInterest = await prisma?.interest.create({
      data: { name },
    });

    return newInterest;
  } catch (error) {
    console.error("Error Creating Interest: ", error);
    return null;
  }
};

export const GetInterest = async (id: number): Promise<Interest | null> => {
  try {
    const interests = await prisma?.interest.findFirst({ where: { id: id } });
    return interests as Interest;
  } catch (error) {
    console.log("Error In gettings interest");
    return null;
  }
};

export const GetInterestByName = async (
  name: string
): Promise<Interest | null> => {
  try {
    const interest = await prisma?.interest.findFirst({
      where: { name: name },
    });
    return interest as Interest;
  } catch (error) {
    console.log("Error In gettings Skill");
    return null;
  }
};

export type InterestType = {
  id: number;
  name: string;
};
export const GetInterestByUserId = async (
  userId: number
): Promise<InterestType[] | null> => {
  try {
    const interests = await prisma.interest.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
    });
    return interests;
  } catch (error) {
    console.error("Error in getting interest: ", error);
    return null;
  }
};




