/* ============================================================================================
   Set-piece registry. Every signature animation lives in src/components/setpieces/ and is
   switched here. Turning a flag off removes the piece and leaves the page complete (each call
   site renders a designed static fallback or simply nothing).
   PROGRESS.md lists where each one lives and how to trigger it.
   ========================================================================================== */

export const FEATURES = {
  // ★ Flagships
  ascent: { on: true, desc: "Scroll-driven 3D climb of Everest with altimeter HUD and waypoint cards (home)." },
  everest3d: { on: true, desc: "Drag-to-rotate brass-contour Everest with camp hotspots, climbers and summit plume (story)." },
  globe: { on: true, desc: "Brass-dot globe: spins to the Himalayas, flies Kathmandu → Harrisonburg (live pin labels, mileage ticking up), lands with ripples and hands off to Visit (home)." },

  // Hero + intro
  intro: { on: true, desc: "First-visit logo draw-on intro: arc strokes on, peaks rise, sun rises, numerals settle." },
  plaque: { on: true, desc: "three.js brushed-brass plaque face (engraved via height/normal map, anisotropic lamp highlight following cursor / phone tilt) on the walnut stand; scroll pushes through the arc. Off → CSS plaque." },
  skyTime: { on: true, desc: "Hero sky matches the current time in Harrisonburg (dawn, day, golden hour, night + moon)." },
  lampLight: { on: true, desc: "Warm lamp glow follows cursor/finger on dark sections and reveals engraved contour lines." },

  // Ambient life
  prayerFlags: { on: true, desc: "Verlet-cloth prayer flags strung across section tops; wind follows scroll speed." },
  snow: { on: true, desc: "Drifting snow that parts around the cursor or finger." },
  ripples: { on: true, desc: "Tap anywhere on dark sections for singing-bowl ripple rings (+ optional chime)." },
  sound: { on: true, desc: "Sound toggle, off by default: wind bed that rises with altitude on the ascent, summit bowl, globe whoosh + landing chime, dial detents, stamp thuds, add-to-pack pluck, bowl ripples. All synthesized (lib/audio.ts)." },
  butterLamps: { on: true, desc: "Flickering butter lamps; lit = open now, extinguished + smoke = closed." },
  climber: { on: true, desc: "Tiny climber ascends a ridgeline on the page edge as you scroll." },
  cloudWipe: { on: true, desc: "Clouds wipe across the screen between routes." },
  mandalaLoader: { on: true, desc: "Brass mandala / compass loader while heavy 3D scenes load." },
  tilt: { on: true, desc: "Phone-tilt parallax on mountain layers (with iOS permission button)." },
  haptics: { on: true, desc: "Light vibration on add-to-bag where supported." },

  // Menu + ordering
  campRail: { on: true, desc: "Menu categories as camps on an altitude rail; a climber walks between camps." },
  spicePeaks: { on: true, desc: "Spice level as 1–5 tiny peaks; hot dishes shimmer with heat." },
  steam: { on: true, desc: "Steam curls off dish photos on hover/tap." },
  bagFlight: { on: true, desc: "Add-to-bag: the dish flies along an arc into the trekking-pack bag, which bounces." },
  momoBuilder: { on: true, desc: "Build a momo: pick filling + style, watch it pleat and cook, add it to the bag." },
  thali: { on: true, desc: "Top-down dal bhat thali; tap each katori to learn what it is." },
  permit: { on: true, desc: "Order confirmation as a stamped Sagarmatha trekking permit + summit flag." },
  prayerWheel: { on: true, desc: "Spin a brass prayer wheel; where it stops suggests a dish (menu)." },

  // The Bar
  nightSky: { on: true, desc: "Milky Way, twinkling stars and shooting stars over the peaks (bar). Tap a shooting star to catch it: sparks + a wish." },
  constellation: { on: true, desc: "Press and hold the bar sky: stars join up into the 8848 mark." },
  cocktailPour: { on: true, desc: "Tap a cocktail: layers pour into an SVG glass, ice drops, garnish lands; tilt sloshes." },

  // Story, testimonials, visit
  routeMap: { on: true, desc: "Hand-drawn Kathmandu → Summit route that draws itself on lokta paper as you scroll." },
  counters: { on: true, desc: "Big counters tick up: 8,848.86 m, 29,031.7 ft." },
  postcards: { on: true, desc: "Testimonials as postcards from Base Camp with stamps and postmarks, auto-scrolling lanes." },
  polaroids: { on: true, desc: "Polaroids pinned on a swaying string like prayer flags." },
  singingBowl: { on: true, desc: "A singing bowl you can play: circle the rim to make it hum (WebAudio)." },
  twinClocks: { on: true, desc: "Brass twin clocks: Harrisonburg and Kathmandu time, side by side." },
  reservation: { on: true, desc: "Brass-dial date/time picker; confirming engraves your name on a plaque and stamps a passport." },
  footerHorizon: { on: true, desc: "Footer horizon: four rim-lit ranges with valley mist, a teahouse window, prayer flags, shooting stars, and the real moon/sun on the logo arc; ranges part as it scrolls in." },
  momoCounter: { on: true, desc: "Momos pleated today — a live-feeling counter tied to the kitchen clock." },
  altitudeTitle: { on: true, desc: "Browser tab title shows your altitude while you climb the home page." },

  // Easter eggs
  avalanche: { on: true, desc: "Tap the logo 8 times or type 8848: gentle avalanche + yeti footprints." },
  blizzard404: { on: true, desc: "404: lost in a whiteout with a spinning brass compass that locks onto 'Return to Base Camp' when you point at it." },
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isOn(key: FeatureKey): boolean {
  return FEATURES[key].on;
}
