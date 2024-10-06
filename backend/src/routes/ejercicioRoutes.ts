import express from "express"
import { getAllEjercicios, createEjercicio, getEjercicioById, updateEjercicio, deleteEjercicio } from "../controllers/ejercicioController"
import { auth, checkRole } from "../middleware/auth"

const router = express.Router()

router.get("/", auth, getAllEjercicios)
router.post("/", auth, checkRole(['admin', 'physiotherapist']), createEjercicio)
router.get("/:id", auth, getEjercicioById)
router.put("/:id", auth, checkRole(['admin', 'physiotherapist']), updateEjercicio)
router.delete("/:id", auth, checkRole(['admin']), deleteEjercicio)

export default router
