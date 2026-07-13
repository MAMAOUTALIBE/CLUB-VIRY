-- Rôles CRM additionnels demandés (cahier des charges) : éditeur, contributeur,
-- responsable sportif, responsable boutique. Ajout NON destructif à l'enum app_role
-- (les rôles existants et leurs rangs relatifs sont préservés).
-- Migration séparée du durcissement RLS : une nouvelle valeur d'enum ne peut pas être
-- utilisée dans la transaction qui l'ajoute (Postgres).

alter type public.app_role add value if not exists 'EDITEUR';
alter type public.app_role add value if not exists 'CONTRIBUTEUR';
alter type public.app_role add value if not exists 'RESP_SPORTIF';
alter type public.app_role add value if not exists 'RESP_BOUTIQUE';
