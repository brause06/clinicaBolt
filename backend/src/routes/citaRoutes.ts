import express from "express"
import { getAllCitas, getCitaById, createCita, updateCita, deleteCita, getCitasByPatient, deleteAllCitas, createTestCitas } from "../controllers/citaController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllCitas)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getCitaById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createCita)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updateCita)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deleteCita)
router.get("/patient/:patientId", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getCitasByPatient)
router.delete("/test/deleteAll", auth, roleAuth([UserRole.FISIOTERAPEUTA]), deleteAllCitas);
router.post("/test/createTest", auth, roleAuth([UserRole.FISIOTERAPEUTA]), createTestCitas)

export default router
