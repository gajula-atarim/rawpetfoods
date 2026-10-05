// Generates Elementor JSON (_elementor_data) for the Raw Petfoods homepage,
// UAE header and UAE footer, plus the Elementor kit (global styles) settings.
// Output: elementor/dist/*.json
import fs from 'fs';

const SITE = 'https://rawpetfoods.wsdfy.com';
const MEDIA = {
  logo: { id: 6, url: `${SITE}/wp-content/uploads/2026/10/raw-pet-foods-logo.webp` },
  logoLarge: { id: 7, url: `${SITE}/wp-content/uploads/2026/10/raw-pet-foods-logo-large.webp` },
  trustpilot: { id: 8, url: `${SITE}/wp-content/uploads/2026/10/trustpilot-rating.webp` },
  hero: { id: 9, url: `${SITE}/wp-content/uploads/2026/10/hero-cat-and-dog-by-lake.jpg` },
  pawBg: { id: 10, url: `${SITE}/wp-content/uploads/2026/10/paw-pattern-background.jpg` },
  dog: { id: 11, url: `${SITE}/wp-content/uploads/2026/10/dog-with-raw-pet-foods-sign.jpg` },
  ocean: { id: 12, url: `${SITE}/wp-content/uploads/2026/10/ocean-seafood-banner.jpg` },
  oceanRight: { id: 51, url: `${SITE}/wp-content/uploads/2026/10/ocean-banner-salmon-right.webp` },
  productBg: { id: 13, url: `${SITE}/wp-content/uploads/2026/10/product-section-background.jpg` },
  pack: { id: 14, url: `${SITE}/wp-content/uploads/2026/10/salmon-belly-fin-pack.webp` },
  about: { id: 15, url: `${SITE}/wp-content/uploads/2026/10/woman-hugging-cat.jpg` },
  reviewsBg: { id: 16, url: `${SITE}/wp-content/uploads/2026/10/testimonials-paws-background.webp` },
  partner: { id: 17, url: `${SITE}/wp-content/uploads/2026/10/man-with-jack-russell.jpg` },
  // Pexels photos (free licence) added for the client revision brief.
  heroPets: { id: 56, url: `${SITE}/wp-content/uploads/2026/10/golden-retrievers-and-cat-relaxing.jpg` },
  seafoodPlatter: { id: 57, url: `${SITE}/wp-content/uploads/2026/10/fresh-raw-salmon-and-prawns-on-ice.jpg` },
  salmonIce: { id: 58, url: `${SITE}/wp-content/uploads/2026/10/raw-salmon-fillet-on-ice.jpg` },
  fishIce: { id: 59, url: `${SITE}/wp-content/uploads/2026/10/fresh-fish-on-ice-market.jpg` },
  fishingBoat: { id: 60, url: `${SITE}/wp-content/uploads/2026/10/fishing-boat-open-sea.jpg` },
  // Wholesale page (Pexels, free licence).
  storeOwners: { id: 99, url: `${SITE}/wp-content/uploads/2026/10/pet-store-owners-in-shop.jpg` },
  retailShelves: { id: 100, url: `${SITE}/wp-content/uploads/2026/10/retailers-stocking-shelves.jpg` },
  groomer: { id: 101, url: `${SITE}/wp-content/uploads/2026/10/groomer-with-terrier.jpg` },
  petPro: { id: 102, url: `${SITE}/wp-content/uploads/2026/10/pet-care-professional-with-dog.jpg` },
  // Why Raw page (Pexels, free licence).
  dogHome: { id: 134, url: `${SITE}/wp-content/uploads/2026/10/dog-eating-from-bowl-at-home.jpg` },
  // Sustainability page (Pexels, free licence).
  coastline: { id: 204, url: `${SITE}/wp-content/uploads/2026/10/australian-coastline-great-ocean-road.jpg` },
  fisherNet: { id: 205, url: `${SITE}/wp-content/uploads/2026/10/fisherman-hauling-net-at-sunset.jpg` },
  beachCatch: { id: 201, url: `${SITE}/wp-content/uploads/2026/10/dog-on-beach-with-fresh-catch.jpg` },
  catTreat: { id: 132, url: `${SITE}/wp-content/uploads/2026/10/cat-taking-treat-from-owner.jpg` },
  blog1: { id: 18, url: `${SITE}/wp-content/uploads/2026/10/blog-real-seafood.jpg` },
  blog2: { id: 19, url: `${SITE}/wp-content/uploads/2026/10/blog-natural-pet-food.jpg` },
  blog3: { id: 20, url: `${SITE}/wp-content/uploads/2026/10/blog-sustainable-feeding.jpg` },
};
const img = (m) => ({ id: m.id, url: m.url, size: '', alt: '', source: 'library' });

// ---------- helpers ----------
let n = 0;
const uid = () => (0x1000000 + ((++n) * 7919 + 0x2a3f1) % 0xeffffff).toString(16).slice(-7);
const px = (size) => ({ unit: 'px', size, sizes: [] });
const pct = (size) => ({ unit: '%', size, sizes: [] });
const box = (t, r = t, b = t, l = r, unit = 'px') => ({ unit, top: String(t), right: String(r), bottom: String(b), left: String(l), isLinked: t === r && r === b && b === l });
const gap = (g) => ({ unit: 'px', size: g, column: String(g), row: String(g), isLinked: true });
const link = (url, ext = false) => ({ url, is_external: ext ? 'on' : '', nofollow: '', custom_attributes: '' });
const icon = (value, library = 'fa-solid') => ({ value, library });
const gColor = (id) => `globals/colors?id=${id}`;
const gType = (id) => `globals/typography?id=${id}`;

const con = (settings, elements = [], isInner = true) => ({
  id: uid(), elType: 'container', isInner,
  // Inner containers are full width so their own Width setting applies (boxed ignores it).
  settings: isInner && !settings.content_width ? { content_width: 'full', ...settings } : settings,
  elements,
});
const section = (settings, elements) => con(settings, elements, false);
const w = (widgetType, settings) => {
  const st = { ...settings };
  if (st.css_classes) { st._css_classes = st.css_classes; delete st.css_classes; }
  if (st.z_index !== undefined) { st._z_index = st.z_index; delete st.z_index; }
  return { id: uid(), elType: 'widget', widgetType, isInner: false, settings: st, elements: [] };
};

const row = (extra = {}) => {
  const r = { flex_direction: 'row', flex_direction_mobile: 'column', ...extra };
  // Rows that stay rows on mobile must not wrap (Elementor wraps them by default).
  if (r.flex_direction_mobile === 'row' && !r.flex_wrap) { r.flex_wrap_tablet = 'nowrap'; r.flex_wrap_mobile = 'nowrap'; }
  return r;
};
const col = (extra = {}) => ({ flex_direction: 'column', ...extra });
const widthPx = (desktop, extra = {}) => ({ width: px(desktop), width_tablet: pct(100), width_mobile: pct(100), ...extra });

const heading = (title, { tag = 'h2', color = 'primary', type = 'primary', align, extra = {} } = {}) =>
  w('heading', { title, header_size: tag, ...(align ? { align, align_mobile: align } : {}), __globals__: { title_color: gColor(color), typography_typography: gType(type) }, ...extra });
const text = (html, { color = 'text', type = 'text', align, extra = {} } = {}) =>
  w('text-editor', { editor: html, ...(align ? { align, align_mobile: align } : {}), __globals__: { text_color: gColor(color), typography_typography: gType(type) }, ...extra });
const button = (label, url, extra = {}) => w('button', { text: label, link: link(url), ...extra });
const smallButton = (label, url, extra = {}) => button(label, url, {
  __globals__: { typography_typography: gType('rpf_nav') },
  text_padding: box(12, 32), ...extra,
});
const image = (m, extra = {}) => w('image', { image: img(m), image_size: 'full', ...extra });

// ---------- Kit (Site Settings) ----------
const typo = (weight, size, lh, ls, tablet, mobile, mobileLh) => ({
  typography_typography: 'custom',
  typography_font_family: 'Source Sans Pro',
  typography_font_weight: String(weight),
  typography_font_size: px(size),
  ...(tablet ? { typography_font_size_tablet: px(tablet) } : {}),
  ...(mobile ? { typography_font_size_mobile: px(mobile) } : {}),
  typography_line_height: px(lh),
  ...(mobileLh ? { typography_line_height_mobile: px(mobileLh) } : {}),
  typography_letter_spacing: px(ls),
});
export const kit = {
  system_colors: [
    { _id: 'primary', title: 'Plum (Headings)', color: '#514150' },
    { _id: 'secondary', title: 'Brand Red', color: '#B4544E' },
    { _id: 'text', title: 'Body Text', color: '#534251' },
    { _id: 'accent', title: 'Brand Green', color: '#7EC78E' },
  ],
  custom_colors: [
    { _id: 'rpf_blue', title: 'Ocean Blue', color: '#62B6CF' },
    { _id: 'rpf_grey', title: 'Muted Grey', color: '#9E9E9E' },
    { _id: 'rpf_dark', title: 'Dark Grey', color: '#3C3C3C' },
    { _id: 'rpf_light', title: 'Light Background', color: '#F5F7FA' },
    { _id: 'rpf_cream', title: 'Cream Background', color: '#FFFCF9' },
    { _id: 'rpf_border', title: 'Border', color: '#E1E4EA' },
    { _id: 'rpf_star', title: 'Star Orange', color: '#FFA600' },
    { _id: 'rpf_white', title: 'White', color: '#FFFFFF' },
  ],
  system_typography: [
    { _id: 'primary', title: 'Section Heading (H2)', ...typo(700, 48, 56, -0.96, 40, 32, 40) },
    { _id: 'secondary', title: 'Card Title (H3)', ...typo(600, 24, 32, -0.24, null, 20, 28) },
    { _id: 'text', title: 'Body', ...typo(600, 16, 24, -0.16) },
    { _id: 'accent', title: 'Button', ...typo(600, 20, 28, -0.2, null, 18, 26) },
  ],
  custom_typography: [
    { _id: 'rpf_display', title: 'Hero Heading (H1)', ...typo(700, 64, 72, -1.28, 52, 40, 48) },
    { _id: 'rpf_lead', title: 'Lead / List', ...typo(600, 20, 28, -0.2, null, 18, 26) },
    { _id: 'rpf_nav', title: 'Navigation / Small Button', ...typo(600, 16, 24, 0) },
    { _id: 'rpf_small', title: 'Small (dates)', ...typo(400, 14, 20, -0.14) },
    { _id: 'rpf_banner', title: 'Announcement Bar', ...typo(900, 20, 32, -0.2, null, 15, 22) },
    { _id: 'rpf_rating', title: 'Rating Text', ...typo(700, 18, 28, -0.72, null, 16, 24) },
  ],
  body_color: '#534251',
  body_typography_typography: 'custom',
  body_typography_font_family: 'Source Sans Pro',
  body_typography_font_weight: '600',
  body_typography_font_size: px(16),
  body_typography_line_height: px(24),
  link_normal_color: '#B4544E',
  link_hover_color: '#514150',
  button_typography_typography: 'custom',
  button_typography_font_family: 'Source Sans Pro',
  button_typography_font_weight: '600',
  button_typography_font_size: px(20),
  button_typography_line_height: px(28),
  button_typography_letter_spacing: px(-0.2),
  button_text_color: '#FFFFFF',
  button_background_background: 'classic',
  button_background_color: '#B4544E',
  button_hover_text_color: '#FFFFFF',
  button_hover_background_background: 'classic',
  button_hover_background_color: '#9A4540',
  button_border_radius: box(999),
  button_padding: box(16, 48),
  container_width: px(1216),
  container_padding: box(0),
  space_between_widgets: { unit: 'px', size: 0, column: '0', row: '0', isLinked: true },
};

