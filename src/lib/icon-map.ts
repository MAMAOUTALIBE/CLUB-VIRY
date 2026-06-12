import {
  Award,
  Building2,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Flag,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Home,
  Landmark,
  MapPin,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Waves
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Les icônes lucide-react sont des composants — non sérialisables en base.
 * Le CMS stocke donc un NOM (string) ; ce mapping le résout en composant au rendu.
 * Toute valeur inconnue retombe sur une icône neutre (jamais de crash).
 */
const ICONS: Record<string, LucideIcon> = {
  Award,
  Building2,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Flag,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Home,
  Landmark,
  MapPin,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Waves
};

/** Liste des noms d'icônes autorisés (pour l'aide de saisie dans l'admin). */
export const ICON_NAMES = Object.keys(ICONS);

/** Résout un nom d'icône en composant lucide-react, avec repli neutre. */
export function iconByName(name: string | undefined | null): LucideIcon {
  if (name && ICONS[name]) {
    return ICONS[name];
  }
  return Sparkles;
}
