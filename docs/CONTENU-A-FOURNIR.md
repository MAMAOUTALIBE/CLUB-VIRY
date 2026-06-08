# Contenus à fournir par le club — Personnalisation du site

> Tout ce qui est nécessaire pour remplacer les contenus de démonstration (photos Unsplash, textes et données fictifs) par les vrais éléments de l'ES Viry-Châtillon.
> Légende priorité : 🔴 indispensable au lancement · 🟠 fortement recommandé · 🟢 optionnel / phase 2.

---

## 1. Identité visuelle 🔴
- [ ] **Logo officiel** en haute résolution (SVG de préférence, sinon PNG fond transparent) — remplace `public/club-logo.svg`.
- [ ] **Couleurs officielles** exactes (codes) — actuellement vert `#002f1d` + jaune `#f7c600`. Confirmer ou corriger.
- [ ] **Slogan / devise** du club — actuellement « Une passion, notre force » et « Jaune et Vert ». À garder ?

## 2. Coordonnées du club 🔴 (affichées + utilisées pour le référencement local)
- [ ] **Adresse** exacte du stade — actuellement « Stade Henri Longuet, Avenue de l'Armée Leclerc, 91170 Viry-Châtillon ». Confirmer.
- [ ] **Téléphone** — actuellement « 01 69 24 39 50 ». Confirmer.
- [ ] **Email de contact public** — actuellement « contact@esviryfootball.com ». Confirmer.
- [ ] **Horaires** du secrétariat / d'accueil.
- [ ] **Année de fondation** — actuellement 1967. Confirmer.

## 3. Réseaux sociaux 🟠
- [ ] URL **Facebook**
- [ ] URL **Instagram**
- [ ] URL **YouTube**
- [ ] URL **TikTok**
- [ ] Numéro / lien **WhatsApp**
> (Les icônes existent déjà mais ne sont pas cliquables faute d'URL.)

## 4. Photos 🔴 (élément n°1 pour la crédibilité — remplacent les photos génériques Unsplash)
- [ ] **Photo « hero »** d'accueil : ambiance stade / match (paysage, haute déf).
- [ ] **Stade Henri Longuet** : extérieur, pelouse, tribunes, éclairage.
- [ ] **Une photo par équipe** (équipe fanion, école de foot, féminines, futsal, jeunes…).
- [ ] **École de foot / entraînements** (jeunes en action).
- [ ] **Supporters / ambiance** de match.
- [ ] **Photo du président** (pour la page « Mot du Président »).
- [ ] **Galerie médias** : sélection de photos (et vidéos / interviews si la rubrique doit en contenir).

## 5. Le Club 🟠
- [ ] **Histoire** : dates clés + texte (la frise chronologique est actuellement fictive).
- [ ] **Mot du Président** : nom du président + texte réel + photo.
- [ ] **Organigramme** : noms, fonctions et contacts (bureau, dirigeants, pôles).
- [ ] **Infos pratiques stade** : accès, parking, transports en commun, accessibilité PMR.
- [ ] **Chiffres clés** à confirmer/corriger : +600 licenciés · 50 éducateurs · 30 équipes · depuis 1967.

## 6. Équipes 🔴
- [ ] **Liste réelle des équipes / catégories** (nom, niveau, saison).
- [ ] Pour chaque équipe : **photo**, **staff** (éducateurs/coachs), jour/heure d'entraînement, et effectif si vous souhaitez l'afficher.
- [ ] **Liste exacte des catégories d'inscription** (sert au menu déroulant du formulaire d'inscription).

## 7. Calendrier & résultats 🟠
- [ ] **Matchs** réels : adversaire, date, heure, lieu, compétition (ou source officielle : FFF / district).
- [ ] **Classement** officiel (ou lien) — actuellement masqué (« Classement à venir ») pour ne rien inventer.
- [ ] **Événements** : stages, tournois, assemblée générale, dates importantes.

## 8. Actualités 🟠
- [ ] Quelques **vrais articles** de lancement : titre, date, **contenu complet**, image.
> (Le système d'articles est prêt ; il affiche aujourd'hui un texte « contenu à venir ».)

## 9. Inscriptions 🔴
- [ ] **Période d'inscription** — actuellement « du 09 juin à fin juin » (bandeau défilant). Confirmer/mettre à jour.
- [ ] **Étapes** réelles + **pièces à fournir**.
- [ ] **Tarifs des licences** par catégorie.
- [ ] **Email destinataire** des demandes d'inscription (voir §13).

## 10. Détections / Recrutement 🟢
- [ ] Catégories concernées, **process** de détection, **dates** des séances.

## 11. Partenaires 🟠
- [ ] **Liste réelle des partenaires** : nom, logo, lien.
> ⚠️ Les logos Nike / Adidas / Engie affichés en démo sont à retirer/remplacer (risque d'allégation non fondée).
- [ ] **Offres de sponsoring** : paliers, contreparties, tarifs (+ plaquette PDF si disponible).

## 12. Boutique 🟢 (décision à prendre)
- [ ] **Choix** : boutique « bientôt disponible » / lien externe / vraie boutique en ligne ?
- [ ] Si produits : nom, **prix**, **photos**, variantes (tailles), stock.
- [ ] **CGV** et **politique de livraison/retour** (pages actuellement vides).

## 13. Légal & RGPD 🔴 (obligatoire avant mise en ligne)
- [ ] **Mentions légales** : éditeur, directeur de publication, **hébergeur**, statut association (loi 1901), **RNA / SIRET**, n° d'affiliation FFF.
- [ ] **Politique de confidentialité** : responsable de traitement, finalité, **durée de conservation**, contact (important : le site collecte des données pouvant concerner des **mineurs**).

## 14. Technique — réception des formulaires & domaine 🔴
- [ ] **Email destinataire** des demandes (contact / inscription / recrutement) → variable `ADMIN_NOTIFICATIONS_EMAIL`.
- [ ] **(Recommandé) URL de webhook** pour être notifié en temps réel (relais email / Make / Zapier / Discord) → `NOTIFICATION_WEBHOOK_URL`.
- [ ] **Nom de domaine final** du site (pour les URLs, le partage social et le sitemap) → `NEXT_PUBLIC_SITE_URL` / `SITE_DOMAIN`.

## 15. Back-office / comptes — décision 🟢
- [ ] Souhaitez-vous **activer** l'espace membre/éducateur, le CRM admin et/ou la boutique en ligne ?
> Si oui, cela nécessite un **projet Supabase** (base de données + authentification). Tant que ce n'est pas activé, le site fonctionne en « vitrine » et les demandes sont reçues par email/webhook + fichier.

---

### Le minimum pour un lancement crédible (🔴)
Logo · coordonnées confirmées · **photos réelles (hero, stade, équipes)** · liste des équipes & catégories · infos d'inscription (période, pièces, tarifs) · **mentions légales + politique de confidentialité** · email de réception des demandes · nom de domaine.
