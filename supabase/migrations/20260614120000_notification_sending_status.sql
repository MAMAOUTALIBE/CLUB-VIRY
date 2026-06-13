-- Statut transitoire pour réserver une notification AVANT l'appel au provider email.
-- Évite le double-envoi en cas de dispatch concurrent : le dispatcher fait passer
-- la ligne de QUEUED -> SENDING de façon atomique (un seul run gagne) avant d'envoyer.
alter type public.notification_status add value if not exists 'SENDING';
