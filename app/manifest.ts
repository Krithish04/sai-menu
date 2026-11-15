import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shree Sai Restaurant – Digital Menu",
    short_name: "Shree Sai Menu",
    description:
      "Authentic South Indian, Pav Bhaji, Chinese & fast food since 1989. Salabatpura, Surat.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7EFE1",
    theme_color: "#F7EFE1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
