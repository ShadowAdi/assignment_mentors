"use server";

import { prisma } from "@/app/_actions/prisma";
import { Skill } from "@/lib/types";

export const GetSkills = async (): Promise<Skill[] | null> => {
  try {
    const skills = await prisma?.skill.findMany();

    return skills as Skill[];
  } catch (error) {
    console.log("Error In gettings Skills: ", error);
    return null;
  }
};

export const CreateSkill = async (name: string) => {
  try {
    // Check if skill already exists
    const existingSkill = await prisma?.skill.findUnique({
      where: { name },
    });

    if (existingSkill) {
      return existingSkill;
    }

    // Create new skill if it doesn't exist
    const newSkill = await prisma?.skill.create({
      data: { name },
    });

    return newSkill;
  } catch (error) {
    console.error("Error Creating Skill: ", error);
    return null;
  }
};
export const GetSkill = async (id: number): Promise<Skill | null> => {
  try {
    const skills = await prisma?.skill.findFirst({ where: { id: id } });
    return skills as Skill;
  } catch (error) {
    console.log("Error In gettings Skill");
    return null;
  }
};

export const GetSkillByName = async (name: string): Promise<Skill | null> => {
  try {
    const skills = await prisma?.skill.findFirst({ where: { name: name } });
    return skills as Skill;
  } catch (error) {
    console.log("Error In gettings Skill");
    return null;
  }
};

export type SkillType = {
  id: number;
  name: string;
};
export const GetSkillByUserId = async (
  userId: number
): Promise<SkillType[] | null> => {
  try {
    const skills = await prisma.skill.findMany({
      where: {
        users: {
          some: {
            userId: userId,
          },
        },
      },
    });
    return skills;
  } catch (error) {
    console.error("Error in getting skill: ",error);
    return null;
  }
};


