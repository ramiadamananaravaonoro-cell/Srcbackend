import express from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import donRoutes from "./routes/donRoutes.js";
import demandeAide from "./routes/demandeAideRoutes.js";
import projetRoutes from "./routes/projetRoutes.js";
import { initAssociations } from "./models/associations.js";
import statsRoutes from "./routes/statsRoutes.js";





dotenv.config();
initAssociations();

const app = express();
app.use(cors({
  origin: 'https://srcfrontend.vercel.app'
}));
app.use(express.json());

// Routes

app.use('/api/user', userRoutes);
app.use("/api/demandeAide", demandeAide);
app.use("/api/projets", projetRoutes);
app.use("/api/dons", donRoutes);
app.use("/stats", statsRoutes);
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API de gestion des utilisateurs !');
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion Mysql réussie !');

    await sequelize.sync({ alter: true }); 
    console.log('Tables synchronisées avec succès !');

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Impossible de démarrer le serveur :', error);
  }
};

startServer();