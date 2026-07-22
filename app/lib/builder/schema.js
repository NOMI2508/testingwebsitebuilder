// Section schema registry for the visual drag-and-drop builder.
//
// Every section type is described by ONE schema object (label, icon, default
// content/styles, editable field descriptors and list descriptors). The editor
// renders its settings UI generically from these descriptors, so adding a new
// section type means adding one entry here — nothing is hardcoded in the panel.
//
// This module is isomorphic: it runs in the browser (editor) and on the server
// (PUT validation), so it must stay free of React/DOM/Node-only APIs.

/**
 * @typedef {Object} BuilderSection
 * @property {string} id
 * @property {string} type      One of SECTION_TYPES keys.
 * @property {number} order     1-based position inside the page.
 * @property {Object} content   Type-specific editable content.
 * @property {BuilderStyles} styles
 * @property {BuilderSettings} settings
 *
 * @typedef {Object} BuilderStyles
 * @property {string} backgroundColor  Hex color, e.g. "#ffffff".
 * @property {string} textColor
 * @property {string} accentColor     Buttons / highlights.
 * @property {"left"|"center"|"right"} align
 * @property {number} paddingY        Vertical padding in px.
 *
 * @typedef {Object} BuilderSettings
 * @property {boolean} visible
 * @property {string} anchor          In-page anchor id used by nav links.
 *
 * @typedef {Object} BuilderPage
 * @property {string} id
 * @property {string} name
 * @property {BuilderSection[]} sections
 *
 * @typedef {Object} BuilderSite
 * @property {number} version
 * @property {BuilderPage[]} pages
 */

const MAX_SECTIONS_PER_PAGE = 60;
const MAX_LIST_ITEMS = 50;
const MAX_TEXT = 4000;
const MAX_URL = 1000;