// ---------- Header (UAE) ----------
const headerLayoutCss = `<style>
.rpf-header > .rpf-style-only{display:none!important}
/* Hidden off-canvas bits (e.g. the closed mobile sub-menus) must never widen the page: on phones that zooms the
   whole site out and shows a white strip down the right-hand side. clip (unlike hidden) keeps sticky/anchors working. */
html,body{max-width:100%;overflow-x:clip}
@supports not (overflow-x:clip){body{overflow-x:hidden}}
/* No orphans: balance headings across their lines and keep paragraphs from ending on a single word. */
h1,h2,h3,h4,h5,h6,.elementor-heading-title,.elementor-icon-box-title{text-wrap:balance}
p,li,blockquote,figcaption,.elementor-icon-list-text,.elementor-icon-box-description,.elementor-tab-content,.e-n-accordion-item-title-text{text-wrap:pretty}
/* Blog page: line up card buttons at the bottom of each card. */
.page-id-105 .e-con > .elementor-widget-button:last-child{margin-top:auto!important}
.rpf-posts .hfe-post-card{display:flex;flex-direction:column;height:100%}
.rpf-posts .hfe-post-content{display:flex;flex-direction:column;flex:1 1 auto}
.rpf-posts .hfe-read-more{margin-top:auto;align-self:flex-start}
@media (min-width:768px){.page-id-105 .elementor-widget-button{flex-shrink:0}.page-id-105 .elementor-widget-button .elementor-button{white-space:nowrap}}
@media (max-width:1024px){
  body .rpf-header > .elementor-widget-image{flex:0 0 auto!important;order:1!important;margin-right:auto!important;width:auto!important;min-width:0!important}
  body .rpf-header > .rpf-header-cta{flex:0 0 auto!important;order:2!important}
  body .rpf-header > .rpf-nav{flex:0 0 auto!important;order:3!important;width:auto!important;max-width:60px!important}
}
/* Laptops: keep all nine top-level menu items on one line. */
@media (min-width:1025px) and (max-width:1399px){
  .rpf-header{padding-left:24px!important;padding-right:24px!important;gap:16px!important}
  .rpf-header > .elementor-widget-image img{width:88px!important}
  .rpf-nav .hfe-nav-menu > li > a.hfe-menu-item,.rpf-nav .hfe-nav-menu > li > .hfe-has-submenu-container > a.hfe-menu-item{padding-left:10px!important;padding-right:10px!important;font-size:15px!important}
  .rpf-header .rpf-header-cta .elementor-button{padding:12px 20px!important}
}
@media (min-width:1025px) and (max-width:1199px){
  .rpf-header > .elementor-widget-image img{width:76px!important}
  .rpf-nav .hfe-nav-menu > li > a.hfe-menu-item,.rpf-nav .hfe-nav-menu > li > .hfe-has-submenu-container > a.hfe-menu-item{padding-left:6px!important;padding-right:6px!important;font-size:14px!important}
  .rpf-header .rpf-header-cta .elementor-button{padding:10px 16px!important;font-size:14px!important}
}
@media (min-width:1025px) and (max-width:1099px){
  .rpf-header{gap:10px!important}
  .rpf-nav .hfe-nav-menu > li > a.hfe-menu-item,.rpf-nav .hfe-nav-menu > li > .hfe-has-submenu-container > a.hfe-menu-item{padding-left:4px!important;padding-right:4px!important;font-size:13.5px!important}
}
@media (max-width:767px){
  .rpf-header{gap:12px!important}
  /* Phones: no Contact Us button in the header (Contact is in the menu). */
  body .rpf-header > .rpf-header-cta{display:none!important}
}
/* ---------- Phones (<=767px) ---------- */
@media (max-width:767px){
  /* Buttons and headings sized for small screens. */
  .elementor-button{font-size:14px!important;letter-spacing:0!important;padding:12px 22px!important}
  /* Health Benefits: the long order label is shortened to "Order Now" on phones (full text stays for screen readers). */
  #health-benefits .elementor-button-text{font-size:0!important;line-height:0!important}
  #health-benefits .elementor-button-text::after{content:"Order Now";font-size:14px;line-height:20px;display:inline-block}
  .elementor-widget-heading h2.elementor-heading-title{font-size:28px!important;line-height:34px!important;letter-spacing:-0.4px!important}
  /* Home hero: show the dogs and the cat as a photo band at the top, fading into the dark text area below. */
  .home .rpf-hero{background-image:linear-gradient(180deg,rgba(26,30,38,0) 200px,#1A1E26 345px),url(https://rawpetfoods.wsdfy.com/wp-content/uploads/2026/10/golden-retrievers-and-cat-relaxing.jpg)!important;background-size:100% 100%,165% auto!important;background-position:0 0,48% 0!important;background-repeat:no-repeat!important;background-color:#1A1E26!important;padding-top:330px!important}
  .home .rpf-hero h1.elementor-heading-title{font-size:30px!important;line-height:1.15!important}
  /* Trust badges: tidy 2x2 grid of equal cards. */
  #trust.e-con-full,#trust.e-con-boxed > .e-con-inner{display:grid!important;grid-template-columns:1fr 1fr;gap:12px!important;align-items:stretch}
  #trust .elementor-widget-icon-box{width:auto!important;max-width:none!important;margin:0!important;height:100%;box-sizing:border-box;padding:16px 10px;background:#F5FAFC;border:1px solid #E1E4EA;border-radius:16px}
  #trust .elementor-icon-box-icon{margin-bottom:10px!important}
  #trust .elementor-icon-box-title{font-size:15px!important;line-height:20px!important;margin-bottom:4px!important}
  #trust .elementor-icon-box-description{font-size:13px!important;line-height:18px!important}
  /* Home Our Range: smaller callout cards, two per row, equal heights. */
  .home .rpf-callouts{flex-direction:row!important;flex-wrap:nowrap!important;align-items:stretch!important;gap:10px!important;width:100%!important}
  .home .rpf-callouts > .e-con{flex:1 1 0!important;width:auto!important;min-width:0;flex-direction:column!important;gap:8px!important;padding:14px 12px!important;border-radius:16px!important}
  .home .rpf-callouts h3.elementor-heading-title{font-size:15px!important;line-height:20px!important}
  .home .rpf-callouts p{font-size:13px!important;line-height:18px!important}
  /* Home feeding guide: hide the two images. */
  #feeding-guide.e-con-full > .e-con:first-child,#feeding-guide.e-con-boxed > .e-con-inner > .e-con:first-child{display:none!important}
  /* Testimonials: full-width card, arrows below, stars on one line. */
  #reviews .e-con:has(> .rpf-review-track){flex-wrap:wrap!important;justify-content:center!important;gap:16px!important}
  #reviews .rpf-review-track{order:-1;flex:0 0 100%!important;width:100%!important;max-width:100%!important}
  #reviews .rpf-review{padding:24px 18px!important}
  #reviews .elementor-star-rating{white-space:nowrap}
  #reviews .rpf-review .e-con > .elementor-widget-text-editor:first-child p{font-size:17px!important;line-height:26px!important}
}
/* Home hero form: on narrow phones stack the animal picker above the button so the label shows in full. */
@media (max-width:480px){
  .rpf-animal-form{flex-wrap:wrap!important;border-radius:20px!important;padding:10px!important;gap:8px!important}
  .rpf-animal-form .rpf-select{flex:1 1 100%!important;padding:6px 8px}
  .rpf-animal-form .rpf-pill-btn{flex:1 1 100%!important;text-align:center;justify-content:center}
}
</style>
<script>
/* Orphan fallback for browsers without text-wrap:pretty (e.g. older Safari): glue a short last word to the one before it. */
(function(){if(window.CSS&&CSS.supports&&CSS.supports('text-wrap','pretty'))return;
function fix(){document.querySelectorAll('.elementor p,.elementor-widget-text-editor li,.elementor-icon-list-text,.elementor-icon-box-description').forEach(function(el){
  var w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),n,last=null;while((n=w.nextNode())){if(n.nodeValue.trim())last=n;}
  if(!last||el.textContent.trim().split(/\\s+/).length<4)return;
  var v=last.nodeValue,t=v.replace(/\\s+$/,''),i=t.lastIndexOf(' ');
  if(i>0&&t.length-i<=12){last.nodeValue=t.slice(0,i)+'\\u00a0'+t.slice(i+1)+v.slice(t.length);}
});}
if(document.readyState!=='loading'){fix();}else{document.addEventListener('DOMContentLoaded',fix);}})();
</script>`;
const header = [
  section({
    content_width: 'full', ...row({ flex_direction_mobile: 'row' }), flex_justify_content: 'center', flex_align_items: 'center',
    padding: box(16), padding_mobile: box(10, 16),
    background_background: 'classic', __globals__: { background_color: gColor('accent') },
  }, [
    heading('<u>Get a discount code with your first order — limited time only! 🐾</u>', {
      tag: 'p', color: 'rpf_white', type: 'rpf_banner', align: 'center',
    }),
  ]),
  section({
    content_width: 'full', ...row({ flex_direction_mobile: 'row' }), flex_justify_content: 'space-between', flex_align_items: 'center',
    flex_gap: gap(24), padding: box(16, 42), padding_tablet: box(12, 24), padding_mobile: box(10, 16),
    background_background: 'classic', background_color: '#FFFFFF', css_classes: 'rpf-header',
  }, [
    image(MEDIA.logo, { link_to: 'custom', link: link(`${SITE}/`), width: px(103), width_mobile: px(80), _flex_size: 'none' }),
    w('navigation-menu', {
      menu: 'main-menu', layout: 'horizontal', navmenu_align: 'center', submenu_icon: 'arrow', submenu_animation: 'none',
      dropdown: 'tablet', resp_align: 'center', full_width_dropdown: 'yes',
      pointer: 'none', padding_horizontal_menu_item: px(16), padding_vertical_menu_item: px(8), menu_space_between: px(0),
      color_menu_item: '#3C3C3C', color_menu_item_hover: '#B4544E', color_menu_item_active: '#3C3C3C',
      hamburger_align_tablet: 'right', hamburger_align_mobile: 'right',
      menu_typography_typography: 'custom', menu_typography_font_family: 'Source Sans Pro', menu_typography_font_weight: '600',
      menu_typography_font_size: px(16), menu_typography_line_height: px(24),
      color_dropdown_item: '#3C3C3C', background_color_dropdown_item: '#FFFFFF',
      color_dropdown_item_hover: '#FFFFFF', background_color_dropdown_item_hover: '#B4544E',
      dropdown_typography_typography: 'custom', dropdown_typography_font_family: 'Source Sans Pro', dropdown_typography_font_weight: '600',
      dropdown_typography_font_size: px(16),
      toggle_color: '#514150', toggle_size: px(24),
      // Grow AND shrink so the menu wraps instead of pushing the CTA off-screen on small laptops (1025-1200px).
      _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1,
      css_classes: 'rpf-nav',
    }),
    smallButton('Contact Us', `${SITE}/contact/`, { _flex_size: 'none', text_padding_mobile: box(10, 18), css_classes: 'rpf-header-cta' }),
    // Tablet/mobile order: logo | (space) | Contact Us | hamburger. The widget itself is hidden; only its <style> applies.
    // Fixed id (no uid() call) so adding this widget doesn't renumber every element after it.
    { id: 'a7f30c1', elType: 'widget', widgetType: 'html', isInner: false, settings: { html: headerLayoutCss, _css_classes: 'rpf-style-only' }, elements: [] },
  ]),
];

// ---------- Footer (UAE) ----------
const TAGLINE = 'Australia’s First Ocean-Fresh Raw Seafood Meals for Pets';
const EMAIL_ORDERS = 'orders@rawpetfoods.com.au';
const EMAIL_INFO = 'info@rawpetfoods.com.au';
const footerColTitle = (t) => heading(t, { tag: 'h4', color: 'rpf_dark', type: 'secondary' });
// Footer columns use the WordPress menus (Appearance → Menus: "Footer Home" and "Footer Legal"),
// so links stay connected to the pages and can be edited without opening Elementor.
const footerMenu = (slug) => w('navigation-menu', {
  menu: slug, layout: 'vertical', navmenu_align: 'left', submenu_icon: 'arrow', dropdown: 'none', pointer: 'none',
  padding_horizontal_menu_item: px(0), padding_vertical_menu_item: px(0), menu_space_between: px(12),
  color_menu_item: '#534251', color_menu_item_hover: '#B4544E', color_menu_item_active: '#534251',
  menu_typography_typography: 'custom', menu_typography_font_family: 'Source Sans Pro', menu_typography_font_weight: '600',
  menu_typography_font_size: px(16), menu_typography_line_height: px(24), _css_classes: 'rpf-footer-menu',
});
const newsletterForm = `<form class="rpf-pill-form" onsubmit="return false;">
  <label class="screen-reader-text" for="rpf-newsletter-email">Email address</label>
  <input id="rpf-newsletter-email" type="email" name="email" placeholder="Email address..." required>
  <button type="submit" class="rpf-pill-btn" style="font-size:16px;line-height:24px;padding:12px 32px;border-radius:999px">Join now</button>
</form>`;
const contactHtml = `<div class="rpf-contact">
  <p><strong>Orders &amp; product enquiries</strong><br><a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a></p>
  <p><strong>General &amp; partnership enquiries</strong><br><a href="mailto:${EMAIL_INFO}">${EMAIL_INFO}</a></p>
</div>
<style>.rpf-contact p{margin:0 0 14px;font:600 15px/22px "Source Sans Pro",sans-serif;color:#9E9E9E}.rpf-contact strong{color:#534251}.rpf-contact a{color:#B4544E;word-break:break-word}.rpf-contact a:hover{color:#514150}
/* Instagram's brand gradient (the widget's colour setting only takes a flat colour, #E4405F is the fallback). */
.elementor-social-icon-instagram{background:radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)!important}</style>`;
// Two footer columns side by side below desktop; accounts for the row gap.
const halfCol = { unit: 'custom', size: 'calc(50% - 12px)', sizes: [] };
const pctCol = (d) => ({ width: pct(d), width_tablet: halfCol, width_mobile: halfCol });
const footer = [
  section({
    content_width: 'boxed', ...col(), flex_gap: gap(56), flex_gap_mobile: gap(40), padding: box(56, 112, 40, 112), padding_tablet: box(48, 32), padding_mobile: box(40, 16),
    background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1, 0, 0, 0), border_color: '#E1E4EA', _element_id: 'contact',
  }, [
    con({ ...col(), flex_align_items: 'center', flex_gap: gap(20) }, [
      image(MEDIA.logoLarge, { link_to: 'custom', link: link(`${SITE}/`), width: px(200), width_mobile: px(160) }),
      text(`<p><strong>${TAGLINE}</strong><br>Ocean-fresh, snap-frozen raw seafood nutrition — made with care for pets and the planet.</p>`, { color: 'rpf_grey', align: 'center' }),
      // icon_color 'default' = each network's own brand colour; links open in a new tab.
      w('social-icons', {
        social_icon_list: [
          { _id: uid(), social_icon: icon('fab fa-facebook', 'fa-brands'), link: link('https://www.facebook.com/', true) },
          { _id: uid(), social_icon: icon('fab fa-instagram', 'fa-brands'), link: link('https://www.instagram.com/', true), item_icon_color: 'custom', item_icon_primary_color: '#E4405F', item_icon_secondary_color: '#FFFFFF' },
          { _id: uid(), social_icon: icon('fab fa-x-twitter', 'fa-brands'), link: link('https://x.com/', true), item_icon_color: 'custom', item_icon_primary_color: '#000000', item_icon_secondary_color: '#FFFFFF' },
        ],
        shape: 'circle', align: 'center', icon_color: 'default', icon_size: px(20), icon_padding: { unit: 'px', size: 12 }, icon_spacing: px(16),
      }),
    ]),
    con({ ...row({ flex_direction_mobile: 'row', flex_wrap: 'nowrap' }), flex_wrap_tablet: 'wrap', flex_wrap_mobile: 'wrap', flex_justify_content: 'space-between', flex_gap: gap(24), flex_gap_tablet: { unit: 'px', size: 32, column: '24', row: '32', isLinked: false }, flex_gap_mobile: { unit: 'px', size: 32, column: '24', row: '32', isLinked: false } }, [
      con({ ...col(), flex_gap: gap(16), ...pctCol(17) }, [footerColTitle('Explore'), footerMenu('footer-home')]),
      con({ ...col(), flex_gap: gap(16), ...pctCol(17) }, [footerColTitle('Help'), footerMenu('footer-legal')]),
      con({ ...col(), flex_gap: gap(16), width: pct(26), width_tablet: halfCol, width_mobile: pct(100) }, [footerColTitle('Contact'), w('html', { html: contactHtml })]),
      con({ ...col(), flex_gap: gap(16), width: pct(32), width_tablet: halfCol, width_mobile: pct(100) }, [
        footerColTitle('Newsletter'),
        text('<p>Get tasty updates and exclusive deals — no spam, just wagging tails.</p>', { color: 'rpf_grey' }),
        w('html', { html: newsletterForm }),
      ]),
    ]),
    w('text-editor', { editor: '<p>© 2026 Raw Pet Foods | All rights reserved.</p>', align: 'center', text_color: 'rgba(83,66,81,0.5)', __globals__: { typography_typography: gType('text') }, css_classes: 'rpf-copyright' }),
  ]),
];

// ---------- Home page ----------
// Custom listbox instead of a native <select>: mobile browsers place the native picker wherever they like.
const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;
const heroForm = `<form class="rpf-pill-form rpf-pill-form--dark rpf-animal-form" action="${SITE}/contact/">
  <input type="hidden" name="animal" value="">
  <div class="rpf-select">
    <div class="rpf-select__btn" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"><span class="rpf-select__label">Choose your animal</span></div>
    <ul class="rpf-select__list" role="listbox" aria-label="Choose your animal" hidden>
      <li role="option" tabindex="-1" aria-selected="false" data-value="dog">Dog</li>
      <li role="option" tabindex="-1" aria-selected="false" data-value="cat">Cat</li>
    </ul>
  </div>
  <a class="rpf-pill-btn" href="${SITE}/contact/">Shop Now</a>
</form>
<style>
.rpf-select{position:relative;flex:1 1 auto;min-width:0}
.rpf-select__btn{box-sizing:border-box;display:block;margin:0;border:0;border-radius:0;background-color:transparent;user-select:none;width:100%;padding-right:26px;cursor:pointer;color:#fff;font:600 16px/24px "Source Sans Pro",sans-serif;letter-spacing:-.16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:${chevron} no-repeat right center}
.rpf-select__btn[aria-expanded="true"]{background-image:${chevron.replace("d='m6 9 6 6 6-6'", "d='m6 15 6-6 6 6'")}}
.rpf-select__btn:focus-visible{outline:2px solid #fff;outline-offset:4px;border-radius:4px}
.rpf-select__list{position:absolute;left:-16px;right:0;top:calc(100% + 18px);z-index:30;margin:0;padding:8px;list-style:none;background:#fff;border-radius:16px;box-shadow:0 16px 32px rgba(14,18,27,.2)}
.rpf-select__list[hidden]{display:none}
.rpf-select__list.is-up{top:auto;bottom:calc(100% + 18px)}
.rpf-select__list li{margin:0;padding:10px 12px;border-radius:10px;color:#514150;font:600 16px/24px "Source Sans Pro",sans-serif;cursor:pointer}
.rpf-select__list li:hover,.rpf-select__list li:focus,.rpf-select__list li[aria-selected="true"]{background:#F5F7FA;color:#B4544E;outline:none}
@media (max-width:480px){.rpf-animal-form{padding-left:14px;gap:8px}.rpf-animal-form .rpf-pill-btn{padding:10px 16px}.rpf-select__btn{font-size:14px;padding-right:22px;background-size:18px}}
</style>
<script>
(function(){document.querySelectorAll('.rpf-animal-form:not([data-ready])').forEach(function(f){
  f.setAttribute('data-ready','1');
  var btn=f.querySelector('.rpf-select__btn'),list=f.querySelector('.rpf-select__list'),label=f.querySelector('.rpf-select__label'),input=f.querySelector('input[name=animal]'),opts=[].slice.call(list.querySelectorAll('[role=option]'));
  // The hero clips overflow (rounded corners), so open upwards when the list won't fit below the field.
  function place(){list.classList.remove('is-up');var box=f.closest('.rpf-hero')||document.documentElement,lim=Math.min(box.getBoundingClientRect().bottom,window.innerHeight);if(list.getBoundingClientRect().bottom>lim-8){list.classList.add('is-up');}}
  function toggle(open){list.hidden=!open;if(open){place();}btn.setAttribute('aria-expanded',open?'true':'false');if(open){(list.querySelector('[aria-selected=true]')||opts[0]).focus();}}
  function pick(o){opts.forEach(function(x){x.setAttribute('aria-selected',x===o?'true':'false');});label.textContent=o.textContent;input.value=o.getAttribute('data-value');toggle(false);btn.focus();}
  btn.addEventListener('click',function(){toggle(list.hidden);});
  btn.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){e.preventDefault();toggle(true);}else if(e.key==='Escape'){toggle(false);}});
  opts.forEach(function(o,i){
    o.addEventListener('click',function(){pick(o);});
    o.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'){e.preventDefault();(opts[i+1]||opts[0]).focus();}
      else if(e.key==='ArrowUp'){e.preventDefault();(opts[i-1]||opts[opts.length-1]).focus();}
      else if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(o);}
      else if(e.key==='Escape'||e.key==='Tab'){toggle(false);btn.focus();}
    });
  });
  document.addEventListener('click',function(e){if(!f.contains(e.target)){toggle(false);}});
});})();
</script>`;

const benefitItem = (t) => ({ _id: uid(), text: t, selected_icon: icon('fas fa-heart') });
const callout = (title, body, rotate) => con({
  ...row({ flex_direction_mobile: 'row' }), flex_gap: gap(16), flex_align_items: 'flex-start',
  padding: box(16, 24), background_background: 'classic', background_color: '#FFFFFF', border_radius: box(20),
  box_shadow_box_shadow_type: 'yes', box_shadow_box_shadow: { horizontal: 0, vertical: 16, blur: 32, spread: 0, color: 'rgba(14,18,27,0.1)' },
  _transform_rotate_popover: 'transform', _transform_rotateZ_effect: { unit: 'px', size: rotate, sizes: [] },
  _transform_rotateZ_effect_mobile: { unit: 'px', size: 0, sizes: [] },
  width: px(362), width_tablet: px(320), width_mobile: pct(100),
}, [
  w('icon', { selected_icon: icon('fas fa-check'), view: 'stacked', shape: 'circle', primary_color: '#B4544E', secondary_color: '#FFFFFF', size: px(14), icon_padding: px(9), _flex_size: 'none' }),
  // 'custom' grow+shrink: Elementor's 'grow' preset disables shrinking, which lets text overflow the card.
  con({ ...col(), flex_gap: gap(8), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
    heading(title, { tag: 'h3', type: 'secondary' }),
    text(`<p>${body}</p>`, { color: 'primary' }),
  ]),
]);

