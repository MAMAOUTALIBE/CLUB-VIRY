# Cahier des charges CRM - ES Viry-Chatillon Football

Date : 2026-06-06

## 1. Vision

Le CRM doit devenir le centre de pilotage unique de l'ES Viry-Chatillon Football. Il ne doit pas etre un simple panneau d'administration du site, mais le cerveau operationnel du club : gouvernance, sportif, familles, inscriptions, finances, boutique, partenaires, communication, medias, evenements et reporting doivent etre geres depuis une seule interface.

L'objectif est de donner a chaque role une vue claire de ce qu'il doit faire :

- le president pilote l'etat general du club ;
- les dirigeants suivent les priorites, les risques et les indicateurs ;
- le tresorier suit paiements, cotisations, commandes, factures et tresorerie ;
- le secretaire general gere inscriptions, dossiers, documents et licences ;
- le charge de communication pilote le site, les actualites, les medias et les campagnes ;
- les educateurs gerent leurs equipes, convocations, presences, resultats et joueurs ;
- les familles suivent leurs enfants, documents, paiements et convocations ;
- les partenaires suivent leur fiche, leur contrat et leurs actions ;
- les benevoles accedent uniquement aux missions qui leur sont confiees.

Le CRM doit etre professionnel, rapide, moderne et sobre. L'inspiration produit est plus proche de Notion, Linear, HubSpot, Stripe Dashboard et Vercel Dashboard que d'un ancien back-office. L'interface doit privilegier les listes filtrables, les fiches 360 degres, les actions rapides, les statuts lisibles et les tableaux de bord metier.

## 2. Audit du backend existant

Le backend Next.js/Supabase est deja structure autour des principaux domaines du club. Les fondations presentes sont solides pour demarrer un CRM.

### 2.1 Tables et domaines existants

- Authentification et profils : `profiles`, roles applicatifs, statuts, RLS, logs.
- Saisons et categories : `seasons`, `categories`.
- Familles et joueurs : `families`, `family_members`, `players`, `player_guardians`.
- Inscriptions : `registrations`, `registration_documents`, statuts de dossier et documents.
- Documents : bucket prive `club-documents`, generation d'URL signee.
- Equipes et sportif : `teams`, `team_staff`, `team_players`, `matches`.
- Calendrier : `club_events`, visibilites publique, membres et staff.
- Contenus : `news`, `media_albums`, `media_assets`.
- Partenaires : `partners`, `partnership_requests`.
- Recrutement : `recruitment_applications`.
- Boutique et paiements : `product_categories`, `products`, `product_variants`, `orders`, `order_items`, `payments`.
- Contact et notifications : `contact_messages`, `notification_logs`.
- Administration : `activity_logs`, dashboard admin, exports CSV.

### 2.2 API existantes

Le projet expose deja des routes publiques, membre, famille, educateur et admin :

- public : actualites, equipes, matchs, calendrier, medias, partenaires, boutique ;
- famille : foyer, enfants, inscriptions, documents, commandes, paiements ;
- educateur : equipes rattachees, effectif, matchs ;
- admin : utilisateurs, inscriptions, documents, equipes, matchs, calendrier, news, medias, partenaires, recrutement, boutique, paiements, notifications, exports, logs, dashboard.

### 2.3 Permissions existantes

Les roles actuels sont :

- `SUPER_ADMIN`
- `ADMIN_CLUB`
- `DIRIGEANT`
- `EDUCATEUR`
- `FAMILLE`
- `JOUEUR`
- `MEMBRE`
- `PARTENAIRE`
- `VISITEUR`

Les permissions actuelles sont globales : acces admin, gestion utilisateurs, contenus, equipes, joueurs, matchs, inscriptions, documents, paiements, boutique, partenaires, famille, joueur, educateur, partenaire et lecture publique.

### 2.4 Points forts

- Architecture modulaire deja coherente.
- Separation public / admin / educateur / famille.
- RLS activee sur les tables sensibles.
- Logs d'activite et notifications deja prevus.
- Statuts metier deja formalises pour inscriptions, documents, commandes, paiements, contenus, demandes et recrutement.
- Exports CSV deja amorces.

### 2.5 Ecarts pour atteindre le CRM cible

