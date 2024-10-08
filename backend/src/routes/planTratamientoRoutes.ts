import express from "express"
import { getAllPlanesTratamiento, getPlanTratamientoById, createPlanTratamiento, updatePlanTratamiento, deletePlanTratamiento, getPacientePlanesTratamiento } from "../controllers/planTratamientoController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllPlanesTratamiento)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPlanTratamientoById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createPlanTratamiento)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updatePlanTratamiento)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deletePlanTratamiento)
router.get("/pacientes/:pacienteId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getPacientePlanesTratamiento)

export default router
