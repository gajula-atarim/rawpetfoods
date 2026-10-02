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
  productBg: { id: 13, url: `${SITE}/wp-content/uploads/2026/10/product-section-background.jpg` },
  pack: { id: 14, url: `${SITE}/wp-content/uploads/2026/10/salmon-belly-fin-pack.webp` },
  about: { id: 15, url: `${SITE}/wp-content/uploads/2026/10/woman-hugging-cat.jpg` },
  reviewsBg: { id: 16, url: `${SITE}/wp-content/uploads/2026/10/testimonials-paws-background.webp` },
  partner: { id: 17, url: `${SITE}/wp-content/uploads/2026/10/man-with-jack-russell.jpg` },
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

const con = (settings, elements = [], isInner = true) => ({ id: uid(), elType: 'container', isInner, settings, elements });
const section = (settings, elements) => con(settings, elements, false);
const w = (widgetType, settings) => ({ id: uid(), elType: 'widget', widgetType, isInner: false, settings, elements: [] });

const row = (extra = {}) => ({ flex_direction: 'row', flex_direction_mobile: 'column', ...extra });
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
  viewport_md: 768,
  viewport_lg: 1025,
};

// ---------- Header (UAE) ----------
const header = [
  section({
    content_width: 'full', ...row({ flex_direction_mobile: 'row' }), flex_justify_content: 'center', flex_align_items: 'center',
    padding: box(16), padding_mobile: box(10, 16),
    background_background: 'classic', __globals__: { background_color: gColor('accent') },
  }, [
    heading('Get a discount code with your first order — limited time only! 🐾', {
      tag: 'p', color: 'rpf_white', type: 'rpf_banner', align: 'center',
      extra: { typography_text_decoration: 'underline' },
    }),
  ]),
  section({
    content_width: 'full', ...row({ flex_direction_mobile: 'row' }), flex_justify_content: 'space-between', flex_align_items: 'center',
    flex_gap: gap(54), padding: box(16, 42), padding_tablet: box(12, 24), padding_mobile: box(10, 16),
    background_background: 'classic', background_color: '#FFFFFF', css_classes: 'rpf-header',
  }, [
    image(MEDIA.logo, { link_to: 'custom', link: link(`${SITE}/`), width: px(103), width_mobile: px(80), _flex_size: 'none' }),
    w('navigation-menu', {
      menu: 'main-menu', layout: 'horizontal', navmenu_align: 'center', submenu_icon: 'arrow', submenu_animation: 'none',
      dropdown: 'tablet', resp_align: 'center', full_width_dropdown: 'yes',
      pointer: 'none', padding_horizontal_menu_item: px(16), padding_vertical_menu_item: px(8), menu_space_between: px(0),
      color_menu_item: '#3C3C3C', color_menu_item_hover: '#B4544E', color_menu_item_active: '#B4544E',
      menu_typography_typography: 'custom', menu_typography_font_family: 'Source Sans Pro', menu_typography_font_weight: '600',
      menu_typography_font_size: px(16), menu_typography_line_height: px(24),
      color_dropdown_item: '#3C3C3C', background_color_dropdown_item: '#FFFFFF',
      color_dropdown_item_hover: '#FFFFFF', background_color_dropdown_item_hover: '#B4544E',
      dropdown_typography_typography: 'custom', dropdown_typography_font_family: 'Source Sans Pro', dropdown_typography_font_weight: '600',
      dropdown_typography_font_size: px(16),
      toggle_color: '#514150', toggle_size: px(24),
      _flex_size: 'grow', _flex_size_tablet: 'none', _flex_size_mobile: 'none', _element_width_tablet: 'auto',
      css_classes: 'rpf-nav',
    }),
    smallButton('Contact Us', '#contact', { _flex_size: 'none', hide_mobile: 'hidden-mobile', css_classes: 'rpf-header-cta' }),
  ]),
];

