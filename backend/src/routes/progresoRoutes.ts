import express from "express"
import { getAllProgresos, getProgresoById, createProgreso, updateProgreso, deleteProgreso, getPacienteProgresos } from "../controllers/progresoController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getAllProgresos)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getProgresoById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createProgreso)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updateProgreso)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deleteProgreso)
router.get("/pacientes/:pacienteId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getPacienteProgresos)

export default router
