import express from "express"
import { getAllObjetivos, createObjetivo, getObjetivoById, updateObjetivo, deleteObjetivo } from "../controllers/objetivoController"
import { auth, checkRole } from "../middleware/auth"

const router = express.Router()

router.get("/", auth, getAllObjetivos)
router.post("/", auth, checkRole(['admin', 'physiotherapist']), createObjetivo)
router.get("/:id", auth, getObjetivoById)
router.put("/:id", auth, checkRole(['admin', 'physiotherapist']), updateObjetivo)
router.delete("/:id", auth, checkRole(['admin']), deleteObjetivo)

export default router