const blogCard = (m, date, title, excerpt, url) => con({
  ...col(), flex_gap: gap(16), padding: box(16), background_background: 'classic', background_color: '#FFFFFF',
  border_border: 'solid', border_width: box(1), border_color: 'rgba(83,66,81,0.24)',
  width: pct(31), width_tablet: pct(100), width_mobile: pct(100), _flex_size: 'grow',
}, [
  image(m, { link_to: 'custom', link: link(url), height: px(308), height_mobile: px(240), 'object-fit': 'cover', width: pct(100), width_tablet: pct(100), width_mobile: pct(100), _element_width: 'inherit' }),
  con({ ...col(), flex_gap: gap(24), padding: box(16) }, [
    w('icon-list', {
      view: 'inline', icon_list: [{ _id: uid(), text: date, selected_icon: icon('far fa-calendar', 'fa-regular') }],
      icon_color: '#B4544E', icon_size: px(18), text_indent: px(8),
      __globals__: { text_color: gColor('primary'), icon_typography_typography: gType('rpf_small') },
    }),
    con({ ...col(), flex_gap: gap(8) }, [
      heading(title, { tag: 'h3', type: 'secondary', extra: { link: link(url) } }),
      text(`<p>${excerpt}</p>`, { color: 'rpf_grey', extra: { css_classes: 'rpf-clamp-2' } }),
    ]),
    w('button', {
      text: 'Read more', link: link(url), selected_icon: icon('fas fa-arrow-right'), icon_align: 'row-reverse', icon_indent: px(4),
      text_padding: box(0, 0, 4, 0), background_background: 'classic', background_color: 'rgba(0,0,0,0)',
      button_background_hover_background: 'classic', button_background_hover_color: 'rgba(0,0,0,0)',
      button_text_color: '#B4544E', hover_color: '#514150', border_radius: box(0),
      border_border: 'solid', border_width: box(0, 0, 1, 0), border_color: '#B4544E',
      __globals__: { typography_typography: gType('rpf_nav') }, css_classes: 'rpf-readmore', align: 'left',
    }),
  ]),
]);

// ---------- Shared bits ----------
const BLOG = {
  seafood: `${SITE}/why-real-seafood-is-more-attractive-for-pets/`,
  natural: `${SITE}/how-to-tell-if-your-pets-food-is-truly-natural/`,
  sustainable: `${SITE}/sustainable-feeding-good-for-pets-better-for-the-planet/`,
};
const STORAGE_LINE = 'Delivered frozen to preserve raw nutrition. Simply thaw in the fridge before serving.';
const SEC = (extra) => ({ content_width: 'boxed', ...extra });
// Small uppercase label above section headings ("Why Raw", "Our Range"…).
const eyebrow = (t, align) => w('heading', {
  title: t, header_size: 'p', ...(align ? { align, align_mobile: align } : {}),
  title_color: '#B4544E', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700',
  typography_font_size: px(14), typography_line_height: px(20), typography_letter_spacing: px(1.6), typography_text_transform: 'uppercase',
});
// Tighter side padding on phones so the longer benefit-led labels fit on one or two lines.
const ctaBtn = (label, url, extra = {}) => button(label, url, { text_padding_mobile: box(14, 24), ...extra });

const faq = (q, a) => ({ q, a });
const faqs = [
  faq('Is raw seafood safe for pets?', `Yes — when it’s sourced, handled and stored properly. Our seafood is prepared hygienically and snap-frozen to lock in freshness. Keep it frozen until needed, thaw it in the fridge, and wash bowls and hands after serving, just as you would with any raw protein. If your pet has a health condition, check with your vet before changing their diet. <a href="${BLOG.seafood}">Why real seafood works for pets →</a>`),
  faq('How is the food delivered and stored?', `${STORAGE_LINE} Pop it straight in the freezer when it arrives and thaw only what you need. <a href="${SITE}/delivery-info/">Delivery &amp; storage info →</a>`),
  faq('Can I refreeze after thawing?', 'No. Once thawed, keep it covered in the fridge and use it within the time shown on the pack. Refreezing thawed raw food affects both texture and food safety, so thaw one portion at a time.'),
  faq('How do I transition my pet to raw food?', `Go gradually over about 7–10 days. Start by swapping a small part of their usual meal for raw seafood, then increase the share each day while keeping an eye on their digestion. Puppies, kittens and pets with health conditions should switch under your vet’s guidance. <a href="${BLOG.natural}">What “natural” pet food really means →</a>`),
  faq('What makes Raw Pet Foods different?', `We’re ${'Australia’s first ocean-fresh raw seafood meals for pets'}: real seafood cuts like salmon belly fins instead of fillers, snap-frozen to lock in nutrition, vet-approved and responsibly sourced. <a href="${BLOG.sustainable}">How we feed pets sustainably →</a>`),
  faq('Do you deliver interstate?', `We’re expanding our delivery areas. Check <a href="${SITE}/delivery-info/">Delivery Info</a> for the latest, or email <a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a> with your postcode and we’ll confirm delivery to you.`),
];
const makeAccordion = (list = faqs) => {
  const acc = w('nested-accordion', {
    items: list.map((f) => ({ _id: uid(), item_title: f.q })),
    title_tag: 'h3', faq_schema: 'yes', default_state: 'all_collapsed', max_items_expended: 'one',
    accordion_item_title_icon: icon('fas fa-plus-circle'), accordion_item_title_icon_active: icon('fas fa-minus-circle'),
    accordion_item_title_icon_position: 'end', accordion_item_title_position_horizontal: 'stretch',
    accordion_item_title_space_between: px(16), accordion_item_title_distance_from_content: px(0),
    accordion_padding: box(28, 32), accordion_padding_mobile: box(20),
    accordion_border_radius: box(2),
    accordion_background_normal_background: 'classic', accordion_background_normal_color: '#FFFFFF',
    accordion_background_hover_background: 'classic', accordion_background_hover_color: '#FFFFFF',
    accordion_background_active_background: 'classic', accordion_background_active_color: '#FFFFFF',
    accordion_border_normal_border: 'solid', accordion_border_normal_width: box(1), accordion_border_normal_color: 'rgba(83,66,81,0.24)',
    accordion_border_hover_border: 'solid', accordion_border_hover_width: box(1), accordion_border_hover_color: 'rgba(83,66,81,0.4)',
    accordion_border_active_border: 'solid', accordion_border_active_width: box(1), accordion_border_active_color: 'rgba(83,66,81,0.4)',
    title_typography_typography: 'custom', title_typography_font_family: 'Source Sans Pro', title_typography_font_weight: '600',
    title_typography_font_size: px(22), title_typography_font_size_mobile: px(18), title_typography_line_height: px(30), title_typography_letter_spacing: px(-0.22),
    normal_title_color: '#514150', hover_title_color: '#B4544E', active_title_color: '#514150',
    normal_icon_color: '#62B6CF', hover_icon_color: '#62B6CF', active_icon_color: '#62B6CF', icon_size: px(24),
    content_padding: box(0, 32, 28, 32), content_padding_mobile: box(0, 20, 20, 20),
    _element_width: 'initial', _element_custom_width: px(860), _element_custom_width_tablet: pct(100),
  });
  acc.elements = list.map((f) => con({ content_width: 'full', ...col() }, [text(`<p>${f.a}</p>`, { color: 'text' })]));
  return acc;
};

// Trust badges (icon boxes). Icons are Font Awesome; swap for badge artwork later if the client has it.
const badge = (ic, title, desc) => w('icon-box', {
  selected_icon: icon(ic), view: 'stacked', shape: 'circle', position: 'top', title_text: title, description_text: desc, title_size: 'h3',
  primary_color: '#62B6CF', secondary_color: '#FFFFFF', icon_size: px(26), icon_padding: px(18), icon_space: px(14),
  text_align: 'center', title_color: '#514150', description_color: '#9E9E9E',
  title_typography_typography: 'custom', title_typography_font_family: 'Source Sans Pro', title_typography_font_weight: '700', title_typography_font_size: px(18), title_typography_line_height: px(24),
  description_typography_typography: 'custom', description_typography_font_family: 'Source Sans Pro', description_typography_font_weight: '600', description_typography_font_size: px(14), description_typography_line_height: px(20),
  _element_width: 'initial', _element_custom_width: pct(23), _element_custom_width_tablet: pct(23), _element_custom_width_mobile: { unit: 'custom', size: 'calc(50% - 8px)', sizes: [] },
});
const trustBadges = (bg = '#FFFFFF') => section(SEC({
  _element_id: 'trust', ...row({ flex_direction_mobile: 'row' }), flex_wrap: 'nowrap', flex_wrap_mobile: 'wrap', flex_justify_content: 'space-between', flex_align_items: 'flex-start',
  flex_gap: gap(16), flex_gap_mobile: { unit: 'px', size: 16, column: '16', row: '28', isLinked: false },
  padding: box(48, 112), padding_tablet: box(40, 32), padding_mobile: box(36, 16), background_background: 'classic', background_color: bg,
}), [
  badge('fas fa-map-marker-alt', 'Australian Owned', 'Proudly Australian, from ocean to bowl'),
  badge('fas fa-stethoscope', 'Vet Approved', 'Balanced, safe nutrition backed by science'),
  badge('fas fa-fish', 'Sustainable Seafood', 'Responsibly sourced from local waters'),
  badge('fas fa-industry', 'Made in NSW', 'Prepared and snap-frozen locally'),
]);

const pillar = (ic, title, body) => con({ ...row({ flex_direction_mobile: 'row' }), flex_gap: gap(16), flex_align_items: 'flex-start' }, [
  w('icon', { selected_icon: icon(ic), view: 'stacked', shape: 'circle', primary_color: '#EAF6FA', secondary_color: '#3E9AB8', size: px(20), icon_padding: px(12), _flex_size: 'none' }),
  con({ ...col(), flex_gap: gap(4), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
    heading(title, { tag: 'h3', type: 'secondary' }),
    text(`<p>${body}</p>`),
  ]),
]);

const scrollCue = w('html', { css_classes: 'rpf-scroll-cue-w', html: `<a class="rpf-scroll-cue" href="#trust" aria-label="Scroll to learn more"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></a>
<style>
body .rpf-hero > .rpf-scroll-cue-w{position:absolute!important;left:50%;bottom:18px;transform:translateX(-50%);width:auto!important;max-width:none!important;margin:0!important;z-index:3}
.rpf-scroll-cue{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;border:1.5px solid rgba(255,255,255,.75);background:rgba(0,0,0,.15);animation:rpf-bob 1.8s ease-in-out infinite}
.rpf-scroll-cue:hover{background:rgba(0,0,0,.3)}
@keyframes rpf-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
@media (prefers-reduced-motion:reduce){.rpf-scroll-cue{animation:none}}
</style>` });

const feedingTable = `<div class="rpf-feed">
<table>
  <thead><tr><th>Your pet</th><th>Typical weight</th><th>Daily raw food*</th></tr></thead>
  <tbody>
    <tr><td>Cat</td><td>4 kg</td><td>80–120 g</td></tr>
    <tr><td>Small dog</td><td>5 kg</td><td>100–150 g</td></tr>
    <tr><td>Medium dog</td><td>10 kg</td><td>200–300 g</td></tr>
    <tr><td>Large dog</td><td>20 kg</td><td>400–600 g</td></tr>
    <tr><td>Giant dog</td><td>30 kg</td><td>600–900 g</td></tr>
  </tbody>
</table>
<p class="rpf-feed__note">*A general guide of 2–3% of your adult pet’s ideal body weight in total raw food per day, split across meals. Puppies, kittens, seniors and very active pets need different amounts — check the pack and ask your vet.</p>
</div>
<style>
.rpf-feed table{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #E1E4EA;border-radius:16px;overflow:hidden;font:600 16px/24px "Source Sans Pro",sans-serif;color:#534251;margin:0}
.rpf-feed th,.rpf-feed td{padding:12px 16px;text-align:left;border-bottom:1px solid #E1E4EA}
.rpf-feed th{background:#EAF6FA;color:#514150;font-weight:700}
.rpf-feed tr:last-child td{border-bottom:0}
.rpf-feed td:last-child{color:#B4544E;font-weight:700;white-space:nowrap}
.rpf-feed__note{margin:12px 0 0;font:600 14px/20px "Source Sans Pro",sans-serif;color:#9E9E9E}
@media (max-width:480px){.rpf-feed th,.rpf-feed td{padding:10px 12px;font-size:15px}}
</style>`;

const storageSteps = w('icon-list', {
  icon_list: [
    ['fas fa-snowflake', 'Keep frozen until you need it'],
    ['fas fa-temperature-low', 'Thaw overnight in the fridge'],
    ['fas fa-utensils', 'Serve, and keep leftovers covered in the fridge'],
    ['fas fa-ban', 'Never refreeze once thawed'],
  ].map(([ic, t]) => ({ _id: uid(), text: t, selected_icon: icon(ic) })),
  space_between: px(10), icon_size: px(18), text_indent: px(12), icon_color: '#3E9AB8',
  __globals__: { text_color: gColor('text'), icon_typography_typography: gType('text') },
});

