import express from "express"
import { getAllEjercicios, createEjercicio, getEjercicioById, updateEjercicio, deleteEjercicio, getEjerciciosByPatient, completeEjercicio } from "../controllers/ejercicioController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllEjercicios)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createEjercicio)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getEjercicioById)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updateEjercicio)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deleteEjercicio)
router.get("/patient/:patientId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getEjerciciosByPatient)
router.put("/:id/complete", auth, roleAuth([UserRole.PACIENTE]), completeEjercicio)

export default router
