import { Request, Response } from "express"
import { AppDataSource } from "../config/database"
import { Usuario } from "../models/Usuario"
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/')) // Asegúrate de que esta ruta sea correcta
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const userRepository = AppDataSource.getRepository(Usuario)
        const user = await userRepository.findOneBy({ id: parseInt(req.params.id) })
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" })
        }
        const { password, ...userWithoutPassword } = user
        res.json(userWithoutPassword)
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el perfil del usuario" })
    }
}

export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id);
        const { username, email, phoneNumber, address, dateOfBirth, specialization } = req.body;

        const userRepository = AppDataSource.getRepository(Usuario);
        const usuario = await userRepository.findOneBy({ id: userId });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        usuario.username = username || usuario.username;
        usuario.email = email || usuario.email;
        usuario.phoneNumber = phoneNumber || usuario.phoneNumber;
        usuario.address = address || usuario.address;
        usuario.dateOfBirth = dateOfBirth || usuario.dateOfBirth;
        usuario.specialization = specialization || usuario.specialization;

        if (req.file) {
            const fileName = req.file.filename;
            usuario.profileImageUrl = `/uploads/${fileName}`;
        }

        const updatedUsuario = await userRepository.save(usuario);
        
        console.log('Usuario actualizado:', updatedUsuario);
        
        res.json(updatedUsuario);
    } catch (error) {
        console.error("Error al actualizar perfil de usuario:", error);
        res.status(500).json({ message: "Error al actualizar perfil de usuario" });
    }
}

// Exporta el middleware de carga de archivos
export const uploadProfilePicture = upload.single('profilePicture')
