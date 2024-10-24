import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Notification } from "../models/Notification";
import { Usuario } from "../models/Usuario";
import { Server } from 'socket.io';
import { io as socketIo } from '../app';
import { getRepository } from "typeorm";
import logger from '../utils/logger';
import * as schedule from 'node-schedule';
import { PlanTratamiento } from "../models/PlanTratamiento";
import { Cita } from "../models/Cita";

const notificationRepository = AppDataSource.getRepository(Notification);
const userRepository = AppDataSource.getRepository(Usuario);
const treatmentRepository = AppDataSource.getRepository(PlanTratamiento);
const appointmentRepository = AppDataSource.getRepository(Cita);

export const getNotifications = async (req: Request, res: Response) => {
    try {
        if (!req.user || typeof req.user === 'string') {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        const userId = (req.user as any).id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10; // Número de notificaciones por página
        const skip = (page - 1) * limit;

        const [notifications, total] = await notificationRepository.findAndCount({
            where: { user: { id: userId } },
            order: { createdAt: "DESC" },
            take: limit,
            skip: skip
        });

        const hasMore = total > page * limit;

        res.json({
            notifications,
            hasMore,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        logger.error("Error al obtener notificaciones:", error);
        res.status(500).json({ message: "Error al obtener notificaciones" });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notification = await notificationRepository.findOne({ where: { id: parseInt(id) } });
        if (!notification) {
            return res.status(404).json({ message: "Notificación no encontrada" });
        }
        notification.read = true;
        await notificationRepository.save(notification);
        res.json({ message: "Notificación marcada como leída" });
    } catch (error) {
        logger.error("Error al marcar la notificación como leída:", error);
        res.status(500).json({ message: "Error al marcar la notificación como leída" });
    }
};

export const createNotification = async (userId: number, message: string, type: 'info' | 'warning' | 'success' | 'appointment' | 'treatment') => {
  try {
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      logger.error(`Usuario no encontrado para el ID: ${userId}`);
      throw new Error("Usuario no encontrado");
    }
    const notification = notificationRepository.create({
      message,
      type,
      user,
      createdAt: new Date()
    });
    const savedNotification = await notificationRepository.save(notification);
    logger.info(`Notificación creada para el usuario ${userId}:`, savedNotification);
    
    // Emitir la notificación al cliente
    logger.info(`Intentando emitir notificación al usuario ${userId}`);
    socketIo.to(userId.toString()).emit('newNotification', savedNotification);
    logger.info(`Notificación emitida para el usuario ${userId}:`, savedNotification);
    
    return savedNotification;
  } catch (error) {
    logger.error("Error al crear notificación:", error);
    throw error;
  }
};

export const createTestNotification = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const testNotification = await createNotification(
      userId,
      "Esta es una notificación de prueba",
      "info"
    );
    res.json(testNotification);
  } catch (error) {
    logger.error("Error al crear notificación de prueba:", error);
    res.status(500).json({ message: "Error al crear notificación de prueba" });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
    try {
        logger.info("Iniciando markAllNotificationsAsRead");
        logger.info("req.user:", req.user);
        if (!req.user || typeof req.user === 'string') {
            logger.error("Usuario no autenticado o inválido");
            return res.status(401).json({ message: "Usuario no autenticado o inválido" });
        }
        
        const userId = req.user.userId;
        logger.info(`Marcando como leídas las notificaciones para el usuario ${userId}`);
        
        const result = await notificationRepository
            .createQueryBuilder()
            .update(Notification)
            .set({ read: true })
            .where("userId = :userId AND read = :read", { userId, read: false })
            .execute();
        
        logger.info(`Notificaciones marcadas como leídas: ${result.affected}`);
        
        res.json({ message: "Todas las notificaciones han sido marcadas como leídas", count: result.affected });
    } catch (error: any) {
        logger.error("Error al marcar todas las notificaciones como leídas:", error);
        res.status(500).json({ message: "Error al marcar todas las notificaciones como leídas" });
    }
};

export const deleteAllNotifications = async (req: Request, res: Response) => {
    try {
        logger.info("Iniciando deleteAllNotifications");
        logger.info("req.user:", req.user);
        if (!req.user || typeof req.user === 'string') {
            logger.error("Usuario no autenticado o inválido");
            return res.status(401).json({ message: "Usuario no autenticado o inválido" });
        }
        
        const userId = (req.user as any).userId;
        logger.info("ID del usuario:", userId);
        if (!userId) {
            logger.error("ID de usuario no encontrado");
            return res.status(400).json({ message: "ID de usuario no encontrado" });
        }
        
        const result = await notificationRepository
            .createQueryBuilder()
            .delete()
            .from(Notification)
            .where("userId = :userId", { userId })
            .execute();
        
        logger.info("Resultado de la eliminación:", result);
        
        if (socketIo instanceof Server) {
            socketIo.to(userId.toString()).emit('notificationsDeleted');
        } else {
            logger.info("Socket.IO no está configurado correctamente");
        }
        
        res.json({ message: "Todas las notificaciones han sido eliminadas", count: result.affected });
    } catch (error: any) {
        logger.error("Error detallado al eliminar todas las notificaciones:", error);
        res.status(500).json({ message: "Error al eliminar todas las notificaciones", error: error.message });
    }
};

export const createAppointmentReminder = async (appointmentId: number) => {
  try {
    const appointment = await appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['patient']
    });

    if (!appointment) {
      throw new Error("Cita no encontrada");
    }

    // Cambiar esto para que el recordatorio se envíe 1 minuto después de crear la cita
    const reminderDate = new Date(appointment.date);
    reminderDate.setDate(reminderDate.getDate() - 1); // Recordatorio un día antes
    reminderDate.setHours(9, 0, 0, 0); // Establecer la hora del recordatorio a las 9:00 AM

     //Cambiar esto para que el recordatorio se envíe 1 minuto después de crear la cita
    //const reminderDate = new Date(Date.now() + 60 * 1000); // 1 minuto en el futuro

    const formattedAppointmentDate = appointment.date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `Recordatorio de prueba: Tienes una cita programada para ${formattedAppointmentDate}`;
    
    logger.info(`Programando recordatorio de prueba para la cita ${appointmentId} el ${reminderDate}`);

    // Programar la notificación
    schedule.scheduleJob(reminderDate, async () => {
      logger.info(`Enviando recordatorio de prueba para la cita ${appointmentId}`);
      await createNotification(appointment.patient.id, message, 'appointment');
    });

    logger.info(`Recordatorio de prueba programado con éxito para la cita ${appointmentId}`);

  } catch (error) {
    logger.error("Error al crear recordatorio de cita:", error);
    throw error;
  }
};

export const notifyTreatmentUpdate = async (patientId: number, treatmentId: number) => {
  try {
    const treatment = await treatmentRepository.findOne({
      where: { id: treatmentId }
    });

    if (!treatment) {
      throw new Error("Tratamiento no encontrado");
    }

    const message = `Tu plan de tratamiento ha sido actualizado. Por favor, revisa los nuevos ejercicios.`;
    await createNotification(patientId, message, 'treatment');

  } catch (error) {
    logger.error("Error al notificar actualización de tratamiento:", error);
    throw error;
  }
};
