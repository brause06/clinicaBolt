import { Request, Response, NextFunction } from "express"
import { AppDataSource } from "../config/database"
import { Mensaje } from "../models/Mensaje"
import { Usuario } from "../models/Usuario"
import logger from '../utils/logger';
import { UserRole } from '../types/roles';
import { createNotification } from './NotificationController';
import { Server, Socket } from 'socket.io';
import { io } from '../app';
import * as path from 'path';
import * as fs from 'fs';

const mensajeRepository = AppDataSource.getRepository(Mensaje)
const usuarioRepository = AppDataSource.getRepository(Usuario)

// Mapa para mantener registro de usuarios escribiendo
const usuariosEscribiendo = new Map<string, { receptor: string, timeout: NodeJS.Timeout }>();

// Mapa para mantener registro de usuarios en línea
const usuariosEnLinea = new Map<string, Socket>();

// Agregar después de las importaciones
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const getAllMensajes = async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        let queryBuilder = mensajeRepository.createQueryBuilder("mensaje")
            .leftJoinAndSelect("mensaje.emisor", "emisor")
            .leftJoinAndSelect("mensaje.receptor", "receptor")
            .where("mensaje.eliminado = :eliminado", { eliminado: false });

        if (search) {
            queryBuilder = queryBuilder.andWhere("mensaje.contenido LIKE :search", { search: `%${search}%` });
        }

        const [mensajes, total] = await queryBuilder
            .skip(skip)
            .take(Number(limit))
            .getManyAndCount();

        res.json({
            mensajes,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        logger.error("Error al obtener mensajes:", error);
        res.status(500).json({ message: "Error al obtener mensajes" });
    }
}

export const createMensaje = async (req: Request, res: Response) => {
    try {
        const newMensaje = mensajeRepository.create(req.body)
        const result = await mensajeRepository.save(newMensaje)
        res.status(201).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al crear mensaje" })
    }
}

export const getMensajeById = async (req: Request, res: Response) => {
    try {
        const mensaje = await mensajeRepository.findOne({
            where: { 
                id: parseInt(req.params.id),
                eliminado: false 
            },
            relations: ["emisor", "receptor"]
        })
        if (!mensaje) {
            return res.status(404).json({ message: "Mensaje no encontrado" })
        }
        res.json(mensaje)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener mensaje" })
    }
}

export const updateMensaje = async (req: Request, res: Response) => {
    try {
        const mensaje = await mensajeRepository.findOne({
            where: { 
                id: parseInt(req.params.id),
                eliminado: false
            }
        });
        
        if (!mensaje) {
            return res.status(404).json({ message: "Mensaje no encontrado" })
        }
        mensajeRepository.merge(mensaje, req.body)
        const result = await mensajeRepository.save(mensaje)
        
        // Notificar actualización por WebSocket
        io.to(mensaje.receptor.id.toString()).emit('mensajeActualizado', result);
        
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar mensaje" })
    }
}

export const softDeleteMensaje = async (req: Request, res: Response) => {
    try {
        const mensaje = await mensajeRepository.findOne({
            where: { id: parseInt(req.params.id) }
        });

        if (!mensaje) {
            return res.status(404).json({ message: "Mensaje no encontrado" });
        }

        mensaje.eliminado = true;
        mensaje.fechaEliminacion = new Date();
        await mensajeRepository.save(mensaje);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar mensaje" });
    }
}

