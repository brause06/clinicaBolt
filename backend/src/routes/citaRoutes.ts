import express from "express"
import { getAllCitas, createCita, getCitaById, updateCita, deleteCita } from "../controllers/citaController"
import { auth, checkRole } from "../middleware/auth"

const router = express.Router()

router.get("/", auth, getAllCitas)
router.post("/", auth, checkRole(['admin', 'physiotherapist']), createCita)
router.get("/:id", auth, getCitaById)
router.put("/:id", auth, checkRole(['admin', 'physiotherapist']), updateCita)
router.delete("/:id", auth, checkRole(['admin']), deleteCita)

export default router
