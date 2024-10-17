import express from "express"
import { AppDataSource } from "../src/config/database"
import dotenv from 'dotenv';
dotenv.config();
import pacienteRoutes from "./routes/pacienteRoutes"
import citaRoutes from "./routes/citaRoutes"
import ejercicioRoutes from "./routes/ejercicioRoutes"
import planTratamientoRoutes from "./routes/planTratamientoRoutes"
import objetivoRoutes from "./routes/objetivoRoutes"
import progresoRoutes from "./routes/progresoRoutes"
import mensajeRoutes from "./routes/mensajeRoutes"
import authRoutes from "./routes/authRoutes"
import cors from 'cors';
import userRoutes from "./routes/userRoutes";
import path from 'path';
import fs from 'fs';

const app = express()
console.log("Servidor Express inicializado")
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const uploadsPath = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
console.log("Ruta de uploads:", uploadsPath);
app.use('/uploads', express.static(uploadsPath));

app.use("/api/objetivos", objetivoRoutes)
app.use("/api/pacientes", pacienteRoutes)
app.use("/api/citas", citaRoutes)
app.use("/api/ejercicios", ejercicioRoutes)
app.use("/api/planes-tratamiento", planTratamientoRoutes)
app.use("/api/objetivos", objetivoRoutes)
app.use("/api/progresos", progresoRoutes)
app.use("/api/mensajes", mensajeRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

app.use((req, res) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).send('Ruta no encontrada');
});

AppDataSource.initialize()
    .then(() => {
        console.log("Base de datos inicializada")
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`)
        })
    })
    .catch((error) => console.log(error))

export default app
