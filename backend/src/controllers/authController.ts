import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/database';
import { Usuario } from '../models/Usuario';
import { UserRole } from '../types/roles';
import { Paciente } from '../models/Paciente';

const userRepository = AppDataSource.getRepository(Usuario);
const pacienteRepository = AppDataSource.getRepository(Paciente);

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role, age, condition } = req.body;

    let userRole: UserRole = UserRole.PACIENTE; // Valor por defecto
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      userRole = role as UserRole;
    }

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new Usuario();
    newUser.username = username;
    newUser.email = email;
    newUser.password = hashedPassword;
    newUser.role = userRole;

    await userRepository.save(newUser);

    // Si el rol es paciente, crear entrada en la tabla paciente
    if (userRole === UserRole.PACIENTE) {
      if (!age) {
        return res.status(400).json({ message: 'La edad es requerida para pacientes' });
      }
      const newPaciente = pacienteRepository.create({
        usuario: newUser,
        name: username,
        age: age, // Asegúrate de que age se pase correctamente
        condition: condition || null
      });
      await pacienteRepository.save(newPaciente);
    }

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response) => {
  console.log("Solicitud de login recibida en el controlador");
  try {
    const { email, password } = req.body;
    console.log("Datos de login recibidos:", { email, password: '*****' });

    // Buscar el usuario por email
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      console.log("Usuario no encontrado");
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Contraseña inválida");
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'tu_clave_secreta_aqui',
      { expiresIn: '1h' }
    );

    console.log("Token generado:", token);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Error en el controlador de login:", error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
};
