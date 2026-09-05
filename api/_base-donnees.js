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
  // Une commande est enregistrée dès que le paiement est préparé, donc
  // avant d'être réglée : une cliente peut renoncer sur la page SumUp.
  // Ces deux colonnes distinguent ce qui a vraiment été payé. Ajoutées à
  // part parce que « CREATE TABLE IF NOT EXISTS » ne touche pas à une
  // table qui existe déjà, créée avant l'ajout de ces colonnes.
  await sql`ALTER TABLE commandes ADD COLUMN IF NOT EXISTS payee BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE commandes ADD COLUMN IF NOT EXISTS payee_le TIMESTAMPTZ`;
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
    SELECT reference, nom, email, telephone, adresse, lignes, total, cree_le, payee, payee_le
    FROM commandes
    ORDER BY cree_le DESC
    LIMIT ${limite}
  `;
}

/**
 * Marque une commande comme payée, et renvoie son contenu — mais
 * seulement si elle ne l'était pas déjà. SumUp renvoie plusieurs fois le
 * même événement (et réessaie en cas d'erreur) : sans cette condition,
 * Françoise et la cliente recevraient l'e-mail de confirmation autant de
 * fois. Renvoie null si la commande est introuvable ou déjà réglée.
 */
async function marquerPayee(reference) {
  await assurerTable();
  var sql = requete();
  var lignes = await sql`
    UPDATE commandes
    SET payee = true, payee_le = now()
    WHERE reference = ${reference} AND payee = false
    RETURNING reference, nom, email, telephone, adresse, lignes, total
  `;
  return lignes.length ? lignes[0] : null;
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
  marquerPayee: marquerPayee,
  purgerCommandes: purgerCommandes
};
