import { systems } from '../../prototype-app/src/demo/catalog.js';

export const demos = Object.entries(systems).map(([slug, system]) => ({
  slug,
  label: system.label,
  name: system.name,
  image: `/images/prototipe/${slug}.webp`,
  href: `/prototipe/${slug}/`,
}));
