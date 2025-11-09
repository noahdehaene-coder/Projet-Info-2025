/* Fonctions faisant appel aux endpoints du back-end pour gérer les données dans la table slot


  Récupère tous les créneaux pour une date donnée depuis ADE.
 
  @async
  @function
  @param {string} date - La date au format YYYY-MM-DD.
  @returns {Promise<Object[]>} Une promesse contenant la liste des créneaux pour cette date.
 
export async function getSlots(date) {
    try {
        const response = await fetch(`http://localhost:3000/ade/creneaux/${date}`)
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur de chargement des étudiants du groupe :', error);
    }
}


  Envoie un créneau dans la base de données, en le liant à un groupe, une matière et un type de session.
 
  @async
  @function
  @param {number} groupId - L’identifiant du groupe concerné.
  @param {string} courseName - Le nom de la matière concernée.
  @param {string} sessionType - Le type de session (ex. : "CM", "TD", "TP").
  @param {string} date - La date du créneau (format YYYY-MM-DD).
  @returns {Promise<Object>} Une promesse contenant le créneau créé.
 
export async function postSlot(groupId, courseName, sessionType, date) {
    try {
        const response = await fetch("http://localhost:3000/slot/by-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                groupId: groupId,
                courseName: courseName,
                sessionType: sessionType,
                date, date
            })
        })
        if (!response.ok) {
            throw new Error("Erreur lors de l'envoi du créneau");
        }
        return await response.json();
    } catch (error) {
        console.error("Erreur lors de l'envoi du créneau :", error);
    }
}


  Supprime tous les créneaux présents dans la table slot.
 
  @async
  @function
  @returns {Promise<Object>} Une promesse contenant le nombre de lignes supprimées.
 
export async function deleteSlots() {
    try {
        const response = await fetch(`http://localhost:3000/slot`, {
            method: "DELETE"
        })
        if (!response.ok) {
            throw new Error("Erreur lors de la suppression des créneaux");
        }
    } catch (error) {
        console.error("Erreur lors de la suppression des créneaux:", error);
    }
}*/

/* Fonctions faisant appel aux endpoints du back-end pour gérer les données dans la table slot */

/**
 * Récupère tous les créneaux pour une date donnée depuis LA BASE DE DONNÉES LOCALE.
 *
 * @async
 * @function
 * @param {string} date - La date au format YYYY-MM-DD.
 * @returns {Promise<Object[]>} Une promesse contenant la liste des créneaux pour cette date.
 */
export async function getSlots(date) {
  const response = await fetch(`http://localhost:3000/slot/by-date/${date}`);
  const slots = await response.json();

  // On transforme les données pour que la page SlotPage.vue les comprenne
  return slots.map((slot) => ({
    type: slot.slot_session_type.course_type_name,
    matiere_name: slot.slot_session_type.session_type_course_material.name,
    date: slot.date,
    // On ajoute les IDs nécessaires pour les autres pages
    slot_id: slot.id,
    group_id: slot.group_id,
  }));
}

/**
 * Envoie un créneau dans la base de données.
 *
 * @async
 * @function
 * @param {Object} slot - L'objet créneau (doit contenir date, group_id, session_type_id).
 * @returns {Promise<Object>} Une promesse contenant le créneau créé.
 */
export async function postSlot(slot) {
  const response = await fetch(`http://localhost:3000/slot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(slot),
  });
  const createdSlot = await response.json();
  return createdSlot;
}

/**
 * Supprime tous les créneaux présents dans la table slot.
 *
 * @async
 * @function
 * @returns {Promise<Object>} Une promesse contenant le nombre de lignes supprimées.
 */
export async function deleteSlots() {
  try {
    const response = await fetch(`http://localhost:3000/slot`, {
      method: "DELETE"
    })
    if (!response.ok) {
      throw new Error("Erreur lors de la suppression des créneaux");
    }
    return await response.json(); // S'assurer que la fonction retourne la réponse
  } catch (error) {
    console.error("Erreur lors de la suppression des créneaux:", error);
    // Propager l'erreur peut être une bonne idée
    throw error;
  }
}