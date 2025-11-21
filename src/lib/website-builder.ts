import type { NavLink } from "@/types/website-builder";

type PartialNavLink = Partial<NavLink> & {
  text?: string;
  url?: string;
};

export const DEFAULT_NAV_LINK: NavLink = {
  label: "New Link",
  href: "#",
};

export function normalizeNavLinks(links: unknown): NavLink[] {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.map((link) => {
    if (!link) {
      return { ...DEFAULT_NAV_LINK };
    }

    if (typeof link === "string") {
      return {
        label: link,
        href: DEFAULT_NAV_LINK.href,
      };
    }

    if (typeof link === "object") {
      const candidate = link as PartialNavLink;
      return {
        label: candidate.label ?? candidate.text ?? "",
        href: candidate.href ?? candidate.url ?? DEFAULT_NAV_LINK.href,
      };
    }

    return {
      label: String(link),
      href: DEFAULT_NAV_LINK.href,
    };
  });
}
