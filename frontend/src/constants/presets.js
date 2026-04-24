export const PRESETS = [
  { category: 'Events',       name: 'ListImage',          w: 370, h: 230 },
  { category: 'Events',       name: 'DetailsImage',       w: 770, h: 350 },
  { category: 'Events',       name: 'ThumbnailImage',     w: 120, h: 200 },
  { category: 'Services',     name: 'ListImage',          w: 370, h: 250 },
  { category: 'Services',     name: 'DetailsImage',       w: 770, h: 380 },
  { category: 'Services',     name: 'Gallery(5 images)',  w: 370, h: 270 },
  { category: 'Competitions', name: 'CompetitionsList',   w: 370, h: 250 },
  { category: 'Competitions', name: 'CompetitionDetails', w: 770, h: 380 },
];

export const PRESET_GROUPS = PRESETS.reduce((acc, p) => {
  if (!acc[p.category]) acc[p.category] = [];
  acc[p.category].push(p);
  return acc;
}, {});
