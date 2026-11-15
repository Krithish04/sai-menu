import type { Metadata, Viewport } from "next";
import { Fraunces, Mukta, Noto_Serif_Gujarati } from "next/font/google";
import "./globals.css";
import { PWARegister } from "@/components/PWARegister";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const mukta = Mukta({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoGujarati = Noto_Serif_Gujarati({
  weight: ["400", "500", "600", "700"],
  subsets: ["gujarati"],
  variable: "--font-gujarati",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shreesai.restaurant";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Shree Sai Restaurant – Menu | Salabatpura, Surat",
    template: "%s | Shree Sai Restaurant",
  },
  description:
    "Authentic South Indian, Pav Bhaji, Chinese & fast food since 1989. Salabatpura, Surat. Pure vegetarian taste.",
  applicationName: "Shree Sai Restaurant",
  authors: [{ name: "Shree Sai Restaurant" }],
  keywords: [
    "Shree Sai Restaurant",
    "Salabatpura Surat",
    "Digital Menu",
    "South Indian Food",
    "Pav Bhaji",
    "Dosa",
    "Pure Veg Surat",
  ],
  openGraph: {
    title: "Shree Sai Restaurant – Menu | Salabatpura, Surat",
    description:
      "Authentic South Indian, Pav Bhaji, Chinese & fast food since 1989. Salabatpura, Surat.",
    url: siteUrl,
    siteName: "Shree Sai Restaurant",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shree Sai Restaurant – Digital Menu",
    description:
      "Authentic South Indian, Pav Bhaji, Chinese & fast food since 1989. Salabatpura, Surat.",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F7EFE1",
  viewportFit: "cover",
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Shree Sai Restaurant",
  alternateName: "શ્રી સાંઈ રેસ્ટોરન્ટ",
  image: `${siteUrl}/logo.png`,
  url: siteUrl,
  telephone: ["+918140882995", "+919499570333"],
  servesCuisine: [
    "South Indian",
    "Pav Bhaji",
    "Chinese",
    "Fast Food",
    "Pure Vegetarian",
  ],
  priceRange: "₹",
  hasMenu: `${siteUrl}/`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Salabatpura",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "395003",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 21.1896,
    longitude: 72.8364,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "23:00",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${mukta.variable} ${notoGujarati.variable}`}
    >
      <head>
        <meta
          name="description"
          content="Authentic South Indian, Pav Bhaji, Chinese &amp; fast food since 1989. Salabatpura, Surat. Pure vegetarian taste."
        />
        <link rel="preload" as="image" href="/logo.png" type="image/png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('shree-sai-theme')==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased text-indigo selection:bg-ribbon selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        {children}
        <PWARegister />
      </body>
    </html>
  );
}
