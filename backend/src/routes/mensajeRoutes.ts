import express from "express"
import { getAllMensajes, getMensajeById, createMensaje, updateMensaje, softDeleteMensaje, getPacienteMensajes, getConversacion, enviarMensaje, getMensajesNoLeidos } from "../controllers/mensajeController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"
import { getAllPacientes } from "../controllers/pacienteController"
import multer from 'multer';

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getAllMensajes)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getMensajeById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), createMensaje)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), updateMensaje)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN]), softDeleteMensaje)
router.get("/pacientes/:pacienteId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getPacienteMensajes)
router.get("/conversacion/:emisorId/:receptorId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getConversacion)
router.post("/enviar/:emisorId/:receptorId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), upload.single('adjunto'), enviarMensaje)
router.get("/pacientes", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllPacientes);
router.get("/no-leidos/:userId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getMensajesNoLeidos);

export default router
