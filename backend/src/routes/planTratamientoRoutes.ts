import express from "express"
import { getAllPlanesTratamiento, createPlanTratamiento, getPlanTratamientoById, updatePlanTratamiento, deletePlanTratamiento } from "../controllers/planTratamientoController"
import { auth, checkRole } from "../middleware/auth"

const router = express.Router()

router.get("/", auth, getAllPlanesTratamiento)
router.post("/", auth, checkRole(['admin', 'physiotherapist']), createPlanTratamiento)
router.get("/:id", auth, getPlanTratamientoById)
router.put("/:id", auth, checkRole(['admin', 'physiotherapist']), updatePlanTratamiento)
router.delete("/:id", auth, checkRole(['admin']), deletePlanTratamiento)

export default router
