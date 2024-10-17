import express from "express"
import multer from "multer"
import path from "path"
import { getUserProfile, updateUserProfile, uploadProfilePicture, getAllUsers } from "../controllers/userController"
import { auth } from "../middleware/auth"

const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

router.get("/profile/:id", auth, getUserProfile)
router.put("/profile/:id", auth, upload.single('profileImage'), updateUserProfile)
router.get("/", auth, getAllUsers)

export default router
