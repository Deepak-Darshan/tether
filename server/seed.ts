import { db } from "./db";
import { users } from "@shared/schema";

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16) + password.length.toString(16);
}

const demoUsers = [
  {
    username: "alexchen",
    password: hashPassword("demo12345"),
    name: "Alex Chen",
    headline: "Senior Software Engineer at Google",
    bio: "Passionate about building scalable systems and mentoring developers. 10+ years in tech, specializing in distributed systems and cloud architecture.",
    skills: "TypeScript, Go, Kubernetes, AWS, System Design",
  },
  {
    username: "sarahj",
    password: hashPassword("demo12345"),
    name: "Sarah Johnson",
    headline: "Product Manager at Stripe",
    bio: "Building the future of payments. Previously at Meta and Uber. Love connecting with fellow PMs and engineers.",
    skills: "Product Strategy, Agile, Data Analysis, UX Research",
  },
  {
    username: "mikepatel",
    password: hashPassword("demo12345"),
    name: "Mike Patel",
    headline: "Startup Founder & Angel Investor",
    bio: "3x founder with 2 successful exits. Now investing in early-stage startups and helping founders scale their businesses.",
    skills: "Fundraising, Leadership, Growth Strategy, B2B SaaS",
  },
  {
    username: "emilywang",
    password: hashPassword("demo12345"),
    name: "Emily Wang",
    headline: "UX Design Lead at Airbnb",
    bio: "Creating delightful user experiences. Passionate about accessibility and inclusive design. Speaker at design conferences worldwide.",
    skills: "Figma, User Research, Design Systems, Prototyping",
  },
  {
    username: "davidkim",
    password: hashPassword("demo12345"),
    name: "David Kim",
    headline: "Machine Learning Engineer at OpenAI",
    bio: "Working on the cutting edge of AI. PhD in Computer Science from MIT. Open to collaborating on innovative ML projects.",
    skills: "Python, PyTorch, LLMs, Deep Learning, Research",
  },
  {
    username: "lisagreen",
    password: hashPassword("demo12345"),
    name: "Lisa Green",
    headline: "Marketing Director at HubSpot",
    bio: "B2B marketing expert with 15 years experience. Helping companies tell their story and connect with their audience.",
    skills: "Content Marketing, SEO, Brand Strategy, Analytics",
  },
  {
    username: "jameslee",
    password: hashPassword("demo12345"),
    name: "James Lee",
    headline: "VP of Engineering at Shopify",
    bio: "Building world-class engineering teams. Focused on developer experience and technical excellence.",
    skills: "Engineering Leadership, Ruby, React, Team Building",
  },
  {
    username: "racheltan",
    password: hashPassword("demo12345"),
    name: "Rachel Tan",
    headline: "Data Scientist at Netflix",
    bio: "Using data to drive decisions. Passionate about machine learning and its applications in entertainment technology.",
    skills: "Python, SQL, Machine Learning, A/B Testing, Statistics",
  },
];

export async function seedDatabase() {
  console.log("Checking for existing demo users...");

  for (const user of demoUsers) {
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, user.username),
    });

    if (!existing) {
      await db.insert(users).values(user);
      console.log(`Created demo user: ${user.name}`);
    }
  }

  console.log("Database seeding complete.");
}

seedDatabase().catch(console.error);