// ---------- Footer (UAE) ----------
const footerColTitle = (t) => heading(t, { tag: 'h4', color: 'rpf_dark', type: 'secondary' });
const footerMenu = (slug) => w('navigation-menu', {
  menu: slug, layout: 'vertical', navmenu_align: 'left', submenu_icon: 'arrow', dropdown: 'none',
  pointer: 'none', padding_horizontal_menu_item: px(0), padding_vertical_menu_item: px(0), menu_space_between: px(16),
  color_menu_item: '#534251', color_menu_item_hover: '#B4544E', color_menu_item_active: '#534251',
  menu_typography_typography: 'custom', menu_typography_font_family: 'Source Sans Pro', menu_typography_font_weight: '600',
  menu_typography_font_size: px(16), menu_typography_line_height: px(24),
  css_classes: 'rpf-footer-menu',
});
const newsletterForm = `<form class="rpf-pill-form" onsubmit="return false;">
  <label class="screen-reader-text" for="rpf-newsletter-email">Email address</label>
  <input id="rpf-newsletter-email" type="email" name="email" placeholder="Email Adress..." required>
  <button type="submit" class="rpf-pill-btn">Join now</button>
</form>`;
const footer = [
  section({
    content_width: 'boxed', ...col(), flex_gap: gap(64), padding: box(48, 112), padding_tablet: box(48, 32), padding_mobile: box(40, 16),
    background_background: 'classic', background_color: '#FFFFFF', _element_id: 'contact',
  }, [
    con({ ...col(), flex_align_items: 'center', flex_gap: gap(24) }, [
      image(MEDIA.logoLarge, { link_to: 'custom', link: link(`${SITE}/`), width: px(232), width_mobile: px(180) }),
      text('<p>Raw Petfoods — Real seafood nutrition, made with care for pets and the planet.</p>', { color: 'rpf_grey', align: 'center' }),
      w('social-icons', {
        social_icon_list: [
          { _id: uid(), social_icon: icon('fab fa-facebook', 'fa-brands'), link: link('https://www.facebook.com/', true) },
          { _id: uid(), social_icon: icon('fab fa-instagram', 'fa-brands'), link: link('https://www.instagram.com/', true) },
          { _id: uid(), social_icon: icon('fab fa-x-twitter', 'fa-brands'), link: link('https://x.com/', true) },
        ],
        shape: 'circle', align: 'center', icon_color: 'custom', icon_primary_color: '#B4544E', icon_secondary_color: '#FFFFFF',
        icon_size: px(22), icon_padding: { unit: 'px', size: 13 }, icon_spacing: px(20), hover_primary_color: '#514150', hover_secondary_color: '#FFFFFF',
      }),
    ]),
    con({ ...row({ flex_wrap_mobile: 'wrap' }), flex_justify_content: 'space-between', flex_gap: gap(24) }, [
      con({ ...col(), flex_gap: gap(16), ...widthPx(400) }, [footerColTitle('Home'), footerMenu('footer-home')]),
      con({ ...col(), flex_gap: gap(16), ...widthPx(400) }, [footerColTitle('Legal'), footerMenu('footer-legal')]),
      con({ ...col(), flex_gap: gap(16), ...widthPx(373) }, [
        footerColTitle('Newsletter'),
        text('<p>Get tasty updates and exclusive deals — no spam, just wagging tails.</p>', { color: 'rpf_grey' }),
        w('html', { html: newsletterForm }),
      ]),
    ]),
    text('<p>© 2025 Raw Petfoods | All rights reserved.</p>', { color: 'text', align: 'center', extra: { _css_classes: 'rpf-copyright', css_classes: 'rpf-copyright' } }),
  ]),
];

// ---------- Home page ----------
const heroForm = `<form class="rpf-pill-form rpf-pill-form--dark" action="#products">
  <label class="screen-reader-text" for="rpf-animal">Choose your animal</label>
  <select id="rpf-animal" name="animal">
    <option value="">Choose your animal</option>
    <option value="dog">Dog</option>
    <option value="cat">Cat</option>
  </select>
  <a class="rpf-pill-btn" href="#products">Shop Now</a>
</form>`;

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
  con({ ...col(), flex_gap: gap(8), _flex_size: 'grow' }, [
    heading(title, { tag: 'h3', type: 'secondary' }),
    text(`<p>${body}</p>`, { color: 'primary' }),
  ]),
]);