- Permissions trop larges pour un vrai pilotage par fonction.
- Pas encore de fiches 360 degres completes pour famille, joueur, equipe, partenaire et paiement.
- Pas encore de module CMS complet pour modifier toutes les pages, menus, blocs, banniere et footer sans developpeur.
- Pas de workflow de convocations detaille : selection joueurs, reponses, relances, presence.
- Pas de presences aux entrainements.
- Pas de comptabilite operationnelle : factures, avoirs, depenses, budget, rapprochement.
- Pas de CRM partenaires avance : contrats, renouvellements, relances, historique commercial.
- Pas de module benevoles, taches, missions et disponibilites.
- Pas de reporting transverse par saison, categorie, equipe et role.
- Pas de moteur d'automatisations configurable.
- Pas de couche IA interne.

## 3. Architecture fonctionnelle cible

Le CRM doit etre organise en quatre couches.

### 3.1 Couche pilotage

- Tableau de bord president.
- Tableau de bord dirigeant.
- Tableau de bord tresorier.
- Tableau de bord communication.
- Tableau de bord sportif.
- Tableau de bord secretariat.
- Tableau de bord educateur.
- Tableau de bord famille.
- Centre de notifications et priorites.

### 3.2 Couche metier

- CMS et site.
- Actualites.
- Medias.
- Utilisateurs et droits.
- Familles.
- Joueurs.
- Inscriptions.
- Documents.
- Equipes.
- Matchs.
- Entrainements et presences.
- Calendrier et evenements.
- Communications.
- Finances.
- Boutique.
- Partenaires.
- Recrutement.
- Benevoles.
- Taches internes.

### 3.3 Couche donnees

- Fiches 360 degres.
- Recherche globale.
- Filtres avances.
- Segments dynamiques.
- Exports.
- Historique d'activite.
- Journal des communications.
- Documents et pieces jointes.
- Statistiques par saison.

### 3.4 Couche automatisations

- Regles de relance.
- Notifications transactionnelles.
- Alertes de risque.
- Taches automatiques.
- Generation de contenus.
- Synchronisations futures : paiement, email, FFF, reseaux sociaux.

## 4. Principes UX/UI

Le CRM doit etre concu comme un outil de travail quotidien.

- Navigation laterale compacte avec groupes : Pilotage, Sportif, Administration, Communication, Finance, Boutique, Partenaires, Parametres.
- Barre superieure avec recherche globale, saison active, creation rapide, notifications, profil.
- Pages liste avec filtres sauvegardables, tri, recherche, vues segmentes et actions groupees.
- Fiches detail en onglets : resume, activite, documents, paiements, communications, notes.
- Statuts visibles avec libelles courts et couleurs sobres.
- Actions importantes toujours contextualisees : valider, relancer, convoquer, publier, rembourser, archiver.
- Pas de cards decoratives inutiles. Les cards servent aux indicateurs, fiches courtes et elements repetes.
- Affichage dense mais lisible pour les dirigeants et secretaires.
- Interface responsive, mais priorite a l'usage desktop/tablette pour les roles administratifs.

## 5. Modules CRM

### 5.1 Accueil CRM et centre de pilotage

Objectif : afficher les priorites du club des l'ouverture.

Fonctions :

- Vue "Aujourd'hui" : matchs, entrainements, evenements, echeances, dossiers urgents.
- Vue "A traiter" : inscriptions en attente, documents refuses, paiements en retard, messages sans reponse, notifications echouees.
- Vue "Risques" : stock faible, contrat partenaire proche expiration, paiement en retard, dossier incomplet, match sans convocation.
- Activite recente : validations, paiements, publications, commandes, modifications critiques.
- Raccourcis de creation : actualite, match, evenement, campagne email, produit, partenaire, inscription.

### 5.2 CMS site

Objectif : permettre au charge de communication de modifier le site sans developpeur.

Fonctions :

- Gestion des pages : accueil, club, histoire, president, stade, organigramme, equipes, inscriptions, boutique, partenaires, contact, pages legales.
- Editeur de blocs : hero, texte, image, grille, CTA, statistiques, galerie, video, partenaires, calendrier, liste d'actualites.
- Gestion des menus : navigation principale, menus secondaires, ordre, liens externes.
- Gestion du footer : coordonnees, reseaux sociaux, liens utiles, mentions.
- Gestion des bannieres : alerte club, annonce recrutement, inscription ouverte, evenement important.
- Previsualisation desktop/mobile.
- Brouillon, publication, archivage, historique de versions.
- SEO par page : titre, description, image sociale, slug.
- Workflow de validation optionnel : brouillon communication -> relecture dirigeant -> publication.

