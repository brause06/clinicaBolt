import express from "express"
import { getAllPacientes, getPacienteById, createPaciente, updatePaciente, deletePaciente, getPacienteCitas, getPacienteDetails, getHistorialMedico, addHistorialMedico } from "../controllers/pacienteController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"
import { getEjerciciosByPatient } from "../controllers/ejercicioController"
import { getPacientePlanTratamiento } from "../controllers/pacienteController";
import { getPacienteObjetivos } from "../controllers/pacienteController";
import { getPacienteProgresos } from "../controllers/pacienteController";
import { getPacienteMensajes } from "../controllers/pacienteController";

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllPacientes)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createPaciente)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updatePaciente)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN]), deletePaciente)
router.get("/:pacienteId/citas", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteCitas)
router.get("/:pacienteId/ejercicios", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getEjerciciosByPatient)
router.get("/:pacienteId/plan-tratamiento", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacientePlanTratamiento);
router.get("/:pacienteId/objetivos", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteObjetivos);
router.get("/:pacienteId/progresos", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteProgresos);
router.get("/:pacienteId/mensajes", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteMensajes);
router.get("/:id/details", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getPacienteDetails);
router.get("/:pacienteId/historial-medico", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getHistorialMedico)
router.post("/:pacienteId/historial-medico", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), addHistorialMedico)

export default router
