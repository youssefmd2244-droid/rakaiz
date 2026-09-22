"use client";

import { useEffect } from "react";

/**
 * ScrollReveal
 * ---------------------------------------------------------------------------
 * حركة ظهور 3D أثناء السكرول: العناصر تكون مخفية، وأول ما توصل لمجال الرؤية
 * بتظهر بحركة (ميل ثلاثي الأبعاد + رفع + تدرّج في الظهور) مع تأخير متتابع.
 *
 * مصمّمة عشان ما تعمل لاج:
 *  - بتستخدم IntersectionObserver واحد فقط (بدون أي scroll listener ثقيل).
 *  - بتحرّك opacity + transform فقط (GPU) — بدون blur أو تغيير layout.
 *  - بعد ما العنصر يظهر بنشيل عنه كل حاجة (attribute + will-change) فيرجع لستايله الأصلي
 *    والـ hover بتاعه يشتغل عادي، ولما يخرج من الشاشة بيتخبّى تاني (بره النظر) عشان
 *    الحركة تتكرر في النزول وفي الطلوع.
 *  - النزول: العناصر بتدخل من تحت. الطلوع: بتدخل من فوق (اتجاه معكوس).
 *  - لو الموبايل مفعّل "تقليل الحركة" بتشتغل نسخة خفيفة (ظهور + رفعة صغيرة بدون ميل 3D).
 *    لتجربة الحركة الكاملة رغم كده: افتح الموقع بـ ?motion=full
 *
 * مفيش حاجة لازم تتعدّل في الأقسام نفسها: الكومبوننت بيلاقي العناصر لوحده.
 * ولو عايز تتحكم في عنصر معيّن: data-rk-group على أي عنصر = ظهور أبنائه واحد ورا التاني.
 */

const MAX_STAGGER_STEPS = 7;
const STAGGER_MS = 90;
const CLEAN_AFTER_MS = 1400; // أطول من مدة الترانزيشن

const cls = (el: Element) => el.getAttribute("class") ?? "";
const hasClass = (el: Element, name: string) => new RegExp(`(^|\\s)${name}(\\s|$)`).test(cls(el));
const isDecor = (el: Element) => hasClass(el, "absolute") || hasClass(el, "fixed") || el.tagName === "SCRIPT" || el.tagName === "STYLE";
const kids = (el: Element) => Array.from(el.children).filter((c) => !isDecor(c)) as HTMLElement[];