Objets a prevoir :

- `cms_pages`
- `cms_blocks`
- `cms_menus`
- `cms_menu_items`
- `cms_site_settings`
- `cms_revisions`

### 5.3 Actualites

Objectif : publier et planifier les contenus editoriaux du club.

Fonctions :

- Creation, modification, brouillon, publication, planification, archivage.
- Categories : club, sportif, jeunes, seniors, feminin, boutique, partenaires, evenement, benevoles.
- Tags.
- Image de couverture, video, galerie associee.
- SEO et partage social.
- Auteur, relecteur, date de publication.
- Publication automatique selon `published_at`.
- Suggestions IA : titre, resume, correction, hashtags.
- Liaison possible avec match, equipe, evenement, partenaire ou album.

Ameliorations de l'existant :

- Ajouter categories et tags a `news`.
- Ajouter workflow de relecture.
- Ajouter revisions et apercu public.

### 5.4 Medias

Objectif : gerer la phototheque et videotheque du club.

Fonctions :

- Upload photos/videos.
- Albums par saison, equipe, evenement, match ou categorie.
- Compression, thumbnails, optimisation images.
- Recherche par titre, tags, equipe, saison, personne associee.
- Statuts : brouillon, publie, archive.
- Selection "a la une".
- Gestion du droit a l'image.
- Liaison avec actualite, equipe, match, partenaire.
- Preparation reseaux sociaux : format carre, story, paysage.

Objets complementaires :

- `media_tags`
- `media_asset_tags`
- `media_usages`
- `image_right_consents`

### 5.5 Communication

Objectif : centraliser toutes les communications du club.

Canaux :

- Email transactionnel.
- Newsletter.
- Convocation.
- Rappel.
- Message familles.
- Message partenaires.
- Notification interne CRM.
- Futur : SMS, WhatsApp, push mobile.

Ciblage :

- Tous les licencies.
- Une equipe.
- Une categorie.
- Les familles d'une equipe.
- Les educateurs.
- Les dirigeants.
- Les partenaires.
- Les benevoles.
- Les personnes avec document manquant.
- Les personnes avec paiement en retard.
- Segment manuel sauvegarde.

Fonctions :

- Editeur de campagnes.
- Templates reutilisables.
- Previsualisation.
- Envoi test.
- Planification.
- Journal d'envoi.
- Taux d'ouverture et clics si provider compatible.
- Gestion des echecs.
- Desinscription newsletter.
- Historique par fiche famille/joueur/partenaire.

Objets a prevoir :

- `communication_templates`
- `communication_campaigns`
- `communication_recipients`
- `communication_events`
- `audience_segments`

### 5.6 Utilisateurs, roles et permissions

Objectif : donner le bon acces a la bonne personne.

Roles cibles :

- Super administrateur.
- President.
- Vice-president.
- Tresorier.
- Secretaire general.
- Responsable communication.
- Responsable sportif.
- Responsable categorie.
- Educateur.
- Administrateur club.
- Benevole.
- Famille.
- Joueur.
- Partenaire.
- Membre.
- Visiteur.

Le role `DIRIGEANT` existant doit etre conserve mais specialise par permissions ou sous-role.

Permissions ciblees :

- `dashboard:view_global`
- `dashboard:view_finance`
- `dashboard:view_sport`
- `dashboard:view_communication`
- `users:read`, `users:write`, `users:assign_roles`
- `cms:read`, `cms:write`, `cms:publish`
- `news:write`, `news:publish`
- `media:write`, `media:publish`
- `families:read`, `families:write`
- `players:read`, `players:write`, `players:medical_read`
- `registrations:read`, `registrations:review`, `registrations:validate`
- `documents:read`, `documents:review`, `documents:delete`
- `teams:read`, `teams:write`
- `team_roster:write`
- `matches:write`, `matches:publish_result`
- `trainings:write`, `attendance:write`
- `communications:send`
- `finance:read`, `finance:write`, `finance:refund`
- `shop:write`, `stock:write`
- `partners:write`, `partner_contracts:read`, `partner_contracts:write`
- `reports:export`
- `settings:write`
- `logs:read`