// ---------- Home page ----------
const home = [
  // 1. Hero
  section({ content_width: 'full', padding: box(0, 10, 10, 10), padding_mobile: box(0, 8, 8, 8), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'home' }, [
    con({
      content_width: 'full', ...row(), flex_justify_content: 'space-between', flex_align_items: 'flex-end', flex_gap: gap(32),
      min_height: px(700), min_height_mobile: px(600), padding: box(80, 80, 96, 80), padding_tablet: box(56, 40, 88, 40), padding_mobile: box(32, 20, 80, 20),
      border_radius: box(30), border_radius_mobile: box(20),
      background_background: 'classic', background_image: img(MEDIA.heroPets), background_position: 'center center', background_size: 'cover', background_repeat: 'no-repeat',
      background_overlay_background: 'gradient', background_overlay_color: 'rgba(20,24,32,0.78)', background_overlay_color_stop: pct(0),
      background_overlay_color_b: 'rgba(20,24,32,0.15)', background_overlay_color_b_stop: pct(85),
      background_overlay_gradient_type: 'linear', background_overlay_gradient_angle: { unit: 'deg', size: 70, sizes: [] },
      background_overlay_gradient_angle_mobile: { unit: 'deg', size: 0, sizes: [] },
      css_classes: 'rpf-hero', flex_align_items_mobile: 'flex-start', flex_justify_content_mobile: 'flex-end',
    }, [
      con({ ...col(), flex_gap: gap(20), ...widthPx(600) }, [
        con({ ...row({ flex_direction_mobile: 'row', flex_wrap: 'wrap' }), flex_align_items: 'center', flex_gap: gap(12) }, [
          image(MEDIA.trustpilot, { width: px(220), width_mobile: px(180), _flex_size: 'none' }),
          heading('We’ve rated 4.9 across 200 reviews!', { tag: 'p', color: 'rpf_white', type: 'rpf_rating' }),
        ]),
        // Own typography (not the global H1 style) so the longer tagline fits comfortably.
        w('heading', { title: TAGLINE, header_size: 'h1', title_color: '#FFFFFF', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(56), typography_font_size_tablet: px(46), typography_font_size_mobile: px(34), typography_line_height: { unit: 'em', size: 1.1, sizes: [] }, typography_letter_spacing: px(-1.1) }),
        w('heading', { title: 'Snap-Frozen to Lock in Freshness and Nutrition', header_size: 'p', title_color: '#BFE6F2', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(22), typography_font_size_mobile: px(18), typography_line_height: px(30) }),
        text('<p>Real Australian seafood, prepared raw and delivered frozen — so your dog or cat gets nutrition the way nature intended.</p>', { color: 'rpf_white' }),
        ctaBtn('Order Now', `${SITE}/contact/`, { _margin: box(8, 0, 0, 0), css_classes: 'rpf-hero-cta' }),
      ]),
      con({
        ...col(), flex_gap: gap(16), padding: box(32), padding_mobile: box(20), border_radius: box(40), border_radius_mobile: box(28),
        background_background: 'classic', background_color: 'rgba(0,0,0,0.28)', css_classes: 'rpf-glass', ...widthPx(440),
      }, [
        image(MEDIA.seafoodPlatter, { width: pct(100), height: px(150), height_mobile: px(120), 'object-fit': 'cover', image_border_radius: box(24), image_border_radius_mobile: box(16), _element_width: 'inherit' }),
        heading('Get your custom feeding plan', { tag: 'p', color: 'rpf_white', type: 'secondary' }),
        w('html', { html: heroForm }),
      ]),
      scrollCue,
    ]),
  ]),

  // 2. Trust badges
  trustBadges(),

  // 3. Why Raw
  section(SEC({
    _element_id: 'why-raw', ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40),
    padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC',
  }), [
    image(MEDIA.seafoodPlatter, { width: px(480), width_tablet: pct(100), height_tablet: px(380), height_mobile: px(300), 'object-fit': 'cover', image_border_radius: box(24), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('Why Raw'),
      heading('Why Raw Seafood is Nature’s Perfect Pet Food'),
      text('<p>Cats and dogs thrive on fresh, whole protein. Raw seafood delivers it just as nature made it — no heavy processing, no fillers, nothing your pet doesn’t need.</p>'),
      con({ ...col(), flex_gap: gap(20), _margin: box(8, 0, 0, 0) }, [
        pillar('fas fa-water', 'Ocean-fresh, Australian-sourced', 'Real, whole seafood cuts from Australian waters — never fillers.'),
        pillar('fas fa-leaf', 'Raw, natural nutrition', 'Omega-3s, lean protein and minerals kept intact — not cooked out.'),
        pillar('fas fa-snowflake', 'Snap-frozen for freshness', 'Frozen fast to lock in flavour and nutrients, then delivered frozen.'),
        pillar('fas fa-shield-alt', 'Vet-approved & sustainable', 'Balanced, safe nutrition from responsibly managed fisheries.'),
      ]),
      ctaBtn('Discover Why Raw', `${SITE}/why-raw/`, { selected_icon: icon('fas fa-arrow-right'), icon_align: 'row-reverse', icon_indent: px(8), background_color: '#514150', button_background_hover_color: '#3C3C3C' }),
    ]),
  ]),

  // 4. Health benefits
  section(SEC({
    _element_id: 'health-benefits', ...row(), flex_align_items: 'center', flex_gap: gap(64),
    padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16),
    background_background: 'classic', background_color: '#FFFFFF', background_image: img(MEDIA.pawBg), background_position: 'center center', background_size: 'cover',
  }), [
    con({ ...col(), flex_gap: gap(20), ...widthPx(547) }, [
      eyebrow('Health Benefits'),
      heading('Visible results, from nose to tail'),
      text('<p>Every ingredient serves a purpose — rich proteins for strength, omega oils for glossy coats, and natural minerals for a longer, happier life.</p>'),
      w('icon-list', {
        icon_list: ['Healthier skin &amp; shinier coat', 'Stronger immunity', 'More energy every day', 'Easy, gentle digestion'].map(benefitItem),
        space_between: px(8), icon_size: px(20), text_indent: px(12), icon_color: '#62B6CF',
        __globals__: { text_color: gColor('text'), icon_typography_typography: gType('rpf_lead') },
      }),
      ctaBtn('Order Now – Freshness Delivered Frozen', `${SITE}/contact/`, { _margin: box(16, 0, 0, 0) }),
    ]),
    image(MEDIA.dog, { width: px(557), width_tablet: pct(100), image_border_radius: box(21), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
  ]),

  // 5. Sustainability / ocean banner
  section(SEC({ _element_id: 'sustainability', padding: box(24, 112, 112, 112), padding_tablet: box(24, 32, 64, 32), padding_mobile: box(16, 16, 48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    con({
      content_width: 'full', ...col(), flex_justify_content: 'center', flex_align_items: 'center', flex_gap: gap(40),
      min_height: px(507), padding: box(112), padding_tablet: box(80, 200, 80, 220), padding_mobile: box(48, 20, 290, 20), border_radius: box(24),
      background_background: 'classic', background_color: '#62B6CF', background_image: img(MEDIA.ocean),
      background_position: 'center left', background_position_mobile: 'bottom left', background_size: 'cover', background_size_mobile: 'initial',
      background_bg_width_mobile: { unit: 'px', size: 640, sizes: [] }, background_repeat: 'no-repeat',
      // Second seafood image on the right edge, layered via the background overlay (full opacity).
      background_overlay_background: 'classic', background_overlay_image: img(MEDIA.oceanRight),
      background_overlay_position: 'center right', background_overlay_position_mobile: 'bottom right',
      background_overlay_repeat: 'no-repeat', background_overlay_size: 'contain',
      background_overlay_size_tablet: 'initial', background_overlay_bg_width_tablet: { unit: 'px', size: 190, sizes: [] },
      background_overlay_size_mobile: 'initial', background_overlay_bg_width_mobile: { unit: 'px', size: 150, sizes: [] },
      background_overlay_opacity: { unit: 'px', size: 1, sizes: [] },
    }, [
      // Text never runs under the seafood images on either edge; the heading wraps on small laptops instead.
      con({ ...col(), flex_align_items: 'center', flex_gap: gap(20), width: { unit: 'custom', size: 'min(600px, calc(100% - 380px))', sizes: [] }, width_tablet: pct(100), width_mobile: pct(100) }, [
        eyebrow('Sustainability', 'center'),
        heading('Powered by the ocean’s best', { color: 'rpf_white', align: 'center' }),
        text('<p>Responsibly sourced from Australian waters and snap-frozen at peak freshness — good for your pet, and for the oceans their food comes from.</p>', { color: 'rpf_white', align: 'center' }),
      ]),
      ctaBtn('Our Sustainability Promise', `${SITE}/sustainability/`, { align: 'center' }),
    ]),
  ]),

  // 6. Our Range
  section(SEC({
    _element_id: 'products', ...col(), flex_align_items: 'center', flex_gap: gap(32),
    padding: box(112), padding_tablet: box(80, 32), padding_mobile: box(56, 16),
    background_background: 'classic', background_color: '#FFFCF9', background_image: img(MEDIA.productBg), background_position: 'center center', background_size: 'cover',
  }), [
    con({ ...col(), flex_align_items: 'center', flex_gap: gap(20), width: px(800), width_tablet: pct(100) }, [
      eyebrow('Our Range', 'center'),
      heading('Rethink what pet food should be', { align: 'center' }),
      text('<p>Most pet meals are overly processed and stripped of natural goodness. Ours are different — made from real seafood cuts, rich in Omega-3 and the natural nutrients pets truly need.</p>', { color: 'primary', align: 'center', extra: { _element_width: 'initial', _element_custom_width: px(650), _element_custom_width_tablet: pct(100) } }),
      w('icon-list', {
        view: 'inline', icon_list: [{ _id: uid(), text: STORAGE_LINE, selected_icon: icon('fas fa-snowflake') }],
        icon_color: '#3E9AB8', icon_size: px(18), text_indent: px(10), icon_align: 'center',
        __globals__: { text_color: gColor('primary'), icon_typography_typography: gType('text') }, css_classes: 'rpf-storage-pill',
      }),
      ctaBtn('Explore Our Range', `${SITE}/our-range/`, { align: 'center', selected_icon: icon('fas fa-arrow-right'), icon_align: 'row-reverse', icon_indent: px(8) }),
    ]),
    con({ ...row({ flex_direction_tablet: 'column' }), flex_justify_content: 'space-between', flex_align_items: 'stretch', flex_gap: gap(0), flex_gap_tablet: gap(16), width: pct(100) }, [
      con({ ...col(), flex_justify_content: 'space-between', flex_align_items: 'flex-start', flex_gap: gap(16), z_index: 2, flex_direction_tablet: 'row', flex_wrap_tablet: 'wrap', flex_direction_mobile: 'column', _flex_size: 'none', ...widthPx(362), order_tablet: 'end', css_classes: 'rpf-callouts' }, [
        callout('Real seafood', 'Only premium salmon belly fins — rich in protein, calcium, and vitamin D.', -2),
        callout('Vet-approved nutrition', 'Balanced and safe for pets of all ages — backed by science, trusted by owners.', 2),
      ]),
      // Pack shot fills the gap between the two 362px callout columns and tucks 218px under each,
      // so the row always sums to 100% (927px at the 1216px container) and the pack stays centred.
      image({ ...MEDIA.pack }, { width: pct(100), _element_width: 'initial', _element_custom_width: { unit: 'custom', size: 'calc(100% - 288px)', sizes: [] }, _element_width_tablet: 'inherit', _margin: box(26, -218, 0, -218), _margin_tablet: box(0), _flex_size: 'none', _flex_size_tablet: 'none', z_index: 1, css_classes: 'rpf-pack' }),
      con({ ...col(), flex_justify_content: 'space-between', flex_align_items: 'flex-end', flex_gap: gap(16), z_index: 2, flex_direction_tablet: 'row', flex_wrap_tablet: 'wrap', flex_direction_mobile: 'column', _flex_size: 'none', ...widthPx(362), order_tablet: 'end', css_classes: 'rpf-callouts' }, [
        callout('Australian-sourced', 'Ocean-fresh seafood harvested responsibly from local waters.', 2),
        callout('Snap-frozen', 'Frozen fast to lock in freshness, flavour and nutrition.', -2),
      ]),
    ]),
  ]),

  // 7. Feeding guide: packaging, portions, storage
  section(SEC({
    _element_id: 'feeding-guide', ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40),
    padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF',
  }), [
    con({ ...col(), flex_gap: gap(16), ...widthPx(480), flex_align_items: 'stretch' }, [
      image(MEDIA.salmonIce, { width: pct(100), height: px(260), height_mobile: px(200), 'object-fit': 'cover', image_border_radius: box(20), _element_width: 'inherit' }),
      con({ ...col(), flex_align_items: 'center', padding: box(16, 24), border_radius: box(20), background_background: 'classic', background_color: '#F5FAFC' }, [
        image(MEDIA.pack, { width: px(340), width_mobile: pct(100) }),
        text('<p>Sealed, portion-friendly packs. Pack size and contents are printed on every label.</p>', { color: 'rpf_grey', align: 'center' }),
      ]),
    ]),
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('Feeding Guide'),
      heading('Simple portions, frozen fresh'),
      text(`<p>${STORAGE_LINE} Use this as a starting point and adjust to keep your pet at a healthy weight.</p>`),
      w('html', { html: feedingTable }),
      heading('Storage &amp; handling', { tag: 'h3', type: 'secondary' }),
      storageSteps,
      ctaBtn('View the Full Feeding Guide', `${SITE}/feeding-guide/`, { selected_icon: icon('fas fa-arrow-right'), icon_align: 'row-reverse', icon_indent: px(8), background_color: '#514150', button_background_hover_color: '#3C3C3C' }),
    ]),
  ]),

  // 8. About teaser
  section(SEC({
    _element_id: 'about', ...row(), flex_justify_content: 'space-between', flex_align_items: 'center', flex_gap: gap(64),
    padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5F7FA',
  }), [
    image(MEDIA.about, { width: px(532), width_tablet: pct(100), image_border_radius: box(12), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
    con({ ...col(), flex_gap: gap(20), ...widthPx(547) }, [
      eyebrow('About Us'),
      heading('Crafted by experts.<br>Trusted by pets.'),
      text('<p>We’re more than a brand — we’re an Australian manufacturer passionate about real nutrition and transparency. Every recipe is developed, tested and packed with care in NSW, for pets right across Australia.</p>'),
      ctaBtn('Meet Raw Pet Foods', `${SITE}/about-us/`, { _margin: box(16, 0, 0, 0) }),
    ]),
  ]),

  // 9. Reviews (one real review for now; more to come from the client)
  section(SEC({
    _element_id: 'reviews', ...col(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_mobile: gap(40),
    padding: box(112), padding_tablet: box(80, 32), padding_mobile: box(56, 16),
    background_background: 'classic', background_image: img(MEDIA.reviewsBg), background_position: 'center center', background_size: 'cover', background_repeat: 'no-repeat',
    __globals__: { background_color: gColor('accent') }, css_classes: 'rpf-reviews',
  }), [
    heading('Difference you can see', { color: 'rpf_white', align: 'center' }),
    con({ ...row({ flex_direction_mobile: 'row' }), flex_justify_content: 'center', flex_align_items: 'center', flex_gap: gap(48), flex_gap_mobile: gap(8), width: pct(100) }, [
      w('icon', { selected_icon: icon('fas fa-chevron-left'), view: 'stacked', shape: 'circle', primary_color: '#FFFFFF', secondary_color: '#7EC78E', size: px(20), size_mobile: px(14), icon_padding: px(18), icon_padding_mobile: px(12), link: link('#reviews'), css_classes: 'rpf-review-prev', _flex_size: 'none' }),
      con({ ...col(), flex_align_items: 'center', flex_gap: gap(32), flex_gap_mobile: gap(20), width: px(800), width_tablet: pct(100), _flex_size: 'shrink', css_classes: 'rpf-review-track' }, [
        con({
          ...col(), flex_align_items: 'center', flex_gap: gap(32), flex_gap_mobile: gap(20), padding: box(40), padding_mobile: box(24, 20), width: pct(100),
          background_background: 'classic', background_color: '#FFFFFF', border_radius: box(24),
          border_border: 'solid', border_width: box(1), border_color: '#E1E4EA',
          box_shadow_box_shadow_type: 'yes', box_shadow_box_shadow: { horizontal: 0, vertical: 2, blur: 2, spread: 0, color: 'rgba(10,13,20,0.1)' },
          css_classes: 'rpf-review',
        }, [
          w('star-rating', { rating_scale: '5', rating: '5', star_style: 'star_fontawesome', unmarked_star_style: 'solid', align: 'center', icon_size: px(26), icon_size_mobile: px(20), icon_space: px(18), icon_space_mobile: px(8), stars_color: '#FFA600' }),
          con({ ...col(), flex_gap: gap(16) }, [
            text('<p>“Our golden retriever, Luna, used to be a picky eater. Since switching to Raw Petfoods, she finishes every bowl and her coat looks incredible. You can literally see the difference in just a few weeks.”</p>', { type: 'secondary', align: 'center' }),
            text('<p>Martha B.</p>', { color: 'rpf_grey', align: 'center' }),
          ]),
        ]),
      ]),
      w('icon', { selected_icon: icon('fas fa-chevron-right'), view: 'stacked', shape: 'circle', primary_color: '#FFFFFF', secondary_color: '#7EC78E', size: px(20), size_mobile: px(14), icon_padding: px(18), icon_padding_mobile: px(12), link: link('#reviews'), css_classes: 'rpf-review-next', _flex_size: 'none' }),
    ]),
  ]),

  // 10. Wholesale teaser
  section(SEC({
    _element_id: 'wholesale', ...row(), flex_justify_content: 'space-between', flex_align_items: 'center', flex_gap: gap(64),
    padding: box(112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF',
  }), [
    con({ ...col(), flex_gap: gap(20), ...widthPx(547) }, [
      eyebrow('Wholesale'),
      heading('Join our partner network'),
      text('<p>Join our network of select pet retailers and groomers offering premium raw seafood meals to health-conscious pet owners.</p>'),
      ctaBtn('Become a Stockist', `${SITE}/wholesale/`, { _margin: box(16, 0, 0, 0) }),
    ]),
    image(MEDIA.partner, { width: px(532), width_tablet: pct(100), image_border_radius: box(12), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
  ]),

  // 11. Blog
  section(SEC({
    _element_id: 'blog', ...col(), flex_align_items: 'center', flex_gap: gap(48),
    padding: box(112), padding_tablet: box(80, 32), padding_mobile: box(56, 16),
    background_background: 'classic', __globals__: { background_color: gColor('rpf_light') },
  }), [
    con({ ...col(), flex_align_items: 'center', flex_gap: gap(20), width: px(860), width_tablet: pct(100) }, [
      eyebrow('Feeding Guide &amp; Blog', 'center'),
      heading('Pet care wisdom, straight from the source', { align: 'center' }),
      text('<p>Expert tips, feeding guides and behind-the-scenes stories about how we bring ocean-fresh nutrition to every meal.</p>', { align: 'center', extra: { _element_width: 'initial', _element_custom_width: px(664), _element_custom_width_tablet: pct(100) } }),
    ]),
    con({ ...row({ flex_direction_tablet: 'column' }), flex_gap: gap(32), flex_align_items: 'stretch', width: pct(100) }, [
      blogCard(MEDIA.blog1, 'October 18, 2025', 'Why Real Seafood Is More Attractive For Pets?', 'Fish isn’t just delicious — it’s a powerhouse of omega-3s, minerals, and lean protein that support heart health, shiny coats, and strong joints.', BLOG.seafood),
      blogCard(MEDIA.blog2, 'October 26, 2025', 'How to Tell if Your Pet’s Food Is Truly “Natural”', 'Not all pet food labeled “natural” lives up to the claim. We break down what to look for on the label, how to spot fillers, and what real ingredients should look like in your pet’s bowl.', BLOG.natural),
      blogCard(MEDIA.blog3, 'December 6, 2025', 'Sustainable Feeding: Good for Pets, Better for the Planet', 'From responsibly sourced seafood to recyclable packaging, every choice matters. See how Raw Petfoods is reducing waste while keeping your pet’s nutrition uncompromised.', BLOG.sustainable),
    ]),
    ctaBtn('Visit the Blog', `${SITE}/blog/`, { align: 'center' }),
  ]),

  // 12. FAQ
  section(SEC({
    _element_id: 'faqs', ...col(), flex_align_items: 'center', flex_gap: gap(48), flex_gap_mobile: gap(32),
    padding: box(112), padding_tablet: box(80, 32), padding_mobile: box(56, 16), background_background: 'classic', background_color: '#FFFFFF',
  }), [
    con({ ...col(), flex_align_items: 'center', flex_gap: gap(16) }, [
      eyebrow('FAQ', 'center'),
      heading('Curious? We’ve got answers.', { align: 'center' }),
    ]),
    makeAccordion(),
    ctaBtn('See All FAQs', `${SITE}/faq/`, { align: 'center' }),
  ]),
];

// ---------- Inner pages (About Us, Wholesale, FAQ, Delivery Info) ----------
const pageHero = (eyebrowText, title, sub, m, pos = 'center center') => section({ content_width: 'full', padding: box(0, 10, 10, 10), padding_mobile: box(0, 8, 8, 8), background_background: 'classic', background_color: '#FFFFFF' }, [
  con({
    content_width: 'full', ...col(), flex_justify_content: 'flex-end', flex_gap: gap(16), min_height: px(420), min_height_mobile: px(340),
    padding: box(80), padding_tablet: box(56, 40), padding_mobile: box(32, 20), border_radius: box(30), border_radius_mobile: box(20),
    background_background: 'classic', background_image: img(m), background_position: pos, background_size: 'cover', background_repeat: 'no-repeat',
    background_overlay_background: 'gradient', background_overlay_color: 'rgba(20,24,32,0.78)', background_overlay_color_stop: pct(0),
    background_overlay_color_b: 'rgba(20,24,32,0.2)', background_overlay_color_b_stop: pct(90),
    background_overlay_gradient_type: 'linear', background_overlay_gradient_angle: { unit: 'deg', size: 20, sizes: [] },
  }, [
    w('heading', { title: eyebrowText, header_size: 'p', title_color: '#BFE6F2', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(14), typography_letter_spacing: px(1.6), typography_text_transform: 'uppercase' }),
    w('heading', { title, header_size: 'h1', title_color: '#FFFFFF', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(52), typography_font_size_tablet: px(44), typography_font_size_mobile: px(34), typography_line_height: { unit: 'em', size: 1.1, sizes: [] }, typography_letter_spacing: px(-1) }),
    text(`<p>${sub}</p>`, { color: 'rpf_white', extra: { _element_width: 'initial', _element_custom_width: px(640), _element_custom_width_tablet: pct(100) } }),
  ]),
]);
const ctaBand = (title, body, label, url) => section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(20), padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', __globals__: { background_color: gColor('accent') } }), [
  heading(title, { color: 'rpf_white', align: 'center' }),
  text(`<p>${body}</p>`, { color: 'rpf_white', align: 'center', extra: { _element_width: 'initial', _element_custom_width: px(640), _element_custom_width_tablet: pct(100) } }),
  ctaBtn(label, url, { align: 'center' }),
]);
const bullets = (items, color = '#3E9AB8') => w('icon-list', {
  icon_list: items.map((t) => ({ _id: uid(), text: t, selected_icon: icon('fas fa-check-circle') })),
  space_between: px(10), icon_size: px(20), text_indent: px(12), icon_color: color,
  __globals__: { text_color: gColor('text'), icon_typography_typography: gType('rpf_lead') },
});
const infoCard = (ic, title, body) => con({ ...col(), flex_gap: gap(12), padding: box(28), border_radius: box(20), background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', width: pct(32), width_tablet: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
  w('icon', { selected_icon: icon(ic), view: 'stacked', shape: 'circle', primary_color: '#EAF6FA', secondary_color: '#3E9AB8', size: px(22), icon_padding: px(14), align: 'left' }),
  heading(title, { tag: 'h3', type: 'secondary' }),
  text(`<p>${body}</p>`),
]);
const cardsRow = (cards) => con({ ...row({ flex_direction_tablet: 'column' }), flex_gap: gap(24), flex_align_items: 'stretch', width: pct(100) }, cards);
const introBlock = (eb, title, body, align) => con({ ...col(), flex_gap: gap(16), ...(align ? { flex_align_items: 'center' } : {}), width: px(800), width_tablet: pct(100) }, [
  eyebrow(eb, align), heading(title, align ? { align } : {}), text(`<p>${body}</p>`, align ? { align } : {}),
]);

// About Us — founders section intentionally left out until the client supplies names, photos and story.
const about = [
  pageHero('About Us', 'Ocean-fresh nutrition, made with care', `${TAGLINE}. We believe pets deserve the same fresh, honest food we’d choose for ourselves.`, MEDIA.fishIce),
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    con({ ...col(), flex_gap: gap(20), ...widthPx(560) }, [
      eyebrow('Our Story'),
      heading('Why we started Raw Pet Foods'),
      text('<p>Too many pet meals are heavily processed, packed with fillers and short on the fresh nutrition animals evolved to eat. We set out to change that with something simple: real Australian seafood, prepared raw and snap-frozen at its freshest.</p><p>Every recipe is vet-approved and made in NSW, so you always know what’s in your pet’s bowl — and where it came from.</p>'),
      ctaBtn('Explore Our Range', `${SITE}/our-range/`, { _margin: box(16, 0, 0, 0) }),
    ]),
    image(MEDIA.fishingBoat, { width: px(480), width_tablet: pct(100), height: px(560), height_tablet: px(420), height_mobile: px(320), 'object-fit': 'cover', image_border_radius: box(24), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
  ]),
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC' }), [
    introBlock('Sourcing Transparency', 'From the ocean to your pet’s bowl', 'We want you to know exactly how your pet’s food is made. Here’s what goes into every pack.', 'center'),
    cardsRow([
      infoCard('fas fa-water', 'Where it comes from', 'Seafood sourced from Australian waters through responsibly managed suppliers — never imported fillers.'),
      infoCard('fas fa-snowflake', 'How it’s handled', 'Prepared hygienically and snap-frozen in NSW to lock in freshness, then delivered frozen to your door.'),
      infoCard('fas fa-list-ul', 'What’s inside', 'Real seafood cuts such as salmon belly fins. The full ingredient list is printed on every pack.'),
    ]),
  ]),
  trustBadges('#FFFFFF'),
  ctaBand('Start your pet’s raw journey', 'Ocean-fresh, snap-frozen seafood meals your dog or cat will love.', 'Order Now – Freshness Delivered Frozen', `${SITE}/contact/`),
];

// Wholesale — the form opens the visitor's email app with the enquiry filled in (no form plugin yet).
const wholesaleForm = `<form class="rpf-ws-form" novalidate>
  <div class="rpf-ws-grid">
    <label>Business name*<input name="business" required autocomplete="organization"></label>
    <label>Your name*<input name="name" required autocomplete="name"></label>
    <label>Email*<input name="email" type="email" required autocomplete="email"></label>
    <label>Phone<input name="phone" type="tel" autocomplete="tel"></label>
    <label>Business type<select name="type"><option>Pet retailer</option><option>Groomer</option><option>Vet clinic</option><option>Distributor</option><option>Other</option></select></label>
    <label>Suburb / State<input name="location" autocomplete="address-level2"></label>
    <label class="rpf-ws-full">Tell us about your business<textarea name="message" rows="4"></textarea></label>
  </div>
  <button type="submit" class="rpf-pill-btn">Send Enquiry</button>
  <p class="rpf-ws-note" role="status">Sending opens your email app with your enquiry ready to go to <a href="mailto:${EMAIL_INFO}">${EMAIL_INFO}</a>.</p>
</form>
<style>
.rpf-ws-form{display:flex;flex-direction:column;gap:20px}
.rpf-ws-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rpf-ws-form label{display:flex;flex-direction:column;gap:6px;font:700 14px/20px "Source Sans Pro",sans-serif;color:#514150}
.rpf-ws-form input,.rpf-ws-form select,.rpf-ws-form textarea{font:600 16px/24px "Source Sans Pro",sans-serif;color:#514150;padding:12px 16px;border:1px solid #E1E4EA;border-radius:12px;background:#fff;box-shadow:none;width:100%;box-sizing:border-box}
.rpf-ws-form input:focus,.rpf-ws-form select:focus,.rpf-ws-form textarea:focus{outline:2px solid #62B6CF;outline-offset:1px;border-color:#62B6CF}
.rpf-ws-form .is-invalid{border-color:#B4544E}
.rpf-ws-full{grid-column:1/-1}
.rpf-ws-form .rpf-pill-btn{align-self:flex-start;padding:14px 40px}
.rpf-ws-note{margin:0;font:600 14px/20px "Source Sans Pro",sans-serif;color:#9E9E9E}
.rpf-ws-note a{color:#B4544E}
@media (max-width:600px){.rpf-ws-grid{grid-template-columns:1fr}.rpf-ws-form .rpf-pill-btn{align-self:stretch}}
</style>
<script>
(function(){document.querySelectorAll('.rpf-ws-form:not([data-ready])').forEach(function(f){
  f.setAttribute('data-ready','1');
  f.addEventListener('submit',function(e){
    e.preventDefault();
    var bad=null;[].forEach.call(f.querySelectorAll('[required]'),function(el){var ok=el.value.trim()&&(el.type!=='email'||/.+@.+\\..+/.test(el.value));el.classList.toggle('is-invalid',!ok);if(!ok&&!bad){bad=el;}});
    if(bad){bad.focus();f.querySelector('.rpf-ws-note').textContent='Please fill in the highlighted fields.';return;}
    var v=function(n){return f.elements[n].value.trim();};
    var body=['Business: '+v('business'),'Name: '+v('name'),'Email: '+v('email'),'Phone: '+v('phone'),'Business type: '+v('type'),'Location: '+v('location'),'','Message:',v('message')].join('\\n');
    window.location.href='mailto:${EMAIL_INFO}?subject='+encodeURIComponent('Wholesale enquiry – '+v('business'))+'&body='+encodeURIComponent(body);
    f.querySelector('.rpf-ws-note').innerHTML='Thanks! Your email app should now open with your enquiry — just press send. If it doesn’t, email us at <a href="mailto:${EMAIL_INFO}">${EMAIL_INFO}</a>.';
  });
});})();
</script>`;
// B2B pitch: hero with the client's opening line + benefit bullets, benefit cards, partner types,
// product line, how it works, then the enquiry form. No pricing, MOQs or timeframes until the client confirms them.
const WS_BENEFITS = ['Exclusive distributor pricing', 'Premium frozen product line', 'Free marketing support &amp; POS materials'];
const outlineBtn = (label, url) => button(label, url, {
  text_padding_mobile: box(14, 24), background_color: 'rgba(255,255,255,0)', button_text_color: '#FFFFFF',
  border_border: 'solid', border_width: box(2), border_color: '#FFFFFF',
  button_background_hover_color: '#FFFFFF', hover_color: '#514150', button_hover_border_color: '#FFFFFF',
});
const wsHero = section({ content_width: 'full', padding: box(0, 10, 10, 10), padding_mobile: box(0, 8, 8, 8), background_background: 'classic', background_color: '#FFFFFF' }, [
  con({
    content_width: 'full', ...col(), flex_justify_content: 'center', flex_gap: gap(20), min_height: px(620), min_height_mobile: px(0),
    padding: box(96, 80), padding_tablet: box(72, 40), padding_mobile: box(48, 20), border_radius: box(30), border_radius_mobile: box(20),
    background_background: 'classic', background_image: img(MEDIA.storeOwners), background_position: 'center right', background_size: 'cover', background_repeat: 'no-repeat',
    background_overlay_background: 'gradient', background_overlay_color: 'rgba(20,24,32,0.9)', background_overlay_color_stop: pct(0),
    // Right side stays a little dark so the hero copy stays readable on phones, where it sits over the photo.
    background_overlay_color_b: 'rgba(20,24,32,0.4)', background_overlay_color_b_stop: pct(100),
    background_overlay_gradient_type: 'linear', background_overlay_gradient_angle: { unit: 'deg', size: 90, sizes: [] },
  }, [
    con({ ...col(), flex_gap: gap(20), ...widthPx(640) }, [
      w('heading', { title: 'Wholesale &amp; Stockists', header_size: 'p', title_color: '#BFE6F2', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(14), typography_letter_spacing: px(1.6), typography_text_transform: 'uppercase' }),
      w('heading', { title: 'Stock Australia’s first ocean-fresh raw seafood meals for pets', header_size: 'h1', title_color: '#FFFFFF', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(52), typography_font_size_tablet: px(44), typography_font_size_mobile: px(34), typography_line_height: { unit: 'em', size: 1.1, sizes: [] }, typography_letter_spacing: px(-1) }),
      w('text-editor', { editor: '<p>Join our network of select pet retailers and groomers offering premium raw seafood meals to health-conscious pet owners.</p>', text_color: '#FFFFFF', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '600', typography_font_size: px(20), typography_font_size_mobile: px(18), typography_line_height: { unit: 'em', size: 1.45, sizes: [] } }),
      w('icon-list', {
        icon_list: WS_BENEFITS.map((t) => ({ _id: uid(), text: t, selected_icon: icon('fas fa-check-circle') })),
        space_between: px(10), icon_size: px(20), text_indent: px(12), icon_color: '#62B6CF', text_color: '#FFFFFF',
        icon_typography_typography: 'custom', icon_typography_font_family: 'Source Sans Pro', icon_typography_font_weight: '700', icon_typography_font_size: px(18), icon_typography_line_height: px(26),
      }),
      con({ ...row({ flex_direction_mobile: 'column' }), flex_gap: gap(16), flex_align_items: 'center', flex_align_items_mobile: 'stretch', _margin: box(12, 0, 0, 0) }, [
        ctaBtn('Become a Stockist', '#enquiry'),
        outlineBtn('Email Our Wholesale Team', `mailto:${EMAIL_INFO}?subject=Wholesale%20enquiry`),
      ]),
    ]),
  ]),
]);
// Big benefit card: icon, title (the client's bullet), supporting copy.
const benefitCard = (ic, title, body) => con({ ...col(), flex_gap: gap(14), padding: box(36, 32), padding_mobile: box(28, 24), border_radius: box(24), background_background: 'classic', background_color: '#FFFFFF', box_shadow_box_shadow_type: 'yes', box_shadow_box_shadow: { horizontal: 0, vertical: 16, blur: 40, spread: 0, color: 'rgba(14,18,27,0.08)' }, border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', width: pct(32), width_tablet: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
  w('icon', { selected_icon: icon(ic), view: 'stacked', shape: 'circle', primary_color: '#62B6CF', secondary_color: '#FFFFFF', size: px(24), icon_padding: px(18), align: 'left' }),
  heading(title, { tag: 'h3', type: 'secondary' }),
  text(`<p>${body}</p>`),
]);
// Partner type card with photo on top.
const partnerCard = (m, title, body) => con({ ...col(), flex_gap: gap(0), border_radius: box(24), background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', overflow: 'hidden', width: pct(32), width_tablet: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
  image(m, { width: pct(100), height: px(220), height_mobile: px(200), 'object-fit': 'cover', _element_width: 'inherit' }),
  con({ ...col(), flex_gap: gap(10), padding: box(24, 28, 28, 28) }, [
    heading(title, { tag: 'h3', type: 'secondary' }),
    text(`<p>${body}</p>`),
  ]),
]);
// Numbered step for "How it works".
const stepCard = (num, title, body) => con({ ...col(), flex_gap: gap(12), padding: box(28), border_radius: box(20), background_background: 'classic', background_color: 'rgba(255,255,255,0.08)', border_border: 'solid', border_width: box(1), border_color: 'rgba(255,255,255,0.18)', width: pct(24), width_tablet: { unit: 'custom', size: 'calc(50% - 12px)', sizes: [] }, width_mobile: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
  w('heading', { title: num, header_size: 'p', title_color: '#62B6CF', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(40), typography_line_height: px(44) }),
  heading(title, { tag: 'h3', type: 'secondary', color: 'rpf_white' }),
  w('text-editor', { editor: `<p>${body}</p>`, text_color: 'rgba(255,255,255,0.82)', __globals__: { typography_typography: gType('text') } }),
]);
const wholesale = [
  wsHero,
  trustBadges('#FFFFFF'),
  // Benefits
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC' }), [
    introBlock('Wholesale Benefits', 'Everything you need to sell premium raw', 'We look after our stockists. Partner with us and you get a standout product, pricing that works for your business, and the support to put it in front of the right customers.', 'center'),
    cardsRow([
      benefitCard('fas fa-tags', 'Exclusive distributor pricing', 'Trade pricing reserved for approved stockists, so you can offer a premium, in-demand product while protecting your margins. We’ll share our wholesale price list once we’ve learnt a little about your business.'),
      benefitCard('fas fa-snowflake', 'Premium frozen product line', 'Australian-sourced seafood, prepared raw and snap-frozen in NSW to lock in freshness and nutrition. Packs arrive frozen, ready for your freezer — your customers simply thaw them in the fridge before serving.'),
      benefitCard('fas fa-bullhorn', 'Free marketing support &amp; POS materials', 'Point-of-sale materials, product information and marketing assets at no extra cost, so your team can talk confidently about raw seafood nutrition and your customers can see why it’s worth trying.'),
    ]),
  ]),
  // Who we partner with
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    introBlock('Who We Partner With', 'Built for businesses pet owners trust', 'Our stockists are the people pet owners already turn to for advice. If health-conscious customers walk through your door, we’d love to hear from you.', 'center'),
    cardsRow([
      partnerCard(MEDIA.retailShelves, 'Pet retailers', 'Independent pet stores and specialty retailers looking for a fresh, natural point of difference in the freezer.'),
      partnerCard(MEDIA.groomer, 'Groomers &amp; salons', 'Recommend nutrition that supports healthy skin and a shinier coat — and give clients something great to take home.'),
      partnerCard(MEDIA.petPro, 'Vets &amp; pet care professionals', 'Clinics, trainers and pet care businesses that want a vet-approved raw seafood option they can recommend with confidence.'),
    ]),
  ]),
  // Product line
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFCF9' }), [
    con({ ...col(), flex_align_items: 'center', flex_justify_content: 'center', padding: box(40), padding_mobile: box(24), border_radius: box(24), background_background: 'classic', background_color: '#FFFFFF', ...widthPx(480), _flex_size: 'none', _flex_size_tablet: 'shrink' }, [
      image(MEDIA.pack, { width: pct(100) }),
    ]),
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('The Product Line'),
      heading('A premium range that earns its place in your freezer'),
      text('<p>Raw Pet Foods brings something genuinely new to your shelves: real Australian seafood, prepared raw for dogs and cats. It’s a product your customers will notice — and come back for.</p>'),
      con({ ...col(), flex_gap: gap(18), _margin: box(8, 0, 0, 0) }, [
        pillar('fas fa-water', 'Ocean-fresh, Australian-sourced', 'Real seafood cuts such as salmon belly fins — never fillers.'),
        pillar('fas fa-snowflake', 'Snap-frozen &amp; delivered frozen', `${STORAGE_LINE}`),
        pillar('fas fa-stethoscope', 'Vet-approved', 'Balanced, safe nutrition you can recommend with confidence.'),
        pillar('fas fa-fish', 'Sustainable seafood, made in NSW', 'Responsibly sourced and prepared locally.'),
      ]),
    ]),
  ]),
  // How it works
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#514150' }), [
    con({ ...col(), flex_gap: gap(16), flex_align_items: 'center', width: px(800), width_tablet: pct(100) }, [
      w('heading', { title: 'How It Works', header_size: 'p', align: 'center', title_color: '#BFE6F2', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(14), typography_line_height: px(20), typography_letter_spacing: px(1.6), typography_text_transform: 'uppercase' }),
      heading('Becoming a stockist is simple', { color: 'rpf_white', align: 'center' }),
    ]),
    con({ ...row({ flex_direction_tablet: 'row' }), flex_wrap: 'nowrap', flex_wrap_tablet: 'wrap', flex_gap: gap(24), flex_align_items: 'stretch', width: pct(100) }, [
      stepCard('01', 'Send an enquiry', 'Tell us about your business using the form below — it only takes a minute.'),
      stepCard('02', 'Have a chat with us', 'We’ll get in touch to talk through your customers, our range and how we can work together.'),
      stepCard('03', 'Set up your account', 'Once you’re approved, we’ll set up your trade account and share distributor pricing.'),
      stepCard('04', 'Stock &amp; sell', 'Your first order arrives frozen, with marketing support and POS materials to help it sell.'),
    ]),
  ]),
  // Enquiry
  section(SEC({ ...row(), flex_align_items: 'stretch', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'enquiry' }), [
    con({ ...col(), flex_gap: gap(20), ...widthPx(400), _flex_size: 'none', _flex_size_tablet: 'shrink' }, [
      eyebrow('Wholesale Enquiry'),
      heading('Let’s grow together'),
      text('<p>Join our network of select pet retailers and groomers offering premium raw seafood meals to health-conscious pet owners. Fill in the form and our team will be in touch.</p>'),
      bullets(WS_BENEFITS),
      con({ ...col(), flex_gap: gap(6), padding: box(20, 24), border_radius: box(16), background_background: 'classic', background_color: '#F5FAFC', _margin: box(8, 0, 0, 0) }, [
        heading('Prefer email?', { tag: 'p', type: 'secondary' }),
        text(`<p><a href="mailto:${EMAIL_INFO}?subject=Wholesale%20enquiry">${EMAIL_INFO}</a></p>`),
      ]),
    ]),
    con({ ...col(), flex_gap: gap(20), padding: box(40), padding_mobile: box(24), border_radius: box(24), background_background: 'classic', background_color: '#F5FAFC', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1, width_tablet: pct(100) }, [
      heading('Become a stockist', { tag: 'h3', type: 'secondary' }),
      w('html', { html: wholesaleForm }),
    ]),
  ]),
];