const blogCard = (m, date, title, excerpt, url) => con({
  ...col(), flex_gap: gap(16), padding: box(16), background_background: 'classic', background_color: '#FFFFFF',
  border_border: 'solid', border_width: box(1), border_color: 'rgba(83,66,81,0.24)',
  width: pct(33.33), width_tablet: pct(100), width_mobile: pct(100), _flex_size: 'grow',
}, [
  image(m, { link_to: 'custom', link: link(url), height: px(308), height_mobile: px(240), 'object-fit': 'cover', width: pct(100) }),
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

const faq = (q, a) => ({ q, a });
const faqs = [
  faq('What makes Raw Petfoods different?', 'We use real seafood cuts — like premium salmon belly fins — instead of overly processed fillers, so your pet gets natural protein, Omega-3 and minerals the way nature intended.'),
  faq('How fresh is your seafood?', 'Our seafood is responsibly sourced and sealed for freshness to lock in every drop of natural flavour and benefit.'),
  faq('Can I order in bulk or subscribe?', 'Yes — get in touch with our team and we’ll help you set up bulk or regular orders that suit your pet.'),
  faq('How do I store the food?', 'Keep your Raw Petfoods frozen until you need it, then thaw in the fridge and serve. Check the pack for full storage guidance.'),
  faq('Do you ship to my area?', 'We deliver to pets across Australia. Contact us with your postcode and we’ll confirm delivery options for your area.'),
];
const accordion = w('nested-accordion', {
  items: faqs.map((f) => ({ _id: uid(), item_title: f.q })),
  title_tag: 'h3', faq_schema: 'yes', default_state: 'all_collapsed', max_items_expended: 'one',
  accordion_item_title_icon: icon('fas fa-plus-circle'), accordion_item_title_icon_active: icon('fas fa-minus-circle'),
  accordion_item_title_icon_position: 'end', accordion_item_title_position_horizontal: 'stretch',
  accordion_item_title_space_between: px(16), accordion_item_title_distance_from_content: px(0),
  accordion_padding: box(32), accordion_padding_mobile: box(20),
  accordion_border_radius: box(2),
  accordion_background_normal_background: 'classic', accordion_background_normal_color: '#FFFFFF',
  accordion_background_hover_background: 'classic', accordion_background_hover_color: '#FFFFFF',
  accordion_background_active_background: 'classic', accordion_background_active_color: '#FFFFFF',
  accordion_border_normal_border: 'solid', accordion_border_normal_width: box(1), accordion_border_normal_color: 'rgba(83,66,81,0.24)',
  accordion_border_hover_border: 'solid', accordion_border_hover_width: box(1), accordion_border_hover_color: 'rgba(83,66,81,0.4)',
  accordion_border_active_border: 'solid', accordion_border_active_width: box(1), accordion_border_active_color: 'rgba(83,66,81,0.4)',
  title_typography_typography: 'custom', title_typography_font_family: 'Source Sans Pro', title_typography_font_weight: '600',
  title_typography_font_size: px(24), title_typography_font_size_mobile: px(19), title_typography_line_height: px(32), title_typography_letter_spacing: px(-0.24),
  normal_title_color: '#514150', hover_title_color: '#B4544E', active_title_color: '#514150',
  normal_icon_color: '#7EC78E', hover_icon_color: '#7EC78E', active_icon_color: '#7EC78E', icon_size: px(24),
  content_padding: box(0, 32, 32, 32), content_padding_mobile: box(0, 20, 20, 20),
  width: px(800), width_tablet: pct(100), _element_width: 'initial', _element_custom_width: px(800), _element_custom_width_tablet: pct(100),
});
accordion.elements = faqs.map((f) => con({ content_width: 'full', ...col() }, [text(`<p>${f.a}</p>`, { color: 'text' })]));

const SEC = (extra) => ({ content_width: 'boxed', ...extra });

const home = [
  // 1. Hero
  section({ content_width: 'full', padding: box(0, 10, 10, 10), padding_mobile: box(0, 8, 8, 8), background_background: 'classic', background_color: '#FFFFFF', _element_id: 'home' }, [
    con({
      content_width: 'full', ...row(), flex_justify_content: 'space-between', flex_align_items: 'flex-end', flex_gap: gap(32),
      min_height: px(700), min_height_mobile: px(560), padding: box(80), padding_tablet: box(56, 40), padding_mobile: box(32, 20),
      border_radius: box(30), border_radius_mobile: box(20),
      background_background: 'classic', background_image: img(MEDIA.hero), background_position: 'center center', background_size: 'cover', background_repeat: 'no-repeat',
      background_overlay_background: 'classic', background_overlay_color: '#000000', background_overlay_opacity: { unit: 'px', size: 0.4, sizes: [] },
      css_classes: 'rpf-hero', flex_align_items_mobile: 'flex-start', flex_justify_content_mobile: 'flex-end',
    }, [
      con({ ...col(), flex_gap: gap(24), ...widthPx(547) }, [
        con({ ...row({ flex_direction_mobile: 'row', flex_wrap: 'wrap' }), flex_align_items: 'center', flex_gap: gap(12) }, [
          image(MEDIA.trustpilot, { width: px(259), width_mobile: px(200), _flex_size: 'none', alt: 'Trustpilot 5 stars' }),
          heading('We’ve rated 4.9 across 200 reviews!', { tag: 'p', color: 'rpf_white', type: 'rpf_rating' }),
        ]),
        heading('Made for pets who deserve better.', { tag: 'h1', color: 'rpf_white', type: 'rpf_display' }),
        text('<p>We craft premium seafood meals packed with natural protein and nutrients — giving pets the same quality we expect for ourselves. Straight from the source, straight to their bowl.</p>', { color: 'rpf_white' }),
      ]),
      con({
        ...col(), flex_gap: gap(16), padding: box(32), padding_mobile: box(20), border_radius: box(48), border_radius_mobile: box(28),
        background_background: 'classic', background_color: 'rgba(0,0,0,0.24)', css_classes: 'rpf-glass', ...widthPx(488),
      }, [
        heading('Take 2 minutes and get a personalized plan and price', { tag: 'p', color: 'rpf_white', type: 'secondary' }),
        w('html', { html: heroForm }),
      ]),
    ]),
  ]),

  // 2. Health benefits
  section(SEC({
    _element_id: 'health-benefits', ...row(), flex_align_items: 'center', flex_gap: gap(64),
    padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16),
    background_background: 'classic', background_color: '#FFFFFF', background_image: img(MEDIA.pawBg), background_position: 'center center', background_size: 'cover',
  }), [
    con({ ...col(), flex_gap: gap(24), ...widthPx(547) }, [
      heading('Healthy eating made simple'),
      text('<p>Every ingredient serves a purpose — rich proteins for strength, omega oils for glossy coats, and natural minerals for a longer, happier life.</p>'),
      w('icon-list', {
        icon_list: ['Healthier skin &amp; coat', 'Stronger immunity', 'More energy every day', 'Easy digestion'].map(benefitItem),
        space_between: px(8), icon_size: px(20), text_indent: px(12), icon_color: '#7EC78E',
        __globals__: { text_color: gColor('text'), icon_typography_typography: gType('rpf_lead') },
      }),
      button('Order now', '#products', { _margin: box(24, 0, 0, 0) }),
    ]),
    image(MEDIA.dog, { width: px(557), width_tablet: pct(100), image_border_radius: box(21), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
  ]),

  // 3. Sustainability / ocean banner
  section(SEC({ _element_id: 'sustainability', padding: box(24, 112, 112, 112), padding_tablet: box(24, 32, 64, 32), padding_mobile: box(16, 16, 48, 16), background_background: 'classic', background_color: '#FFFFFF' }), [
    con({
      content_width: 'full', ...col(), flex_justify_content: 'center', flex_align_items: 'center', flex_gap: gap(48),
      min_height: px(507), padding: box(112), padding_tablet: box(80, 48, 80, 220), padding_mobile: box(48, 20, 260, 20), border_radius: box(24),
      background_background: 'classic', background_color: '#62B6CF', background_image: img(MEDIA.ocean),
      background_position: 'center left', background_position_mobile: 'bottom left', background_size: 'cover', background_size_mobile: 'initial',
      background_bg_width_mobile: { unit: 'px', size: 640, sizes: [] }, background_repeat: 'no-repeat',
    }, [
      con({ ...col(), flex_align_items: 'center', flex_gap: gap(24), width: px(600), width_tablet: pct(100), width_mobile: pct(100) }, [
        heading('Powered by the ocean’s best', { color: 'rpf_white', align: 'center' }),
        text('<p>Every ingredient serves a purpose — rich proteins for strength, omega oils for glossy coats, and natural minerals for a longer, happier life.</p>', { color: 'rpf_white', align: 'center' }),
      ]),
      button('Order now', '#products', { align: 'center' }),
    ]),
  ]),

  // 4. Product range
  section(SEC({
    _element_id: 'products', ...col(), flex_align_items: 'center', flex_gap: gap(32),
    padding: box(112), padding_tablet: box(80, 32), padding_mobile: box(56, 16),
    background_background: 'classic', background_color: '#FFFCF9', background_image: img(MEDIA.productBg), background_position: 'center center', background_size: 'cover',
  }), [
    con({ ...col(), flex_align_items: 'center', flex_gap: gap(24), width: px(800), width_tablet: pct(100) }, [
      heading('Rethink what pet food should be', { align: 'center' }),
      text('<p>Most pet meals are overly processed and stripped of natural goodness. Ours are different — made from real seafood cuts, rich in Omega-3 and natural nutrients pets truly need.</p>', { color: 'primary', align: 'center', extra: { _element_width: 'initial', _element_custom_width: px(650), _element_custom_width_tablet: pct(100) } }),
      button('Order now', '#products', { align: 'center' }),
    ]),
    con({ ...row({ flex_direction_tablet: 'column' }), flex_justify_content: 'space-between', flex_align_items: 'stretch', flex_gap: gap(0), flex_gap_tablet: gap(16), width: pct(100) }, [
      con({ ...col(), flex_justify_content: 'space-between', flex_align_items: 'flex-start', flex_gap: gap(16), z_index: 2, flex_direction_tablet: 'row', flex_wrap_tablet: 'wrap', flex_direction_mobile: 'column', _flex_size: 'none', order_tablet: 'end', css_classes: 'rpf-callouts' }, [
        callout('Real seafood', 'Only premium salmon belly fins — rich in protein, calcium, and vitamin D.', -2),
        callout('Vet-approved nutrition', 'Balanced and safe for pets of all ages — backed by science, trusted by owners.', 2),
      ]),
      image({ ...MEDIA.pack }, { width: px(927), width_tablet: pct(100), _margin: box(26, -150, 0, -150), _margin_tablet: box(0), _flex_size: 'none', _flex_size_tablet: 'none', z_index: 1, css_classes: 'rpf-pack' }),
      con({ ...col(), flex_justify_content: 'space-between', flex_align_items: 'flex-end', flex_gap: gap(16), z_index: 2, flex_direction_tablet: 'row', flex_wrap_tablet: 'wrap', flex_direction_mobile: 'column', _flex_size: 'none', order_tablet: 'end', css_classes: 'rpf-callouts' }, [
        callout('Responsibly sourced', 'Harvested from sustainable local waters with care for your pet.', 2),
        callout('Freshly packed', 'Sealed for freshness to lock in every drop of natural flavor and benefit.', -2),
      ]),
    ]),
  ]),

  // 5. About
  section(SEC({
    _element_id: 'about', ...row(), flex_justify_content: 'space-between', flex_align_items: 'center', flex_gap: gap(64),
    padding: box(80, 112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF',
  }), [
    image(MEDIA.about, { width: px(532), width_tablet: pct(100), image_border_radius: box(12), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
    con({ ...col(), flex_gap: gap(24), ...widthPx(547) }, [
      heading('Crafted by experts.<br>Trusted by pets.'),
      text('<p>We’re more than a brand — we’re a dedicated manufacturer passionate about real nutrition and transparency. Our recipes are developed, tested, and packed with care for pets across Australia.</p>'),
      button('Meet Raw Petfoods', '#contact', { _margin: box(24, 0, 0, 0) }),
    ]),
  ]),

  // 6. Reviews
  section(SEC({
    _element_id: 'reviews', ...col(), flex_align_items: 'center', flex_gap: gap(80), flex_gap_mobile: gap(40),
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
          w('star-rating', { rating_scale: '5', rating: '5', star_style: 'star_fontawesome', unmarked_star_style: 'solid', align: 'center', icon_size: px(26), icon_space: px(18), stars_color: '#FFA600' }),
          con({ ...col(), flex_gap: gap(16) }, [
            text('<p>“Our golden retriever, Luna, used to be a picky eater. Since switching to Raw Petfoods, she finishes every bowl and her coat looks incredible. You can literally see the difference in just a few weeks.”</p>', { type: 'secondary', align: 'center' }),
            text('<p>Martha B.</p>', { color: 'rpf_grey', align: 'center' }),
          ]),
        ]),
      ]),
      w('icon', { selected_icon: icon('fas fa-chevron-right'), view: 'stacked', shape: 'circle', primary_color: '#FFFFFF', secondary_color: '#7EC78E', size: px(20), size_mobile: px(14), icon_padding: px(18), icon_padding_mobile: px(12), link: link('#reviews'), css_classes: 'rpf-review-next', _flex_size: 'none' }),
    ]),
  ]),

  // 7. Wholesale
  section(SEC({
    _element_id: 'wholesale', ...row(), flex_justify_content: 'space-between', flex_align_items: 'center', flex_gap: gap(64),
    padding: box(112), padding_tablet: box(64, 32), padding_mobile: box(48, 16), background_background: 'classic', background_color: '#FFFFFF',
  }), [
    con({ ...col(), flex_gap: gap(24), ...widthPx(547) }, [
      heading('Join our partner network'),
      text('<p>We supply premium pet food to trusted retailers and distributors across the country. If you share our passion for quality and care, let’s grow together.</p>'),
      button('Become a Partner', '#contact', { _margin: box(24, 0, 0, 0) }),
    ]),
    image(MEDIA.partner, { width: px(532), width_tablet: pct(100), image_border_radius: box(12), _flex_size: 'none', _flex_size_tablet: 'shrink' }),
  ]),

  // 8. Blog
  section(SEC({
    _element_id: 'blog', ...col(), flex_align_items: 'center', flex_gap: gap(48),
    padding: box(112), padding_tablet: box(80, 32), padding_mobile: box(56, 16),
    background_background: 'classic', __globals__: { background_color: gColor('rpf_light') },
  }), [
    con({ ...col(), flex_align_items: 'center', flex_gap: gap(24), width: px(860), width_tablet: pct(100) }, [
      heading('Pet care wisdom, straight from the source', { align: 'center' }),
      text('<p>Explore expert tips, feeding guides, and behind-the-scenes stories about how we bring ocean-fresh nutrition to every meal.</p>', { align: 'center', extra: { _element_width: 'initial', _element_custom_width: px(664), _element_custom_width_tablet: pct(100) } }),
    ]),
    con({ ...row({ flex_direction_tablet: 'column' }), flex_gap: gap(32), flex_align_items: 'stretch', width: pct(100) }, [
      blogCard(MEDIA.blog1, 'October 18, 2025', 'Why Real Seafood Is More Attractive For Pets?', 'Fish isn’t just delicious — it’s a powerhouse of omega-3s, minerals, and lean protein that support heart health, shiny coats, and strong joints.', `${SITE}/why-real-seafood-is-more-attractive-for-pets/`),
      blogCard(MEDIA.blog2, 'October 26, 2025', 'How to Tell if Your Pet’s Food Is Truly “Natural”', 'Not all pet food labeled “natural” lives up to the claim. We break down what to look for on the label, how to spot fillers, and what real ingredients should look like in your pet’s bowl.', `${SITE}/how-to-tell-if-your-pets-food-is-truly-natural/`),
      blogCard(MEDIA.blog3, 'December 6, 2025', 'Sustainable Feeding: Good for Pets, Better for the Planet', 'From responsibly sourced seafood to recyclable packaging, every choice matters. See how Raw Petfoods is reducing waste while keeping your pet’s nutrition uncompromised.', `${SITE}/sustainable-feeding-good-for-pets-better-for-the-planet/`),
    ]),
  ]),

  // 9. FAQ
  section(SEC({
    _element_id: 'faqs', ...col(), flex_align_items: 'center', flex_gap: gap(64), flex_gap_mobile: gap(32),
    padding: box(112), padding_tablet: box(80, 32), padding_mobile: box(56, 16), background_background: 'classic', background_color: '#FFFFFF',
  }), [
    heading('Curious? We’ve got answers.', { align: 'center' }),
    accordion,
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
