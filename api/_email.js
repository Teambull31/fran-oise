/* =========================================================
   Couture & Fil — envoi des e-mails de commande

   Avant, le site ouvrait le logiciel de courrier de la cliente
   avec un message pré-rempli à envoyer elle-même à Françoise :
   déroutant au moment de payer, et surtout jamais garanti — un
   message pas envoyé, et la commande n'arrivait nulle part.
   L'envoi se fait désormais ici, depuis le serveur.

   Passe par Resend (une simple requête HTTP, aucune bibliothèque
   à installer). Réglages à faire dans Vercel, Project Settings →
   Environment Variables, jamais dans ce fichier :

     - RESEND_API_KEY     clé créée sur resend.com → API Keys
     - EMAIL_BOUTIQUE     adresse de Françoise, qui reçoit les
                          commandes (par défaut celle ci-dessous)
     - EMAIL_EXPEDITEUR   adresse d'expédition. Tant que le domaine
                          couture-fil.fr n'est pas vérifié chez
                          Resend, laisser vide : les messages
                          partent alors de onboarding@resend.dev,
                          ce qui fonctionne mais finit plus souvent
                          en indésirables.

   Rien ici ne doit interrompre une commande : si l'envoi échoue,
   on le note dans les journaux et on continue. La commande est de
   toute façon enregistrée en base, donc consultable dans l'espace
   « Commandes ».
   ========================================================= */

var BOUTIQUE_PAR_DEFAUT = 'couturefil47@gmail.com';
var EXPEDITEUR_PAR_DEFAUT = 'Couture & Fil <onboarding@resend.dev>';

function adresseBoutique() {
  return process.env.EMAIL_BOUTIQUE || BOUTIQUE_PAR_DEFAUT;
}

/** Échappe ce qui vient de la cliente : son nom part dans du HTML. */
function echapper(valeur) {
  return String(valeur == null ? '' : valeur)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

function lignesEnTexte(lignes) {
  return (lignes || [])
    .map(function (ligne) {
      return '  ' + ligne.qty + ' × ' + ligne.nom + ' — ' + euro.format(ligne.prix * ligne.qty);
    })
    .join('\n');
}

function lignesEnHtml(lignes) {
  return (lignes || [])
    .map(function (ligne) {
      return (
        '<tr><td>' +
        ligne.qty +
        ' × ' +
        echapper(ligne.nom) +
        '</td><td align="right">' +
        echapper(euro.format(ligne.prix * ligne.qty)) +
        '</td></tr>'
      );
    })
    .join('');
}

/**
 * Envoie un message. Ne lève jamais : renvoie true/false, pour que
 * l'appelant puisse le noter sans que la commande en pâtisse.
 */
async function envoyer(message) {
  var cle = process.env.RESEND_API_KEY;
  if (!cle) {
    console.error('E-mail non envoyé : RESEND_API_KEY n’est pas réglé.');
    return false;
  }

  try {
    var reponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + cle,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!reponse.ok) {
      // Jamais la clé ni le contenu complet dans les journaux.
      console.error('Resend a refusé l’envoi :', reponse.status);
      return false;
    }
    return true;
  } catch (erreur) {
    console.error('Impossible de contacter Resend :', erreur.message);
    return false;
  }
}

/** Prévient Françoise qu'une commande payée est à préparer. */
async function previenirBoutique(commande) {
  var texte = [
    'Une commande vient d’être payée sur le site.',
    '',
    'Cliente : ' + commande.nom,
    'E-mail : ' + commande.email,
    'Téléphone : ' + commande.telephone,
    '',
    'Adresse de livraison :',
    commande.adresse,
    '',
    'Commande :',
    lignesEnTexte(commande.lignes),
    '',
    'Total payé : ' + euro.format(commande.total),
    'Référence : ' + commande.reference
  ].join('\n');

  var html = [
    '<h2>Commande payée à préparer</h2>',
    '<p><strong>' + echapper(commande.nom) + '</strong><br>',
    echapper(commande.email) + '<br>',
    echapper(commande.telephone) + '</p>',
    '<p><strong>Adresse de livraison</strong><br>',
    echapper(commande.adresse).replace(/\n/g, '<br>') + '</p>',
    '<table cellpadding="6" style="border-collapse:collapse">',
    lignesEnHtml(commande.lignes),
    '<tr><td><strong>Total payé</strong></td><td align="right"><strong>' +
      echapper(euro.format(commande.total)) +
      '</strong></td></tr>',
    '</table>',
    '<p style="color:#6f5a67;font-size:13px">Référence ' + echapper(commande.reference) + '</p>'
  ].join('');

  return envoyer({
    from: process.env.EMAIL_EXPEDITEUR || EXPEDITEUR_PAR_DEFAUT,
    to: [adresseBoutique()],
    // Répondre au message écrit directement à la cliente.
    reply_to: commande.email || undefined,
    subject: 'Commande à préparer — ' + commande.nom,
    text: texte,
    html: html
  });
}

/** Accuse réception à la cliente : SumUp ne lui dit ni quoi, ni où. */
async function accuserReceptionCliente(commande) {
  if (!commande.email) return false;

  var texte = [
    'Bonjour ' + commande.nom + ',',
    '',
    'Votre commande est bien enregistrée et son paiement confirmé. Merci !',
    '',
    'Commande :',
    lignesEnTexte(commande.lignes),
    '',
    'Total payé : ' + euro.format(commande.total),
    '',
    'Livraison à :',
    commande.adresse,
    '',
    'Je prépare vos créations et vous écris dès qu’elles partent.',
    'Pour toute question, il suffit de répondre à ce message.',
    '',
    'Françoise — Couture & Fil',
    'Référence de votre commande : ' + commande.reference
  ].join('\n');

  var html = [
    '<p>Bonjour ' + echapper(commande.nom) + ',</p>',
    '<p>Votre commande est bien enregistrée et son paiement confirmé. Merci !</p>',
    '<table cellpadding="6" style="border-collapse:collapse">',
    lignesEnHtml(commande.lignes),
    '<tr><td><strong>Total payé</strong></td><td align="right"><strong>' +
      echapper(euro.format(commande.total)) +
      '</strong></td></tr>',
    '</table>',
    '<p><strong>Livraison à</strong><br>' +
      echapper(commande.adresse).replace(/\n/g, '<br>') +
      '</p>',
    '<p>Je prépare vos créations et vous écris dès qu’elles partent.<br>',
    'Pour toute question, il suffit de répondre à ce message.</p>',
    '<p>Françoise — Couture &amp; Fil<br>',
    '<span style="color:#6f5a67;font-size:13px">Référence ' +
      echapper(commande.reference) +
      '</span></p>'
  ].join('');

  return envoyer({
    from: process.env.EMAIL_EXPEDITEUR || EXPEDITEUR_PAR_DEFAUT,
    to: [commande.email],
    // Une réponse de la cliente doit arriver chez Françoise.
    reply_to: adresseBoutique(),
    subject: 'Votre commande Couture & Fil est confirmée',
    text: texte,
    html: html
  });
}

module.exports = {
  previenirBoutique: previenirBoutique,
  accuserReceptionCliente: accuserReceptionCliente
};