const faqPage = [
  pageHero('FAQ', 'Frequently asked questions', 'Everything you need to know about feeding raw seafood, delivery and storage. Can’t find your answer? We’re happy to help.', MEDIA.salmonIce),
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    makeAccordion(),
    text(`<p>Still have a question? Email <a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a> for orders and products, or <a href="mailto:${EMAIL_INFO}">${EMAIL_INFO}</a> for everything else.</p>`, { align: 'center' }),
  ]),
  ctaBand('Ready to make the switch?', 'Start your pet’s raw journey with ocean-fresh, snap-frozen seafood.', 'Order Now – Freshness Delivered Frozen', `${SITE}/contact/`),
];

const delivery = [
  pageHero('Delivery Info', 'Delivered frozen, fresh to your door', `${STORAGE_LINE}`, MEDIA.salmonIce),
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    introBlock('Delivery & Storage', 'How your order arrives', 'Your order is packed and delivered frozen to preserve raw nutrition. Here’s how to keep it at its best.', 'center'),
    cardsRow([
      infoCard('fas fa-truck', 'Delivered frozen', 'Your order arrives frozen. Put it straight into the freezer when it arrives.'),
      infoCard('fas fa-temperature-low', 'Thaw in the fridge', 'Move one portion to the fridge the night before. Never thaw at room temperature or in the microwave.'),
      infoCard('fas fa-ban', 'Don’t refreeze', 'Once thawed, keep it covered in the fridge, use it within the time shown on the pack, and never refreeze.'),
    ]),
  ]),
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(16), padding: box(0, 112, 96, 112), padding_tablet: box(0, 32, 64, 32), padding_mobile: box(0, 16, 48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    con({ ...col(), flex_gap: gap(12), padding: box(32), padding_mobile: box(24), border_radius: box(20), background_background: 'classic', background_color: '#F5FAFC', width: px(800), width_tablet: pct(100) }, [
      heading('Delivery areas &amp; fees', { tag: 'h2', type: 'secondary' }),
      text(`<p>We’re expanding where we deliver. Email <a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a> with your postcode and we’ll confirm delivery options and timing for your area.</p>`),
    ]),
  ]),
];

