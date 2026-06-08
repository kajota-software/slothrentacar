# Sloth Rent a Car — Sitio Web

Landing page bilingüe (ES/EN) para **Sloth Rent a Car**, empresa de alquiler de vehículos en Costa Rica.

## Stack técnico

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** (configuración vía CSS, paleta de marca personalizada)
- **Framer Motion** — animaciones y micro-interacciones
- **next-intl v4** — internacionalización ES/EN con rutas `/es` y `/en`

---

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) — redirige automáticamente a `/es`.

### Build de producción

```bash
npm run build
npm run start
```

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp (sin +) | `50671896080` |
| `NEXT_PUBLIC_USD_CRC_RATE` | Tasa de cambio de referencia ₡/USD | `530` |
| `NEXT_PUBLIC_SANTAFE_AVAILABLE` | Disponibilidad del Santa Fe | `true` |

> **Nota:** Cuando el Santa Fe se venda, cambiar `NEXT_PUBLIC_SANTAFE_AVAILABLE=false` en `.env.local` (o en Vercel) para mostrar "Consultar disponibilidad" sin tocar código.

---

## Estructura del proyecto

```
slothrentacar/
├── app/
│   ├── layout.tsx              # Root layout (fuentes, html lang dinámico)
│   ├── globals.css             # Tailwind v4 + paleta de marca
│   ├── sitemap.ts              # Sitemap generado automáticamente
│   ├── robots.ts               # robots.txt
│   └── [locale]/
│       ├── layout.tsx          # Layout de locale (providers, Navbar, Footer)
│       ├── page.tsx            # Home page
│       ├── not-found.tsx       # 404 branded
│       └── vehicles/[slug]/
│           └── page.tsx        # Detalle de vehículo
├── components/
│   ├── Navbar.tsx              # Navbar fija con menú móvil
│   ├── LanguageSwitcher.tsx    # Botón ES/EN
│   ├── Hero.tsx                # Hero full-viewport con animaciones
│   ├── TrustBar.tsx            # 4 puntos de confianza
│   ├── FleetGrid.tsx           # Grilla de flota con filtros
│   ├── FleetCard.tsx           # Tarjeta de vehículo con hover
│   ├── VehicleImage.tsx        # Imagen con fallback de gradiente
│   ├── VehicleGallery.tsx      # Galería de 3 fotos con thumbnails
│   ├── VehicleBooking.tsx      # Precio + botón reserva (cliente)
│   ├── HowItWorks.tsx          # 4 pasos visuales
│   ├── Destinations.tsx        # 3 destinos con recomendación de vehículo
│   ├── Testimonials.tsx        # Reseñas (placeholder → Google Reviews)
│   ├── FAQ.tsx                 # Acordeón animado
│   ├── ReservationModal.tsx    # Modal 2 pasos + calculadora de precio
│   ├── Footer.tsx              # Footer completo
│   ├── WhatsAppButton.tsx      # Botón flotante animado
│   └── SchemaOrg.tsx           # JSON-LD LocalBusiness
├── i18n/
│   ├── routing.ts              # Locales: ['es', 'en'], default: 'es'
│   ├── request.ts              # Config server-side de next-intl
│   └── navigation.ts           # Link/useRouter con locale
├── lib/
│   ├── fleet.ts                # Flota completa + textos editoriales por vehículo
│   └── utils.ts                # Formateo de precios, WhatsApp URL builder
├── messages/
│   ├── es.json                 # Traducciones en español
│   └── en.json                 # Traducciones en inglés
├── public/
│   └── images/                 # Imágenes por vehículo (ver README dentro)
├── proxy.ts                    # Proxy para locale routing (reemplaza middleware)
└── .env.example                # Plantilla de variables de entorno
```

---

## Imágenes de la flota

Las imágenes van en `/public/images/[slug]/` con los archivos:
- `exterior-1.jpg` — foto principal
- `interior.jpg` — interior
- `trunk.jpg` — maletero

Ver instrucciones completas en [`public/images/README.md`](public/images/README.md).

**Hasta que las fotos reales estén disponibles**, se muestra un placeholder de gradiente acorde al color del vehículo.

---

## TODOs pendientes

| # | Tarea | Dónde |
|---|---|---|
| 1 | Agregar fotos reales (del Drive del cliente) | `public/images/[slug]/` |
| 2 | Proveer URLs de Instagram y Facebook | `components/Footer.tsx` → buscar `href="#"` |
| 3 | Conectar Google Reviews API | `components/Testimonials.tsx` → buscar `// TODO` |
| 4 | Confirmar dominio final en producción | `app/layout.tsx`, `app/sitemap.ts`, `components/SchemaOrg.tsx` |

---

## Deploy en Vercel

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Agrega las variables de entorno en **Settings → Environment Variables**
3. Deploy automático en cada push a `main`

---

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `forest` | `#1B4332` | Fondos oscuros, textos de marca |
| `forest-dark` | `#0f2a1f` | Hero, footer |
| `sand` | `#F5E6C8` | Trust bar, fondos cálidos |
| `cream` | `#FAFAF7` | Fondo general de la app |
| `amber` | `#D4A017` | CTAs, acentos, precios destacados |
