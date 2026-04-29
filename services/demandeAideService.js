import DemandeAide from "../models/DemandeAide.js";
import PieceJustificative from "../models/PieceJustificative.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";
import Projet from "../models/Projet.js";
import { Op } from "sequelize";
export const createDemande = async (data) => {
  return await DemandeAide.create(data);
};

export const createDemandeWithPieces = async (data, files) => {
  const transaction = await sequelize.transaction();

  try {
    // 🔹 1. Créer la demande
    const demande = await DemandeAide.create(
      {
        id_beneficiaire: data.id_beneficiaire,
        titre: data.titre,
        categorie: data.categorie,
        description_situation: data.description_situation,
        montant_objectif: data.montant_objectif,
      }, 
      { transaction }
    );

    // 🔹 2. Créer les pièces justificatives
    let pieces = [];

    if (files && files.length > 0) {
      pieces = await Promise.all(
        files.map((file) =>
          PieceJustificative.create(
            {
              id_demande: demande.id_demande,
              fichier_url: file.path || file.filename,
              type_fichier: file.mimetype,
            },
            { transaction }
          )
        )
      );
    }

    // 🔹 3. commit transaction
    await transaction.commit();

    // 🔹 4. retourner tout
    return {
      demande,
      pieces,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

export const getAllDemandes = async () => {
  return await DemandeAide.findAll({
    include:[
      {model: User, as: "beneficiaire", attributes: ["id", "name"]},
      {model: Projet, as: "projet", attributes: ["id_projet", "titre", "statut"]},
    ]
  });
};

export const getDemandeById = async (id) => {
  return await DemandeAide.findByPk(id);
};

export const updateDemande = async (id, data) => {
  const demande = await DemandeAide.findByPk(id);
  if (!demande) return null;

  return await demande.update(data);
};

export const deleteDemande = async (id) => {
  const demande = await DemandeAide.findByPk(id);
  if (!demande) return null;

  await demande.destroy();
  return true;
};

export const updateStatutDemande = async (id, data) => {
  const demande = await DemandeAide.findByPk(id);

  if (!demande) return null;

  // 🔥 update statut
  await demande.update({
    statut: data.statut,
    motif_refus: data.statut === "refusee" ? data.motif_refus : null,
  });

  // 🔥 AUTO CREATE PROJET SI VALIDÉE (NON PUBLIÉ)
  if (data.statut === "validee") {
    const exist = await Projet.findOne({
      where: { id_demande: id },
    });

    if (!exist) {
      const imagePiece = await PieceJustificative.findOne({
    where: {
      id_demande: id,
      type_fichier: { [Op.like]: "image/%" }, // ✅ première image trouvée
    },
  });
      await Projet.create({
        id_demande: id,
        titre: demande.titre,
        description_courte: demande.description_situation,
        categorie: demande.categorie,
        statut: "depublie", // 🔥 important
        image_url: imagePiece ? imagePiece.fichier_url : null, // ✅ image transmise
      });
    }
  }

  return demande;
};