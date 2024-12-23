"use server";

import { prisma } from "@/app/_actions/prisma";
import { RequestStatus } from "@/lib/types";
import {
  MentorshipConnection,
  MentorshipRequest,
  UserRole,
} from "@prisma/client";

export const SentRequests = async (
  senderId: number,
  receiverId: number,
  message?: string
) => {
  try {
    const SenderDataExists = await prisma?.user.findFirst({
      where: {
        id: senderId,
      },
    });

    const ReceiverDataExists = await prisma?.user.findFirst({
      where: {
        id: receiverId,
      },
    });

    // Check if users exist
    if (!SenderDataExists || !ReceiverDataExists) {
      throw new Error("Sender or receiver user not found");
    }

    const existingRequest = await prisma?.mentorshipRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (existingRequest) {
      throw new Error("A mentorship request already exists");
    }

    const mentorshipRequest = await prisma?.mentorshipRequest.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        message: message,
        status: "PENDING",
      },
    });

    await prisma?.notification.create({
      data: {
        userId: receiverId,
        content: "New Mentorship Request from " + SenderDataExists.name,
        type: "Mentorship_Request",
      },
    });

    return mentorshipRequest;
  } catch (error) {
    console.error("Error sending mentorship request:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

export const ReceivedRequest = async (
  requestId: number,
  status: RequestStatus,
  currentUserId: number
): Promise<{
  message: string;
  success: boolean;
  request: MentorshipRequest | null;
}> => {
  try {
    console.log("Request ID:", requestId);
    console.log("Current User ID:", currentUserId);

    const existingRequest = await prisma?.mentorshipRequest.findFirst({
      where: {
        id: requestId,
        receiverId: currentUserId,
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!existingRequest) {
      throw new Error("Mentorship request not found");
    }

    const updateRequest = await prisma?.mentorshipRequest.update({
      where: { id: requestId },
      data: { status: status },
    });

    console.log("Updated Request:", updateRequest);

    if (status === "ACCEPTED") {
      await prisma?.mentorshipConnection.create({
        data: {
          mentorId: existingRequest.receiverId,
          menteeId: existingRequest.senderId,
        },
      });
    } else if (status === "DECLINED") {
      await prisma?.mentorshipRequest.delete({
        where: { id: requestId },
      });
    }

    await prisma?.notification.create({
      data: {
        userId: existingRequest.senderId,
        content:
          status === "DECLINED"
            ? `Your mentorship request was declined`
            : `Your mentorship request has been ${status.toLowerCase()}`,
        type: "MENTORSHIP_REQUEST_RESPONSE",
      },
    });

    return {
      success: true,
      request: updateRequest,
      message: `Request ${status.toLowerCase()} successfully`,
    };
  } catch (error: any) {
    console.error("Error handling mentorship request:", error);
    return {
      success: false,
      message: "An Error Occurred: " + error.message || error,
      request: null,
    };
  }
};

export const CancelMentorShipConnection = async (
  senderId: number,
  receiverId: number
): Promise<{
  message: string;
  success: boolean;
  connection: MentorshipConnection | null;
}> => {
  try {
    const existingConnection = await prisma?.mentorshipConnection.findUnique({
      where: {
        mentorId_menteeId: {
          menteeId: senderId,
          mentorId: receiverId,
        },
      },
      include: {
        mentee: true,
        mentor: true,
      },
    });
    if (!existingConnection) {
      throw new Error("No active mentorship connection found");
    }

    const deletedConnection = await prisma?.mentorshipConnection.delete({
      where: {
        mentorId_menteeId: {
          mentorId: receiverId,
          menteeId: senderId,
        },
      },
    });
    await prisma?.notification.createMany({
      data: [
        {
          userId: senderId,
          content: `Mentorship connection with ${existingConnection.mentor.name} has been terminated`,
          type: "MENTORSHIP_CONNECTION_CANCELLED",
        },
        {
          userId: receiverId,
          content: `Mentorship connection with ${existingConnection.mentee.name} has been terminated`,
          type: "MENTORSHIP_CONNECTION_CANCELLED",
        },
      ],
    });

    return {
      success: true,
      message: "Mentorship connection successfully cancelled",
      connection: deletedConnection,
    };
  } catch (error) {
    console.error("Error cancelling mentorship connection:", error);

    return {
      success: false,
      message: "Error cancelling mentorship connection: " + error,
      connection: null,
    };
  }
};

export const CancelMentorShipConnectionByMentor = async (
  senderId: number,
  receiverId: number
): Promise<{
  message: string;
  success: boolean;
  connection: MentorshipConnection | null;
}> => {
  try {
    const existingConnection = await prisma?.mentorshipConnection.findUnique({
      where: {
        mentorId_menteeId: {
          menteeId: receiverId,
          mentorId: senderId,
        },
      },
      include: {
        mentee: true,
        mentor: true,
      },
    });
    if (!existingConnection) {
      throw new Error("No active mentorship connection found");
    }

    const deletedConnection = await prisma?.mentorshipConnection.delete({
      where: {
        mentorId_menteeId: {
          mentorId: senderId,
          menteeId: receiverId,
        },
      },
    });
    await prisma?.notification.createMany({
      data: [
        {
          userId: receiverId,
          content: `Mentorship connection with ${existingConnection.mentor.name} has been terminated`,
          type: "MENTORSHIP_CONNECTION_CANCELLED",
        },
        {
          userId: senderId,
          content: `Mentorship connection with ${existingConnection.mentee.name} has been terminated`,
          type: "MENTORSHIP_CONNECTION_CANCELLED",
        },
      ],
    });

    return {
      success: true,
      message: "Mentorship connection successfully cancelled",
      connection: deletedConnection,
    };
  } catch (error) {
    console.error("Error cancelling mentorship connection:", error);

    return {
      success: false,
      message: `An Error Occured: ${error}`,
      connection: null,
    };
  }
};

// Function to get active mentorship connections
export const getMentorshipConnections = async (userId: number) => {
  try {
    const userExists = await prisma?.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new Error("User not found");
    }

    const mentorConnections = await prisma?.mentorshipConnection.findMany({
      where: {
        mentorId: userId,
      },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
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
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    // For mentee role
    const menteeConnections = await prisma?.mentorshipConnection.findMany({
      where: {
        menteeId: userId,
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
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
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return {
      success: true,
      MenteeConnections: menteeConnections ?? [],
      MentorConnections: mentorConnections ?? [],
    };
  } catch (error) {
    console.error("Error retrieving mentorship connections:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      mentorConnections: [],
      menteeConnections: [],
    };
  }
};

export const GetPendingRequests = async (
  userId: number
): Promise<{
  success: boolean;
  PendingMentorshipsRequests: (MentorshipRequest & {
    sender: {
      id: number;
      name: string;
      email: string;
    };
  })[];
}> => {
  try {
    const getMentorshipRequests = await prisma?.mentorshipRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return {
      success: true,
      PendingMentorshipsRequests: getMentorshipRequests,
    };
  } catch (error) {
    console.log("Error in Getting Mentorship Requests: ", error);
    return { success: false, PendingMentorshipsRequests: [] };
  }
};

export const GetActiveMentorships = async (
  userId: number
): Promise<{
  success: boolean;
  GetActiveMentorships: (MentorshipConnection & {
    mentor: { id: number; name: string; email: string; role: UserRole };
    mentee: { id: number; name: string; email: string; role: UserRole };
  })[];
}> => {
  try {
    const activeMentorships = await prisma?.mentorshipConnection.findMany({
      where: { OR: [{ mentorId: userId }, { menteeId: userId }] },
      include: {
        mentor: { select: { id: true, name: true, email: true, role: true } },
        mentee: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return {
      success: true,
      GetActiveMentorships: activeMentorships || [],
    };
  } catch (error) {
    console.log("Error in Getting Active Mentorships: ", error);
    return { success: false, GetActiveMentorships: [] };
  }
};

export const SearchMentorOrMentees = async (
  role: UserRole,
  searchTerm: string
) => {
  try {
    return {
      success: true,
      GetSearchMentorMentees: prisma?.user.findMany({
        where: {
          role: role,
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            {
              skills: {
                some: {
                  skill: {
                    name: { contains: searchTerm, mode: "insensitive" },
                  },
                },
              },
            },
            {
              interests: {
                some: {
                  interest: {
                    name: {
                      contains: searchTerm,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        },
      }),
    };
  } catch (error) {
    console.log("Error in Getting Mentorship Requests: ", error);
    return { success: false, GetSearchMentorMentees: [] };
  }
};