Principe : les roles donnent une base, les permissions affinent le perimetre. Un educateur ne voit que ses equipes. Un responsable categorie voit les equipes de sa categorie. Une famille ne voit que son foyer.

### 5.7 Familles

Objectif : offrir une vue 360 degres du foyer.

Fiche famille :

- Coordonnees principales.
- Responsables legaux.
- Enfants inscrits.
- Personnes autorisees a recuperer l'enfant.
- Documents.
- Inscriptions par saison.
- Paiements et recus.
- Commandes boutique.
- Convocations.
- Messages envoyes.
- Notes internes.
- Historique complet.

Actions :

- Ajouter un enfant.
- Demander un document.
- Relancer un paiement.
- Envoyer un message.
- Transferer un enfant d'equipe.
- Marquer un risque ou une information importante.

### 5.8 Joueurs

Objectif : suivre chaque joueur sur le plan administratif et sportif.

Fiche joueur :

- Identite.
- Famille rattachee.
- Saison active.
- Categorie et equipe.
- Numero de licence.
- Documents.
- Paiements associes.
- Convocations.
- Presences entrainement.
- Matchs joues.
- Poste, numero, informations sportives.
- Notes educateur.
- Restrictions medicales visibles uniquement aux roles autorises.

Actions :

- Affecter a une equipe.
- Changer de categorie.
- Marquer absent.
- Ajouter note sportive.
- Exporter fiche.
- Contacter famille.

### 5.9 Inscriptions et documents

Objectif : transformer l'inscription en workflow fluide.

Workflow :

1. Famille cree ou selectionne un enfant.
2. Famille demarre une inscription pour la saison active.
3. Le CRM genere la checklist documentaire.
4. Famille depose les documents.
5. Secretariat controle les pieces.
6. Dossier passe en "a payer" ou "complet".
7. Paiement cotisation.
8. Validation finale.
9. Affectation equipe.
10. Notification famille et educateur.

Statuts cibles :

- brouillon ;
- soumis ;
- en controle ;
- documents manquants ;
- documents valides ;
- paiement attendu ;
- paiement partiel ;
- valide ;
- refuse ;
- annule ;
- archive.

Fonctions :

- Checklists par categorie/saison.
- Documents obligatoires ou optionnels.
- Motif de refus document.
- Relance automatique.
- Paiement en une ou plusieurs fois.
- Reduction famille, aide, coupon, exoneration.
- Export licencies.
- Historique des validations.

### 5.10 Equipes

Objectif : piloter chaque equipe comme une unite operationnelle.

Fiche equipe :

- Saison, categorie, niveau.
- Staff.
- Effectif.
- Calendrier.
- Matchs.
- Entrainements.
- Presences.
- Resultats.
- Statistiques.
- Documents d'equipe.
- Communications envoyees.
- Galerie et actualites associees.

Actions :

- Ajouter joueur.
- Affecter staff.
- Creer entrainement.
- Creer match.
- Convoquer joueurs.
- Envoyer message a l'equipe.
- Exporter effectif.

### 5.11 Entrainements et presences

Objectif : donner aux educateurs un outil concret de suivi.

Fonctions :

- Planning entrainement par equipe.
- Lieu, horaire, theme, notes.
- Liste attendue.
- Presence, absence, retard, excuse.
- Commentaire educateur.
- Statistiques de presence par joueur, equipe et saison.
- Alertes absences repetees.
- Communication automatique aux familles si besoin.

Objets a prevoir :

- `training_sessions`
- `training_attendance`

### 5.12 Matchs, convocations et resultats

Objectif : gerer tout le cycle match.

Workflow :

1. Creer le match.
2. Definir equipe, adversaire, competition, lieu, horaire.
3. Selectionner les joueurs convoques.
4. Envoyer convocation.
5. Collecter reponses : present, absent, incertain.
6. Relancer les non-repondants.
7. Generer feuille de match interne.
8. Saisir score, buteurs, passeurs, cartons, notes.
9. Publier resultat.
10. Generer resume ou actualite.

Objets a prevoir :

- `match_convocations`
- `match_convocation_recipients`
- `match_events`
- `match_reports`
- `competitions`
- `standings`

### 5.13 Calendrier et evenements

Objectif : unifier matchs, entrainements, reunions, evenements, deadlines et tournois.

Fonctions :

