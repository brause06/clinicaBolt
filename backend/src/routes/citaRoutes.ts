import express from "express"
import { getAllCitas, getCitaById, createCita, updateCita, deleteCita } from "../controllers/citaController"
import { auth, roleAuth } from "../middleware/auth"
import { UserRole } from "../types/roles"

const router = express.Router()

router.get("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), getAllCitas)
router.get("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA, UserRole.PACIENTE]), getCitaById)
router.post("/", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), createCita)
router.put("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), updateCita)
router.delete("/:id", auth, roleAuth([UserRole.ADMIN, UserRole.FISIOTERAPEUTA]), deleteCita)

export default router
