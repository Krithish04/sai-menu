import { z } from "zod";

const PriceSchema = z.object({
  half: z.number().int().min(0).max(10000).optional(),
  full: z.number().int().min(0).max(10000).optional(),
  single: z.number().int().min(0).max(10000).optional(),
  plate: z.number().int().min(0).max(10000).optional(),
  oil: z.number().int().min(0).max(10000).optional(),
  butter: z.number().int().min(0).max(10000).optional(),
  price: z.number().int().min(0).max(10000).optional(),
});

const ItemSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1, "English name is required"),
  gu: z.string().default(""),
  price: PriceSchema,
  soldOut: z.boolean().optional(),
  featured: z.boolean().optional(),
});

const SectionSchema = z.object({
  id: z.string().min(1),
  en: z.string().min(1, "Section name is required"),
  gu: z.string().default(""),
  group: z.string().optional(),
  columns: z.union([
    z.tuple([z.enum(["half", "full"]), z.enum(["half", "full"]).optional()]),
    z.tuple([z.enum(["oil", "butter"]), z.enum(["oil", "butter"]).optional()]),
    z.tuple([z.enum(["single", "plate"]), z.enum(["single", "plate"]).optional()]),
    z.tuple([z.literal("price")]),
    z.array(z.string()),
  ]),
  availability: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .optional(),
  notes: z
    .array(
      z.object({
        en: z.string(),
        gu: z.string().optional(),
      })
    )
    .optional(),
  items: z.array(ItemSchema),
  hidden: z.boolean().optional(),
});

const RestaurantSchema = z.object({
  name: z.string(),
  guName: z.string(),
  tagline: z.string(),
  guTagline: z.string(),
  since: z.number().int(),
  address: z.string(),
  guAddress: z.string(),
  city: z.string(),
  guCity: z.string(),
  phones: z.array(z.string()),
  mapsUrl: z.string(),
});

export const MenuDataSchema = z
  .object({
    restaurant: RestaurantSchema,
    sections: z.array(SectionSchema),
  })
  .superRefine((data, ctx) => {
    const ids = new Set<string>();
    for (const section of data.sections) {
      for (const item of section.items) {
        if (ids.has(item.id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate item ID: ${item.id}`,
            path: ["sections", section.id, "items", item.id],
          });
        }
        ids.add(item.id);
      }
    }
  });

export const SnapshotSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  summary: z.string(),
  data: MenuDataSchema,
});

export type ValidatedSnapshot = z.infer<typeof SnapshotSchema>;
