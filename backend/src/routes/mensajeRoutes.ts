import express from "express"
import { getAllMensajes, getMensajeById, createMensaje, updateMensaje, deleteMensaje, getPacienteMensajes, getConversacion, enviarMensaje } from "../controllers/mensajeController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"
import { getAllPacientes } from "../controllers/pacienteController"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getAllMensajes)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getMensajeById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), createMensaje)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), updateMensaje)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN]), deleteMensaje)
router.get("/pacientes/:pacienteId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getPacienteMensajes)
router.get("/conversacion/:emisorId/:receptorId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getConversacion)
router.post("/enviar/:emisorId/:receptorId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), enviarMensaje)
router.get("/pacientes", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllPacientes);

export default router
