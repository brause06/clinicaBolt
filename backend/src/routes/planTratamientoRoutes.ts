import express from "express"
import { getAllPlanesTratamiento, getPlanTratamientoById, createPlanTratamiento, updatePlanTratamiento, deletePlanTratamiento, getPacientePlanesTratamiento, createSesion, getSesionesPlanTratamiento } from "../controllers/planTratamientoController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllPlanesTratamiento)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPlanTratamientoById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createPlanTratamiento)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updatePlanTratamiento)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deletePlanTratamiento)
router.get("/pacientes/:pacienteId", (req, res, next) => {
  console.log('Recibida solicitud para planes de tratamiento del paciente:', req.params.pacienteId);
  next();
}, auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getPacientePlanesTratamiento)
router.post("/sesion", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createSesion)
router.get("/:planTratamientoId/sesiones", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getSesionesPlanTratamiento)

export default router
