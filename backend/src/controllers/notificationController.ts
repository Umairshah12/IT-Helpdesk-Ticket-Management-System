import { Request, Response } from 'express';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';

export const notificationController = {
  async getNotifications(req: Request, res: Response) {
    const user = req.user!;
    const notifs = dbStore.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return ApiResponse.success(res, notifs);
  },

  async markAsRead(req: Request, res: Response) {
    const user = req.user!;
    const { id } = req.params;
    const notif = dbStore.notifications.find((n) => n.id === id && n.userId === user.id);

    if (notif) {
      notif.isRead = true;
      notif.readAt = new Date();
    }

    return ApiResponse.success(res, null, 'Notification marked as read');
  },

  async markAllAsRead(req: Request, res: Response) {
    const user = req.user!;
    dbStore.notifications.forEach((n) => {
      if (n.userId === user.id) {
        n.isRead = true;
        n.readAt = new Date();
      }
    });

    return ApiResponse.success(res, null, 'All notifications marked as read');
  },
};

