export type CategoryGroup =
  | 'Education'
  | 'Food'
  | 'Transportation'
  | 'Healthcare'
  | 'Entertainment'
  | 'Beauty'
  | 'Social'
  | 'Other';

export interface CategoryItem {
  value: string;
  label: string;
}

export type Categories = Record<CategoryGroup, CategoryItem[]>;

export const categories: Categories = {
  Education: [
    { value: 'education-tuition', label: '🎓 Tuition' },
    { value: 'education-books', label: '📚 Books & Supplies' },
    { value: 'education-online', label: '🖥️ Online Courses' },
  ],
  Food: [
    { value: 'food-groceries', label: '🛒 Groceries' },
    { value: 'food-restaurants', label: '🍽️ Restaurants' },
    { value: 'food-coffee', label: '☕ Coffee' },
  ],
  Transportation: [
    { value: 'transport-fuel', label: '⛽ Fuel' },
    { value: 'transport-public', label: '🚌 Public Transport' },
    { value: 'transport-ride', label: '🚕 Ride Share' },
  ],
  Healthcare: [
    { value: 'health-doctor', label: '🩺 Doctor Visits' },
    { value: 'health-pharmacy', label: '💊 Pharmacy' },
    { value: 'health-insurance', label: '🛡️ Insurance' },
  ],
  Entertainment: [
  { value: 'movies', label: '🎬 Movies' },
  { value: 'games', label: '🎮 Games' },
  { value: 'events', label: '🎟️ Events' },
  { value: 'music', label: '🎵 Music' },
],
  Beauty: [
    { value: 'beauty-salon', label: '💇 Salon' },
    { value: 'beauty-cosmetics', label: '💄 Cosmetics' },
    { value: 'beauty-spa', label: '🧖 Spa & Wellness' },
    { value: 'beauty-other', label: '💅 Other Beauty' },
  ],
  Social: [
    { value: 'social-gifts', label: '🎁 Gifts' },
    { value: 'social-donations', label: '🙏 Donations' },
    { value: 'social-events', label: '🎉 Events & Parties' },
    { value: 'social-other', label: '🔖 Other Social' },
  ],
  Other: [
    { value: 'other-misc', label: '🔖 Miscellaneous' },
  ],
};
