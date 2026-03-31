import { Event, Sermon, TeamMember } from './types';

export const EVENTS: Event[] = [
  {
    id: '1',
    title: 'Sunday Worship Service',
    date: 'Oct 15',
    time: '9:00 AM & 11:00 AM',
    description: 'Join us in the Main Sanctuary or online for a time of worship, prayer, and teaching.',
    category: 'worship',
    image: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Ignite Youth Service',
    date: 'Oct 18',
    time: '6:30 PM - 8:30 PM',
    description: 'High School and Middle School students gathering for fellowship and worship.',
    category: 'youth',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Adult Small Groups',
    date: 'Oct 19',
    time: '7:00 PM - Various Locations',
    description: 'Deeper dive into the Sunday sermon in a small community setting.',
    category: 'small-group',
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'Grace Kids Program',
    date: 'Oct 22',
    time: 'During All Services',
    description: 'Age-appropriate Bible teaching and activities for children aged 3-12.',
    category: 'kids',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    title: 'Community Outreach',
    date: 'Nov 22',
    time: '9:00 AM',
    description: 'Serving our local food pantry this Saturday. All ages are welcome to join us!',
    category: 'outreach',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80'
  }
];

export const SERMONS: Sermon[] = [
  {
    id: '1',
    title: 'Love One Another: The Heart of the Gospel',
    series: 'Walking in Light',
    date: 'Oct 22, 2023',
    speaker: 'Pastor John Smith',
    description: 'Exploring the commandment that defines the Christian life and how it transforms our relationships.',
    duration: '38:42',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Walking in Truth',
    series: 'Walking in Light',
    date: 'Oct 15, 2023',
    speaker: 'Pastor John Smith',
    description: "What does it mean to walk in the truth of God's Word in a culture that treats truth as relative?",
    duration: '42:15',
    thumbnail: 'https://images.unsplash.com/photo-1490730141103-6ac27d020028?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    title: 'Finding Rest in the Storm',
    series: 'Psalms of Summer',
    date: 'Aug 27, 2023',
    speaker: 'Dr. Sarah Williams',
    description: 'A study of Psalm 46 and how we can find true stillness and peace when the world around us is in chaos.',
    duration: '35:10',
    thumbnail: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    title: 'The Authority of Scripture',
    series: 'Foundation Stones',
    date: 'July 09, 2023',
    speaker: 'Pastor John Smith',
    description: 'Why we believe the Bible is the inspired word of God and how it serves as the final authority for our faith.',
    duration: '45:55',
    thumbnail: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80'
  }
];

export const TEAM: TeamMember[] = [
  {
    id: '1',
    name: 'Rev. David Johnson',
    role: 'Lead Pastor',
    description: 'David has been leading our community for 12 years with a heart for teaching and community outreach.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Pastor Sarah Chen',
    role: 'Associate Pastor',
    description: 'Sarah oversees our small groups and discipleship programs. She is passionate about mentoring the next generation.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Marcus Thompson',
    role: 'Worship Director',
    description: 'Marcus leads our music ministry with excellence. His goal is to create space for connection through worship.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
  }
];