- Vue calendrier globale.
- Filtres par equipe, categorie, type, visibilite.
- Evenements publics, membres, staff.
- Deadlines administratives.
- Inscription a un evenement.
- Besoins benevoles associes.
- Export ICS.
- Rappels automatiques.

### 5.14 Finances

Objectif : donner au tresorier une vision fiable et actionnable.

Perimetre :

- Cotisations.
- Paiements boutique.
- Factures.
- Recus.
- Remboursements.
- Depenses.
- Recettes.
- Avoirs.
- Remises.
- Dons.
- Packs partenaires.

Dashboard :

- Chiffre d'affaires par source.
- Paiements recus.
- Paiements en attente.
- Paiements en retard.
- Tresorerie previsionnelle.
- Remboursements.
- Commandes non reglees.
- Cotisations par categorie.

Fonctions :

- Creation facture/recu.
- Suivi paiement partiel.
- Rapprochement manuel.
- Export comptable.
- Notes tresorier.
- Relances automatiques.
- Historique financier par famille, commande et partenaire.

Objets a prevoir :

- `invoices`
- `invoice_items`
- `refunds`
- `expenses`
- `finance_categories`
- `payment_plans`
- `payment_installments`

### 5.15 Boutique

Objectif : gerer le catalogue, les stocks et les commandes.

Fonctions :

- Produits, categories, variants, tailles, couleurs.
- Stock par variant.
- Alertes stock faible.
- Commandes : paiement, preparation, pret, livre, annule, rembourse.
- Retours.
- Livraison ou retrait club.
- Notes internes.
- Export commandes.
- Statistiques : meilleures ventes, panier moyen, CA, stock dormant.

Ameliorations de l'existant :

- Ajouter mouvements de stock.
- Ajouter retraits/livraisons.
- Ajouter retours et avoirs.

### 5.16 Partenaires

Objectif : creer un CRM partenaires complet.

Fiche partenaire :

- Societe.
- Contacts.
- Email, telephone, adresse.
- Site web.
- Logo.
- Niveau de partenariat.
- Contrat.
- Montant.
- Date de debut.
- Date de fin.
- Renouvellement.
- Visibilite achetee : maillot, panneau, site, reseaux, evenement.
- Factures et paiements.
- Historique d'echanges.
- Notes internes.

Suivi :

- Pipeline : prospect, contacte, proposition envoyee, negocie, signe, actif, a renouveler, perdu, archive.
- Relances.
- Echeances.
- Taches commerciales.
- Opportunites.
- Documents contractuels.

Objets a prevoir :

- `partner_contacts`
- `partner_contracts`
- `partner_interactions`
- `partner_opportunities`
- `partner_tasks`

### 5.17 Recrutement et detections

Objectif : traiter les candidatures joueurs de maniere propre.

Fonctions :

- Candidatures publiques.
- Qualification par categorie, poste, niveau, club actuel.
- Statuts : recu, contacte, essai planifie, accepte, refuse, archive.
- Convocation detection.
- Notes staff.
- Transformation en joueur ou inscription.
- Export.
- Notifications famille/candidat.

### 5.18 Benevoles et missions

Objectif : mieux organiser l'aide autour du club.

Fonctions :

- Fiches benevoles.
- Competences : buvette, transport, administratif, evenement, photo, arbitrage, logistique.
- Disponibilites.
- Missions par evenement.
- Affectation.
- Rappel automatique.
- Historique participation.

Objets a prevoir :

- `volunteers`
- `volunteer_skills`
- `volunteer_availabilities`
- `volunteer_missions`
- `volunteer_assignments`

### 5.19 Taches internes

Objectif : eviter que les demandes restent dans les discussions informelles.

Fonctions :

- Taches liees a une famille, joueur, inscription, partenaire, commande, match ou evenement.
- Assignation.
- Priorite.
- Echeance.
- Commentaires internes.
- Statuts : a faire, en cours, bloque, termine, annule.
- Vues par role et par personne.

Objets a prevoir :

- `tasks`
- `task_comments`
- `task_links`

### 5.20 Parametres club

Objectif : rendre le CRM configurable.

Fonctions :

- Saison active.
- Categories.
- Tarifs cotisation.
- Documents obligatoires.
- Templates email.
- Coordonnees club.
- Reseaux sociaux.
- RIB ou moyens de paiement hors ligne.
- Parametres de notification.
- Seuils d'alerte.
- Gestion des imports/exports.

## 6. Tableaux de bord

### 6.1 President

