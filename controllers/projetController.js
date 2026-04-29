import {
  createProjet,
  getAllProjets,
  getProjetById,
  updateProjet,
  deleteProjet,
  publierProjet,
  depublierProjet,
  createFromDemande,
  getProjetsPublies,
} from "../services/projetService.js";

// 🔹 CREATE
export const create = async (req, res) => {
  try {
    const projet = await createProjet(req.body);
    res.status(201).json(projet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 CREATE FROM DEMANDE
export const fromDemande = async (req, res) => {
  try {
    const projet = await createFromDemande(req.params.id_demande, req.body);
    res.status(201).json(projet);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 GET ALL
export const findAll = async (req, res) => {
  try {
    const projets = await getAllProjets();
    res.json(projets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 GET ONE
export const findOne = async (req, res) => {
  try {
    const projet = await getProjetById(req.params.id);

    if (!projet) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    res.json(projet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 UPDATE
export const update = async (req, res) => {
  try {
    const projet = await updateProjet(req.params.id, req.body);

    if (!projet) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    res.json(projet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 DELETE
export const remove = async (req, res) => {
  try {
    const deleted = await deleteProjet(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    res.json({ message: "Projet supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 PUBLIER PROJET
export const publier = async (req, res) => {
  try {
    const projet = await publierProjet(req.params.id);

    if (!projet) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    res.json(projet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DEPUBLIE PROJET
export const depublier = async (req, res) => {
  try {
    console.log("Id du projet:", req.params.id)
    const projet = await depublierProjet(req.params.id);

    if (!projet) {
      return res.status(404).json({ error: "Projet non trouvé" });
    }

    res.json(projet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPublishedProjects = async (req, res) => {
  try {
    const projets = await getProjetsPublies();

    const formatted = projets.map((p) => {
      const uniqueDonors = new Set(
        (p.dons || []).map((d) => d.id_donateur)
      );

      return {
        id: p.id_projet,
        title: p.demande?.titre,
        category: p.demande?.categorie,
        collected: p.demande?.montant_collecte || 0,
        goal: p.demande?.montant_objectif || 0,
        donors: uniqueDonors.size, // 🔥 FIX
        beneficiaryId: p.demande.id_beneficiaire, // 🔥 IMPORTANT 
        image: p.image_url || null,
      };
    });
    console.log(formatted)
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};