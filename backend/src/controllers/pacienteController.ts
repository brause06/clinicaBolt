import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Paciente } from "../models/Paciente"
import { Cita } from "../models/Cita";
import { PlanTratamiento } from "../models/PlanTratamiento";
import { Objetivo } from "../models/Objetivo";
import { Progreso } from "../models/Progreso";
import { Mensaje } from "../models/Mensaje";
import { Like, FindOptionsWhere } from "typeorm";
import { HistorialMedico } from "../models/HistorialMedico"
import { Ejercicio } from "../models/Ejercicio"
import { UserRole } from "../types/roles"
import logger from '../utils/logger';

const pacienteRepository = AppDataSource.getRepository(Paciente)

export const getAllPacientes = async (req: Request, res: Response) => {
    try {
        const { search, sortBy, sortOrder, page = 1, limit = 10 } = req.query

        let where: FindOptionsWhere<Paciente> = {}
        if (search) {
            where = [
                { name: Like(`%${search}%`) },
                { condition: Like(`%${search}%`) },
                { age: Like(`%${search}%`) },
                { lastAppointment: Like(`%${search}%`) }
            ] as FindOptionsWhere<Paciente>
        }

        const [pacientes, total] = await pacienteRepository.findAndCount({
            where,
            order: sortBy ? { [sortBy as string]: sortOrder } : undefined,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            relations: ['usuario']
        })

        res.json({
            pacientes,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        })
    } catch (error) {
        logger.error("Error al obtener pacientes:", error)
        res.status(500).json({ message: "Error al obtener pacientes" })
    }
}

export const createPaciente = async (req: Request, res: Response) => {
    try {
        const { name, age, condition, email, phone, address, emergencyContact, medicalHistory, userId } = req.body;
        const newPaciente = pacienteRepository.create({
            name,
            age,
            condition,
            email,
            phone,
            address,
            emergencyContact,
            medicalHistory,
            usuario: { id: userId }
        });
        const result = await pacienteRepository.save(newPaciente);
        res.status(201).json(result);
    } catch (error) {
        logger.error("Error al crear paciente:", error);
        res.status(500).json({ message: "Error al crear paciente" });
    }
};

export const getPacienteById = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.id)
        const paciente = await pacienteRepository.findOneBy({ id: pacienteId })

        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" })
        }

        res.json(paciente)
    } catch (error) {
        logger.error("Error al obtener paciente:", error)
        res.status(500).json({ message: "Error al obtener paciente" })
    }
}

export const updatePaciente = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.id);
        const { name, age, condition, email, phone, address, emergencyContact, medicalHistory } = req.body;

        const paciente = await pacienteRepository.findOneBy({ id: pacienteId });

        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        paciente.name = name || paciente.name;
        paciente.age = age || paciente.age;
        paciente.condition = condition || paciente.condition;
        paciente.email = email || paciente.email;
        paciente.phone = phone || paciente.phone;
        paciente.address = address || paciente.address;
        paciente.emergencyContact = emergencyContact || paciente.emergencyContact;
        paciente.medicalHistory = medicalHistory || paciente.medicalHistory;

        const updatedPaciente = await pacienteRepository.save(paciente);
        res.json(updatedPaciente);
    } catch (error) {
        logger.error("Error al actualizar paciente:", error);
        res.status(500).json({ message: "Error al actualizar paciente" });
    }
};

export const deletePaciente = async (req: Request, res: Response) => {
    try {
        const result = await pacienteRepository.delete(req.params.id)
        if (result.affected === 0) {
            return res.status(404).json({ message: "Paciente no encontrado" })
        }
        res.status(204).send()
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar paciente" })
    }
}

export const getPacienteCitas = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const citas = await AppDataSource.getRepository(Cita).find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (citas.length === 0) {
            return res.status(404).json({ message: "No se encontraron citas para este paciente" });
        }
        
        res.json(citas);
    } catch (error) {
        logger.error("Error al obtener las citas del paciente:", error);
        res.status(500).json({ message: "Error al obtener las citas del paciente" });
    }
};

export const getPacientePlanTratamiento = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const planTratamiento = await AppDataSource.getRepository(PlanTratamiento).findOne({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (!planTratamiento) {
            return res.status(404).json({ message: "No se encontró plan de tratamiento para este paciente" });
        }
        
        res.json(planTratamiento);
    } catch (error) {
        logger.error("Error al obtener el plan de tratamiento del paciente:", error);
        res.status(500).json({ message: "Error al obtener el plan de tratamiento del paciente" });
    }
};

export const getPacienteObjetivos = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const objetivos = await AppDataSource.getRepository(Objetivo).find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (objetivos.length === 0) {
            return res.status(404).json({ message: "No se encontraron objetivos para este paciente" });
        }
        
        res.json(objetivos);
    } catch (error) {
        logger.error("Error al obtener los objetivos del paciente:", error);
        res.status(500).json({ message: "Error al obtener los objetivos del paciente" });
    }
};

export const getPacienteProgresos = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const progresos = await AppDataSource.getRepository(Progreso).find({
            where: { patient: { id: pacienteId } },
            relations: ["patient"]
        });
        
        if (progresos.length === 0) {
            return res.status(404).json({ message: "No se encontraron progresos para este paciente" });
        }
        
        res.json(progresos);
    } catch (error) {
        logger.error("Error al obtener los progresos del paciente:", error);
        res.status(500).json({ message: "Error al obtener los progresos del paciente" });
    }
};

