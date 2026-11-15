import { MenuData, Section } from "@/types/menu";

export interface MenuGroup {
  id: string;
  en: string;
  gu: string;
}

export const ALL_GROUP: MenuGroup = {
  id: "all",
  en: "All",
  gu: "બધું",
};

export const MENU_GROUPS: MenuGroup[] = [
  { id: "south-indian", en: "South Indian", gu: "સાઉથ ઇન્ડિયન" },
  { id: "pav-bhaji-pulav", en: "Pav Bhaji & Pulav", gu: "પાંવ ભાજી અને પુલાવ" },
  { id: "sandwich-grill", en: "Sandwich & Grill", gu: "સેન્ડવીચ અને ગ્રીલ" },
  { id: "pizza-burger", en: "Pizza & Burger", gu: "પીઝા અને બર્ગર" },
  { id: "chinese", en: "Chinese", gu: "ચાઈનીઝ" },
  { id: "drinks", en: "Drinks", gu: "ડ્રિંક્સ" },
];

/**
 * Returns the default group ID for a section based on its ID
 */
export function getDefaultGroupForSection(sectionId: string): string {
  const id = sectionId.toLowerCase();
  if (
    id.includes("dosa") ||
    id === "snacks" ||
    id.includes("idli") ||
    id.includes("vada") ||
    id.includes("uttapam")
  ) {
    return "south-indian";
  }
  if (id.includes("pav") || id.includes("bhaji") || id.includes("pulav") || id.includes("pulao")) {
    return "pav-bhaji-pulav";
  }
  if (id.includes("sandwich") || id.includes("grill")) {
    return "sandwich-grill";
  }
  if (id.includes("pizza") || id.includes("burger")) {
    return "pizza-burger";
  }
  if (
    id.includes("chinese") ||
    id.includes("soup") ||
    id.includes("starter") ||
    id.includes("grav") ||
    id.includes("noodle") ||
    id.includes("rice") ||
    id.includes("manchurian") ||
    id.includes("bhel")
  ) {
    return "chinese";
  }
  if (id.includes("drink") || id.includes("cold") || id.includes("beverage")) {
    return "drinks";
  }
  return "south-indian";
}

/**
 * Migration helper ensuring every section has a valid group assigned,
 * and canonical Sai Special items have featured: true assigned.
 */
export function migrateMenuGroups(menu: MenuData): MenuData {
  return {
    ...menu,
    sections: menu.sections.map((section: Section) => ({
      ...section,
      group: section.group || getDefaultGroupForSection(section.id),
      items: (section.items || []).map((item) => {
        const isCanonicalFeatured =
          item.id === "pb-1" ||
          item.id === "gsw-1" ||
          item.id === "piz-1" ||
          item.en.toLowerCase().includes("sai special") ||
          item.en.toLowerCase().includes("sai sp.");
        return {
          ...item,
          featured: item.featured !== undefined ? item.featured : isCanonicalFeatured,
        };
      }),
    })),
  };
}