export const getPacienteMensajes = async (req: Request, res: Response) => {
    try {
        const { pacienteId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [mensajes, total] = await mensajeRepository.findAndCount({
            where: { 
                receptor: { id: parseInt(pacienteId) },
                eliminado: false
            },
            relations: ["receptor", "emisor"],
            skip,
            take: Number(limit),
            order: { fechaEnvio: "DESC" }
        });

        res.json({
            mensajes,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        logger.error("Error al obtener los mensajes del paciente:", error);
        res.status(500).json({ message: "Error al obtener los mensajes del paciente" });
    }
};

export const getConversacion = async (req: Request, res: Response) => {
    try {
        const { emisorId, receptorId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        console.log('Buscando conversación entre:', { emisorId, receptorId });

        const [mensajes, total] = await mensajeRepository.findAndCount({
            where: [
                {
                    emisor: { id: parseInt(emisorId) },
                    receptor: { id: parseInt(receptorId) },
                    eliminado: false
                },
                {
                    emisor: { id: parseInt(receptorId) },
                    receptor: { id: parseInt(emisorId) },
                    eliminado: false
                }
            ],
            relations: ["emisor", "receptor"],
            order: {
                fechaEnvio: "DESC"
            },
            skip: (parseInt(page as string) - 1) * parseInt(limit as string),
            take: parseInt(limit as string)
        });

        console.log(`Se encontraron ${mensajes.length} mensajes`);

        res.json({
            mensajes: mensajes.reverse(),
            page: parseInt(page as string),
            totalPages: Math.ceil(total / parseInt(limit as string)),
            total
        });
    } catch (error) {
        console.error('Error al obtener conversación:', error);
        res.status(500).json({ 
            message: "Error al obtener la conversación",
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

export const enviarMensaje = async (req: Request, res: Response) => {
    try {
        console.log('Headers recibidos:', req.headers);
        console.log('Body recibido:', req.body);
        console.log('Archivo recibido:', req.file);
        
        const { emisorId, receptorId } = req.params;
        const { contenido } = req.body;

        console.log('Datos extraídos:', {
            emisorId,
            receptorId,
            contenido,
            bodyCompleto: req.body
        });

        // Validación del contenido
        if (!contenido || contenido.trim() === '') {
            return res.status(400).json({ 
                message: "El contenido del mensaje no puede estar vacío",
                debug: {
                    contenidoRecibido: contenido,
                    tipoContenido: typeof contenido,
                    bodyCompleto: req.body
                }
            });
        }

        const emisor = await usuarioRepository.findOne({ where: { id: parseInt(emisorId) } });
        const receptor = await usuarioRepository.findOne({ where: { id: parseInt(receptorId) } });

        if (!emisor || !receptor) {
            return res.status(404).json({ message: "Emisor o receptor no encontrado" });
        }

        // Log para depuración
        console.log('Datos recibidos:', {
            contenido,
            emisorId,
            receptorId,
            file: req.file
        });

        let adjuntoUrl, tipoAdjunto;
        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname}`;
            const filePath = path.join(__dirname, '../../uploads', fileName);
            await fs.promises.writeFile(filePath, req.file.buffer);
            adjuntoUrl = `/uploads/${fileName}`;
            tipoAdjunto = req.file.mimetype;
        }

        const mensaje = mensajeRepository.create({
            contenido: contenido.trim(),
            emisor,
            receptor,
            fechaEnvio: new Date(),
            leido: false,
            adjuntoUrl,
            tipoAdjunto,
            eliminado: false
        });

        const mensajeGuardado = await mensajeRepository.save(mensaje);

        // Verificar que se guardó correctamente
        const mensajeVerificado = await mensajeRepository.findOne({
            where: { id: mensajeGuardado.id },
            relations: ["emisor", "receptor"]
        });

        if (!mensajeVerificado) {
            throw new Error('El mensaje no se guardó correctamente');
        }

        console.log('Mensaje guardado exitosamente:', mensajeVerificado);

        // Emitir el mensaje por WebSocket
        io.to(receptorId.toString()).emit('nuevoMensaje', {
            ...mensajeGuardado,
            emisor: {
                id: emisor.id,
                username: emisor.username,
                profileImageUrl: emisor.profileImageUrl
            },
            receptor: {
                id: receptor.id,
                username: receptor.username,
                profileImageUrl: receptor.profileImageUrl
            }
        });

        res.status(201).json(mensajeVerificado);
    } catch (error) {
        logger.error("Error detallado al enviar mensaje:", {
            error,
            body: req.body,
            params: req.params,
            file: req.file
        });
        res.status(500).json({ 
            message: "Error al enviar mensaje",
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
};

// WebSocket handlers
export const handleConnection = (socket: Socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        usuariosEnLinea.set(userId.toString(), socket);
        socket.join(userId.toString());
        io.emit('usuarioConectado', { userId });
    }
};

export const handleDisconnection = (socket: Socket) => {
    const userId = socket.handshake.auth.userId;
    if (userId) {
        usuariosEnLinea.delete(userId.toString());
        io.emit('usuarioDesconectado', { userId });
    }
};

export const handleEscribiendo = (socket: Socket, data: { emisorId: string, receptorId: string }) => {
    const { emisorId, receptorId } = data;
    const key = `${emisorId}-${receptorId}`;

    // Limpiar timeout anterior si existe
    if (usuariosEscribiendo.has(key)) {
        clearTimeout(usuariosEscribiendo.get(key)!.timeout);
    }

    // Establecer nuevo timeout
    const timeout = setTimeout(() => {
        usuariosEscribiendo.delete(key);
        io.to(receptorId).emit('dejoDeEscribir', { emisorId });
    }, 3000);

    usuariosEscribiendo.set(key, { receptor: receptorId, timeout });
    io.to(receptorId).emit('estaEscribiendo', { emisorId });
};

export const getUsuariosEnLinea = async (req: Request, res: Response) => {
    try {
        const usuariosIds = Array.from(usuariosEnLinea.keys());
        res.json({ usuariosEnLinea: usuariosIds });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios en línea" });
    }
};