export const getPacienteMensajes = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const mensajes = await AppDataSource.getRepository(Mensaje).find({
            where: { receptor: { id: pacienteId } },
            relations: ["receptor"]
        });
        
        if (mensajes.length === 0) {
            return res.status(404).json({ message: "No se encontraron mensajes para este paciente" });
        }
        
        res.json(mensajes);
    } catch (error) {
        logger.error("Error al obtener los mensajes del paciente:", error);
        res.status(500).json({ message: "Error al obtener los mensajes del paciente" });
    }
};

export const getPacienteDetails = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.id)
        const paciente = await pacienteRepository.findOne({
            where: { id: pacienteId },
            relations: ["citas", "planTratamiento"]
        })

        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" })
        }

        const nextAppointment = paciente.citas
            .filter(cita => new Date(cita.date) > new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

        const patientDetails = {
            id: paciente.id,
            name: paciente.name,
            age: paciente.age,
            condition: paciente.condition,
            lastAppointment: paciente.citas
                .filter(cita => new Date(cita.date) <= new Date())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date,
            nextAppointment: nextAppointment?.date,
            treatmentPlan: paciente.planesTratamiento[0]?.name // o cualquier otra propiedad que quieras mostrar
        }

        res.json(patientDetails)
    } catch (error) {
        logger.error("Error al obtener detalles del paciente:", error)
        res.status(500).json({ message: "Error al obtener detalles del paciente" })
    }
}

export const getHistorialMedico = async (req: Request, res: Response) => {
    logger.info("Obteniendo historial médico para paciente:", req.params.pacienteId);
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const historial = await AppDataSource.getRepository(HistorialMedico).find({
            where: { paciente: { id: pacienteId } },
            order: { fecha: "DESC" }
        });
        
        logger.info("Historial encontrado:", historial);

        // Siempre devuelve una respuesta, incluso si el array está vacío
        res.json(historial);
    } catch (error) {
        logger.error("Error al obtener el historial médico del paciente:", error);
        res.status(500).json({ message: "Error al obtener el historial médico del paciente" });
    }
};

export const addHistorialMedico = async (req: Request, res: Response) => {
    try {
        const pacienteId = parseInt(req.params.pacienteId);
        const { fecha, diagnostico, tratamiento } = req.body;
        const fotoInicial = req.file ? req.file.filename : undefined;

        console.log("Datos recibidos en el backend:", { pacienteId, fecha, diagnostico, tratamiento, fotoInicial });

        // Validación de campos requeridos
        if (!fecha || !diagnostico || !tratamiento) {
            return res.status(400).json({ 
                message: "Fecha, diagnóstico y tratamiento son campos requeridos",
                missingFields: { fecha: !fecha, diagnostico: !diagnostico, tratamiento: !tratamiento }
            });
        }

        const paciente = await pacienteRepository.findOne({ where: { id: pacienteId } });
        if (!paciente) {
            return res.status(404).json({ message: "Paciente no encontrado" });
        }

        const nuevoHistorial = AppDataSource.getRepository(HistorialMedico).create({
            fecha: new Date(fecha),
            diagnostico,
            tratamiento,
            fotoInicial,
            paciente
        });

        const resultado = await AppDataSource.getRepository(HistorialMedico).save(nuevoHistorial);
        res.status(201).json(resultado);
    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({ 
            message: "Error al agregar historial médico", 
            error: error instanceof Error ? error.message : String(error) 
        });
    }
};

export const getEjerciciosByPatient = async (req: Request, res: Response) => {
  logger.info("Received request for patient exercises");
  logger.info("Request params:", req.params);
  logger.info("Authenticated user:", req.user);
  
  try {
    const pacienteId = parseInt(req.params.pacienteId);
    logger.info("Parsed patient ID:", pacienteId);
    
    if (isNaN(pacienteId)) {
      logger.info("Invalid patient ID");
      return res.status(400).json({ message: "ID de paciente no válido" });
    }

    // Verificar permisos
    if (req.user?.role === UserRole.PACIENTE && req.user?.userId!== pacienteId) {
      logger.info("Patient trying to access another patient's exercises");
      return res.status(403).json({ message: "No tiene permiso para acceder a los ejercicios de este paciente" });
    }

    const pacienteRepository = AppDataSource.getRepository(Paciente);
    const paciente = await pacienteRepository.findOne({
      where: { id: pacienteId },
      relations: ["ejercicios"]
    });

    logger.info("Found patient:", paciente);

    if (!paciente) {
      logger.info("Patient not found");
      return res.status(404).json({ message: "Paciente no encontrado" });
    }

    logger.info("Exercises found:", paciente.ejercicios);
    res.json(paciente.ejercicios || []);
  } catch (error) {
    logger.error("Error al obtener ejercicios del paciente:", error);
    res.status(500).json({ 
      message: "Error al obtener ejercicios del paciente", 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

export const updateHistorialMedico = async (req: Request, res: Response) => {
    try {
        const historialId = parseInt(req.params.historialId);
        const { fecha, diagnostico, tratamiento } = req.body;
        const fotoFinal = req.file ? req.file.filename : undefined;

        const historialRepository = AppDataSource.getRepository(HistorialMedico);
        const historial = await historialRepository.findOne({ where: { id: historialId } });

        if (!historial) {
            return res.status(404).json({ message: "Historial médico no encontrado" });
        }

        // Actualiza los campos si se proporcionan
        if (fecha) historial.fecha = new Date(fecha);
        if (diagnostico) historial.diagnostico = diagnostico;
        if (tratamiento) historial.tratamiento = tratamiento;
        if (fotoFinal) historial.fotoFinal = fotoFinal;

        const resultado = await historialRepository.save(historial);
        res.json(resultado);
    } catch (error) {
        console.error("Error al actualizar historial médico:", error);
        res.status(500).json({ message: "Error al actualizar historial médico" });
    }
};

// Implementa más funciones según sea necesario




