// ---------- Feeding Guide page ----------
// Portion maths matches the homepage table and FAQ: 2–3% of an adult pet's ideal body weight per day.
const feedCalc = `<div class="rpf-calc">
  <div class="rpf-calc__grid">
    <label>Your pet<select name="pet"><option value="dog">Dog</option><option value="cat">Cat</option></select></label>
    <label>Ideal adult weight (kg)<input name="kg" type="number" min="1" max="90" step="0.5" value="10" inputmode="decimal"></label>
    <label class="rpf-calc__full">Activity level<select name="act"><option value="0.02">Less active / senior (about 2%)</option><option value="0.025" selected>Moderately active (about 2.5%)</option><option value="0.03">Very active / working (about 3%)</option></select></label>
  </div>
  <div class="rpf-calc__out" role="status" aria-live="polite">
    <p class="rpf-calc__label">Suggested daily amount</p>
    <p class="rpf-calc__value"><span data-out="day">250 g</span> per day</p>
    <p class="rpf-calc__meals">That’s about <span data-out="meal">125 g</span> per meal, split across <span data-out="n">2 meals</span>.</p>
  </div>
  <p class="rpf-calc__note">A starting point for healthy adult pets only. Puppies, kittens, pregnant or nursing pets and pets with health conditions have different needs — please check with your vet.</p>
</div>
<style>
.rpf-calc{display:flex;flex-direction:column;gap:20px}
.rpf-calc__grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rpf-calc label{display:flex;flex-direction:column;gap:6px;font:700 14px/20px "Source Sans Pro",sans-serif;color:#514150}
.rpf-calc input,.rpf-calc select{font:600 16px/24px "Source Sans Pro",sans-serif;color:#514150;padding:12px 16px;border:1px solid #E1E4EA;border-radius:12px;background:#fff;box-shadow:none;width:100%;box-sizing:border-box}
.rpf-calc input:focus,.rpf-calc select:focus{outline:2px solid #62B6CF;outline-offset:1px;border-color:#62B6CF}
.rpf-calc__full{grid-column:1/-1}
.rpf-calc__out{background:#514150;border-radius:20px;padding:24px 28px;color:#fff}
.rpf-calc__out p{margin:0}
.rpf-calc__label{font:700 13px/18px "Source Sans Pro",sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#BFE6F2}
.rpf-calc__value{font:700 34px/42px "Source Sans Pro",sans-serif;margin:6px 0 4px!important}
.rpf-calc__value span{color:#62B6CF}
.rpf-calc__meals{font:600 16px/24px "Source Sans Pro",sans-serif;color:rgba(255,255,255,.85)}
.rpf-calc__note{margin:0;font:600 14px/20px "Source Sans Pro",sans-serif;color:#9E9E9E}
@media (max-width:600px){.rpf-calc__grid{grid-template-columns:1fr}.rpf-calc__value{font-size:28px;line-height:36px}}
</style>
<script>
(function(){document.querySelectorAll('.rpf-calc:not([data-ready])').forEach(function(c){
  c.setAttribute('data-ready','1');
  var q=function(n){return c.querySelector('[name='+n+']');},o=function(n){return c.querySelector('[data-out='+n+']');};
  function round(g){return g<100?Math.round(g/5)*5:Math.round(g/10)*10;}
  function calc(){
    var kg=parseFloat(q('kg').value)||0,pct=parseFloat(q('act').value),cat=q('pet').value==='cat';
    if(kg<=0){o('day').textContent='—';o('meal').textContent='—';return;}
    var day=round(kg*1000*pct),meals=cat||kg<5?3:2;
    o('day').textContent=day+' g';o('meal').textContent=Math.round(day/meals/5)*5+' g';o('n').textContent=meals+' meals';
  }
  ['pet','kg','act'].forEach(function(n){q(n).addEventListener('input',calc);q(n).addEventListener('change',calc);});
  calc();
});})();
</script>`;
const stepTile = (num, title, body) => con({ ...col(), flex_gap: gap(10), padding: box(28), border_radius: box(20), background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', width: pct(32), width_tablet: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
  w('heading', { title: num, header_size: 'p', title_color: '#62B6CF', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(40), typography_line_height: px(44) }),
  heading(title, { tag: 'h3', type: 'secondary' }),
  text(`<p>${body}</p>`),
]);
// Transition plan as a simple four-step timeline (HTML so the progress bars line up on every screen size).
const transitionPlan = `<div class="rpf-plan">
  <div class="rpf-plan__row"><p class="rpf-plan__days">Days 1–3</p><div class="rpf-plan__bar"><span style="width:25%">25% raw</span></div><p class="rpf-plan__tip">Mix a small amount of raw seafood into their usual food.</p></div>
  <div class="rpf-plan__row"><p class="rpf-plan__days">Days 4–6</p><div class="rpf-plan__bar"><span style="width:50%">50% raw</span></div><p class="rpf-plan__tip">Half and half. Keep an eye on appetite and digestion.</p></div>
  <div class="rpf-plan__row"><p class="rpf-plan__days">Days 7–9</p><div class="rpf-plan__bar"><span style="width:75%">75% raw</span></div><p class="rpf-plan__tip">Mostly raw now — slow down if their tummy needs more time.</p></div>
  <div class="rpf-plan__row"><p class="rpf-plan__days">Day 10+</p><div class="rpf-plan__bar"><span style="width:100%">100% raw</span></div><p class="rpf-plan__tip">Fully switched. Weigh your pet regularly and adjust portions.</p></div>
</div>
<style>
.rpf-plan{display:flex;flex-direction:column;gap:14px}
.rpf-plan__row{display:grid;grid-template-columns:110px 1fr 1.2fr;gap:20px;align-items:center;background:#fff;border:1px solid #E1E4EA;border-radius:16px;padding:16px 20px}
.rpf-plan p{margin:0}
.rpf-plan__days{font:700 16px/24px "Source Sans Pro",sans-serif;color:#514150}
.rpf-plan__bar{height:34px;background:#EAF6FA;border-radius:999px;overflow:hidden}
.rpf-plan__bar span{display:flex;align-items:center;height:100%;padding:0 14px;background:#62B6CF;color:#fff;border-radius:999px;font:700 14px/20px "Source Sans Pro",sans-serif;white-space:nowrap;box-sizing:border-box;min-width:86px}
.rpf-plan__tip{font:600 15px/22px "Source Sans Pro",sans-serif;color:#534251}
@media (max-width:767px){.rpf-plan__row{grid-template-columns:1fr;gap:10px}}
</style>`;
const FEEDING_FAQS = [
  faq('How much should I feed my pet?', 'As a general guide, healthy adult pets need about 2–3% of their ideal body weight in raw food each day, split across meals. Use the calculator above as a starting point, then adjust to keep your pet at a healthy weight.'),
  faqs[3],
  faq('How many meals a day?', 'Most adult dogs do well on two meals a day. Cats and small dogs often prefer smaller meals, so splitting the daily amount into two or three serves works well.'),
  faqs[1],
  faqs[2],
  faq('Should I serve it straight from the fridge?', 'Serve it thawed and fridge-cool. Never microwave raw food or leave it sitting out — pick up anything your pet doesn’t finish and keep leftovers covered in the fridge.'),
];
const feedingGuide = [
  pageHero('Feeding Guide', 'How to feed raw seafood, the simple way', 'Portion sizes, a gradual switch-over plan and safe storage tips — everything you need to start your pet’s raw journey with confidence.', MEDIA.blog2),
  // Quick start
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC' }), [
    introBlock('Quick Start', 'Feeding raw in three easy steps', 'You don’t need to be a nutrition expert. Start with your pet’s weight, work out a daily amount, and split it into meals.', 'center'),
    cardsRow([
      stepTile('01', 'Weigh your pet', 'Start with your pet’s ideal adult body weight. If you’re unsure what that is, your vet can help.'),
      stepTile('02', 'Work out the daily amount', 'Most healthy adult pets need about 2–3% of their ideal body weight in raw food each day.'),
      stepTile('03', 'Split it into meals', 'Divide the daily amount into two meals for most dogs, or two to three smaller meals for cats and small dogs.'),
    ]),
  ]),
  // Calculator + table
  section(SEC({ ...row(), flex_align_items: 'flex-start', flex_gap: gap(48), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'portions' }), [
    con({ ...col(), flex_gap: gap(20), padding: box(36), padding_mobile: box(24), border_radius: box(24), background_background: 'classic', background_color: '#F5FAFC', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1, width_tablet: pct(100) }, [
      eyebrow('Portion Calculator'),
      heading('How much does my pet need?', { tag: 'h2', type: 'secondary' }),
      w('html', { html: feedCalc }),
    ]),
    con({ ...col(), flex_gap: gap(20), ...widthPx(520), _flex_size: 'none', _flex_size_tablet: 'shrink' }, [
      eyebrow('Portion Guide'),
      heading('Daily portions at a glance'),
      text(`<p>${STORAGE_LINE} Use this table as a starting point and adjust to keep your pet at a healthy weight.</p>`),
      w('html', { html: feedingTable }),
    ]),
  ]),
  // Transition plan
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFCF9', _element_id: 'transition' }), [
    introBlock('Switching to Raw', 'Make the switch gradually over 7–10 days', 'Changing food too quickly can upset sensitive tummies. Increase the share of raw seafood a little at a time, and slow down if your pet needs longer.', 'center'),
    con({ ...col(), width: px(960), width_tablet: pct(100) }, [w('html', { html: transitionPlan })]),
    text('<p>Puppies, kittens and pets with health conditions should switch under your vet’s guidance.</p>', { color: 'rpf_grey', align: 'center' }),
  ]),
  // Storage & safe handling
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'storage' }), [
    image(MEDIA.salmonIce, { width: px(480), width_tablet: pct(100), height: px(460), height_tablet: px(380), height_mobile: px(260), 'object-fit': 'cover', image_border_radius: box(24), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('Storage &amp; Safe Handling'),
      heading('Keep it fresh from freezer to bowl'),
      text(`<p>${STORAGE_LINE}</p>`),
      con({ ...col(), flex_gap: gap(18), _margin: box(8, 0, 0, 0) }, [
        pillar('fas fa-snowflake', 'Keep frozen until needed', 'Pop your order straight into the freezer when it arrives.'),
        pillar('fas fa-temperature-low', 'Thaw overnight in the fridge', 'Move one portion to the fridge the night before. Never thaw at room temperature or in the microwave.'),
        pillar('fas fa-ban', 'Never refreeze', 'Once thawed, keep it covered in the fridge and use it within the time shown on the pack.'),
        pillar('fas fa-hands-wash', 'Handle it like any raw protein', 'Wash bowls, surfaces and hands after serving, and pick up anything your pet doesn’t finish.'),
      ]),
    ]),
  ]),
  // Dogs vs cats
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC' }), [
    introBlock('Tips for Dogs &amp; Cats', 'Every pet is a little different', 'A few simple tips to help your dog or cat settle into raw seafood meals.', 'center'),
    con({ ...row({ flex_direction_tablet: 'column' }), flex_gap: gap(24), flex_align_items: 'stretch', width: pct(100) }, [
      con({ ...col(), flex_gap: gap(16), padding: box(32), padding_mobile: box(24), border_radius: box(24), background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', width: pct(49), width_tablet: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
        w('icon', { selected_icon: icon('fas fa-dog'), view: 'stacked', shape: 'circle', primary_color: '#62B6CF', secondary_color: '#FFFFFF', size: px(24), icon_padding: px(18), align: 'left' }),
        heading('Feeding dogs', { tag: 'h3', type: 'secondary' }),
        bullets(['Two meals a day suits most adult dogs', 'Active and working dogs may need closer to 3%', 'Weigh them every few weeks and adjust portions', 'Always have fresh water available']),
      ]),
      con({ ...col(), flex_gap: gap(16), padding: box(32), padding_mobile: box(24), border_radius: box(24), background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', width: pct(49), width_tablet: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
        w('icon', { selected_icon: icon('fas fa-cat'), view: 'stacked', shape: 'circle', primary_color: '#62B6CF', secondary_color: '#FFFFFF', size: px(24), icon_padding: px(18), align: 'left' }),
        heading('Feeding cats', { tag: 'h3', type: 'secondary' }),
        bullets(['Cats often prefer two to three smaller meals', 'Be patient — some cats take a little longer to switch', 'Serve fridge-cool, never microwaved', 'Always have fresh water available']),
      ]),
    ]),
  ]),
  // Feeding FAQ
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    introBlock('Feeding FAQ', 'Common feeding questions', `More questions? See our <a href="${SITE}/faq/">full FAQ</a> or email <a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a>.`, 'center'),
    makeAccordion(FEEDING_FAQS),
  ]),
  // CTA
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(20), padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', __globals__: { background_color: gColor('accent') } }), [
    heading('Get your custom feeding plan', { color: 'rpf_white', align: 'center' }),
    text('<p>Tell us about your pet and we’ll help you work out the right portions — then start their raw journey with ocean-fresh, snap-frozen seafood.</p>', { color: 'rpf_white', align: 'center', extra: { _element_width: 'initial', _element_custom_width: px(640), _element_custom_width_tablet: pct(100) } }),
    con({ ...row({ flex_direction_mobile: 'column' }), flex_gap: gap(16), flex_justify_content: 'center', flex_align_items: 'center', flex_align_items_mobile: 'stretch' }, [
      ctaBtn('Get Your Custom Feeding Plan', `mailto:${EMAIL_ORDERS}?subject=Custom%20feeding%20plan`, { background_color: '#514150', button_background_hover_color: '#3C3C3C' }),
      ctaBtn('Order Now – Freshness Delivered Frozen', `${SITE}/contact/`),
    ]),
  ]),
];