export function uid(prefix = "id") {
  const rand =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${rand}`;
}

/* ------------------------------ field helpers ----------------------------- */
// Field descriptor kinds understood by the settings panel:
//   text | textarea | url | image | number
const f = (key, label, kind = "text", extra = {}) => ({ key, label, kind, ...extra });

const IMG = {
  hero: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  about: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
  product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  productAlt: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
};

export function createProduct(overrides = {}) {
  return {
    id: uid("prod"),
    name: "New Product",
    description: "Describe what makes this product great.",
    price: 99,
    discountPrice: "",
    imageUrl: IMG.productAlt,
    ctaText: "Buy Now",
    ctaHref: "#contact",
    ...overrides,
  };
}

const PRODUCT_FIELDS = [
  f("name", "Product name"),
  f("description", "Description", "textarea"),
  f("price", "Price", "number"),
  f("discountPrice", "Discount price (optional)", "number"),
  f("imageUrl", "Image", "image"),
  f("ctaText", "CTA button text"),
  f("ctaHref", "CTA link", "url"),
];

/* ---------------------------- section registry ---------------------------- */

export const SECTION_TYPES = {
  navbar: {
    label: "Navbar",
    icon: "🧭",
    description: "Logo, navigation links and a call-to-action.",
    fields: [f("logoText", "Logo text"), f("ctaText", "Button text"), f("ctaHref", "Button link", "url")],
    lists: [
      {
        key: "links",
        label: "Navigation links",
        addLabel: "+ Add Link",
        labelKey: "label",
        fields: [f("label", "Label"), f("href", "Link", "url")],
        newItem: () => ({ id: uid("link"), label: "New Link", href: "#" }),
      },
    ],
    defaults: {
      content: {
        logoText: "Acme Studio",
        links: [
          { id: uid("link"), label: "Home", href: "#hero" },
          { id: uid("link"), label: "Features", href: "#features" },
          { id: uid("link"), label: "Products", href: "#products" },
          { id: uid("link"), label: "Contact", href: "#contact" },
        ],
        ctaText: "Get Started",
        ctaHref: "#contact",
      },
      styles: { backgroundColor: "#ffffff", textColor: "#0f172a", accentColor: "#2563eb", align: "left", paddingY: 18 },
    },
  },

  hero: {
    label: "Hero",
    icon: "🚀",
    description: "Big headline with buttons and an image.",
    fields: [
      f("heading", "Heading"),
      f("subheading", "Description", "textarea"),
      f("primaryCtaText", "Primary button text"),
      f("primaryCtaHref", "Primary button link", "url"),
      f("secondaryCtaText", "Secondary button text"),
      f("secondaryCtaHref", "Secondary button link", "url"),
      f("imageUrl", "Image", "image"),
    ],
    defaults: {
      content: {
        heading: "Build something people love",
        subheading:
          "Launch a beautiful, professional website in minutes. Show off your products, tell your story and turn visitors into customers.",
        primaryCtaText: "Get Started",
        primaryCtaHref: "#contact",
        secondaryCtaText: "Learn More",
        secondaryCtaHref: "#features",
        imageUrl: IMG.hero,
      },
      styles: { backgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#2563eb", align: "left", paddingY: 96 },
    },
  },

  features: {
    label: "Features",
    icon: "✨",
    description: "Grid of feature highlights.",
    fields: [f("heading", "Heading"), f("subheading", "Description", "textarea")],
    lists: [
      {
        key: "items",
        label: "Features",
        addLabel: "+ Add Feature",
        labelKey: "title",
        fields: [f("icon", "Icon (emoji)"), f("title", "Title"), f("description", "Description", "textarea")],
        newItem: () => ({ id: uid("item"), icon: "⭐", title: "New Feature", description: "Explain the benefit in one or two sentences." }),
      },
    ],
    defaults: {
      content: {
        heading: "Everything you need",
        subheading: "Powerful features that help you launch faster and grow with confidence.",
        items: [
          { id: uid("item"), icon: "⚡", title: "Lightning Fast", description: "Optimized for speed so your visitors never wait." },
          { id: uid("item"), icon: "🛡️", title: "Secure by Default", description: "Best-practice security baked into every page." },
          { id: uid("item"), icon: "📈", title: "Built to Convert", description: "Layouts designed to turn visitors into customers." },
        ],
      },
      styles: { backgroundColor: "#ffffff", textColor: "#0f172a", accentColor: "#2563eb", align: "center", paddingY: 80 },
    },
  },

  about: {
    label: "About",
    icon: "🏢",
    description: "Story, image and key numbers.",
    fields: [f("heading", "Heading"), f("body", "Story", "textarea"), f("imageUrl", "Image", "image")],
    lists: [
      {
        key: "stats",
        label: "Key numbers",
        addLabel: "+ Add Stat",
        labelKey: "label",
        fields: [f("value", "Value"), f("label", "Label")],
        newItem: () => ({ id: uid("item"), value: "10+", label: "Years of experience" }),
      },
    ],
    defaults: {
      content: {
        heading: "About us",
        body:
          "We are a passionate team dedicated to building products that make a difference. Since day one, our mission has been to combine beautiful design with honest craftsmanship — and to treat every customer like our first.",
        imageUrl: IMG.about,
        stats: [
          { id: uid("item"), value: "10k+", label: "Happy customers" },
          { id: uid("item"), value: "99.9%", label: "Uptime" },
          { id: uid("item"), value: "24/7", label: "Support" },
        ],
      },
      styles: { backgroundColor: "#f8fafc", textColor: "#0f172a", accentColor: "#2563eb", align: "left", paddingY: 80 },
    },
  },

  products: {
    label: "Products",
    icon: "🛍️",
    description: "Product cards with price, discount and CTA.",
    fields: [f("heading", "Heading"), f("subheading", "Description", "textarea"), f("currency", "Currency symbol")],
    lists: [
      {
        key: "products",
        label: "Products",
        addLabel: "+ Add New Product",
        labelKey: "name",
        fields: PRODUCT_FIELDS,
        newItem: () => createProduct(),
      },
    ],
    defaults: {
      content: {
        heading: "Our Products",
        subheading: "Hand-picked quality, honest prices.",
        currency: "$",
        products: [
          {
            id: uid("prod"),
            name: "Aurora Smartwatch",
            description: "A precision-crafted smartwatch with a 10-day battery, AMOLED display and health tracking.",
            price: 249,
            discountPrice: 199,
            imageUrl: IMG.product,
            ctaText: "Buy Now",
            ctaHref: "#contact",
          },
        ],
      },
      styles: { backgroundColor: "#ffffff", textColor: "#0f172a", accentColor: "#2563eb", align: "center", paddingY: 80 },
    },
  },

  testimonials: {
    label: "Testimonials",
    icon: "💬",
    description: "Customer quotes with names and roles.",
    fields: [f("heading", "Heading")],
    lists: [
      {
        key: "items",
        label: "Testimonials",
        addLabel: "+ Add Testimonial",
        labelKey: "name",
        fields: [
          f("quote", "Quote", "textarea"),
          f("name", "Name"),
          f("role", "Role / company"),
          f("avatarUrl", "Avatar", "image"),
        ],
        newItem: () => ({
          id: uid("item"),
          quote: "This product completely changed how we work. Highly recommended!",
          name: "New Customer",
          role: "Customer",
          avatarUrl: "https://i.pravatar.cc/100?img=12",
        }),
      },
    ],
    defaults: {
      content: {
        heading: "Loved by our customers",
        items: [
          {
            id: uid("item"),
            quote: "The quality exceeded every expectation. Ordering was easy and support answered within minutes.",
            name: "Sarah Mitchell",
            role: "Founder, Bloom & Co",
            avatarUrl: "https://i.pravatar.cc/100?img=47",
          },
          {
            id: uid("item"),
            quote: "We switched from a competitor and never looked back. It simply works, every single day.",
            name: "David Chen",
            role: "CTO, Northwind",
            avatarUrl: "https://i.pravatar.cc/100?img=13",
          },
        ],
      },
      styles: { backgroundColor: "#0f172a", textColor: "#f8fafc", accentColor: "#38bdf8", align: "center", paddingY: 80 },
    },
  },

  cta: {
    label: "Call to Action",
    icon: "📣",
    description: "Bold banner with one button.",
    fields: [
      f("heading", "Heading"),
      f("subheading", "Description", "textarea"),
      f("buttonText", "Button text"),
      f("buttonHref", "Button link", "url"),
    ],
    defaults: {
      content: {
        heading: "Ready to get started?",
        subheading: "Join thousands of happy customers today. No credit card required.",
        buttonText: "Start Free Trial",
        buttonHref: "#contact",
      },
      styles: { backgroundColor: "#2563eb", textColor: "#ffffff", accentColor: "#ffffff", align: "center", paddingY: 72 },
    },
  },

  contact: {
    label: "Contact",
    icon: "✉️",
    description: "Contact details and a message form.",
    fields: [
      f("heading", "Heading"),
      f("subheading", "Description", "textarea"),
      f("email", "Email address"),
      f("phone", "Phone"),
      f("address", "Address"),
      f("buttonText", "Form button text"),
    ],
    defaults: {
      content: {
        heading: "Get in touch",
        subheading: "Questions, feedback or a project in mind? We usually reply within one business day.",
        email: "hello@acmestudio.com",
        phone: "+1 (555) 123-4567",
        address: "100 Market Street, San Francisco, CA",
        buttonText: "Send Message",
      },
      styles: { backgroundColor: "#f8fafc", textColor: "#0f172a", accentColor: "#2563eb", align: "left", paddingY: 80 },
    },
  },

  footer: {
    label: "Footer",
    icon: "🦶",
    description: "Logo, links and copyright.",
    fields: [f("logoText", "Logo text"), f("tagline", "Tagline", "textarea"), f("copyright", "Copyright line")],
    lists: [
      {
        key: "links",
        label: "Footer links",
        addLabel: "+ Add Link",
        labelKey: "label",
        fields: [f("label", "Label"), f("href", "Link", "url")],
        newItem: () => ({ id: uid("link"), label: "New Link", href: "#" }),
      },
    ],
    defaults: {
      content: {
        logoText: "Acme Studio",
        tagline: "Beautiful websites, built with care.",
        links: [
          { id: uid("link"), label: "Privacy", href: "#" },
          { id: uid("link"), label: "Terms", href: "#" },
          { id: uid("link"), label: "Contact", href: "#contact" },
        ],
        copyright: `© ${new Date().getFullYear()} Acme Studio. All rights reserved.`,
      },
      styles: { backgroundColor: "#0f172a", textColor: "#cbd5e1", accentColor: "#38bdf8", align: "left", paddingY: 48 },
    },
  },
};

export const SECTION_ORDER = [
  "navbar",
  "hero",
  "features",
  "about",
  "products",
  "contact",
  "testimonials",
  "cta",
  "footer",
];

const DEFAULT_STYLES = { backgroundColor: "#ffffff", textColor: "#0f172a", accentColor: "#2563eb", align: "left", paddingY: 64 };

/* ------------------------------ constructors ------------------------------ */

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** Create a brand-new section of the given type with professional defaults. */
export function createSection(type) {
  const schema = SECTION_TYPES[type];
  if (!schema) throw new Error(`Unknown section type "${type}".`);
  const defaults = deepClone(schema.defaults);
  // Every nested list item gets a fresh id so two sections never share ids.
  for (const list of schema.lists || []) {
    for (const item of defaults.content[list.key] || []) item.id = uid("item");
  }
  return {
    id: uid("sec"),
    type,
    order: 0,
    content: defaults.content,
    styles: { ...DEFAULT_STYLES, ...defaults.styles },
    settings: { visible: true, anchor: type },
  };
}

/** Deep-copy a section (or list item) regenerating every id inside it. */
export function duplicateSection(section) {
  const copy = deepClone(section);
  copy.id = uid("sec");
  const schema = SECTION_TYPES[section.type];
  for (const list of schema?.lists || []) {
    for (const item of copy.content[list.key] || []) item.id = uid("item");
  }
  return copy;
}

export function createEmptySite() {
  return { version: 1, pages: [{ id: "home", name: "Home", sections: [] }] };
}

/* ------------------------------ normalization ----------------------------- */

function cleanString(value, fallback = "", max = MAX_TEXT) {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return fallback;
  return value.slice(0, max);
}

function cleanNumberish(value, fallback = "") {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return fallback; // "" means "not set" (e.g. no discount)
}

function cleanColor(value, fallback) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : fallback;
}

function cleanListItem(item, fields, factory) {
  const base = factory();
  const out = { id: typeof item?.id === "string" && item.id ? item.id.slice(0, 60) : uid("item") };
  for (const field of fields) {
    const fallback = base[field.key] ?? "";
    out[field.key] =
      field.kind === "number"
        ? cleanNumberish(item?.[field.key], fallback)
        : cleanString(item?.[field.key], fallback, field.kind === "url" || field.kind === "image" ? MAX_URL : MAX_TEXT);
  }
  return out;
}

/**
 * Validate + repair an arbitrary site document into a safe BuilderSite.
 * Unknown section types and unknown fields are dropped; missing fields are
 * filled from the schema defaults. Runs on every load and every server save.
 * @returns {BuilderSite}
 */
export function normalizeSite(input) {
  const pagesIn = Array.isArray(input?.pages) && input.pages.length ? input.pages : [{ id: "home", name: "Home", sections: [] }];
  const pages = pagesIn.slice(0, 10).map((page, pageIndex) => {
    const sectionsIn = Array.isArray(page?.sections) ? page.sections.slice(0, MAX_SECTIONS_PER_PAGE) : [];
    const sections = [];
    for (const raw of sectionsIn) {
      const schema = SECTION_TYPES[raw?.type];
      if (!schema) continue; // unknown type — drop rather than crash the editor
      const defaults = createSection(raw.type);
      const content = { ...defaults.content };
      for (const key of Object.keys(defaults.content)) {
        const listSchema = (schema.lists || []).find((l) => l.key === key);
        if (listSchema) {
          const items = Array.isArray(raw?.content?.[key]) ? raw.content[key].slice(0, MAX_LIST_ITEMS) : defaults.content[key];
          content[key] = items.map((item) => cleanListItem(item, listSchema.fields, listSchema.newItem));
        } else {
          const field = (schema.fields || []).find((fl) => fl.key === key);
          const fallback = defaults.content[key];
          content[key] =
            field?.kind === "number"
              ? cleanNumberish(raw?.content?.[key], fallback)
              : cleanString(raw?.content?.[key], fallback, field?.kind === "url" || field?.kind === "image" ? MAX_URL : MAX_TEXT);
        }
      }
      const styles = {
        backgroundColor: cleanColor(raw?.styles?.backgroundColor, defaults.styles.backgroundColor),
        textColor: cleanColor(raw?.styles?.textColor, defaults.styles.textColor),
        accentColor: cleanColor(raw?.styles?.accentColor, defaults.styles.accentColor),
        align: ["left", "center", "right"].includes(raw?.styles?.align) ? raw.styles.align : defaults.styles.align,
        paddingY: Math.max(0, Math.min(200, Number(raw?.styles?.paddingY ?? defaults.styles.paddingY) || 0)),
      };
      const settings = {
        visible: raw?.settings?.visible !== false,
        anchor: cleanString(raw?.settings?.anchor, raw.type, 60) || raw.type,
      };
      sections.push({
        id: typeof raw?.id === "string" && raw.id ? raw.id.slice(0, 60) : uid("sec"),
        type: raw.type,
        order: sections.length + 1,
        content,
        styles,
        settings,
      });
    }
    return {
      id: typeof page?.id === "string" && page.id ? page.id.slice(0, 60) : `page_${pageIndex}`,
      name: cleanString(page?.name, `Page ${pageIndex + 1}`, 80) || `Page ${pageIndex + 1}`,
      sections,
    };
  });
  return { version: 1, pages };
}

/* -------------------------------- utilities ------------------------------- */

/** Pick a readable text color (dark navy or white) for a solid background. */
export function contrastText(hexColor) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(hexColor || "") ? hexColor.slice(1) : "2563eb";
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#0f172a" : "#ffffff";
}

export function formatPrice(value, currency = "$") {
  if (value === "" || value == null || Number.isNaN(Number(value))) return "";
  return `${currency}${Number(value).toLocaleString()}`;
}
