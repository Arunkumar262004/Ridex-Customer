// Server vehicle types store an admin-picked icon name from a different
// icon set (see server/src/utils/seedVehicleTypes.js), so it isn't safe to
// render directly with MaterialDesignIcons. This derives a matching
// MaterialDesignIcons glyph from the vehicle's name instead - used only as
// a fallback when the vehicle type has no admin-uploaded photo.
const ICON_RULES = [
  { match: /bike/i, icon: 'motorbike' },
  { match: /auto/i, icon: 'rickshaw' },
  { match: /premium/i, icon: 'car-side' },
  { match: /cab|car/i, icon: 'car' },
  { match: /scoot/i, icon: 'moped' },
  { match: /parcel/i, icon: 'package-variant-closed' },
];

const getVehicleIcon = name => (ICON_RULES.find(rule => rule.match.test(name || ''))?.icon) || 'taxi';

export { getVehicleIcon };
