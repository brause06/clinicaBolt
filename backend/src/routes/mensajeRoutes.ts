import { Router } from "express"
import { getAllMensajes, createMensaje, getMensajeById, updateMensaje, deleteMensaje } from "../controllers/mensajeController"
import { auth, checkRole } from "../middleware/auth"

const router = Router()

router.get("/", auth, getAllMensajes)
router.post("/", auth, createMensaje)
router.get("/:id", auth, getMensajeById)
router.put("/:id", auth, checkRole(['admin', 'physiotherapist']), updateMensaje)
router.delete("/:id", auth, checkRole(['admin']), deleteMensaje)

export default router
