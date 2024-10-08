import express from "express"
import { getAllPacientes, getPacienteById, createPaciente, updatePaciente, deletePaciente, getPacienteCitas } from "../controllers/pacienteController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"
import { getPacienteEjercicios } from "../controllers/ejercicioController"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllPacientes)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createPaciente)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updatePaciente)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN]), deletePaciente)
router.get("/:pacienteId/citas", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteCitas)
router.get("/:pacienteId/ejercicios", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteEjercicios)

export default router
