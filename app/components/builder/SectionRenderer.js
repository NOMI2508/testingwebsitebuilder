"use client";

import { memo } from "react";
import { contrastText, formatPrice } from "../../lib/builder/schema";

/*
 * Pure JSON → React renderers for every builder section type.
 *
 * Used in two modes:
 *   editable=true  — inside the editor canvas (product cards are clickable to
 *                    select them; hidden sections render dimmed with a badge).
 *   editable=false — the clean render captured for Publish (hidden sections
 *                    are skipped entirely). No editor chrome may leak here.
 *
 * All styling is inline (the project has no CSS system), which also makes the
 * published innerHTML snapshot self-contained.
 */

const mutedBox = { background: "rgba(127,127,127,0.08)", border: "1px solid rgba(127,127,127,0.16)" };

function btnPrimary(accent) {
  return {
    display: "inline-block",
    padding: "12px 22px",
    background: accent,
    color: contrastText(accent),
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    textDecoration: "none",
    border: "1px solid " + accent,
    cursor: "pointer",
  };
}

function btnSecondary() {
  return {
    display: "inline-block",
    padding: "12px 22px",
    background: "transparent",
    color: "inherit",
    borderRadius: 8,
    fontWeight: 600,
    fontSize: 15,
    textDecoration: "none",
    border: "1px solid rgba(127,127,127,0.45)",
    cursor: "pointer",
  };
}

const h2Style = { margin: 0, fontSize: 32, fontWeight: 800, lineHeight: 1.2 };
const subStyle = (align) => ({
  marginTop: 12,
  marginBottom: 0,
  marginLeft: align === "center" ? "auto" : 0,
  marginRight: align === "center" ? "auto" : 0,
  fontSize: 16.5,
  opacity: 0.78,
  lineHeight: 1.6,
  maxWidth: 640,
});

function justify(align) {
  return align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
}

/* ------------------------------ section bodies ----------------------------- */

function NavbarSection({ content, styles }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
      <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>{content.logoText}</div>
      <nav style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
        {(content.links || []).map((link) => (
          <a key={link.id} href={link.href || "#"} style={{ color: "inherit", textDecoration: "none", fontSize: 14.5, fontWeight: 500, opacity: 0.85 }}>
            {link.label}
          </a>
        ))}
        {content.ctaText ? (
          <a href={content.ctaHref || "#"} style={{ ...btnPrimary(styles.accentColor), padding: "9px 16px", fontSize: 13.5 }}>
            {content.ctaText}
          </a>
        ) : null}
      </nav>
    </div>
  );
}

