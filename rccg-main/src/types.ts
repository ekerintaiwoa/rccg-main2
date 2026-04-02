export type Tab =
  | 'home'
  | 'events'
  | 'sermons'
  | 'give'
  | 'about'
  | 'contact'
  | 'blog'
  | 'devotional'
  | 'devotional'
  | 'library'
  | 'gallery'
  | 'prayer'
  | 'bible'
  | 'live';

export interface PrayerPointItem {
  id: number;
  text: string;
  order: number;
}

export interface DailyPrayer {
  id: number;
  date: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  title: string;
  verse?: string;
  declaration: string;
  points: PrayerPointItem[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  category: 'worship' | 'youth' | 'small-group' | 'kids' | 'outreach';
  image?: string;
}

export interface Sermon {
  id: string;
  title: string;
  series: string;
  date: string;
  speaker: string;
  description: string;
  duration: string;
  thumbnail: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}
