"use server";

import { prisma } from "@/app/_actions/prisma";
import { Notification } from "@prisma/client";

export const GetNotificationOfUser = async (
  id: number
): Promise<Notification[]> => {
  const notifications = await prisma?.notification.findMany({
    where: {
      userId: id,
    },
  });

  return notifications;
};

export const MarkNotificationAsRead = async (notificationId: number) => {
  return prisma?.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};
