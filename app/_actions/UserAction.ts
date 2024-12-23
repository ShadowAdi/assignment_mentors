"use server";

import { prisma } from "@/app/_actions/prisma";
import { JWT_SECRET, UserRole } from "@/lib/types";
import {
  Interest,
  MentorshipConnection,
  Skill,
  User,
  UserInterest,
  UserSkill,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // If you're using JWT for authentication
import { jwtDecode } from "jwt-decode";

// Define the type reflecting the structure with users
type UserSkillWithUser = UserSkill & {
  user: User; // Include the 'user' field, which is the full user object
};

type SkillWithUsers = Skill & {
  users: UserSkillWithUser[]; // The 'users' array now contains UserSkillWithUser objects
};

type UserInterestWithUser = UserInterest & {
  user: User; // Include the 'user' field, which is the full user object
};

type InterestsWithSkills = Interest & {
  users: UserInterestWithUser[]; // The 'users' array now contains UserSkillWithUser objects
};

interface CreateUserType {
  name: string;
  password: string;
  email: string;
  bio?: string;
  role: UserRole;
  skills: number[]; // Array of skill IDs to connect
  interests: number[]; // Array of interest IDs to connect
}

interface UpdatedUserType {
  name?: string;
  email?: string;
  bio?: string;
  skills?: number[]; // Array of skill IDs to connect
  interests?: number[]; // Array of interest IDs to connect
}

export const GetUsers = async (
  searchQuery: string,
  skillsFilter: number[] = [], // Type explicitly defined as number[]
  interestsFilter: number[] = [], // Type explicitly defined as number[]
  sortBy: string = "name", // Default sorting by name
  sortOrder: string = "asc", // Sorting order: asc or desc
  page: number = 1, // Default page
  limit: number = 10, // Default limit per page
  role?: UserRole
) => {
  try {
    const skip = (page - 1) * limit;
    const filters: any = {
      AND: [],
    };

    // Filter by search query
    if (searchQuery) {
      filters.AND.push({
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            skills: {
              some: {
                skill: {
                  name: {
                    contains: searchQuery,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          {
            interests: {
              some: {
                interest: {
                  name: {
                    contains: searchQuery,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      });
    }

    // Filter by skills
    if (skillsFilter.length > 0) {
      filters.AND.push({
        skills: {
          some: {
            skill: {
              id: {
                in: skillsFilter, // Filter by skill IDs
              },
            },
          },
        },
      });
    }

    // Filter by interests
    if (interestsFilter.length > 0) {
      filters.AND.push({
        interests: {
          some: {
            interest: {
              id: {
                in: interestsFilter, // Filter by interest IDs
              },
            },
          },
        },
      });
    }

    // Fetch users from the database
    const users = await prisma.user.findMany({
      where: filters,
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    const totalUsers = await prisma.user.count({ where: filters });

    return {
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      users: [],
      pagination: null,
    };
  }
};

export const GetUser = async (userId: number): Promise<User | null> => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    return user as User;
  } catch (error) {
    console.log(
      `Error Happend While Connecting  the desired user with id of ${userId} `,
      error
    );
    return null;
  }
};

export const RegisterUser = async (
  data: CreateUserType
): Promise<User | null> => {
  try {
    const { skills, interests, password, email, ...userData } = data;

    if (!email || !password) {
      throw new Error("Email and password are required.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error("A user with this email already exists.");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate skills and interests
    const existingSkills = await prisma.skill.findMany({
      where: {
        id: { in: skills || [] },
      },
    });

    const existingInterests = await prisma.interest.findMany({
      where: {
        id: { in: interests || [] },
      },
    });

    const invalidSkills = skills?.filter(
      (skillId) => !existingSkills.some((skill) => skill.id === skillId)
    );

    const invalidInterests = interests?.filter(
      (interestId) =>
        !existingInterests.some((interest) => interest.id === interestId)
    );

    if (invalidSkills?.length > 0 || invalidInterests?.length > 0) {
      throw new Error(`Invalid skills or interests. 
          Invalid Skills: ${invalidSkills?.join(", ")}
          Invalid Interests: ${invalidInterests?.join(", ")}`);
    }

    // Create the user
    const createdUser = await prisma.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword, // Save the hashed password
        skills: {
          create: skills?.map((skillId) => ({
            skill: {
              connect: { id: skillId },
            },
          })),
        },
        interests: {
          create: interests?.map((interestId) => ({
            interest: {
              connect: { id: interestId },
            },
          })),
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    return createdUser;
  } catch (error) {
    console.error("Error Registering User: ", error);
    return null;
  }
};

export const LoginUser = async (
  email: string,
  password: string
): Promise<{
  User?: User;
  success: boolean;
  message?: string;
  token?: string;
}> => {
  try {
    if (!email || !password) {
      console.log("Errro i password ");
      return {
        success: false,
        message: "Email and password are required.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return {
        success: false,
        message: "User Not Exists",
      };
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid Password",
      };
    }
    if (JWT_SECRET) {
      const token = jwt.sign(
        {
          userId: existingUser.id,
          email: existingUser.email,
        },
        "VVSADUGLSUGD",
        {
          expiresIn: "2d",
        }
      );
      return { User: existingUser, token: token, success: true };
    }
    console.log("Not present ");

    return {
      success: false,
      message: "Jwt Secret Not Present",
    };
  } catch (error) {
    console.error("Error during login: ", error);
    return {
      success: false,
      message: "Error During login",
    };
  }
};

export const DeleteUser = async (id: number) => {
  try {
    await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return {
      message: "User Is Deleted",
    };
  } catch (error) {
    console.log("Error in deleting the user: ", error);
    return null;
  }
};

export const verifyToken = async (
  token: string
): Promise<{
  isAuthenticated: boolean;
  decodedToken: {
    email: string;
    userId: number;
    exp: number;
    iat: number;
  } | null;
  message: string;
}> => {
  try {
    if (!token) {
      return {
        isAuthenticated: false,
        decodedToken: null,
        message: "TOKEN_NOT_FOUND",
      };
    }
    const DecodeToken: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (DecodeToken.exp < currentTime) {
      return {
        isAuthenticated: false,
        decodedToken: null,
        message: "TOKEN_NOT_PRESENT",
      };
    }

    return {
      isAuthenticated: true,
      decodedToken: DecodeToken,
      message: "TOKEN_FOUND",
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return {
      isAuthenticated: false,
      decodedToken: null,
      message: "ERROR_IN_TOKEN",
    };
  }
};

export const UpdateUser = async (id: number, data: UpdatedUserType) => {
  try {
    const { skills, interests, ...userData } = data;
    const existingSkills = await prisma.skill.findMany({
      where: {
        id: { in: skills },
      },
    });
    const existingInterests = await prisma.interest.findMany({
      where: {
        id: { in: interests },
      },
    });
    if (skills) {
      const invalidSkills = skills.filter(
        (skillId) => !existingSkills.some((skill) => skill.id === skillId)
      );
      if (invalidSkills.length > 0) {
        throw new Error(`Invalid skills or interests. 
            Invalid Skills: ${invalidSkills.join(", ")}
           `);
      }
    }
    if (interests) {
      const invalidInterests = interests.filter(
        (interestId) =>
          !existingInterests.some((interest) => interest.id === interestId)
      );
      if (invalidInterests.length > 0) {
        throw new Error(`Invalid skills or interests. 
            Invalid Interests: ${invalidInterests.join(", ")}`);
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        ...userData,
        skills: {
          deleteMany: {},
          create: skills && skills.map((skillId) => ({
            skill: {
              connect: { id: skillId },
            },
          })),
        },
        interests: {
          deleteMany: {},
          create: interests && interests.map((interestId) => ({
            interest: {
              connect: { id: interestId },
            },
          })),
        },
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });
    return {
      message: "User Updated Successfully",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error updating the user: ", error);
    return null;
  }
};

export const SearchUsers = async (searchName: string) => {
  try {
    const users = await prisma?.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchName,
              mode: "insensitive",
            },
          },
          {
            skills: {
              some: {
                skill: {
                  name: {
                    contains: searchName,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
          {
            interests: {
              some: {
                interest: {
                  name: {
                    contains: searchName,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });
    return {
      success: true,
      users,
    };
  } catch (error) {
    console.error("Error searching users:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      users: [],
    };
  }
};

export const GetUsersProfile = async (userId: number) => {
  try {
    const getUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        interests: {
          include: {
            interest: true,
          },
        },
        menteeConnections: {
          include: {
            mentee: true,
          },
        },
        mentorConnections: {
          include: {
            mentor: true,
          },
        },
      },
    });
    return { success: true, user: getUser };
  } catch (error) {
    console.error("Error searching users:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      users: [],
    };
  }
};

export const GetMentors = async (): Promise<User[]> => {
  const mentors = await prisma.user.findMany({
    where: {
      role: "MENTOR",
    },
    include: {
      skills: true,
      interests: true,
    },
  });
  return mentors;
};

export const GetMentees = async (): Promise<User[]> => {
  const mentees = await prisma.user.findMany({
    where: {
      role: "MENTEE",
    },
    include: {
      skills: true,
      interests: true,
    },
  });
  return mentees;
};

export const GetUsersBySkills = async (
  skills: number[]
): Promise<SkillWithUsers[] | null> => {
  try {
    const usersBySkills = await prisma.skill.findMany({
      where: {
        id: {
          in: skills,
        },
      },
      include: {
        users: {
          include: {
            user: true, // Ensure that you're including the full `User` object
          },
        },
      },
    });
    return usersBySkills || null;
  } catch (error) {
    console.log("Error in Getting Skills: ", error);
    return null;
  }
};

export const GetUsersByInterests = async (
  interests: number[]
): Promise<InterestsWithSkills[] | null> => {
  try {
    const usersByInterests = await prisma.interest.findMany({
      where: {
        id: {
          in: interests,
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
    return usersByInterests || null;
  } catch (error) {
    console.log("Error in Getting Interests: ", null);
    return null;
  }
};

export const GetMentorsBasedOnUser = async (
  userId: number
): Promise<(MentorshipConnection & { mentor: User })[]> => {
  const data = await prisma.mentorshipConnection.findMany({
    where: {
      menteeId: userId, // Fetch mentors associated with this mentee
    },
    include: {
      mentor: true, // Includes mentor details in the result
    },
  });
  return data;
};

export const GetMenteeBasedOnUser = async (
  userId: number
): Promise<(MentorshipConnection & { mentee: User })[]> => {
  const data = await prisma.mentorshipConnection.findMany({
    where: {
      mentorId: userId, // Fetch mentees associated with this mentor
    },
    include: {
      mentee: true, // Includes mentee details in the result
    },
  });
  return data;
};
