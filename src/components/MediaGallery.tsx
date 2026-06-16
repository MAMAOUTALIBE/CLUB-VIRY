"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/Motion";

type GalleryItem = { title: string; image: string };

export function MediaGallery({ items }: { items: GalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;
  const current = isOpen ? items[openIndex] : null;

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(() => {
    setOpenIndex((index) => (index === null ? index : (index - 1 + items.length) % items.length));
  }, [items.length]);
  const next = useCallback(() => {
    setOpenIndex((index) => (index === null ? index : (index + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        prev();
      } else if (event.key === "ArrowRight") {
        next();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, prev, next]);

  return (
    <>
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <StaggerItem className={`premium-card overflow-hidden rounded-lg bg-white ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`} key={item.title}>
            <button type="button" onClick={() => setOpenIndex(index)} aria-label={`Agrandir : ${item.title}`} className="focus-ring group block w-full text-left">
              <div className={`relative w-full ${index === 0 ? "h-[29rem]" : "h-52"}`}>
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes={index === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <span className="block p-3 text-sm font-black uppercase text-[#002f1d]">{item.title}</span>
            </button>
          </StaggerItem>
        ))}
      </Stagger>

      {isOpen && current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fermer"
            className="focus-ring absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={24} aria-hidden="true" />
          </button>

          {items.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                prev();
              }}
              aria-label="Image précédente"
              className="focus-ring absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft size={28} aria-hidden="true" />
            </button>
          ) : null}

          <figure className="relative max-w-5xl" onClick={(event) => event.stopPropagation()}>
            {/* Image plein écran : <img> (object-contain) pour respecter le ratio sans dimensions connues. */}
            <img src={current.image} alt={current.title} className="mx-auto max-h-[80vh] w-auto max-w-full rounded-lg object-contain shadow-2xl" />
            <figcaption className="mt-3 text-center text-sm font-black uppercase tracking-wide text-white">
              {current.title}
              <span className="ml-2 text-white/50">
                · {openIndex + 1} / {items.length}
              </span>
            </figcaption>
          </figure>

          {items.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              aria-label="Image suivante"
              className="focus-ring absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
            >
              <ChevronRight size={28} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
