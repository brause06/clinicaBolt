import express from "express"
import { getAllPacientes, createPaciente, getPacienteById, updatePaciente, deletePaciente } from "../controllers/pacienteController"
import { auth, checkRole } from "../middleware/auth"

const router = express.Router()

router.get("/", auth, getAllPacientes)
router.post("/", auth, checkRole(['admin', 'physiotherapist']), createPaciente)
router.get("/:id", auth, getPacienteById)
router.put("/:id", auth, checkRole(['admin', 'physiotherapist']), updatePaciente)
router.delete("/:id", auth, checkRole(['admin']), deletePaciente)

export default router
