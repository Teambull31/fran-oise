/* =========================================================
   Couture & Fil — logique du site
   Tout le contenu vient de window.CONTENT (assets/js/content.js).
   ========================================================= */
(function () {
  'use strict';

  var C = window.CONTENT;
  var STORAGE_KEY = 'couture-fil:cart';
  var euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

  var $ = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  /** Premier emoji du nom d'un produit, utilisé pour les visuels de repli. */
  function leadEmoji(name) {
    var match = name.match(/^\s*([\p{Extended_Pictographic}]+)/u);
    return match ? match[1] : '🧶';
  }

  /** Applique le cadrage choisi dans la page de modification. */
  function cadrerPhoto(img, source) {
    if (source.focus) img.style.objectPosition = source.focus;
    if (source.zoom && source.zoom !== 1) img.style.setProperty('--zoom', source.zoom);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------------------------------------------------------
     Rendu du contenu statique
     --------------------------------------------------------- */

  function renderHero() {
    // Bandeau d'annonce : masqué tant qu'il n'y a rien à annoncer.
    var bandeau = $('#demo-banner');
    var annonce = (C.demoNotice || '').trim();
    bandeau.textContent = annonce;
    bandeau.hidden = !annonce;
    $('#hero-eyebrow').textContent = C.shop.name + ' · ' + C.shop.city + ' (' + C.shop.region + ')';

    var title = $('#hero-title');
    var heading = C.shop.heroTitle || C.shop.tagline;
    var phrase = C.shop.heroHighlight;
    var index = phrase ? heading.indexOf(phrase) : -1;
    if (index === -1) {
      title.textContent = heading;
    } else {
      title.append(heading.slice(0, index));
      title.append(el('em', null, phrase));
      title.append(heading.slice(index + phrase.length));
    }

    $('#hero-lead').textContent = C.shop.intro[0];

    var list = $('#highlights');
    C.highlights.forEach(function (item) {
      var li = el('li');
      li.append(el('strong', null, item.value), el('span', null, item.label));
      list.append(li);
    });
  }

  function renderUniverses() {
    var grid = $('#universe-grid');
    C.universes.forEach(function (universe) {
      var card = el('button', 'universe-card reveal');
      card.type = 'button';

      var media = el('div', 'media');
      var img = el('img');
      img.src = universe.image;
      img.alt = universe.title;
      img.loading = 'lazy';
      img.width = 1200;
      img.height = 675;
      cadrerPhoto(img, universe);
      media.append(img);

      var body = el('div', 'body');
      body.append(
        el('h3', null, universe.title),
        el('p', null, universe.text),
        el('span', 'more', 'Voir les pièces →')
      );

      card.append(media, body);
      card.addEventListener('click', function () {
        applyFilter(universe.id);
        $('#boutique').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      grid.append(card);
    });
  }

  function productCard(product) {
    var card = el('article', 'product-card reveal');

    var media = el('div', 'product-media');
    if (product.image) {
      var img = el('img');
      img.src = product.image;
      img.alt = product.name;
      img.loading = 'lazy';
      img.width = 900;
      img.height = 900;
      cadrerPhoto(img, product);
      media.append(img);
    } else {
      var holder = el('div', 'placeholder');
      holder.append(el('span', null, leadEmoji(product.name)), el('span', null, 'Photo à venir'));
      media.append(holder);
    }
    if (product.badge) media.append(el('span', 'badge', product.badge));

    var body = el('div', 'product-body');
    body.append(el('h3', null, product.name));
    if (product.variants) body.append(el('p', 'variants-note', 'Autres variantes disponibles'));
    body.append(el('p', null, product.description));

    var foot = el('div', 'product-foot');
    foot.append(el('span', 'price', euro.format(product.price)));

    if (product.shopUrl) {
      var lien = el('a', 'add-button', 'Commander');
      lien.href = product.shopUrl;
      lien.rel = 'noopener';
      lien.setAttribute('aria-label', 'Commander ' + product.name + ' sur la boutique');
      foot.append(lien);
    } else {
      var add = el('button', 'add-button', 'Ajouter');
      add.type = 'button';
      add.addEventListener('click', function () {
        addToCart(product.id);
      });
      foot.append(add);
    }

    body.append(foot);
    card.append(media, body);
    return card;
  }

  function renderFilters() {
    var bar = $('#filters');
    C.categories.forEach(function (category) {
      var button = el('button', 'filter', category.label);
      button.type = 'button';
      button.dataset.category = category.id;
      button.setAttribute('aria-pressed', String(category.id === 'all'));
      button.addEventListener('click', function () {
        applyFilter(category.id);
      });
      bar.append(button);
    });
  }

  function applyFilter(categoryId) {
    var known = C.categories.some(function (category) {
      return category.id === categoryId;
    });
    var active = known ? categoryId : 'all';

    Array.prototype.forEach.call($('#filters').children, function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.category === active));
    });

    var grid = $('#product-grid');
    grid.textContent = '';
    var matches = C.products.filter(function (product) {
      return active === 'all' || product.category === active;
    });
    matches.forEach(function (product) {
      grid.append(productCard(product));
    });
    $('#grid-empty').hidden = matches.length > 0;
    observeReveals();
  }

  function renderServices() {
    var grid = $('#service-grid');
    C.services.forEach(function (service) {
      var card = el('article', 'service-card reveal');
      card.append(
        el('h3', null, service.title),
        el('span', 'service-price', service.price),
        el('p', null, service.description)
      );
      var list = el('ul');
      service.points.forEach(function (point) {
        list.append(el('li', null, point));
      });
      card.append(list);
      grid.append(card);
    });
  }

  function renderMarkets() {
    var section = $('#marches');
    if (!section) return;
    if (!C.markets || !C.markets.length) {
      section.hidden = true;
      return;
    }

    var grid = $('#marche-grid');
    C.markets.forEach(function (marche) {
      var card = el('article', 'market-card reveal');
      if (marche.day) card.append(el('span', 'market-day', marche.day));

      if (marche.mapEmbedUrl) {
        var carte = el('div', 'market-map');
        var iframe = document.createElement('iframe');
        iframe.src = marche.mapEmbedUrl;
        iframe.title = 'Carte : ' + (marche.place || marche.city || marche.day);
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.setAttribute('allowfullscreen', '');
        carte.append(iframe);
        card.append(carte);
      }

      var lieu = [marche.place, marche.city].filter(Boolean).join(', ');
      if (lieu) card.append(el('p', 'market-place', lieu));
      if (marche.hours) card.append(el('p', 'market-hours', marche.hours));
      if (marche.mapUrl) {
        var lien = document.createElement('a');
        lien.href = marche.mapUrl;
        lien.target = '_blank';
        lien.rel = 'noopener';
        lien.className = 'market-link';
        lien.textContent = '📍 Voir l’itinéraire';
        card.append(lien);
      }
      grid.append(card);
    });
  }

  function renderAbout() {
    var image = $('#about-image');
    image.src = C.about.image;
    image.alt = C.about.imageAlt;
    cadrerPhoto(image, C.about);
    $('#about-title').textContent = C.about.title;

    var text = $('#about-text');
    C.about.paragraphs.forEach(function (paragraph) {
      text.append(el('p', null, paragraph));
    });

    var skills = $('#about-skills');
    C.about.skills.forEach(function (skill) {
      skills.append(el('li', null, skill));
    });
  }

  function renderContact() {
    var list = $('#contact-infos');
    var infos = [];

    infos.push({
      icon: '📍',
      label: 'L’atelier',
      value: [C.shop.address, C.shop.city + ' (' + C.shop.region + ')'].filter(Boolean).join(' — ')
    });
    if (C.shop.email) infos.push({ icon: '✉️', label: 'E-mail', value: C.shop.email });
    if (C.shop.phone) infos.push({ icon: '📞', label: 'Téléphone', value: C.shop.phone });
    if (C.shop.hours && C.shop.hours.length) {
      infos.push({
        icon: '🕒',
        label: 'Horaires',
        value: C.shop.hours
          .map(function (slot) {
            return slot.day + ' : ' + slot.value;
          })
          .join(' · ')
      });
    }
    infos.push({ icon: '🛍️', label: 'Boutique en ligne', value: C.shop.sumupUrl.replace(/^https?:\/\//, '') });

    infos.forEach(function (info) {
      var li = el('li');
      li.append(el('span', 'ico', info.icon));
      var body = el('div');
      body.append(el('strong', null, info.label), el('span', null, info.value));
      li.append(body);
      list.append(li);
    });
  }

  function renderFooter() {
    $('#footer-tagline').textContent = C.shop.tagline;
    $('#year').textContent = String(new Date().getFullYear());
    $('#footer-sumup').href = C.shop.sumupUrl;
    $('#modal-sumup').href = C.shop.sumupUrl;

    var nav = $('#footer-links');
    var links = [{ label: 'Contactez-nous', url: '#contact' }].concat(C.shop.legalLinks || []);
    C.shop.socials.forEach(function (social) {
      links.push(social);
    });
    links.forEach(function (link) {
      var anchor = el('a', null, link.label);
      anchor.href = link.url;
      if (link.url.indexOf('http') === 0) anchor.rel = 'noopener';
      nav.append(anchor);
    });
  }

  /* ---------------------------------------------------------
     Panier
     --------------------------------------------------------- */

  var cart = loadCart();

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(function (line) {
        return findProduct(line.id) && line.qty > 0;
      });
    } catch (error) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      /* mode privé : le panier reste en mémoire */
    }
  }

  function findProduct(id) {
    return C.products.find(function (product) {
      return product.id === id;
    });
  }

  function cartCount() {
    return cart.reduce(function (total, line) {
      return total + line.qty;
    }, 0);
  }

  function cartTotal() {
    return cart.reduce(function (total, line) {
      var product = findProduct(line.id);
      return total + (product ? product.price * line.qty : 0);
    }, 0);
  }

  function addToCart(id) {
    var line = cart.find(function (item) {
      return item.id === id;
    });
    if (line) {
      line.qty += 1;
    } else {
      cart.push({ id: id, qty: 1 });
    }
    saveCart();
    renderCart();
    bumpCart();
    showToast(findProduct(id).name + ' ajouté au panier');
  }

  function setQty(id, qty) {
    if (qty <= 0) {
      cart = cart.filter(function (line) {
        return line.id !== id;
      });
    } else {
      var line = cart.find(function (item) {
        return item.id === id;
      });
      if (line) line.qty = qty;
    }
    saveCart();
    renderCart();
  }

  function renderCart() {
    var count = cartCount();
    var counter = $('#cart-count');
    counter.textContent = String(count);
    counter.classList.toggle('is-visible', count > 0);
    $('#cart-button').setAttribute(
      'aria-label',
      count > 0 ? 'Ouvrir le panier, ' + count + ' article(s)' : 'Ouvrir le panier, vide'
    );

    var body = $('#cart-body');
    body.textContent = '';

    if (!cart.length) {
      var empty = el('div', 'cart-empty');
      empty.append(
        el('span', null, '🧺'),
        el('p', null, 'Votre panier est vide.'),
        el('p', null, 'Ajoutez une création pour préparer votre commande.')
      );
      body.append(empty);
    }

    cart.forEach(function (line) {
      var product = findProduct(line.id);
      if (!product) return;

      var row = el('div', 'cart-line');

      if (product.image) {
        var thumb = el('img', 'thumb');
        thumb.src = product.image;
        thumb.alt = '';
        thumb.width = 64;
        thumb.height = 64;
        row.append(thumb);
      } else {
        row.append(el('div', 'thumb thumb-placeholder', leadEmoji(product.name)));
      }

      var info = el('div');
      info.append(el('h3', null, product.name));

      var foot = el('div', 'line-foot');

      var qty = el('div', 'qty');
      var minus = el('button', null, '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Retirer un ' + product.name);
      minus.addEventListener('click', function () {
        setQty(product.id, line.qty - 1);
      });

      var output = el('output', null, String(line.qty));

      var plus = el('button', null, '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Ajouter un ' + product.name);
      plus.addEventListener('click', function () {
        setQty(product.id, line.qty + 1);
      });

      qty.append(minus, output, plus);

      var right = el('div');
      right.append(el('div', 'line-price', euro.format(product.price * line.qty)));
      var remove = el('button', 'remove-line', 'Retirer');
      remove.type = 'button';
      remove.addEventListener('click', function () {
        setQty(product.id, 0);
      });
      right.append(remove);

      foot.append(qty, right);
      info.append(foot);
      row.append(info);
      body.append(row);
    });

    $('#cart-total').textContent = euro.format(cartTotal());
    $('#cart-checkout').disabled = cart.length === 0;
  }

  function bumpCart() {
    var button = $('#cart-button');
    button.classList.remove('is-bumped');
    void button.offsetWidth;
    button.classList.add('is-bumped');
  }

  var toastTimer;
  function showToast(message) {
    var toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  /* ---------------------------------------------------------
     Tiroir, modale, focus
     --------------------------------------------------------- */

  var lastFocused = null;

  function focusables(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])'),
      function (node) {
        return node.offsetParent !== null;
      }
    );
  }

  function trapFocus(event, container) {
    if (event.key !== 'Tab') return;
    var items = focusables(container);
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openCart() {
    lastFocused = document.activeElement;
    var drawer = $('#cart-drawer');
    var overlay = $('#overlay');
    drawer.hidden = false;
    overlay.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
    });
    $('#cart-close').focus();
  }

  function closeCart() {
    var drawer = $('#cart-drawer');
    var overlay = $('#overlay');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(function () {
      drawer.hidden = true;
      overlay.hidden = true;
    }, 300);
    if (lastFocused) lastFocused.focus();
  }

  function cartIsOpen() {
    return $('#cart-drawer').classList.contains('is-open');
  }

  var modalReturnFocus = null;

  /** Récapitulatif des pièces choisies, pour les retrouver sur la boutique. */
  function remplirRecapitulatif() {
    var zone = $('#checkout-recap');
    if (!zone) return;
    zone.textContent = '';

    var liste = el('ul', 'recap');
    cart.forEach(function (line) {
      var product = findProduct(line.id);
      if (!product) return;
      var item = el('li');
      item.append(
        el('span', null, (line.qty > 1 ? line.qty + ' × ' : '') + product.name),
        el('strong', null, euro.format(product.price * line.qty))
      );
      liste.append(item);
    });

    var total = el('p', 'recap-total');
    total.append(el('span', null, 'Total'), el('strong', null, euro.format(cartTotal())));

    zone.append(liste, total);
  }

  /** Une ligne par article du panier, pour le récapitulatif comme pour la demande par e-mail. */
  function resumeLignes() {
    return cart
      .map(function (line) {
        var product = findProduct(line.id);
        if (!product) return '';
        return '- ' + (line.qty > 1 ? line.qty + ' × ' : '') + product.name +
          ' : ' + euro.format(product.price * line.qty);
      })
      .filter(Boolean);
  }

  /**
   * Trois façons de commander, selon ce qui est disponible :
   *   - payer directement par carte, coordonnées de livraison à
   *     l'appui (a besoin d'un e-mail : c'est là que ces coordonnées
   *     sont envoyées, la fonction de paiement ne les connaît pas) ;
   *   - une boutique en ligne : on y renvoie ;
   *   - une adresse e-mail seule : la demande part par courrier, et
   *     Françoise répond avec un lien de paiement.
   * Sans rien de tout ça, on le dit plutôt que de proposer un bouton
   * qui ne mène nulle part.
   */
  function preparerCommande() {
    var explication = $('#checkout-explication');
    var demande = $('#modal-commander');
    var boutique = $('#modal-sumup');
    var livraison = $('#checkout-livraison');

    $('#modal-payer-erreur').hidden = true;

    var lignes = resumeLignes();
    var contactPossible = !!C.shop.email;

    livraison.hidden = !contactPossible;

    if (contactPossible) {
      demande.hidden = false;
      demande.href =
        'mailto:' +
        encodeURIComponent(C.shop.email) +
        '?subject=' +
        encodeURIComponent('Demande de commande — ' + C.shop.name) +
        '&body=' +
        encodeURIComponent(
          ['Bonjour,', '', 'Je souhaiterais commander :', '']
            .concat(lignes)
            .concat(['', 'Total : ' + euro.format(cartTotal()), '', 'Merci !'])
            .join('\n')
        );
    } else {
      demande.hidden = true;
    }

    boutique.hidden = !C.shop.sumupUrl;

    if (contactPossible) {
      explication.textContent =
        'Le plus rapide : indiquez vos coordonnées ci-dessous puis payez directement par carte, ' +
        'en toute sécurité. ' +
        (C.shop.sumupUrl ? 'Vous préférez ? La commande se règle aussi sur la boutique en ligne.' : '');
    } else if (C.shop.sumupUrl) {
      explication.textContent = 'La commande se règle sur la boutique en ligne, en paiement sécurisé.';
    } else {
      explication.textContent =
        'Contactez-moi pour finaliser cette commande : je vous confirme la disponibilité et le ' +
        'mode de règlement.';
    }
  }

  /**
   * Envoie les coordonnées de livraison par e-mail, exactement comme le
   * bouton « Envoyer ma demande » : le site n'a pas de serveur pour les
   * garder ailleurs, et la fonction de paiement ne les connaît pas —
   * SumUp encaisse, mais ne demande ni nom ni adresse.
   */
  function envoyerCoordonneesLivraison(nom, email, adresse, urlPaiement) {
    var reference = urlPaiement.split('/').pop();
    var corps = [
      'Commande réglée par carte sur le site (paiement en cours de finalisation).',
      '',
      'Client : ' + nom + ' (' + email + ')',
      '',
      'Adresse de livraison :',
      adresse,
      '',
      'Commande :',
      ''
    ]
      .concat(resumeLignes())
      .concat(['', 'Total : ' + euro.format(cartTotal()), '', 'Référence SumUp : ' + reference]);

    var lien = document.createElement('a');
    lien.href =
      'mailto:' +
      encodeURIComponent(C.shop.email) +
      '?subject=' +
      encodeURIComponent('Commande à préparer — ' + nom) +
      '&body=' +
      encodeURIComponent(corps.join('\n'));
    lien.style.display = 'none';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
  }

  /**
   * Paiement par carte, sans quitter le site : la fonction Vercel
   * /api/checkout crée le paiement chez SumUp avec la clé secrète
   * (jamais présente ici) et renvoie l'adresse de leur page de
   * paiement, vers laquelle on redirige. SumUp ne demandant ni nom ni
   * adresse, les coordonnées de livraison partent par e-mail à côté.
   */
  function payerParCarte() {
    var bouton = $('#modal-payer');
    var erreur = $('#modal-payer-erreur');
    erreur.hidden = true;

    var montant = cartTotal();
    if (!(montant > 0)) return;

    var champNom = $('#checkout-nom');
    var champEmail = $('#checkout-email');
    var champAdresse = $('#checkout-adresse');

    if (!champNom.checkValidity()) return champNom.reportValidity();
    if (!champEmail.checkValidity()) return champEmail.reportValidity();
    if (!champAdresse.checkValidity()) return champAdresse.reportValidity();

    bouton.disabled = true;
    bouton.textContent = 'Préparation du paiement…';

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        montant: montant,
        description: resumeLignes().join(' ; ') || 'Commande Couture & Fil'
      })
    })
      .then(function (reponse) {
        return reponse.json().then(function (donnees) {
          if (!reponse.ok || !donnees.url) throw new Error(donnees.erreur || 'Échec du paiement.');
          return donnees.url;
        });
      })
      .then(function (url) {
        envoyerCoordonneesLivraison(
          champNom.value.trim(),
          champEmail.value.trim(),
          champAdresse.value.trim(),
          url
        );
        // Un court délai laisse le temps au logiciel de courrier de
        // s'ouvrir avant que la page ne parte vers le paiement.
        setTimeout(function () {
          window.location.href = url;
        }, 200);
      })
      .catch(function () {
        bouton.disabled = false;
        bouton.textContent = '💳 Payer par carte';
        erreur.hidden = false;
        erreur.textContent =
          'Le paiement par carte n’est pas disponible pour le moment. Utilisez plutôt l’une des ' +
          'autres façons de commander ci-dessous.';
      });
  }

  function openModal() {
    remplirRecapitulatif();
    preparerCommande();
    modalReturnFocus = document.activeElement;
    var modal = $('#checkout-modal');
    modal.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () {
      modal.classList.add('is-open');
    });
    $('#checkout-close').focus();
  }

  function closeModal() {
    var modal = $('#checkout-modal');
    modal.classList.remove('is-open');
    setTimeout(function () {
      modal.hidden = true;
    }, 250);
    if (!cartIsOpen()) document.body.classList.remove('is-locked');
    if (modalReturnFocus) modalReturnFocus.focus();
  }

  function modalIsOpen() {
    return $('#checkout-modal').classList.contains('is-open');
  }

  /* ---------------------------------------------------------
     Formulaire de contact
     --------------------------------------------------------- */

  function setupForm() {
    var form = $('#contact-form');
    var status = $('#form-status');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var valid = true;

      Array.prototype.forEach.call(form.querySelectorAll('.field'), function (field) {
        var input = field.querySelector('input, textarea');
        var error = field.querySelector('.error');
        if (error) error.remove();
        field.classList.remove('has-error');

        if (!input.checkValidity()) {
          valid = false;
          field.classList.add('has-error');
          var message = input.value.trim()
            ? 'Cette valeur ne semble pas valide.'
            : 'Ce champ est nécessaire.';
          field.append(el('span', 'error', message));
        }
      });

      if (!valid) {
        status.textContent = '';
        var firstError = form.querySelector('.has-error input, .has-error textarea');
        if (firstError) firstError.focus();
        return;
      }

      envoyerLeMessage(form, status);
    });
  }

  /**
   * Le site est hébergé sans serveur : le message part par le logiciel de
   * courrier du visiteur, pré-rempli. Si aucune adresse n'est renseignée
   * dans le contenu, le formulaire n'est pas affiché du tout.
   */
  function envoyerLeMessage(form, status) {
    var nom = form.querySelector('#field-name').value.trim();
    var courriel = form.querySelector('#field-email').value.trim();
    var message = form.querySelector('#field-message').value.trim();

    var sujet = 'Message du site — ' + nom;
    var corps = [message, '', '—', nom, courriel].join('\n');

    // Un lien cliqué plutôt qu'une redirection : mieux supporté par les
    // navigateurs, et sans risque de blocage de fenêtre surgissante.
    var lien = document.createElement('a');
    lien.href =
      'mailto:' +
      encodeURIComponent(C.shop.email) +
      '?subject=' +
      encodeURIComponent(sujet) +
      '&body=' +
      encodeURIComponent(corps);
    lien.style.display = 'none';
    document.body.appendChild(lien);
    lien.click();
    lien.remove();

    status.textContent =
      'Votre logiciel de courrier s’ouvre avec le message prêt. Il ne reste qu’à l’envoyer.';
  }

  /** Sans adresse de contact, un formulaire qui n'envoie rien serait trompeur. */
  function preparerContact() {
    var form = $('#contact-form');
    if (C.shop.email) {
      setupForm();
      return;
    }

    var remplacement = el('div', 'contact-form');
    remplacement.append(
      el('h3', null, 'Me contacter'),
      el(
        'p',
        null,
        'Le plus simple est de passer par la boutique en ligne : les messages y arrivent ' +
          'directement.'
      )
    );

    if (C.shop.sumupUrl) {
      var lien = el('a', 'btn btn--primary', 'Écrire depuis la boutique');
      lien.href = C.shop.sumupUrl;
      lien.rel = 'noopener';
      remplacement.append(lien);
    }

    form.replaceWith(remplacement);
  }

  /* ---------------------------------------------------------
     Navigation, header, animations
     --------------------------------------------------------- */

  function setupNav() {
    var toggle = $('#menu-toggle');
    var nav = $('#site-nav');

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    var header = $('#site-header');
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var revealObserver;

  function observeReveals() {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(document.querySelectorAll('.reveal'), function (node) {
        node.classList.add('is-in');
      });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );
    }
    document.querySelectorAll('.reveal:not(.is-in)').forEach(function (node) {
      revealObserver.observe(node);
    });
  }

  /* ---------------------------------------------------------
     Démarrage

     L'installation de l'application (« Installer l'application »)
     n'est plus proposée ici : elle vit désormais dans les options de
     Françoise, sur la page « Modifier », avec le reste de ce qui ne
     doit pas apparaître sur la page commune.
     --------------------------------------------------------- */

  renderHero();
  renderUniverses();
  renderFilters();
  applyFilter('all');
  renderServices();
  renderMarkets();
  renderAbout();
  renderContact();
  renderFooter();
  renderCart();
  preparerContact();
  setupNav();
  observeReveals();

  $('#cart-button').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#overlay').addEventListener('click', closeCart);
  $('#cart-checkout').addEventListener('click', openModal);
  $('#checkout-close').addEventListener('click', closeModal);
  $('#modal-payer').addEventListener('click', payerParCarte);

  $('#checkout-modal').addEventListener('click', function (event) {
    if (event.target === this) closeModal();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      if (modalIsOpen()) return closeModal();
      if (cartIsOpen()) return closeCart();
    }
    if (modalIsOpen()) return trapFocus(event, $('#checkout-modal'));
    if (cartIsOpen()) trapFocus(event, $('#cart-drawer'));
  });
})();