function HeroSection({ content, styles }) {
  const hasImage = !!content.imageUrl;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 340px", minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 44, fontWeight: 800, lineHeight: 1.12, letterSpacing: "-0.02em" }}>{content.heading}</h1>
        {content.subheading ? (
          <p style={{ margin: "18px 0 0", fontSize: 18, lineHeight: 1.65, opacity: 0.82, maxWidth: 560 }}>{content.subheading}</p>
        ) : null}
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", justifyContent: justify(styles.align) }}>
          {content.primaryCtaText ? (
            <a href={content.primaryCtaHref || "#"} style={btnPrimary(styles.accentColor)}>{content.primaryCtaText}</a>
          ) : null}
          {content.secondaryCtaText ? (
            <a href={content.secondaryCtaHref || "#"} style={btnSecondary()}>{content.secondaryCtaText}</a>
          ) : null}
        </div>
      </div>
      {hasImage ? (
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <img
            src={content.imageUrl}
            alt={content.heading || "Hero"}
            style={{ width: "100%", borderRadius: 16, display: "block", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
          />
        </div>
      ) : null}
    </div>
  );
}

function FeaturesSection({ content }) {
  return (
    <div>
      <h2 style={h2Style}>{content.heading}</h2>
      {content.subheading ? <p style={subStyle("center")}>{content.subheading}</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20, marginTop: 40, textAlign: "left" }}>
        {(content.items || []).map((item) => (
          <div key={item.id} style={{ ...mutedBox, borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 30, lineHeight: 1 }}>{item.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 14 }}>{item.title}</div>
            <div style={{ fontSize: 14, opacity: 0.75, marginTop: 8, lineHeight: 1.6 }}>{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSection({ content, styles }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 48, flexWrap: "wrap" }}>
      {content.imageUrl ? (
        <div style={{ flex: "1 1 300px", minWidth: 0 }}>
          <img src={content.imageUrl} alt={content.heading || "About"} style={{ width: "100%", borderRadius: 16, display: "block" }} />
        </div>
      ) : null}
      <div style={{ flex: "1 1 340px", minWidth: 0 }}>
        <h2 style={h2Style}>{content.heading}</h2>
        <p style={{ margin: "16px 0 0", fontSize: 16, lineHeight: 1.7, opacity: 0.8 }}>{content.body}</p>
        {(content.stats || []).length ? (
          <div style={{ display: "flex", gap: 36, marginTop: 28, flexWrap: "wrap", justifyContent: justify(styles.align) }}>
            {content.stats.map((stat) => (
              <div key={stat.id}>
                <div style={{ fontSize: 28, fontWeight: 800, color: styles.accentColor }}>{stat.value}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ProductCard({ product, currency, accent, editable, selected, onClick }) {
  const hasDiscount =
    product.discountPrice !== "" &&
    product.discountPrice != null &&
    Number(product.discountPrice) > 0 &&
    Number(product.discountPrice) < Number(product.price);
  return (
    <div
      onClick={editable ? onClick : undefined}
      style={{
        ...mutedBox,
        borderRadius: 14,
        overflow: "hidden",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        cursor: editable ? "pointer" : "default",
        outline: selected ? "2px solid " + accent : "none",
        outlineOffset: -2,
      }}
      title={editable ? "Click to edit this product" : undefined}
    >
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }} />
      ) : null}
      <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{product.name}</div>
        {product.description ? (
          <div style={{ fontSize: 13.5, opacity: 0.75, marginTop: 6, lineHeight: 1.55, flex: 1 }}>{product.description}</div>
        ) : null}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 12 }}>
          {hasDiscount ? (
            <>
              <span style={{ fontSize: 19, fontWeight: 800, color: accent }}>{formatPrice(product.discountPrice, currency)}</span>
              <span style={{ fontSize: 14, opacity: 0.55, textDecoration: "line-through" }}>{formatPrice(product.price, currency)}</span>
            </>
          ) : (
            <span style={{ fontSize: 19, fontWeight: 800 }}>{formatPrice(product.price, currency)}</span>
          )}
        </div>
        {product.ctaText ? (
          <a
            href={product.ctaHref || "#"}
            style={{ ...btnPrimary(accent), display: "block", textAlign: "center", marginTop: 14, padding: "10px 16px", fontSize: 14 }}
          >
            {product.ctaText}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function ProductsSection({ content, styles, editable, selectedProductId, onSelectProduct }) {
  return (
    <div>
      <h2 style={h2Style}>{content.heading}</h2>
      {content.subheading ? <p style={subStyle(styles.align)}>{content.subheading}</p> : null}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginTop: 40 }}>
        {(content.products || []).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={content.currency || "$"}
            accent={styles.accentColor}
            editable={editable}
            selected={editable && selectedProductId === product.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct?.(product.id);
            }}
          />
        ))}
      </div>
      {editable && !(content.products || []).length ? (
        <div style={{ ...mutedBox, borderRadius: 12, padding: 28, marginTop: 32, fontSize: 14, opacity: 0.7 }}>
          No products yet — use “Add New Product” in the settings panel.
        </div>
      ) : null}
    </div>
  );
}

function TestimonialsSection({ content }) {
  return (
    <div>
      <h2 style={h2Style}>{content.heading}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40, textAlign: "left" }}>
        {(content.items || []).map((item) => (
          <div key={item.id} style={{ ...mutedBox, borderRadius: 12, padding: 24, display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 15, fontStyle: "italic", lineHeight: 1.65, flex: 1 }}>“{item.quote}”</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
              {item.avatarUrl ? (
                <img src={item.avatarUrl} alt={item.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", display: "block" }} />
              ) : null}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{item.name}</div>
                <div style={{ fontSize: 12.5, opacity: 0.65 }}>{item.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaSection({ content, styles }) {
  return (
    <div>
      <h2 style={{ ...h2Style, fontSize: 34 }}>{content.heading}</h2>
      {content.subheading ? <p style={subStyle(styles.align)}>{content.subheading}</p> : null}
      {content.buttonText ? (
        <div style={{ marginTop: 26 }}>
          <a href={content.buttonHref || "#"} style={btnPrimary(styles.accentColor)}>{content.buttonText}</a>
        </div>
      ) : null}
    </div>
  );
}

function ContactSection({ content, styles, editable }) {
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid rgba(127,127,127,0.35)",
    background: "rgba(255,255,255,0.92)",
    color: "#0f172a",
    fontFamily: "inherit",
  };
  return (
    <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 300px", minWidth: 0 }}>
        <h2 style={h2Style}>{content.heading}</h2>
        {content.subheading ? <p style={subStyle("left")}>{content.subheading}</p> : null}
        <div style={{ marginTop: 24, display: "grid", gap: 12, fontSize: 14.5, justifyItems: justify(styles.align) === "center" ? "center" : "start" }}>
          {content.email ? <div>📧 {content.email}</div> : null}
          {content.phone ? <div>📞 {content.phone}</div> : null}
          {content.address ? <div>📍 {content.address}</div> : null}
        </div>
      </div>
      <form
        action={content.email ? `mailto:${content.email}` : undefined}
        method="post"
        encType="text/plain"
        onSubmit={editable ? (e) => e.preventDefault() : undefined}
        style={{ flex: "1 1 320px", minWidth: 0, display: "grid", gap: 12, textAlign: "left" }}
      >
        <input style={inputStyle} name="name" placeholder="Your name" />
        <input style={inputStyle} name="email" type="email" placeholder="Your email" />
        <textarea style={{ ...inputStyle, resize: "vertical" }} name="message" rows={4} placeholder="Your message" />
        <button type="submit" style={{ ...btnPrimary(styles.accentColor), width: "100%", textAlign: "center", fontFamily: "inherit" }}>
          {content.buttonText || "Send Message"}
        </button>
      </form>
    </div>
  );
}

function FooterSection({ content }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ maxWidth: 320 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{content.logoText}</div>
          {content.tagline ? <div style={{ fontSize: 13.5, opacity: 0.7, marginTop: 8, lineHeight: 1.6 }}>{content.tagline}</div> : null}
        </div>
        <nav style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {(content.links || []).map((link) => (
            <a key={link.id} href={link.href || "#"} style={{ color: "inherit", textDecoration: "none", fontSize: 13.5, opacity: 0.8 }}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      {content.copyright ? (
        <div style={{ borderTop: "1px solid rgba(127,127,127,0.25)", marginTop: 28, paddingTop: 18, fontSize: 12.5, opacity: 0.6 }}>
          {content.copyright}
        </div>
      ) : null}
    </div>
  );
}

const BODIES = {
  navbar: NavbarSection,
  hero: HeroSection,
  features: FeaturesSection,
  about: AboutSection,
  products: ProductsSection,
  testimonials: TestimonialsSection,
  cta: CtaSection,
  contact: ContactSection,
  footer: FooterSection,
};

/* ------------------------------- public API ------------------------------- */

/** One section, JSON in → markup out. Memoized: re-renders only when its own
 *  section object (or its selection state) changes. `onSelectProduct` is
 *  called as (sectionId, productId) so the editor can pass ONE stable
 *  callback to every section and keep the memo effective. */
export const SectionRenderer = memo(function SectionRenderer({
  section,
  editable = false,
  selectedProductId = null,
  onSelectProduct,
}) {
  const Body = BODIES[section.type];
  if (!Body) return null;
  const { styles, settings } = section;
  if (!settings.visible && !editable) return null;

  return (
    <section
      id={settings.anchor || section.type}
      style={{
        background: styles.backgroundColor,
        color: styles.textColor,
        textAlign: styles.align,
        padding: `${styles.paddingY}px 24px`,
        position: "relative",
        opacity: editable && !settings.visible ? 0.35 : 1,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Body
          content={section.content}
          styles={styles}
          editable={editable}
          selectedProductId={selectedProductId}
          onSelectProduct={onSelectProduct ? (productId) => onSelectProduct(section.id, productId) : undefined}
        />
      </div>
    </section>
  );
});

/** Clean, chrome-free render of a whole page — captured for Publish. */
export function StaticSite({ site }) {
  const page = site.pages[0] || { sections: [] };
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.5 }}>
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} editable={false} />
      ))}
    </div>
  );
}
