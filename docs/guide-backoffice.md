# Guide du back-office

Le back-office permet de mettre à jour **l’équipe** (membres, photos, prise de RDV) et **les groupes** du site,
sans passer par un développeur.

## Se connecter

1. Ouvrez l’adresse du site suivie de `/backoffice` (`https://<adresse du site>/backoffice`).
2. Saisissez le mot de passe partagé, puis **Se connecter**.
3. La session dure 8 heures. **Se déconnecter** en fin de travail, surtout sur un ordinateur partagé.

Après 5 erreurs de mot de passe, la connexion est bloquée 15 minutes.

## Enregistrer puis publier

Les modifications se font en deux temps :

1. **Enregistrer** : la modification est gardée dans le back-office, mais **n’apparaît pas encore sur le site**.
   En haut de page, « Modifications non publiées » s’affiche.
2. **Publier les modifications** : toutes les modifications enregistrées sont mises en ligne d’un coup. Le site est
   à jour **environ 2 minutes** plus tard.

Regroupez vos changements avant de publier : chaque publication reconstruit le site.

**Annuler les modifications** efface tout ce qui a été enregistré depuis la dernière publication et revient à la
version en ligne.

## L’équipe

- **Ajouter un membre** : remplissez tous les champs, puis **Enregistrer**.
- **Modifier** : ouvre la fiche du membre. **Annuler** referme sans rien changer.
- **Monter / Descendre** : change l’ordre d’affichage sur le site.
- **Supprimer** : une confirmation est demandée.

**Photo** : JPEG, PNG ou WebP, 5 Mo maximum. Elle est recadrée en portrait sur le site : préférez une photo où le
visage est centré. Pensez à **Enregistrer** le membre après avoir ajouté ou retiré une photo.

**Prise de RDV** (5 maximum par membre) :

- **Téléphone** : par exemple `05 59 00 00 00` ;
- **E-mail** : une adresse complète, par exemple `nom@exemple.fr` ;
- **Lien** (Doctolib…) : l’adresse complète, commençant par `https://`.

Le « texte affiché » est ce que verront les visiteurs (par exemple « Prendre RDV sur Doctolib »).

## Les groupes

Chaque groupe a un **nom** et une **description**. Les boutons fonctionnent comme pour l’équipe.

## Sauvegarde

**Exporter (sauvegarde)** télécharge un fichier avec tout le contenu (publié et en cours). Faites-en une de temps
en temps et avant une grosse modification : il permet de tout restaurer en cas d’erreur.

## En cas de problème

- « Session expirée » : rechargez la page et reconnectez-vous.
- « Champs à corriger » : vérifiez les champs indiqués (souvent un e-mail ou un lien incomplet).
- Le site n’est pas à jour après 5 minutes : contactez le développeur.
- Mot de passe oublié ou à changer : contactez le développeur. Un changement de mot de passe déconnecte tout le
  monde.
