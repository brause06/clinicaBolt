import express from "express"
import { getAllObjetivos, getObjetivoById, createObjetivo, updateObjetivo, deleteObjetivo, getPacienteObjetivos } from "../controllers/objetivoController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getAllObjetivos)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getObjetivoById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createObjetivo)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updateObjetivo)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deleteObjetivo)
router.get("/pacientes/:pacienteId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getPacienteObjetivos)

export default router