- Nombre de licencies par saison, categorie et evolution.
- Inscriptions validees, en attente, bloquees.
- Situation financiere : encaisse, attendu, retard, boutique, partenaires.
- Partenariats actifs, a renouveler, montant total.
- Activite sportive : matchs, resultats, evenements majeurs.
- Risques : documents manquants, impayes, contrats expirants, messages non traites.
- Activite CRM recente.

### 6.2 Tresorier

- Paiements recus aujourd'hui, semaine, mois, saison.
- Cotisations payees, partielles, en retard.
- Commandes boutique payees et en attente.
- Factures partenaires.
- Remboursements.
- Depenses par categorie.
- Tresorerie previsionnelle.
- Exports comptables.

### 6.3 Secretariat

- Dossiers d'inscription par statut.
- Documents a verifier.
- Documents refuses.
- Licences manquantes.
- Familles a relancer.
- Joueurs sans equipe.
- Dossiers valides cette semaine.

### 6.4 Communication

- Actualites brouillon, planifiees, publiees.
- Pages CMS modifiees recemment.
- Albums a publier.
- Campagnes envoyees.
- Taux d'ouverture et clics.
- Contenus proposes par IA.
- Evenements a communiquer.

### 6.5 Sportif

- Equipes actives.
- Matchs a venir.
- Resultats recents.
- Convocations sans reponse.
- Presences entrainement.
- Joueurs blesses ou absents repetes.
- Effectifs incomplets par equipe.

### 6.6 Educateur

- Mes equipes.
- Prochains entrainements.
- Prochains matchs.
- Convocations a envoyer.
- Reponses des familles.
- Presences recentes.
- Notes joueurs.
- Messages equipe.

### 6.7 Famille

- Mes enfants.
- Dossiers d'inscription.
- Documents attendus.
- Paiements.
- Convocations.
- Prochains matchs et entrainements.
- Commandes boutique.
- Messages du club.

### 6.8 Partenaire

- Fiche partenaire.
- Contrat actif.
- Visibilites prevues.
- Factures et paiements.
- Contacts club.
- Evenements partenaires.

## 7. Workflows principaux

### 7.1 Publication site

1. Communication cree une page, un bloc ou une actualite.
2. Contenu passe en brouillon.
3. Previsualisation.
4. Relecture optionnelle par dirigeant.
5. Publication immediate ou planifiee.
6. Notification interne.
7. Historique de version conserve.

### 7.2 Inscription joueur

1. Famille cree son foyer.
2. Famille ajoute l'enfant.
3. Famille soumet le dossier.
4. Le CRM cree les documents attendus.
5. Secretariat controle.
6. Tresorier verifie paiement.
7. Dirigeant ou admin valide.
8. Joueur est affecte a une equipe.
9. Famille et educateur sont notifies.

### 7.3 Paiement cotisation

1. Cotisation calculee selon saison, categorie, reductions et plan de paiement.
2. Paiement cree.
3. Paiement reussi, echoue ou rembourse.
4. Dossier mis a jour automatiquement.
5. Recu/facture genere.
6. Relance si impaye.

### 7.4 Convocation match

1. Educateur cree ou selectionne un match.
2. Educateur choisit les joueurs.
3. CRM envoie les convocations.
4. Familles repondent.
5. CRM relance les non-reponses.
6. Educateur suit les presents/absents.
7. Resultat et resume sont publies apres match.

### 7.5 Commande boutique

1. Client commande.
2. Paiement ou reservation.
3. Stock reserve puis decremente.
4. Commande passe en preparation.
5. Retrait/livraison.
6. Notification client.
7. Retour ou remboursement si besoin.

### 7.6 Partenariat

1. Demande ou prospect cree.
2. Responsable partenaire qualifie.
3. Proposition envoyee.
4. Contrat signe.
5. Facture emise.
6. Visibilites planifiees.
7. Relances de renouvellement automatiques.

### 7.7 Traitement message contact

1. Message recu.
2. Notification admin.
3. Assignation.
4. Reponse.
5. Statut mis a jour.
6. Historique conserve.

## 8. Notifications

### 8.1 Types

- Interne CRM.
- Email transactionnel.
- Newsletter.
- Convocation.
- Rappel.
- Alerte dirigeant.
- Notification educateur.
- Notification famille.
- Notification partenaire.

### 8.2 Evenements a notifier

