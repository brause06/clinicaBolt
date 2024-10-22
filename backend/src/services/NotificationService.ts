import { getRepository } from "typeorm";
import { Notification } from "../models/Notification";
import { Usuario as User } from "../models/Usuario";
import logger from '../utils/logger';

export class NotificationService {
  private notificationRepository = getRepository(Notification);

  async createNotification(userId: number, message: string, type: 'info' | 'warning' | 'success') {
    const notification = new Notification();
    notification.user = { id: userId } as User;
    notification.message = message;
    notification.type = type;
    notification.createdAt = new Date();
    const savedNotification = await this.notificationRepository.save(notification);
    logger.log('Notificación guardada en la base de datos:', savedNotification);
    return savedNotification;
  }

  async getUnreadNotifications(userId: number) {
    return this.notificationRepository.find({
      where: { user: { id: userId }, read: false },
      order: { createdAt: "DESC" }
    });
  }

  async markAsRead(notificationId: number) {
    await this.notificationRepository.update(notificationId, { read: true });
  }
}
