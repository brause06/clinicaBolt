import express from "express"
import { getAllProgresos, createProgreso, getProgresoById, updateProgreso, deleteProgreso } from "../controllers/progresoController"
import { auth, checkRole } from "../middleware/auth"

const router = express.Router()

router.get("/", auth, getAllProgresos)
router.post("/", auth, checkRole(['admin', 'physiotherapist']), createProgreso)
router.get("/:id", auth, getProgresoById)
router.put("/:id", auth, checkRole(['admin', 'physiotherapist']), updateProgreso)
router.delete("/:id", auth, checkRole(['admin']), deleteProgreso)

export default router
