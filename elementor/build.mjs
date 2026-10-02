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
@media (max-width:1024px){
  body .rpf-header > .elementor-widget-image{flex:0 0 auto!important;order:1!important;margin-right:auto!important;width:auto!important;min-width:0!important}
  body .rpf-header > .rpf-header-cta{flex:0 0 auto!important;order:2!important}
  body .rpf-header > .rpf-nav{flex:0 0 auto!important;order:3!important;width:auto!important;max-width:60px!important}
}
@media (max-width:767px){
  .rpf-header{gap:12px!important}
  .rpf-header > .rpf-header-cta .elementor-button{font-size:15px}
}
</style>`;
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
    smallButton('Contact Us', '#contact', { _flex_size: 'none', text_padding_mobile: box(10, 18), css_classes: 'rpf-header-cta' }),
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
          { _id: uid(), social_icon: icon('fab fa-x-twitter', 'fa-brands'), link: link('https://x.com/', true), item_icon_color: 'custom', item_icon_primary_color: '#1DA1F2', item_icon_secondary_color: '#FFFFFF' },
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
const heroForm = `<form class="rpf-pill-form rpf-pill-form--dark rpf-animal-form" action="#products">
  <input type="hidden" name="animal" value="">
  <div class="rpf-select">
    <div class="rpf-select__btn" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"><span class="rpf-select__label">Choose your animal</span></div>
    <ul class="rpf-select__list" role="listbox" aria-label="Choose your animal" hidden>
      <li role="option" tabindex="-1" aria-selected="false" data-value="dog">Dog</li>
      <li role="option" tabindex="-1" aria-selected="false" data-value="cat">Cat</li>
    </ul>
  </div>
  <a class="rpf-pill-btn" href="#products">Shop Now</a>
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
const makeAccordion = () => {
  const acc = w('nested-accordion', {
    items: faqs.map((f) => ({ _id: uid(), item_title: f.q })),
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
  acc.elements = faqs.map((f) => con({ content_width: 'full', ...col() }, [text(`<p>${f.a}</p>`, { color: 'text' })]));
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
        ctaBtn('Order Now', '#products', { _margin: box(8, 0, 0, 0), css_classes: 'rpf-hero-cta' }),
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
      ctaBtn('Start Your Pet’s Raw Journey', '#products', { _margin: box(16, 0, 0, 0) }),
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
        space_between: px(8), icon_size: px(20), text_indent: px(12), icon_color: '#7EC78E',
        __globals__: { text_color: gColor('text'), icon_typography_typography: gType('rpf_lead') },
      }),
      ctaBtn('Order Now – Freshness Delivered Frozen', '#products', { _margin: box(16, 0, 0, 0) }),
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
      ctaBtn('Order Now – Freshness Delivered Frozen', '#products', { align: 'center' }),
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
      ctaBtn('Order Now', '#products', { align: 'center' }),
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
      ctaBtn('Get Your Custom Feeding Plan', `mailto:${EMAIL_ORDERS}?subject=Custom%20feeding%20plan`, { _margin: box(8, 0, 0, 0) }),
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
      ctaBtn('Explore Our Range', `${SITE}/#products`, { _margin: box(16, 0, 0, 0) }),
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
  ctaBand('Start your pet’s raw journey', 'Ocean-fresh, snap-frozen seafood meals your dog or cat will love.', 'Order Now – Freshness Delivered Frozen', `${SITE}/#products`),
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
const wholesale = [
  pageHero('Wholesale', 'Stock Australia’s first ocean-fresh raw seafood meals', 'Join our network of select pet retailers and groomers offering premium raw seafood meals to health-conscious pet owners.', MEDIA.partner, 'center 30%'),
  section(SEC({ ...row(), flex_align_items: 'flex-start', flex_gap: gap(64), flex_gap_tablet: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    con({ ...col(), flex_gap: gap(20), ...widthPx(480) }, [
      eyebrow('Why partner with us'),
      heading('A premium range your customers will come back for'),
      text('<p>Health-conscious pet owners are looking for fresh, natural food they can trust. Raw Pet Foods gives you a premium frozen line that stands out on the shelf — with the support to sell it.</p>'),
      bullets(['Exclusive distributor pricing', 'Premium frozen product line', 'Free marketing support &amp; POS materials']),
      text(`<p>Prefer to talk first? Email <a href="mailto:${EMAIL_INFO}">${EMAIL_INFO}</a>.</p>`, { color: 'rpf_grey' }),
    ]),
    con({ ...col(), flex_gap: gap(20), padding: box(40), padding_mobile: box(24), border_radius: box(24), background_background: 'classic', background_color: '#F5FAFC', _flex_size: 'custom', _flex_grow: 1, _flex_shrink: 1, width_tablet: pct(100), _element_id: 'enquiry' }, [
      heading('Wholesale enquiry', { tag: 'h2', type: 'secondary' }),
      w('html', { html: wholesaleForm }),
    ]),
  ]),
  trustBadges('#FFFFFF'),
];

const faqPage = [
  pageHero('FAQ', 'Frequently asked questions', 'Everything you need to know about feeding raw seafood, delivery and storage. Can’t find your answer? We’re happy to help.', MEDIA.salmonIce),
  section(SEC({ ...col(), flex_align_items: 'center', flex_gap: gap(40), padding: box(96, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    makeAccordion(),
    text(`<p>Still have a question? Email <a href="mailto:${EMAIL_ORDERS}">${EMAIL_ORDERS}</a> for orders and products, or <a href="mailto:${EMAIL_INFO}">${EMAIL_INFO}</a> for everything else.</p>`, { align: 'center' }),
  ]),
  ctaBand('Ready to make the switch?', 'Start your pet’s raw journey with ocean-fresh, snap-frozen seafood.', 'Order Now – Freshness Delivered Frozen', `${SITE}/#products`),
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
