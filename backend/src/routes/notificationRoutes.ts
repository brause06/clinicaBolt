import express from "express";
import { getNotifications, markAsRead, createTestNotification, markAllNotificationsAsRead, deleteAllNotifications, createNotification } from "../controllers/NotificationController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, getNotifications);
router.put("/:id/read", auth, markAsRead);
router.post("/test/:userId", auth, createTestNotification);
router.put("/mark-all-read", auth, markAllNotificationsAsRead);
router.delete("/delete-all", auth, deleteAllNotifications);
router.post('/test/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notification = await createNotification(userId, 'Esta es una notificación de prueba', 'info');
      res.json({ message: 'Notificación de prueba enviada', notification });
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      res.status(500).json({ message: 'Error al enviar notificación de prueba' });
    }
  });
  
  export default router;