// ---------- Blog page ----------
// The post grid is UAE's Basic Posts widget, so new posts appear automatically (each needs a featured image).
const topicCard = (ic, title, body, label, url) => con({ ...col(), flex_gap: gap(12), padding: box(28), border_radius: box(20), background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', width: pct(32), width_tablet: pct(100), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
  w('icon', { selected_icon: icon(ic), view: 'stacked', shape: 'circle', primary_color: '#EAF6FA', secondary_color: '#3E9AB8', size: px(22), icon_padding: px(14), align: 'left' }),
  heading(title, { tag: 'h3', type: 'secondary' }),
  text(`<p>${body}</p>`),
  w('button', { text: label, link: link(url), selected_icon: icon('fas fa-arrow-right'), icon_align: 'row-reverse', icon_indent: px(4), text_padding: box(0, 0, 4, 0), background_background: 'classic', background_color: 'rgba(0,0,0,0)', button_background_hover_background: 'classic', button_background_hover_color: 'rgba(0,0,0,0)', button_text_color: '#B4544E', hover_color: '#514150', border_radius: box(0), border_border: 'solid', border_width: box(0, 0, 1, 0), border_color: '#B4544E', __globals__: { typography_typography: gType('rpf_nav') }, align: 'left', _margin: box(4, 0, 0, 0) }),
]);
const postsGrid = w('hfe-basic-posts', {
  posts_per_page: 9, columns: '3', orderby: 'date', order: 'desc', show_image: 'yes', image_size: 'medium_large',
  show_title: 'yes', title_tag: 'h3', show_meta: 'yes', show_date: 'yes', show_author: '', show_comments: '',
  show_excerpt: 'yes', excerpt_length: 22, show_read_more: 'yes', read_more_text: 'Read more →',
  column_gap: px(32), row_gap: px(32),
  card_background_background: 'classic', card_background_color: '#FFFFFF',
  card_border_border: 'solid', card_border_width: box(1), card_border_color: 'rgba(83,66,81,0.24)', card_border_radius: box(16),
  card_padding: box(16),
  title_color: '#514150', title_hover_color: '#B4544E', title_typography_typography: 'custom', title_typography_font_family: 'Source Sans Pro', title_typography_font_weight: '600', title_typography_font_size: px(22), title_typography_line_height: px(30), title_spacing: px(8),
  meta_color: '#9E9E9E', meta_typography_typography: 'custom', meta_typography_font_family: 'Source Sans Pro', meta_typography_font_weight: '600', meta_typography_font_size: px(14), meta_spacing: px(10),
  excerpt_color: '#9E9E9E', excerpt_typography_typography: 'custom', excerpt_typography_font_family: 'Source Sans Pro', excerpt_typography_font_weight: '600', excerpt_typography_font_size: px(16), excerpt_typography_line_height: px(24), excerpt_spacing: px(16),
  read_more_color: '#B4544E', read_more_hover_color: '#514150', read_more_typography_typography: 'custom', read_more_typography_font_family: 'Source Sans Pro', read_more_typography_font_weight: '600', read_more_typography_font_size: px(16),
  css_classes: 'rpf-posts',
});
// Tidy the UAE post cards (rounded images, equal heights, single column on phones).
const postsCss = w('html', { css_classes: 'rpf-style-only', html: `<style>
.rpf-posts .hfe-post-image img,.rpf-posts img{width:100%;aspect-ratio:16/11;object-fit:cover;border-radius:10px}
.rpf-posts .hfe-post-title a{color:inherit;text-decoration:none}
.rpf-posts .hfe-read-more{text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px}
.e-con > .rpf-style-only{display:none!important}
@media (max-width:1024px){.rpf-posts .hfe-posts-grid{grid-template-columns:repeat(2,1fr)!important}}
@media (max-width:767px){.rpf-posts .hfe-posts-grid{grid-template-columns:1fr!important}}
</style>` });
const blog = [
  pageHero('Feeding Guide &amp; Blog', 'Pet care wisdom, straight from the source', 'Expert tips, feeding guides and behind-the-scenes stories about how we bring ocean-fresh nutrition to every meal.', MEDIA.seafoodPlatter),
  // Start here
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    introBlock('Start Here', 'New to raw seafood?', 'These guides cover the essentials — how much to feed, how to switch over, and how to store and serve raw food safely.', 'center'),
    cardsRow([
      topicCard('fas fa-balance-scale', 'Feeding guide &amp; portion calculator', 'Work out how much to feed your dog or cat each day, with a simple calculator and portion table.', 'Open the feeding guide', `${SITE}/feeding-guide/`),
      topicCard('fas fa-exchange-alt', 'Switching to raw', 'A gentle 7–10 day plan to move your pet from their usual food to raw seafood.', 'See the switch-over plan', `${SITE}/feeding-guide/#transition`),
      topicCard('fas fa-snowflake', 'Storage &amp; delivery', 'Delivered frozen to preserve raw nutrition. Learn how to store, thaw and serve it safely.', 'Read delivery info', `${SITE}/delivery-info/`),
    ]),
  ]),
  // Latest articles
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', __globals__: { background_color: gColor('rpf_light') }, _element_id: 'articles' }), [
    introBlock('Latest Articles', 'From the Raw Pet Foods blog', 'Nutrition, sustainability and practical tips for health-conscious pet owners.', 'center'),
    con({ ...col(), width: pct(100) }, [postsGrid, postsCss]),
  ]),
  // FAQ teaser
  section(SEC({ ...row(), flex_align_items: 'center', flex_justify_content: 'space-between', flex_gap: gap(40), padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    con({ ...col(), flex_gap: gap(12), ...widthPx(640) }, [
      eyebrow('Got a Question?'),
      heading('Answers to the questions pet owners ask most'),
      text('<p>Is raw seafood safe? Can I refreeze it? Do you deliver interstate? Find quick answers in our FAQ.</p>'),
    ]),
    ctaBtn('Read the FAQ', `${SITE}/faq/`),
  ]),
  ctaBand('Start your pet’s raw journey', 'Ocean-fresh, snap-frozen seafood meals your dog or cat will love.', 'Order Now – Freshness Delivered Frozen', `${SITE}/contact/`),
];

// ---------- Why Raw page ----------
const compareTable = `<div class="rpf-compare">
<table>
  <thead><tr><th></th><th>Raw Pet Foods</th><th>Typical processed pet food</th></tr></thead>
  <tbody>
    <tr><td>Main ingredient</td><td>Real seafood cuts, like salmon belly fins</td><td>Often grains, starches and meat by-products</td></tr>
    <tr><td>Processing</td><td>Prepared raw and snap-frozen</td><td>Cooked at high heat and extruded or canned</td></tr>
    <tr><td>Fillers</td><td>None — just seafood</td><td>Commonly used to bulk out the recipe</td></tr>
    <tr><td>Natural nutrients</td><td>Locked in by freezing fast</td><td>Some lost in cooking, then added back as supplements</td></tr>
    <tr><td>Storage</td><td>Freezer, then thaw in the fridge</td><td>Pantry shelf</td></tr>
  </tbody>
</table>
</div>
<style>
.rpf-compare{overflow-x:auto}
.rpf-compare table{width:100%;min-width:560px;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #E1E4EA;border-radius:20px;overflow:hidden;font:600 16px/24px "Source Sans Pro",sans-serif;color:#534251;margin:0}
.rpf-compare th,.rpf-compare td{padding:16px 20px;text-align:left;vertical-align:top;border-bottom:1px solid #E1E4EA}
.rpf-compare th{background:#514150;color:#fff;font-weight:700}
.rpf-compare th:nth-child(2){background:#3E9AB8}
.rpf-compare td:first-child{color:#514150;font-weight:700;white-space:nowrap}
.rpf-compare td:nth-child(2){background:#F5FAFC;color:#2F7F99;font-weight:700}
.rpf-compare tr:last-child td{border-bottom:0}
@media (max-width:767px){.rpf-compare th,.rpf-compare td{padding:12px 14px;font-size:15px}}
</style>`;
const WHY_RAW_FAQS = [
  faqs[0],
  faq('Is raw seafood suitable for both dogs and cats?', `Yes. Seafood is a natural, highly palatable protein for both dogs and cats. Start with small portions and follow our <a href="${SITE}/feeding-guide/">feeding guide</a> for how much to serve.`),
  faq('Do I need to cook it?', 'No — it’s made to be served raw. Thaw a portion in the fridge and serve it fridge-cool. Never cook it or microwave it, as heat changes the texture and the natural nutrients we work to protect.'),
  faq('Can raw seafood be a whole diet, or a topper?', 'Both work. Many owners start by adding it as a topper to their pet’s usual food, then build up from there. If you’d like raw seafood to be the main diet, talk to your vet about keeping meals complete and balanced for your pet.'),
  faqs[3],
  faqs[4],
];
const whyRaw = [
  pageHero('Why Raw', 'Why raw seafood is nature’s perfect pet food', 'Real seafood, prepared raw and snap-frozen to lock in nutrition. Here’s why more Australian pet owners are making the switch.', MEDIA.dogHome),
  // What nature intended
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('What Nature Intended'),
      heading('Fresh, simple food the way pets are built to eat'),
      text('<p>Dogs and cats evolved eating fresh, unprocessed prey — not dry pellets cooked at high heat. Raw feeding brings their bowl closer to that natural diet, with real protein and nothing they don’t need.</p><p>We chose seafood because it’s one of nature’s richest sources of omega-3s, lean protein and minerals, and because pets simply love the taste. Every meal starts with real Australian seafood, prepared raw and snap-frozen so the goodness stays in.</p>'),
      bullets(['Real seafood cuts — no fillers or artificial additives', 'Prepared raw, never cooked or extruded', 'Snap-frozen to lock in freshness and flavour', 'Vet-approved and responsibly sourced']),
    ]),
    image(MEDIA.seafoodPlatter, { width: px(520), width_tablet: pct(100), height: px(500), height_tablet: px(400), height_mobile: px(280), 'object-fit': 'cover', image_border_radius: box(24), _flex_size: 'none', _flex_size_tablet: 'shrink', _element_width_tablet: 'inherit' }),
  ]),
  // Raw vs processed
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC', _element_id: 'compare' }), [
    introBlock('Raw vs Processed', 'What’s really in the bowl?', 'Many pet foods are built for a long shelf life. Ours is built around fresh nutrition. Here’s how they compare.', 'center'),
    con({ ...col(), width: px(1000), width_tablet: pct(100) }, [w('html', { html: compareTable })]),
  ]),
  // Why seafood
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'nutrition' }), [
    introBlock('Why Seafood', 'Ocean nutrition in every bite', 'Seafood packs a lot of goodness into a small, easy-to-digest meal.', 'center'),
    cardsRow([
      benefitCard('fas fa-fish', 'Natural omega-3s', 'Oily fish like salmon is naturally rich in omega-3 fatty acids, which support skin, coat, joints and brain health.'),
      benefitCard('fas fa-dumbbell', 'Lean, quality protein', 'Easy-to-digest protein helps maintain strong muscles and steady energy for active dogs and curious cats.'),
      benefitCard('fas fa-bone', 'Calcium &amp; vitamin D', 'Salmon belly fins provide calcium and vitamin D to help support healthy bones and teeth.'),
    ]),
    cardsRow([
      benefitCard('fas fa-heart', 'Irresistible taste', 'The fresh smell and taste of seafood wins over even fussy eaters — a big help for picky cats.'),
      benefitCard('fas fa-leaf', 'Nothing artificial', 'No fillers, grains or artificial preservatives. Just seafood, frozen fast to keep it fresh.'),
      benefitCard('fas fa-tint', 'Natural moisture', 'Raw food holds its natural moisture, which helps keep pets — especially cats — well hydrated.'),
    ]),
  ]),
  // Benefits owners notice
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFCF9', _element_id: 'benefits' }), [
    image(MEDIA.catTreat, { width: px(500), width_tablet: pct(100), height: px(520), height_tablet: px(400), height_mobile: px(280), 'object-fit': 'cover', image_border_radius: box(24), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('Health Benefits'),
      heading('The difference owners notice'),
      text('<p>Every pet is different, but these are the changes owners most often tell us about after switching to raw seafood.</p>'),
      con({ ...col(), flex_gap: gap(18), _margin: box(8, 0, 0, 0) }, [
        pillar('fas fa-star', 'Shinier coat, healthier skin', 'Omega-3s help nourish skin and give coats a natural shine.'),
        pillar('fas fa-smile', 'Happier tummies', 'Simple, single-protein meals without fillers are gentle on digestion.'),
        pillar('fas fa-bolt', 'Steady energy', 'Quality protein supports lean muscle and an active, playful pet.'),
        pillar('fas fa-tooth', 'Cleaner bowls, keener eaters', 'Pets love the taste, so mealtimes become something to look forward to.'),
      ]),
      text('<p><em>Results vary between pets. If your pet has a health condition, check with your vet before changing their diet.</em></p>', { color: 'rpf_grey' }),
    ]),
  ]),
  // Ocean to bowl
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC', _element_id: 'sustainability' }), [
    introBlock('From Ocean to Bowl', 'Fresh, responsible and made in NSW', 'We keep the journey short and simple, so the nutrition makes it all the way to your pet’s bowl.', 'center'),
    cardsRow([
      stepTile('01', 'Responsibly sourced', 'Seafood is harvested from Australian waters, with care for the oceans it comes from.'),
      stepTile('02', 'Prepared raw in NSW', 'Real seafood cuts like salmon belly fins are prepared hygienically — never cooked, never extruded.'),
      stepTile('03', 'Snap-frozen &amp; delivered', `Frozen fast to lock in freshness. ${STORAGE_LINE}`),
    ]),
    ctaBtn('How to Feed Raw – Feeding Guide', `${SITE}/feeding-guide/`, { align: 'center', background_color: '#514150', button_background_hover_color: '#3C3C3C' }),
  ]),
  // FAQ
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', __globals__: { background_color: gColor('rpf_light') } }), [
    introBlock('Raw Feeding FAQ', 'Questions about raw feeding', `More questions? See our <a href="${SITE}/faq/">full FAQ</a> or email <a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a>.`, 'center'),
    makeAccordion(WHY_RAW_FAQS),
  ]),
  ctaBand('Start your pet’s raw journey', 'Ocean-fresh, snap-frozen seafood meals your dog or cat will love — delivered frozen to your door.', 'Order Now – Freshness Delivered Frozen', `${SITE}/contact/`),
];

