/* Kept apart from lib/menu so client components that only need a photo path don't pull menu.json. */
export function getDishImage(item: { img: string }): string {
  return `/dishes/${item.img}.jpg`;
}