- Nouveau dossier d'inscription.
- Document depose.
- Document refuse.
- Dossier valide.
- Paiement recu.
- Paiement echoue.
- Paiement en retard.
- Commande confirmee.
- Commande prete.
- Match cree.
- Convocation envoyee.
- Absence non justifiee.
- Resultat publie.
- Nouvelle actualite.
- Album publie.
- Message contact recu.
- Candidature detection recue.
- Demande partenaire recue.
- Contrat partenaire proche expiration.
- Stock faible.
- Notification echouee.

### 8.3 Regles

- Chaque notification doit avoir un template.
- Chaque envoi doit etre journalise.
- Les echecs doivent etre visibles dans le dashboard.
- Les emails de masse doivent respecter le consentement et la desinscription.
- Les donnees sensibles ne doivent pas etre exposees dans les emails.

## 9. Automatisations

Automatisations prioritaires :

- Relance document manquant a J+2, J+7, J+14.
- Relance cotisation impayee.
- Notification secretaire pour dossier bloque.
- Notification tresorier pour paiement echoue.
- Notification educateur quand un joueur est affecte a son equipe.
- Rappel convocation 48h avant match.
- Relance non-reponse convocation 24h avant match.
- Rappel entrainement selon preference famille.
- Alerte absences repetees.
- Anniversaire joueur.
- Publication automatique actualite planifiee.
- Archivage automatique des contenus de saison precedente.
- Alerte stock faible.
- Relance commande non retiree.
- Relance partenaire 90, 60 et 30 jours avant fin de contrat.
- Creation automatique de tache apres message contact non traite 48h.
- Generation hebdomadaire du digest dirigeant.
- Export mensuel finance programme.
- Detection des dossiers valides sans equipe.
- Detection des joueurs sans paiement complet.
- Detection des matchs sans score 24h apres la rencontre.

Le moteur cible doit permettre :

- declencheur ;
- conditions ;
- action ;
- canal ;
- temporisation ;
- destinataires ;
- journal d'execution.

## 10. Reporting et statistiques

### 10.1 Indicateurs club

- Nombre de licencies par saison.
- Evolution inscriptions.
- Repartition par categorie, genre, equipe.
- Taux de dossiers complets.
- Delai moyen de validation.
- Taux documents refuses.
- Taux paiement complet.
- Taux impayes.
- Engagement communication.
- Nombre de partenaires actifs.
- CA partenaires.
- CA boutique.
- CA cotisations.
- Presences entrainement.
- Resultats sportifs.

### 10.2 Exports

- Licencies.
- Familles.
- Inscriptions.
- Documents manquants.
- Paiements.
- Commandes.
- Produits et stock.
- Partenaires.
- Candidatures detection.
- Presences.
- Convocations.
- Logs.

### 10.3 Vues analytiques

- Par saison.
- Par equipe.
- Par categorie.
- Par statut.
- Par periode.
- Par responsable.
- Par source de revenu.
- Par campagne.

## 11. Assistant IA interne

L'IA doit etre un assistant de productivite, pas un decisionnaire.

Cas d'usage pertinents :

- Rediger une actualite a partir d'un resultat, de notes ou d'une feuille de match.
- Generer un resume de match.
- Proposer un titre, un extrait SEO et des tags.
- Generer une newsletter hebdomadaire.
- Rediger une convocation.
- Reformuler un message famille avec un ton professionnel.
- Resumer les messages contact.
- Analyser les statistiques du club.
- Identifier les dossiers a risque.
- Proposer une relance partenaire.
- Generer un digest president.
- Aider a classer les medias.
- Proposer une checklist evenement.

Garde-fous :

- L'IA ne publie pas sans validation humaine.
- L'IA ne modifie pas les donnees critiques sans confirmation.
- Les donnees personnelles doivent etre minimisees dans les prompts.
- Les generations doivent etre journalisees.
- Les suggestions doivent etre distinguees des donnees verifiees.

Objets a prevoir :

- `ai_requests`
- `ai_generated_drafts`
- `ai_user_feedback`

## 12. Modele de donnees complementaire cible

Tables a ajouter progressivement :

