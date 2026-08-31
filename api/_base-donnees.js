/* =========================================================
   Couture & Fil — connexion à la base de données (commandes)

   Neon Postgres, provisionné via le Marketplace Vercel : la
   variable DATABASE_URL est ajoutée automatiquement au projet,
   jamais écrite dans ce dépôt.

   Une seule table, créée toute seule au premier appel (pas
   d'outil de migration séparé : ce site n'a pas d'étape de
   build, autant rester simple).

   Préfixé par « _ » : Vercel ne le publie pas comme route de
   l'API, c'est un simple module partagé par les autres fichiers
   de ce dossier.
   ========================================================= */

var neon = require('@neondatabase/serverless').neon;

// Initialisation différée : un simple `require` de ce fichier ne doit
// jamais planter si DATABASE_URL n'est pas encore réglé (avant que la
// base soit provisionnée, par exemple) — seul un appel réel doit échouer.
var executer = null;
function requete() {
  if (!executer) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL manquant : la base de données n’est pas encore reliée.');
    }
    executer = neon(process.env.DATABASE_URL);
  }
  return executer;
}

var tablePrete = false;
async function assurerTable() {
  if (tablePrete) return;
  var sql = requete();
  await sql`
    CREATE TABLE IF NOT EXISTS commandes (
      id SERIAL PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      nom TEXT NOT NULL,
      email TEXT NOT NULL,
      telephone TEXT NOT NULL,
      adresse TEXT NOT NULL,
      lignes JSONB NOT NULL,
      total NUMERIC(10, 2) NOT NULL,
      cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tablePrete = true;
}

/**
 * Enregistre une commande après la création réussie du paiement SumUp.
 * N'échoue jamais bruyamment : appelée depuis checkout.js, qui ne doit
 * pas bloquer un paiement à cause d'un souci d'écriture en base.
 */
async function enregistrerCommande(commande) {
  await assurerTable();
  var sql = requete();
  await sql`
    INSERT INTO commandes (reference, nom, email, telephone, adresse, lignes, total)
    VALUES (
      ${commande.reference}, ${commande.nom}, ${commande.email}, ${commande.telephone},
      ${commande.adresse}, ${JSON.stringify(commande.lignes)}::jsonb, ${commande.total}
    )
    ON CONFLICT (reference) DO NOTHING
  `;
}

/** Les commandes les plus récentes d'abord, pour l'espace « Commandes ». */
async function listerCommandes(limite) {
  await assurerTable();
  var sql = requete();
  return sql`
    SELECT reference, nom, email, telephone, adresse, lignes, total, cree_le
    FROM commandes
    ORDER BY cree_le DESC
    LIMIT ${limite}
  `;
}

/** Supprime les commandes plus anciennes que `moisConservation` mois. */
async function purgerCommandes(moisConservation) {
  await assurerTable();
  var sql = requete();
  var supprimees = await sql`
    DELETE FROM commandes
    WHERE cree_le < now() - (${moisConservation + ' months'})::interval
    RETURNING id
  `;
  return supprimees.length;
}

module.exports = {
  enregistrerCommande: enregistrerCommande,
  listerCommandes: listerCommandes,
  purgerCommandes: purgerCommandes
};
