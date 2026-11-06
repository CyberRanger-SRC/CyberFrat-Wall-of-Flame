export interface CuteQuote {
  id: string;
  category: 'awareness-funny' | 'awareness-thoughtful';
  text: string;
  emoji: string;
}

export const CUTE_FUNNY_QUOTES: CuteQuote[] = [
  {
    id: 'q1',
    category: 'awareness-funny',
    text: "May your passwords be as complex as Mom’s rangoli and twice as hard to crack!",
    emoji: "🎨🔐"
  },
  {
    id: 'q2',
    category: 'awareness-thoughtful',
    text: "Like a diya pushes darkness away, a little cyber awareness shields our entire fraternity.",
    emoji: "🪔✨"
  },
  {
    id: 'q3',
    category: 'awareness-funny',
    text: "True awareness is knowing that not all festive links come with actual Kaju Katli!",
    emoji: "🥮⚠️"
  },
  {
    id: 'q4',
    category: 'awareness-thoughtful',
    text: "The strongest firewall ever built is human awareness. Guard your mind, guard your community.",
    emoji: "🧠🛡️"
  },
  {
    id: 'q5',
    category: 'awareness-funny',
    text: "Don't share your OTP with anyone — even if they promise you lifetime free Diwali sweets!",
    emoji: "🍬🚫"
  },
  {
    id: 'q6',
    category: 'awareness-thoughtful',
    text: "In a world of digital shadows, be the diya that lights the path to safety and trust.",
    emoji: "🌟🔒"
  },
  {
    id: 'q7',
    category: 'awareness-funny',
    text: "Burst eco-safe crackers with joy, but never let anyone burst through your multi-factor auth!",
    emoji: "💥🛡️"
  },
  {
    id: 'q8',
    category: 'awareness-thoughtful',
    text: "Vigilance is not suspicion; it is love and responsibility for the people we cherish.",
    emoji: "🪔❤️"
  },
  {
    id: 'q9',
    category: 'awareness-funny',
    text: "Lock your laptop screen before grabbing that samosa — insider sweet-threats are real!",
    emoji: "🥟👀"
  },
  {
    id: 'q10',
    category: 'awareness-thoughtful',
    text: "A single careless click can cause a blackout; a single mindful moment protects thousands.",
    emoji: "💡🕊️"
  },
  {
    id: 'q11',
    category: 'awareness-funny',
    text: "Update your software like Mom cleans the house before Diwali — thoroughly and without excuses!",
    emoji: "🧹💻"
  },
  {
    id: 'q12',
    category: 'awareness-thoughtful',
    text: "Zero Trust with suspicious links, Infinite Trust with the CyberFrat family.",
    emoji: "🤝✨"
  },
  {
    id: 'q13',
    category: 'awareness-funny',
    text: "Phishers don't take holidays! Think twice before clicking 'Claim your ₹5000 Diwali gift'.",
    emoji: "🎁🛑"
  },
  {
    id: 'q14',
    category: 'awareness-thoughtful',
    text: "May Goddess Lakshmi bring abundance, and your sharp vigilance keep all intruders away.",
    emoji: "💰🧱"
  },
  {
    id: 'q15',
    category: 'awareness-funny',
    text: "Protect your digital identity like Grandma protects the secret family laddu recipe!",
    emoji: "👵🍪"
  },
  {
    id: 'q16',
    category: 'awareness-thoughtful',
    text: "Light dissolves darkness. Knowledge dissolves fear. Happy, mindful, and secure Diwali!",
    emoji: "🪔🌟"
  },
  {
    id: 'q17',
    category: 'awareness-funny',
    text: "Backup your critical data like Dad backups emergency festive cash in his secret drawer!",
    emoji: "📦💵"
  },
  {
    id: 'q18',
    category: 'awareness-thoughtful',
    text: "Festivals unite hearts; cyber hygiene safeguards them. Wishing you radiant peace and security.",
    emoji: "🛡️🪔"
  }
];

export function getRandomQuote(): CuteQuote {
  const index = Math.floor(Math.random() * CUTE_FUNNY_QUOTES.length);
  return CUTE_FUNNY_QUOTES[index];
}
