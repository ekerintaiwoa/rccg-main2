export interface Devotional {
  title: string;
  date: string;
  topic: string;
  bible_reading: string;
  memory_verse: string;
  memory_verse_text: string;
  content: string[];
  prayer_point: string;
  hymn?: string;
  reflection?: string[];
}

export type Tab = 'daily' | 'calendar' | 'bookmarks';
