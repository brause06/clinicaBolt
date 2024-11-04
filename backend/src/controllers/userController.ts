import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Usuario } from "../models/Usuario"
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { UserRole } from "../types/roles"
import logger from '../utils/logger';
import { Like, Between } from "typeorm"
import { Paciente } from "../models/Paciente"
import { Cita } from "../models/Cita"
import { Mensaje } from "../models/Mensaje"
import { Brackets } from "typeorm"

const usuarioRepository = AppDataSource.getRepository(Usuario)
const mensajeRepository = AppDataSource.getRepository(Mensaje);

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(Usuario)
        const user = await userRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }
        const { password, ...userWithoutPassword } = user
        res.json(userWithoutPassword)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el perfil del usuario" })
    }
}

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, email, phoneNumber, address, dateOfBirth, specialization } = req.body;

        const userRepository = AppDataSource.getRepository(Usuario);
        const usuario = await userRepository.findOneBy({ id: userId });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Actualiza solo los campos que se han enviado
        if (username) usuario.username = username;
        if (email) usuario.email = email;
        if (phoneNumber) usuario.phoneNumber = phoneNumber;
        if (address) usuario.address = address;
        if (dateOfBirth) usuario.dateOfBirth = dateOfBirth;
        if (specialization) usuario.specialization = specialization;

        if (req.file) {
            const fileName = req.file.filename;
            usuario.profileImageUrl = `/uploads/${fileName}`;
        }

        const updatedUsuario = await userRepository.save(usuario);
        
        logger.log('Usuario actualizado:', updatedUsuario);
        
        res.json(updatedUsuario);
    } catch (error) {
        logger.error("Error al actualizar perfil de usuario:", error);
        res.status(500).json({ message: "Error al actualizar perfil de usuario" });
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(Usuario)
        const users = await userRepository.find()
        const usersWithoutPassword = users.map(user => {
            const { password, ...userWithoutPassword } = user
            return userWithoutPassword
        })
        res.json(usersWithoutPassword)
    } catch (error) {
        logger.error("Error al obtener usuarios:", error)
        res.status(500).json({ message: "Error al obtener usuarios" })
    }
}

export const getUsersByUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.query;
        const users = await usuarioRepository.find({ where: { username: Like(`%${username}%`) } });
        res.json(users);
    } catch (error) {
        logger.error("Error al buscar usuarios por nombre de usuario:", error);
        res.status(500).json({ message: "Error al buscar usuarios" });
    }
};

