import { restaurant } from "@/lib/menu";
import { formatMoney } from "@/lib/format";

export type FaqItem = { q: string; a: string };

/* Facts come from eatnatraj.com (what the kitchen is known for, meals, takeout and delivery,
   address, service area, gift cards, the Sunday buffet) and from data/menu.json. */
export const FAQ: FaqItem[] = [
  {
    q: "What is Natraj known for?",
    a: "Butter chicken, chicken tikka masala, lamb korma and rogan josh, saag paneer, biryani, samosas and pakoras, and garlic naan from the tandoor. Guests also come back for the Sunday buffet.",
  },
  {
    q: "What meals do you serve?",
    a: "Lunch and dinner, Tuesday through Sunday. Lunch combo boxes pair an entrée with naan, dal, basmati rice and chutney. The restaurant is closed on Mondays.",
  },
  {
    q: "Do you offer takeout or delivery?",
    a: "Both. Choose pickup or delivery when you order. Pickup is ready in about 20 minutes; delivery covers the Culpeper area.",
  },
  {
    q: "Where are you located?",
    a: `${restaurant.address.line1}, in ${restaurant.address.line2} in downtown Culpeper, Virginia ${restaurant.address.zip}.`,
  },
  {
    q: "What areas do you serve?",
    a: "Culpeper and the surrounding county, including Brandy Station, Stevensburg, Rixeyville, Reva, Elkwood, Mitchells and Catalpa.",
  },
  {
    q: "Do you take reservations?",
    a: `Yes. Reserve a table online or call ${restaurant.phone}. The whole room can be booked for private events and gatherings.`,
  },
  {
    q: "Is there a Sunday buffet?",
    a: `Every Sunday, ${formatMoney(restaurant.sundayBuffet.price)} per person: a rotating spread of curries, biryanis, tandoori, fresh naan and sweets.`,
  },
  {
    q: "Are there vegetarian and vegan dishes?",
    a: "Twenty-one vegetarian specialties, many of them vegan, plus vegetarian appetizers, breads and biryani. Each dish is marked on the menu.",
  },
  {
    q: "Can I choose how spicy my food is?",
    a: "Yes. Any curry can be made mild, medium, hot or Indian hot. Pick the level when you order.",
  },
  {
    q: "Do you sell gift cards?",
    a: "Yes. Gift cards are sold online through the link in the footer and work for online pickup and delivery orders.",
  },
];
