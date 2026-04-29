import Projet from "../models/Projet.js";
import DemandeAide from "../models/DemandeAide.js";
import User from "../models/User.js";
import Don from "../models/Don.js";

// 🔹 CREATE PROJET (à partir d'une demande validée)
export const createProjet = async (data) => {
  return await Projet.create(data);
};

// 🔹 GET ALL PROJETS
export const getAllProjets = async () => {
  return await Projet.findAll({
    include: [
      {
        model: DemandeAide,
        as: "demande",
      },
    ],
  });
};

// 🔹 GET PROJET BY ID
export const getProjetById = async (id) => {
  return await Projet.findByPk(id);
};

// 🔹 UPDATE PROJET
export const updateProjet = async (id, data) => {
  const projet = await Projet.findByPk(id);
  if (!projet) return null;

  return await projet.update(data);
};

// 🔹 DELETE PROJET
export const deleteProjet = async (id) => {
  const projet = await Projet.findByPk(id);
  if (!projet) return null;

  await projet.destroy();
  return true;
};

// 🔥 PUBLIER UN PROJET
export const publierProjet = async (id) => {
  const projet = await Projet.findByPk(id);
  if (!projet) return null;

  return await projet.update({
    statut: "publie",
    date_publication: new Date(),
  });
};

// 🔥 DEPUBLIER UN PROJET
export const depublierProjet = async (id) => {
  const projet = await Projet.findByPk(id);
  if (!projet) return null;

 return await projet.update({
    statut: "depublie",
    date_publication: null,
  });
};

// 🔥 CRÉER PROJET DEPUIS UNE DEMANDE VALIDÉE
export const createFromDemande = async (id_demande, data) => {
  const demande = await DemandeAide.findByPk(id_demande);

  if (!demande) throw new Error("Demande introuvable");

  if (demande.statut !== "validee") {
    throw new Error("La demande doit être validée avant création projet");
  }

  return await Projet.create({
    id_demande,
    titre: data.titre,
    description_courte: data.description_courte,
    image_url: data.image_url,
    categorie: data.categorie,
    statut: "depublie",
  });
};

export const getProjetsPublies = async () => {
  return await Projet.findAll({
    where: {
      statut: "publie",
    },
    attributes: ["id_projet", "image_url", "statut"], // ✅ image_url explicite
    include: [
      {
        model: DemandeAide,
        as: "demande",
        attributes: [
          "id_demande",
          "id_beneficiaire", 
          "titre",
          "categorie",
          "montant_objectif",
          "montant_collecte",
        ],
      },
      {model:Don, as:"dons", attributes:["id_don", "id_donateur" ,"montant"]},
    ],
  });
};