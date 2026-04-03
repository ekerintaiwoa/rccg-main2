
const config = {
  "id":1,
  "title":"Holyghost Service April",
  "youtube_url":"https://www.youtube.com/watch?v=YE8uA3R70Ug",
  "service_day":"Today",
  "start_time":"16:00:09",
  "end_time":"00:00:00",
  "service_date":"2026-04-03",
  "is_recurring":false,
  "timezone":"Europe/Berlin"
};

const TZ_NOW_STR = "2026-04-03T18:16:47+02:00";
const tzNow = new Date(TZ_NOW_STR);

console.log("Current Time (tzNow):", tzNow.toString());

const [startH, startM, startS] = config.start_time.split(':').map(Number);
const [endH, endM, endS] = config.end_time.split(':').map(Number);

let targetStart;
let targetEnd;
let mode = 'waiting';

if (!config.is_recurring && config.service_date) {
    const [y, mm, d] = config.service_date.split('-').map(Number);
    
    // Simulating the logic in LiveStream.tsx
    targetStart = new Date(tzNow);
    targetStart.setFullYear(y, mm - 1, d);
    targetStart.setHours(startH, startM, startS || 0, 0);

    targetEnd = new Date(tzNow);
    targetEnd.setFullYear(y, mm - 1, d);
    targetEnd.setHours(endH, endM, endS || 0, 0);

    if (targetEnd.getTime() <= targetStart.getTime()) {
        targetEnd.setDate(targetEnd.getDate() + 1);
    }

    console.log("Target Start:", targetStart.toString());
    console.log("Target End:", targetEnd.toString());

    if (tzNow.getTime() < targetStart.getTime()) {
        mode = 'waiting';
    } else if (tzNow.getTime() >= targetStart.getTime() && tzNow.getTime() <= targetEnd.getTime()) {
        mode = 'live';
    } else {
        mode = 'ended';
    }
}

console.log("Mode:", mode);
