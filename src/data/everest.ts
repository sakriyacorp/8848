/* Hotspots on the interactive Everest: route index (ascent/terrain.ts ROUTE_XZ), a line of
   story, a fact, and the dish we'd pair with it. */
export type Hotspot = { route: number; name: string; alt: string; story: string; fact: string; dish: string };

export const HOTSPOTS: Hotspot[] = [
  {
    route: 4,
    name: "Everest Base Camp",
    alt: "5,364 m",
    story: "A tent city on the Khumbu Glacier. Every spring it fills with climbers, Sherpa teams and cooks.",
    fact: "Base Camp sits on moving ice: the ground under the tents shifts through the season.",
    dish: "nepali-thali",
  },
  {
    route: 5,
    name: "Khumbu Icefall",
    alt: "5,500 m",
    story: "The most dangerous part of the route: a frozen waterfall of seracs, crossed on aluminium ladders.",
    fact: "The glacier here can move about a metre a day. The Icefall Doctors re-lay the ladders all season.",
    dish: "buff-sukuti",
  },
  {
    route: 6,
    name: "Camp I",
    alt: "6,065 m",
    story: "Top of the Icefall, bottom of the Western Cwm. Climbers arrive at dawn to beat the heat off the snow.",
    fact: "In the Cwm the sun reflects off every wall; on a still day it can feel hotter than Kathmandu.",
    dish: "tandoori-chicken",
  },
  {
    route: 7,
    name: "Camp II",
    alt: "6,400 m",
    story: "Advanced Base Camp: a cook tent, a dining tent, and the last proper hot meals for a while.",
    fact: "Teams rest here for days at a time to acclimatise before the Lhotse Face.",
    dish: "everest-goat-biryani",
  },
  {
    route: 8,
    name: "Camp III",
    alt: "7,200 m",
    story: "Tents cut into the Lhotse Face on a slope of about forty degrees. Nobody sleeps well.",
    fact: "Most climbers start using bottled oxygen from here up.",
    dish: "kheer",
  },
  {
    route: 9,
    name: "South Col",
    alt: "7,950 m",
    story: "A windswept saddle between Everest and Lhotse, and the last camp before the summit push.",
    fact: "Above about 8,000 m is the 'death zone': the body can't acclimatise, only endure.",
    dish: "nepali-masala-chiya",
  },
  {
    route: 11,
    name: "Sagarmatha",
    alt: "8,848.86 m",
    story: "The roof of the world. सगरमाथा in Nepali, Chomolungma in Tibetan.",
    fact: "Nepal and China re-measured it together and announced 8,848.86 m in December 2020.",
    dish: "momo-platter",
  },
];
