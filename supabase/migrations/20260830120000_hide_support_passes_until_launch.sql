-- Les offres restent pilotables dans le CRM mais invisibles dans la boutique
-- tant que le parcours paiement + validation manuelle n'est pas officiellement ouvert.
update public.products
set status = 'DRAFT'
where slug in ('pass-famille-plus', 'pass-supporter')
  and status = 'ACTIVE';
