"use client";

import { useEffect } from "react";

/**
 * Dissuasion du téléchargement des images.
 *
 * - Bloque le menu contextuel (« Enregistrer l'image sous… ») et le glisser-déposer
 *   sur les images et figures.
 * - Bloque les raccourcis d'enregistrement de page (Ctrl/Cmd+S) et d'impression (Ctrl/Cmd+P).
 *
 * Rappel : aucune protection côté navigateur n'empêche une capture d'écran ni l'accès
 * via les outils développeur. L'anti-hotlink / accès direct est géré côté serveur (proxy).
 */
export function ImageProtection() {
  useEffect(() => {
    const targetsImage = (event: Event) => {
      const target = event.target as HTMLElement | null;
      return Boolean(target?.closest("img, picture, [data-protected]"));
    };

    const onContextMenu = (event: MouseEvent) => {
      if (targetsImage(event)) {
        event.preventDefault();
      }
    };

    const onDragStart = (event: DragEvent) => {
      if (targetsImage(event)) {
        event.preventDefault();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key === "s" || key === "p") {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