// ---------- Our Range page ----------
const ORDER_URL = `${SITE}/contact/`;
const RANGE_FAQS = [
  faq('What’s in a Salmon Belly Fin pack?', 'Premium salmon belly fins, prepared raw and snap-frozen — no fillers, grains or artificial additives. The pack size and contents are printed on every label.'),
  faq('Is it suitable for dogs and cats?', `Yes. Salmon belly fins suit both dogs and cats as a meal, a topper or a tasty reward. See our <a href="${SITE}/feeding-guide/">feeding guide</a> for how much to serve.`),
  faq('How long will a pack last?', `It depends on your pet’s size and how you serve it. Use the <a href="${SITE}/feeding-guide/#portions">portion calculator</a> to work out a daily amount, then check it against the pack size on the label.`),
  faqs[1],
  faqs[2],
  faqs[5],
];
const ourRange = [
  pageHero('Our Range', 'Ocean-fresh raw seafood meals for pets', 'Real seafood cuts, prepared raw and snap-frozen in NSW. Simple, honest nutrition your dog or cat will love.', MEDIA.beachCatch),
  // Featured product
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'salmon-belly-fin' }), [
    con({ ...col(), flex_align_items: 'center', flex_justify_content: 'center', padding: box(40), padding_mobile: box(24), border_radius: box(30), background_background: 'classic', background_color: '#F5FAFC', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', ...widthPx(520) }, [
      image(MEDIA.pack, { width: pct(100), _element_width: 'inherit' }),
    ]),
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('Featured · Dogs &amp; Cats'),
      heading('Salmon Belly Fin', { tag: 'h2' }),
      text('<p>Our signature cut. Salmon belly fins are naturally rich in protein, healthy fats and minerals — a single, wholesome seafood ingredient that pets go wild for.</p>'),
      bullets(['100% premium salmon belly fins — nothing added', 'Naturally rich in protein, omega-3s, calcium and vitamin D', 'Prepared raw and snap-frozen to lock in freshness', 'Vet-approved and responsibly sourced from Australian waters']),
      w('icon-list', {
        view: 'inline', icon_list: [{ _id: uid(), text: STORAGE_LINE, selected_icon: icon('fas fa-snowflake') }],
        icon_color: '#3E9AB8', icon_size: px(18), text_indent: px(10),
        __globals__: { text_color: gColor('primary'), icon_typography_typography: gType('text') }, css_classes: 'rpf-storage-pill',
      }),
      con({ ...row({ flex_direction_mobile: 'column' }), flex_gap: gap(16), flex_align_items: 'center', flex_align_items_mobile: 'stretch', _margin: box(8, 0, 0, 0) }, [
        ctaBtn('Order Now', ORDER_URL),
        ctaBtn('How Much to Feed', `${SITE}/feeding-guide/`, { selected_icon: icon('fas fa-arrow-right'), icon_align: 'row-reverse', icon_indent: px(8), background_color: '#514150', button_background_hover_color: '#3C3C3C' }),
      ]),
    ]),
  ]),
  // What's inside
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC', _element_id: 'nutrition' }), [
    introBlock('What’s Inside', 'Real seafood, real nutrition', 'No fillers, no grains, no artificial preservatives. Just ocean-fresh seafood and the goodness that comes with it.', 'center'),
    cardsRow([
      benefitCard('fas fa-dumbbell', 'Quality protein', 'Easy-to-digest seafood protein supports strong muscles and steady energy.'),
      benefitCard('fas fa-fish', 'Natural omega-3s', 'Healthy fats from salmon help support skin, coat, joints and brain health.'),
      benefitCard('fas fa-bone', 'Calcium &amp; vitamin D', 'Naturally present in salmon belly fins to help support healthy bones and teeth.'),
    ]),
    text(`<p>Want to know more about the benefits? <a href="${SITE}/why-raw/">Read why raw seafood works →</a></p>`, { align: 'center' }),
  ]),
  // Ways to serve
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'serving' }), [
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('Ways to Serve'),
      heading('One cut, plenty of ways to feed it'),
      text('<p>Whether you’re going fully raw or just adding a little ocean goodness to your pet’s bowl, salmon belly fins fit right in.</p>'),
      con({ ...col(), flex_gap: gap(18), _margin: box(8, 0, 0, 0) }, [
        pillar('fas fa-utensils', 'As a main meal', 'Serve as part of a raw diet, using our feeding guide to get the portions right.'),
        pillar('fas fa-plus-circle', 'As a meal topper', 'Add a portion on top of your pet’s usual food for extra flavour and nutrition.'),
        pillar('fas fa-heart', 'As a tasty reward', 'Offer a small piece as a healthy, high-value treat.'),
        pillar('fas fa-temperature-low', 'Always fridge-thawed', 'Thaw in the fridge overnight and serve cool. Never cook or microwave.'),
      ]),
    ]),
    image(MEDIA.catTreat, { width: px(500), width_tablet: pct(100), height: px(520), height_tablet: px(400), height_mobile: px(280), 'object-fit': 'cover', image_border_radius: box(24), _flex_size: 'none', _flex_size_tablet: 'shrink', _element_width_tablet: 'inherit' }),
  ]),
  // How to order
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#514150', _element_id: 'order' }), [
    con({ ...col(), flex_gap: gap(16), flex_align_items: 'center', width: px(800), width_tablet: pct(100) }, [
      w('heading', { title: 'How to Order', header_size: 'p', align: 'center', title_color: '#BFE6F2', typography_typography: 'custom', typography_font_family: 'Source Sans Pro', typography_font_weight: '700', typography_font_size: px(14), typography_line_height: px(20), typography_letter_spacing: px(1.6), typography_text_transform: 'uppercase' }),
      heading('From our freezer to yours', { color: 'rpf_white', align: 'center' }),
    ]),
    con({ ...row({ flex_direction_tablet: 'row' }), flex_wrap: 'nowrap', flex_wrap_tablet: 'wrap', flex_gap: gap(24), flex_align_items: 'stretch', width: pct(100) }, [
      stepCard('01', 'Send your order', `Email <a href="mailto:${EMAIL_ORDERS}?subject=Order%20enquiry%20-%20Salmon%20Belly%20Fin" style="color:#BFE6F2">${EMAIL_ORDERS}</a> with what you’d like and your postcode.`),
      stepCard('02', 'We confirm delivery', 'We’ll confirm availability, delivery to your area and the details of your order.'),
      stepCard('03', 'Delivered frozen', 'Your seafood arrives frozen to preserve raw nutrition. Pop it straight in the freezer.'),
      stepCard('04', 'Thaw &amp; serve', 'Move a portion to the fridge the night before, then serve fridge-cool.'),
    ]),
    ctaBtn('Order Now', ORDER_URL, { align: 'center' }),
  ]),
  // FAQ
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', __globals__: { background_color: gColor('rpf_light') } }), [
    introBlock('Product FAQ', 'Questions about our range', `Can’t see your answer? See our <a href="${SITE}/faq/">full FAQ</a> or email <a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a>.`, 'center'),
    makeAccordion(RANGE_FAQS),
  ]),
  ctaBand('Ready to start your pet’s raw journey?', 'Ocean-fresh, snap-frozen salmon belly fins — delivered frozen to your door.', 'Order Now – Freshness Delivered Frozen', ORDER_URL),
];

// ---------- Contact page ----------
// The form is Contact Form 7 (form template kept in elementor/cf7-contact-form.txt). Its select uses CF7 "pipes",
// so order/delivery enquiries are emailed to orders@ and everything else to info@.
const CF7_CONTACT_ID = '183';
const contactFormCss = w('html', { css_classes: 'rpf-style-only', html: `<style>
.rpf-cf7 .wpcf7-form{display:flex;flex-direction:column;gap:20px;margin:0}
.rpf-cf7 .wpcf7-form p{margin:0}
.rpf-cf7 .wpcf7-form br{display:none}
.rpf-cf7-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rpf-cf7-grid > p{display:contents}
.rpf-cf7-full{grid-column:1/-1}
.rpf-cf7 label{display:flex;flex-direction:column;gap:6px;font:700 14px/20px "Source Sans Pro",sans-serif;color:#514150}
.rpf-cf7 .wpcf7-form-control-wrap{display:block}
.rpf-cf7 input:not([type=submit]),.rpf-cf7 select,.rpf-cf7 textarea{font:600 16px/24px "Source Sans Pro",sans-serif;color:#514150;padding:12px 16px;border:1px solid #E1E4EA;border-radius:12px;background:#fff;box-shadow:none;width:100%;box-sizing:border-box}
.rpf-cf7 textarea{min-height:140px;resize:vertical}
.rpf-cf7 input:focus,.rpf-cf7 select:focus,.rpf-cf7 textarea:focus{outline:2px solid #62B6CF;outline-offset:1px;border-color:#62B6CF}
.rpf-cf7 .wpcf7-not-valid{border-color:#B4544E}
.rpf-cf7 .wpcf7-not-valid-tip{font:600 13px/18px "Source Sans Pro",sans-serif;color:#B4544E;margin-top:4px}
.rpf-cf7 .wpcf7-submit{font:700 16px/24px "Source Sans Pro",sans-serif;color:#fff;background:#B4544E;border:0;border-radius:999px;padding:14px 40px;cursor:pointer;transition:background .2s}
.rpf-cf7 .wpcf7-submit:hover,.rpf-cf7 .wpcf7-submit:focus{background:#514150}
.rpf-cf7 .wpcf7-spinner{margin:0 12px}
.rpf-cf7 .rpf-cf7-note{font:600 14px/20px "Source Sans Pro",sans-serif;color:#9E9E9E}
.rpf-cf7 .wpcf7-response-output{margin:0!important;padding:12px 16px!important;border-radius:12px;font:600 15px/22px "Source Sans Pro",sans-serif;color:#514150}
.rpf-cf7 .wpcf7 form.sent .wpcf7-response-output{border-color:#7EC88E!important;background:#EEF8F0}
.e-con > .rpf-style-only{display:none!important}
@media (max-width:600px){.rpf-cf7-grid{grid-template-columns:1fr}.rpf-cf7 .wpcf7-submit{width:100%}}
</style>` });
const contactCard = (ic, title, body) => con({ ...row({ flex_direction_mobile: 'row' }), flex_gap: gap(16), flex_align_items: 'flex-start', padding: box(20, 24), border_radius: box(16), background_background: 'classic', background_color: '#FFFFFF', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA' }, [
  w('icon', { selected_icon: icon(ic), view: 'stacked', shape: 'circle', primary_color: '#EAF6FA', secondary_color: '#3E9AB8', size: px(20), icon_padding: px(12), _flex_size: 'none' }),
  con({ ...col(), flex_gap: gap(4), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
    heading(title, { tag: 'h3', type: 'secondary' }),
    text(`<p>${body}</p>`),
  ]),
]);
const contactPage = [
  pageHero('Contact Us', 'We’d love to hear from you', 'Questions about raw feeding, your order or stocking our range? Send us a message and our team will get back to you.', MEDIA.about),
  // Form + details
  section(SEC({ ...row(), flex_align_items: 'flex-start', flex_gap: gap(48), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'contact-form' }), [
    con({ ...col(), flex_gap: gap(20), ...widthPx(420), _flex_size: 'none', _flex_size_tablet: 'shrink' }, [
      eyebrow('Get in Touch'),
      heading('How can we help?'),
      text('<p>Fill in the form and we’ll point your message to the right person. Prefer email? Reach us directly below.</p>'),
      con({ ...col(), flex_gap: gap(14), _margin: box(8, 0, 0, 0) }, [
        contactCard('fas fa-shopping-basket', 'Orders &amp; product enquiries', `<a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a>`),
        contactCard('fas fa-envelope', 'General &amp; partnership enquiries', `<a href="mailto:${EMAIL_INFO}">${EMAIL_INFO}</a>`),
        contactCard('fas fa-store', 'Wholesale &amp; stockists', `Retailers and groomers, see our <a href="${SITE}/wholesale/">wholesale page</a>.`),
      ]),
    ]),
    con({ ...col(), flex_gap: gap(20), padding: box(40), padding_mobile: box(24), border_radius: box(24), background_background: 'classic', background_color: '#F5FAFC', border_border: 'solid', border_width: box(1), border_color: '#E1E4EA', _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1, width_tablet: pct(100) }, [
      heading('Send us a message', { tag: 'h2', type: 'secondary' }),
      w('shortcode', { shortcode: `[contact-form-7 id="${CF7_CONTACT_ID}" html_class="rpf-cf7-form"]`, css_classes: 'rpf-cf7' }),
      contactFormCss,
    ]),
  ]),
  // Quick help
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC' }), [
    introBlock('Quick Help', 'Looking for a fast answer?', 'Many questions are already answered in our guides.', 'center'),
    cardsRow([
      topicCard('fas fa-question-circle', 'Frequently asked questions', 'Safety, storage, refreezing, switching to raw and more.', 'Read the FAQ', `${SITE}/faq/`),
      topicCard('fas fa-truck', 'Delivery &amp; storage', 'Where we deliver and how to keep your order fresh from freezer to bowl.', 'Delivery info', `${SITE}/delivery-info/`),
      topicCard('fas fa-balance-scale', 'Feeding guide', 'Portion sizes, a switch-over plan and a handy portion calculator.', 'Open the feeding guide', `${SITE}/feeding-guide/`),
    ]),
  ]),
  ctaBand('Start your pet’s raw journey', 'Ocean-fresh, snap-frozen seafood meals your dog or cat will love — delivered frozen to your door.', 'Explore Our Range', `${SITE}/our-range/`),
];

// ---------- Sustainability page ----------
// Claims kept general (no certifications or packaging specifics) until the client confirms details.
const sustainabilityPage = [
  pageHero('Sustainability', 'Good for pets, better for the planet', 'Feeding your pet well and caring for our oceans go hand in hand. Here’s how we do our part, from the way we source to the way we deliver.', MEDIA.coastline),
  // Our approach
  section(SEC({ ...row(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'approach' }), [
    image(MEDIA.fisherNet, { width: px(520), width_tablet: pct(100), height: px(480), height_tablet: px(400), height_mobile: px(280), 'object-fit': 'cover', image_border_radius: box(24), _flex_size: 'none', _flex_size_tablet: 'shrink', _element_width_tablet: 'inherit' }),
    con({ ...col(), flex_gap: gap(20), _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1 }, [
      eyebrow('Our Approach'),
      heading('Respect for the ocean, from the very first catch'),
      text('<p>Our food starts with the sea, so looking after it matters to us. We choose seafood from Australian waters, prepare it simply and freeze it fast, so nothing is wasted along the way.</p><p>It’s a short, honest journey from ocean to bowl, and one we’re always looking to improve.</p>'),
      bullets(['Responsibly sourced Australian seafood', 'Prepared and snap-frozen locally in NSW', 'Real seafood cuts, no fillers or additives', 'Portion-friendly packs that help reduce waste']),
    ]),
  ]),
  // Commitments
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#F5FAFC', _element_id: 'commitments' }), [
    introBlock('Our Commitments', 'Small choices that add up', 'Sustainability isn’t one big gesture. It’s lots of careful decisions, made every day.', 'center'),
    cardsRow([
      benefitCard('fas fa-fish', 'Responsibly sourced', 'Seafood from Australian waters, chosen with care for the health of the oceans it comes from.'),
      benefitCard('fas fa-recycle', 'Making the most of every fish', 'Salmon belly fins are a nutritious cut. Feeding them to pets means more of each fish is put to good use.'),
      benefitCard('fas fa-map-marker-alt', 'Made locally in NSW', 'Preparing and freezing our food close to home keeps the journey from ocean to bowl short.'),
    ]),
    cardsRow([
      benefitCard('fas fa-snowflake', 'Less waste at home', 'Snap-frozen portions keep for longer, so you only thaw what your pet needs.'),
      benefitCard('fas fa-leaf', 'Simple ingredients', 'Real seafood with no fillers means nothing in the bowl that doesn’t need to be there.'),
      benefitCard('fas fa-handshake', 'Supporting Australian producers', 'Buying local helps support Australian fishing and food businesses.'),
    ]),
  ]),
  // Your part
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(48), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'your-part' }), [
    introBlock('Your Part', 'Simple ways to feed sustainably', 'A few easy habits help your pet’s food go further, with less waste.', 'center'),
    cardsRow([
      stepTile('01', 'Feed the right amount', `Use our <a href="${SITE}/feeding-guide/">feeding guide</a> to portion meals, so nothing is over-served or thrown away.`),
      stepTile('02', 'Thaw only what you need', 'Keep packs frozen and move one portion to the fridge the night before. Never refreeze.'),
      stepTile('03', 'Dispose of packaging thoughtfully', 'Check your local council’s recycling guidelines for the packaging your order arrives in.'),
    ]),
  ]),
  // Always improving
  section(SEC({ ...row(), flex_align_items: 'center', flex_justify_content: 'space-between', flex_gap: gap(40), padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFCF9' }), [
    con({ ...col(), flex_gap: gap(12), ...widthPx(640) }, [
      eyebrow('Always Improving'),
      heading('We’re not finished yet'),
      text('<p>We’re always looking for ways to reduce our footprint, from packaging to delivery. Have an idea? We’d love to hear it.</p>'),
    ]),
    con({ ...row({ flex_direction_mobile: 'column' }), flex_gap: gap(16), flex_align_items: 'center', flex_align_items_mobile: 'stretch' }, [
      ctaBtn('Share Your Idea', `${SITE}/contact/`),
      ctaBtn('Read Our Blog Post', BLOG.sustainable, { selected_icon: icon('fas fa-arrow-right'), icon_align: 'row-reverse', icon_indent: px(8), background_color: '#514150', button_background_hover_color: '#3C3C3C' }),
    ]),
  ]),
  ctaBand('Feed well, tread lightly', 'Ocean-fresh, snap-frozen seafood meals your dog or cat will love, made with care for the planet.', 'Explore Our Range', `${SITE}/our-range/`),
];

fs.mkdirSync(new URL('./dist/', import.meta.url), { recursive: true });
const out = (name, data) => {
  const json = JSON.stringify(data);
  fs.writeFileSync(new URL(`./dist/${name}.json`, import.meta.url), json);
  console.log(name, json.length, 'bytes');
};
out('home', home);
out('header', header);
out('footer', footer);
out('kit', kit);
out('about', about);
out('wholesale', wholesale);
out('faq', faqPage);
out('delivery', delivery);
out('feeding-guide', feedingGuide);
out('blog', blog);
out('why-raw', whyRaw);
out('our-range', ourRange);
out('contact', contactPage);
out('sustainability', sustainabilityPage);