export const ScrollReveal: React.FC<{ ready: boolean }> = ({ ready }) => {
  useEffect(() => {
    if (!ready) return;
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

    const root = document.documentElement;
    const forceFull = new URLSearchParams(window.location.search).get("motion") === "full";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches && !forceFull;
    if (reduced) root.setAttribute("data-rk-soft", "1");

    const seen = new WeakSet<Element>();
    const all = new Set<HTMLElement>();
    const cleanTimers = new Map<HTMLElement, number>();
    const wide = window.matchMedia("(min-width: 1024px)");
    let lastY = window.scrollY;
    let goingUp = false;

    const stopTimer = (el: HTMLElement) => {
      const id = cleanTimers.get(el);
      if (id !== undefined) {
        window.clearTimeout(id);
        cleanTimers.delete(el);
      }
    };

    /** Hide the element (instantly) so it can animate the next time it enters the screen. */
    const park = (el: HTMLElement, exitedThroughTop: boolean) => {
      stopTimer(el);
      el.style.removeProperty("--rk-delay");
      el.setAttribute("data-rk", "pending");
      // Left through the top → it will come back from the top when the user scrolls up.
      if (exitedThroughTop) el.setAttribute("data-rk-d", "up");
      else el.removeAttribute("data-rk-d");
    };

    const reveal = (el: HTMLElement, delay: number) => {
      if (el.getAttribute("data-rk") !== "pending") return;
      stopTimer(el);
      el.style.setProperty("--rk-delay", `${delay}ms`);
      el.setAttribute("data-rk", "in");
      const id = window.setTimeout(() => {
        cleanTimers.delete(el);
        // Back to the element's own styles (hover effects etc.). The variant/direction stay for the next entrance.
        el.removeAttribute("data-rk");
        el.style.removeProperty("--rk-delay");
      }, delay + CLEAN_AFTER_MS);
      cleanTimers.set(el, id);
    };

    // Observer #1 (slightly inside the bottom edge): decides WHEN an element animates in.
    const io = new IntersectionObserver(
      (entries) => {
        const dir = document.documentElement.dir === "rtl" ? -1 : 1;
        const entering = entries.filter((e) => e.isIntersecting);

        // Order the batch so the stagger reads naturally: top→bottom (bottom→top while scrolling up), start→end.
        const up = goingUp ? -1 : 1;
        entering.sort((a, b) => {
          const dy = Math.round(a.boundingClientRect.top / 40) - Math.round(b.boundingClientRect.top / 40);
          return dy !== 0 ? dy * up : (a.boundingClientRect.left - b.boundingClientRect.left) * dir;
        });

        entering.forEach((e, i) => reveal(e.target as HTMLElement, Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS));
      },
      { rootMargin: "0px 0px -9% 0px", threshold: 0.01 }
    );

    // Observer #2 (the real screen edges): once an element is completely off screen it is hidden
    // again, so the entrance replays when the user comes back — scrolling down or up.
    const ioPark = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) park(e.target as HTMLElement, e.boundingClientRect.bottom <= 0);
        });
      },
      { threshold: 0 }
    );

    const tag = (el: HTMLElement, variant?: string) => {
      if (!el || seen.has(el)) return;
      seen.add(el);
      el.setAttribute("data-rk", "pending");
      if (variant) el.setAttribute("data-rk-v", variant);
      all.add(el);
      io.observe(el);
      ioPark.observe(el);
    };

    const isGrid = (el: Element) => hasClass(el, "grid");
    const isStack = (el: Element) => /(^|\s)space-y-/.test(cls(el));
    const isHeader = (el: Element) => !!el.querySelector(".title-pill") && !el.querySelector(".grid");

    const tagGridChildren = (grid: Element) => {
      const items = kids(grid);
      // Two big side-by-side columns → open like doors (from the start side / from the end side).
      const doors = wide.matches && items.length === 2;
      items.forEach((item, i) => tag(item, doors ? (i === 0 ? "side-start" : "side-end") : undefined));
    };

    const tagHeader = (header: HTMLElement) => {
      kids(header).forEach((col) => {
        const inner = kids(col);
        if (inner.length === 0) {
          tag(col, "head");
          return;
        }
        inner.forEach((item) => tag(item, hasClass(item, "spectrum-bar") ? "bar" : "head"));
      });
    };

    const processContainer = (container: Element) => {
      kids(container).forEach((child) => {
        if (child.hasAttribute("data-rk-group")) {
          kids(child).forEach((c) => tag(c));
        } else if (isGrid(child)) {
          tagGridChildren(child);
        } else if (isStack(child)) {
          kids(child).forEach((c) => tag(c));
        } else if (isHeader(child)) {
          tagHeader(child);
        } else if (child.matches(".spectrum-bar")) {
          tag(child, "bar");
        } else {
          tag(child);
        }
      });
    };

    const roots = (): HTMLElement[] =>
      Array.from(document.querySelectorAll<HTMLElement>("section[id]:not(#hero), footer"));

    const scan = () => {
      roots().forEach((r) => {
        Array.from(r.children).forEach((child) => {
          if (isDecor(child)) return;
          const isContainer = hasClass(child, "max-w-7xl");
          const inner = !isContainer ? child.querySelector(":scope > .max-w-7xl") : null;
          if (isContainer) processContainer(child);
          else if (inner) processContainer(inner);
          else tag(child as HTMLElement); // full-width strips (e.g. partners marquee)
        });
      });
    };

    // Sections/footers can render late (data fetched from the API) → pick up new nodes only.
    let scanTimer: number | undefined;
    const mo = new MutationObserver(() => {
      window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scan, 120);
    });

    // Safety net (runs once scrolling stops): anything still hidden but actually on screen
    // (held back by the bottom margin, e.g. the last items of the page) is revealed.
    // Anything hidden above the screen is prepared to enter from the top.
    let sweepTimer: number | undefined;
    const sweep = () => {
      window.clearTimeout(sweepTimer);
      sweepTimer = window.setTimeout(() => {
        const inView: Array<{ el: HTMLElement; top: number; left: number }> = [];
        all.forEach((el) => {
          if (!el.isConnected) {
            all.delete(el);
            stopTimer(el);
            return;
          }
          if (el.getAttribute("data-rk") !== "pending") return;
          const r = el.getBoundingClientRect();
          if (r.bottom <= 0) el.setAttribute("data-rk-d", "up");
          else if (r.top < window.innerHeight - 2) inView.push({ el, top: r.top, left: r.left });
        });
        const dir = document.documentElement.dir === "rtl" ? -1 : 1;
        inView
          .sort((a, b) => Math.round(a.top / 40) - Math.round(b.top / 40) || (a.left - b.left) * dir)
          .forEach((x, i) => reveal(x.el, Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS));
      }, 140);
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (y !== lastY) {
        goingUp = y < lastY;
        lastY = y;
      }
      sweep();
    };

    scan();
    sweep();
    roots().forEach((r) => mo.observe(r, { childList: true, subtree: true }));
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(scanTimer);
      window.clearTimeout(sweepTimer);
      cleanTimers.forEach((id) => window.clearTimeout(id));
      mo.disconnect();
      io.disconnect();
      ioPark.disconnect();
      root.removeAttribute("data-rk-soft");
      document.querySelectorAll<HTMLElement>("[data-rk]").forEach((el) => {
        el.removeAttribute("data-rk");
        el.removeAttribute("data-rk-v");
        el.removeAttribute("data-rk-d");
        el.style.removeProperty("--rk-delay");
      });
    };
  }, [ready]);

  return null;
};
