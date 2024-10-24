import express from "express"
import { AppDataSource } from "./config/database"
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import logger from './utils/logger';
import { createServer } from 'http';
import { Server } from 'socket.io';
import notificationRoutes from './routes/notificationRoutes';
import bodyParser from 'body-parser';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

dotenv.config();

import pacienteRoutes from "./routes/pacienteRoutes"
import citaRoutes from "./routes/citaRoutes"
import ejercicioRoutes from "./routes/ejercicioRoutes"
import planTratamientoRoutes from "./routes/planTratamientoRoutes"
import objetivoRoutes from "./routes/objetivoRoutes"
import progresoRoutes from "./routes/progresoRoutes"
import mensajeRoutes from "./routes/mensajeRoutes"
import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes";

const app = express()
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }
});

logger.info("Servidor Express inicializado")
const PORT = process.env.PORT || 3000

app.use(bodyParser.json({
    verify: (req: Request, res: Response, buf: Buffer, encoding: string) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            res.status(400).json({ error: 'JSON inválido' });
            return;
        }
    }
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use((req, res, next) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configurar la carpeta de uploads
const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
logger.info("Ruta de uploads:", uploadsPath);

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(uploadsPath));

console.log("Configurando rutas");
app.use("/api/objetivos", objetivoRoutes)
app.use("/api/pacientes", pacienteRoutes)
app.use("/api/citas", citaRoutes)
app.use("/api/ejercicios", ejercicioRoutes)
app.use("/api/planes-tratamiento", planTratamientoRoutes)
app.use("/api/objetivos", objetivoRoutes)
app.use("/api/progresos", progresoRoutes)
app.use("/api/mensajes", mensajeRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use('/api/notifications', notificationRoutes)

const upload = multer({ dest: 'uploads/' });

// Middleware de manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error no manejado:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

AppDataSource.initialize().then(() => {
  logger.info("Base de datos inicializada")
  httpServer.listen(PORT, () => {
    logger.info(`Servidor corriendo en http://localhost:${PORT}`)
  })
}).catch(error => logger.error("Error al inicializar la base de datos:", error))

export default app