- CMS : `cms_pages`, `cms_blocks`, `cms_menus`, `cms_menu_items`, `cms_site_settings`, `cms_revisions`.
- Communication : `communication_templates`, `communication_campaigns`, `communication_recipients`, `communication_events`, `audience_segments`.
- Convocations : `match_convocations`, `match_convocation_recipients`, `match_events`, `match_reports`, `competitions`, `standings`.
- Entrainements : `training_sessions`, `training_attendance`.
- Finance : `invoices`, `invoice_items`, `refunds`, `expenses`, `finance_categories`, `payment_plans`, `payment_installments`.
- Boutique : `stock_movements`, `shop_fulfillments`, `shop_returns`.
- Partenaires : `partner_contacts`, `partner_contracts`, `partner_interactions`, `partner_opportunities`, `partner_tasks`.
- Benevoles : `volunteers`, `volunteer_skills`, `volunteer_availabilities`, `volunteer_missions`, `volunteer_assignments`.
- Taches : `tasks`, `task_comments`, `task_links`.
- Automatisations : `automation_rules`, `automation_runs`, `automation_actions`.
- IA : `ai_requests`, `ai_generated_drafts`, `ai_user_feedback`.

## 13. Securite, RGPD et audit

Principes obligatoires :

- RLS activee sur toutes les tables sensibles.
- Verification serveur des permissions avant chaque mutation.
- Journalisation des actions critiques.
- Documents prives via URL signee temporaire.
- Separation donnees publiques et donnees internes.
- Donnees medicales visibles uniquement aux roles autorises.
- Consentement droit a l'image.
- Droit export/suppression selon RGPD.
- Conservation limitee des documents sensibles.
- Double confirmation pour suppression, remboursement, role privilegie, publication massive.
- Protection rate limiting sur login, contact, upload, newsletter, paiement.
- Sauvegarde et restauration documentees.

## 14. Plan d'execution

### Phase 1 - Socle CRM

- Layout CRM.
- Navigation par role.
- Dashboard global.
- Recherche globale.
- Centre de notifications.
- Fiches 360 degres famille, joueur, equipe.
- Permissions ciblees.

### Phase 2 - Secretariat et inscriptions

- Liste dossiers avancee.
- Fiche inscription complete.
- Review documents.
- Relances.
- Export licences.
- Affectation equipe.

### Phase 3 - CMS, actualites et medias

- CMS pages/blocs.
- Menus/footer.
- Actualites avancees.
- Albums et media manager.
- Previsualisation et publication planifiee.

### Phase 4 - Sportif

- Equipes avancees.
- Entrainements.
- Presences.
- Convocations.
- Resultats et resumes.
- Dashboard educateur.

### Phase 5 - Finance et boutique

- Cotisations.
- Factures et recus.
- Paiements partiels.
- Remboursements.
- Stocks.
- Retours.
- Dashboard tresorier.

### Phase 6 - Partenaires, benevoles et taches

- CRM partenaires complet.
- Contrats et renouvellements.
- Benevoles et missions.
- Taches internes.

### Phase 7 - Automatisations et IA

- Moteur de regles.
- Digests.
- Relances avancees.
- Assistant IA contenu.
- Assistant IA pilotage.

## 15. Priorites de developpement recommandees

Ordre recommande :

1. CRM shell + dashboard global + permissions fines.
2. Fiches 360 degres famille/joueur/inscription.
3. Secretariat inscriptions/documents/paiements.
4. Module CMS minimum viable : pages, blocs, menus, footer.
5. Actualites et medias avances.
6. Equipes, convocations, presences.
7. Finance tresorier.
8. Boutique avancee.
9. Partenaires.
10. Automatisations.
11. IA.

Ce choix maximise l'impact : le club obtient rapidement une interface de pilotage utile, puis ajoute les modules les plus structurants sans casser les fondations deja en place.

## 16. Definition de reussite

Le CRM est considere reussi si :

- un dirigeant peut comprendre l'etat du club en moins de 5 minutes ;
- le secretariat peut traiter une inscription sans passer par des fichiers externes ;
- une famille peut suivre ses enfants, documents, paiements et convocations ;
- un educateur peut gerer son equipe sans demander l'aide d'un administrateur ;
- le tresorier peut suivre paiements, impayes, boutique et partenaires ;
- la communication peut modifier le site et publier sans developpeur ;
- les partenaires ont un suivi clair avec echeances et historique ;
- les actions importantes sont historisees ;
- les donnees sensibles sont protegees ;
- les relances recurrentes sont automatisees ;
- le club reduit les pertes d'information et les taches manuelles.
