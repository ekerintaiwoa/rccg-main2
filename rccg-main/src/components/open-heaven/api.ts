import { Devotional } from './types';

const BACKEND_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'https://backend-production-f755.up.railway.app';

const FALLBACK_URL = 'https://corsproxy.io/?' + encodeURIComponent('https://www.openheavensdaily.com/feeds/posts/default?alt=json&max-results=30');

const decodeHtml = (text: string) => {
  return text.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
             .replace(/&#x([0-9A-Fa-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
             .replace(/&quot;/g, '"')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&nbsp;/g, ' ');
};

const parseDevotionalText = (rawMessage: string, title: string, date: string): Devotional => {
  const messageDesc = decodeHtml(rawMessage);

  const extractContent = (startMarker: RegExp, endMarkers: RegExp[]) => {
    const startMatch = messageDesc.match(startMarker);
    if (!startMatch) return '';
    const startIndex = startMatch.index! + startMatch[0].length;
    let rest = messageDesc.substring(startIndex).trimStart();
    
    let earliestEnd = rest.length;
    for (const endMarker of endMarkers) {
      const endMatch = rest.match(endMarker);
      if (endMatch && endMatch.index !== undefined && endMatch.index < earliestEnd) {
        earliestEnd = endMatch.index;
      }
    }
    
    return rest.substring(0, earliestEnd).trim();
  };

  const nextHeadings = [
    /\n[^\n]*?(?:READ|Read|BIBLE TEXT)\s*:/i, 
    /\n[^\n]*?(?:MESSAGE|Message)\s*\n/i, 
    /\n[^\n]*?(?:KEY POINT|PRAYER POINT|ACTION POINT)[^\n]*\n/i, 
    /\n[^\n]*?(?:HYMN|Hymn)[^\n]*/i,
    /\n[^\n]*?(?:BIBLE IN ONE YEAR|Bible in one year)/i
  ];

  const mvSection = extractContent(/\n[^\n]*?(?:MEMORISE|Memorise|MEMORY VERSE)\s*\n/i, nextHeadings);
  const verses = extractContent(/\n[^\n]*?(?:READ|Read|BIBLE TEXT)\s*:/i, nextHeadings);
  const messageContent = extractContent(/\n[^\n]*?(?:MESSAGE|Message)\s*\n/i, nextHeadings);
  const prayerPoints = extractContent(/\n[^\n]*?(?:KEY POINT|PRAYER POINT|ACTION POINT)[^\n]*\n/i, nextHeadings);
  const hymnContent = extractContent(/\n[^\n]*?(?:HYMN|Hymn)[^\n]*/i, nextHeadings);
  
  const mvLines = mvSection.split('\n').map(l=>l.trim()).filter(Boolean);
  // Reconstruct memory verse string if split
  let memory_verse = '';
  let memory_verse_text = mvSection;

  // The verse is often at the end of the MEMORISE block like "Mark 11:23" or "(Ecclesiastes 9:8)"
  // But let's just make the whole block the `memory_verse_text` and try to extract the citation
  const citationMatch = mvSection.match(/([1-3]?\s*[a-zA-Z]+\s+\d+:\d+(?:-\d+)?)[^\w]*$/i);
  if (citationMatch) { 
    memory_verse = citationMatch[1];
    memory_verse_text = mvSection.replace(citationMatch[1], '').trim();
  } else {
    memory_verse = 'Memory Verse';
  }

  const bible_reading = verses.split('\n')[0]?.trim() || "Today's Reading";
  
  // Try keeping the verses text if requested, or just pass it as 'verses' 
  // (the app UI expects the devotional.bible_reading to just be the citation, but we can prepend it if needed)

  const content = messageContent.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const prayer_point = prayerPoints.split(/\n/).map(p => p.trim()).filter(Boolean).join(' ');
  
  return {
    title: decodeHtml(title || 'Daily Devotional'),
    date,
    topic: '',
    bible_reading,
    memory_verse,
    memory_verse_text,
    content: content.length ? content : [messageDesc.substring(0, 500) + '...'],
    prayer_point,
    hymn: hymnContent,
    reflection: undefined
  };
};

export async function fetchDevotional(date: string): Promise<Devotional | null> {
  try {
    // Prefer our backend proxy (server-side fetch avoids CORS/proxy blocks)
    const backendRes = await fetch(`${BACKEND_BASE_URL}/api/open-heaven/?date=${encodeURIComponent(date)}`);
    if (backendRes.ok) {
      return (await backendRes.json()) as Devotional;
    }

    // If backend says "not found", respect that.
    if (backendRes.status === 404) {
      return null;
    }

    // Otherwise, fall back to the legacy public proxy.
    const res = await fetch(FALLBACK_URL);
    if (!res.ok) return null;
    const data = await res.json();
    const entries = data.feed?.entry || [];

    const [yyyy, mm, dd] = date.split('-');
    const targetDateObj = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(targetDateObj).toLowerCase();
    const dayNum = parseInt(dd, 10);
    const dayRegex = new RegExp(`\\b${dayNum}(st|nd|rd|th)?\\b`, 'i');

    const targetEntry = entries.find((e: any) => {
      const t = (e.title.$t || '').toLowerCase();
      return t.includes(monthName) && t.includes(yyyy) && dayRegex.test(t);
    });

    if (!targetEntry) return null;

    // The feed only provides a truncated summary without the HTML newlines.
    // To get the full uncompressed text with its spacing, we must fetch the specific post's HTML directly.
    const postUrlObj = targetEntry.link?.find((l: any) => l.rel === 'alternate');
    if (!postUrlObj || !postUrlObj.href) return null;

    const postRes = await fetch('https://corsproxy.io/?' + encodeURIComponent(postUrlObj.href));
    if (!postRes.ok) return null;
    
    const postHtml = await postRes.text();
    
    // Extract the content strictly inside the Blogger 'post-body' wrapper
    const bodyMatch = postHtml.match(/<div class=['"]post-body[^>]*>([\s\S]*?)<div class=['"]post-footer['"]/i);
    const rawHtml = bodyMatch ? bodyMatch[1] : ((targetEntry.content && targetEntry.content.$t) || (targetEntry.summary && targetEntry.summary.$t) || '');

    let text = rawHtml.replace(/<br\s*[\/]?>/gi, '\n')
                      .replace(/<\/p>/gi, '\n\n')
                      .replace(/<\/div>/gi, '\n')
                      .replace(/<\/li>/gi, '\n')
                      .replace(/<[^>]+>/g, ' ')
                      .replace(/[ \t]+/g, ' '); // collapse extra horizontal spaces but leave newlines

    return parseDevotionalText(text, targetEntry.title.$t, date);
  } catch (error) {
    console.error('Error fetching devotional from openheavensdaily:', error);
    return null;
  }
}

// Helper to get formatted date string YYYY-MM-DD in local time
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper for display date
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase();
}