export const getUserSummary = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        finMes.setHours(23, 59, 59, 999);

        // Obtener mensajes del mes usando el repositorio directamente
        const mensajesDelMes = await mensajeRepository
            .createQueryBuilder("mensaje")
            .leftJoinAndSelect("mensaje.emisor", "emisor")
            .leftJoinAndSelect("mensaje.receptor", "receptor")
            .where(new Brackets(qb => {
                qb.where("emisor.id = :userId", { userId })
                  .orWhere("receptor.id = :userId", { userId });
            }))
            .andWhere("mensaje.fechaEnvio BETWEEN :inicioMes AND :finMes", { 
                inicioMes: inicioMes.toISOString(),
                finMes: finMes.toISOString()
            })
            .andWhere("mensaje.eliminado = :eliminado", { eliminado: false })
            .getCount();

        logger.info(`Obteniendo resumen para usuario ID: ${userId}`);

        const citaRepository = AppDataSource.getRepository(Cita);

        // Consulta de debug para ver las citas del terapeuta
        const citasDebug = await citaRepository
            .createQueryBuilder("cita")
            .innerJoin("cita.therapist", "therapist")
            .where("therapist.id = :userId", { userId })
            .getMany();

        logger.info(`Citas encontradas para terapeuta ${userId}:`, citasDebug.length);

        // Obtener total de citas completadas
        const citasCompletadas = await citaRepository
            .createQueryBuilder("cita")
            .innerJoin("cita.therapist", "therapist")
            .where("cita.status = :status", { status: 'completed' })
            .andWhere("therapist.id = :userId", { userId })
            .getCount();

        // Obtener horas semanales
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay()); // Inicio de la semana (domingo)
        inicioSemana.setHours(0, 0, 0, 0);

        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6); // Fin de la semana (sábado)
        finSemana.setHours(23, 59, 59, 999);

        const horasSemanales = await citaRepository
            .createQueryBuilder("cita")
            .innerJoin("cita.therapist", "therapist")
            .select("SUM(cita.duration)", "totalMinutes")
            .where("cita.date BETWEEN :inicioSemana AND :finSemana", { 
                inicioSemana,
                finSemana 
            })
            .andWhere("therapist.id = :userId", { userId })
            .andWhere("cita.status != :status", { status: 'cancelled' })
            .getRawOne();

        // Obtener citas próxima semana
        const proximaSemana = new Date(hoy);
        proximaSemana.setDate(hoy.getDate() + 7); // Añade 7 días a la fecha actual
        proximaSemana.setHours(23, 59, 59, 999);

        const citasProximaSemana = await citaRepository
            .createQueryBuilder("cita")
            .innerJoin("cita.therapist", "therapist")
            .where("cita.date BETWEEN :hoy AND :proximaSemana", { 
                hoy,
                proximaSemana 
            })
            .andWhere("cita.status = :status", { status: 'scheduled' })
            .andWhere("therapist.id = :userId", { userId })
            .getCount();

        // Obtener pacientes activos
        const pacientesActivos = await citaRepository
            .createQueryBuilder("cita")
            .innerJoin("cita.therapist", "therapist")
            .innerJoin("cita.patient", "patient")
            .where("cita.status = :status", { status: 'scheduled' })
            .andWhere("therapist.id = :userId", { userId })
            .select("COUNT(DISTINCT patient.id)", "count")
            .getRawOne();

        // Definimos la capacidad máxima de pacientes por día
        const CAPACIDAD_DIARIA = 8; // Por ejemplo, 8 pacientes al día
        const diasLaborables = 22; // Promedio de días laborables al mes
        const capacidadMensual = CAPACIDAD_DIARIA * diasLaborables;

        // Obtenemos el total de pacientes atendidos este mes
        const pacientesAtendidosMes = await citaRepository
            .createQueryBuilder("cita")
            .innerJoin("cita.therapist", "therapist")
            .innerJoin("cita.patient", "patient")
            .where("cita.status = :status", { status: 'completed' })
            .andWhere("therapist.id = :userId", { userId })
            .andWhere("cita.date BETWEEN :inicioMes AND :finMes", { 
                inicioMes: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
                finMes: new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
            })
            .select("COUNT(DISTINCT patient.id)", "count")
            .getRawOne();

        const summary = {
            citasCompletadas,
            citasProximaSemana,
            horasSemanales: Math.round((horasSemanales?.totalMinutes || 0) / 60 * 10) / 10,
            pacientesActivos: parseInt(pacientesActivos?.count || '0'),
            interaccionesMensajes: mensajesDelMes
        };

        logger.info(`Resumen calculado:`, summary);
        res.json(summary);
    } catch (error) {
        logger.error("Error al obtener resumen de usuario:", error);
        res.status(500).json({ message: "Error al obtener resumen de usuario" });
    }
};

// Exporta el middleware de carga de archivos
export const uploadProfilePicture = upload.single('profilePicture')

export const getFisioterapeutas = async (req: Request, res: Response) => {
    try {
        const fisioterapeutas = await usuarioRepository.find({
            where: { 
                role: UserRole.FISIOTERAPEUTA
            },
            select: {
                id: true,
                username: true,
                profileImageUrl: true,
                email: true
            }
        });
        
        res.json(fisioterapeutas);
    } catch (error) {
        logger.error("Error al obtener fisioterapeutas:", error);
        res.status(500).json({ message: "Error al obtener lista de fisioterapeutas" });
    }
};
