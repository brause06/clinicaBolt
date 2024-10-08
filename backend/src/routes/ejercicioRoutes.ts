import express from "express"
import { getAllEjercicios, getEjercicioById, createEjercicio, updateEjercicio, deleteEjercicio } from "../controllers/ejercicioController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getAllEjercicios)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getEjercicioById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createEjercicio)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updateEjercicio)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deleteEjercicio)

export default router
