import express from "express"
import { getAllMensajes, getMensajeById, createMensaje, updateMensaje, deleteMensaje, getPacienteMensajes } from "../controllers/mensajeController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getAllMensajes)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getMensajeById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), createMensaje)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), updateMensaje)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN]), deleteMensaje)
router.get("/pacientes/:pacienteId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getPacienteMensajes)

export default router
