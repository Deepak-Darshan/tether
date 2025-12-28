import { db } from "../server/db";
import { users } from "../shared/schema";
import crypto from "crypto";

const hashPassword = (password: string) => crypto.createHash("sha256").update(password).digest("hex");

const seedUsers = [
  {
    username: "alex_builder",
    passwordHash: hashPassword("password123"),
    name: "Alex Chen",
    headline: "Full-Stack Developer & Startup Founder",
    bio: "Building the future of web3 payments. Previously at Stripe and Google. Looking for co-founders and early team members.",
    skills: ["React", "Node.js", "TypeScript", "Web3", "Solidity"],
    lookingFor: ["Co-founders", "Backend Engineers", "Investors"],
    avatarUrl: null,
  },
  {
    username: "maya_design",
    passwordHash: hashPassword("password123"),
    name: "Maya Rodriguez",
    headline: "Product Designer at Figma",
    bio: "Passionate about design systems and accessibility. Love helping startups build beautiful, usable products from day one.",
    skills: ["UI/UX Design", "Figma", "Design Systems", "User Research"],
    lookingFor: ["Startup Projects", "Mentees", "Speaking Opportunities"],
    avatarUrl: null,
  },
  {
    username: "james_vc",
    passwordHash: hashPassword("password123"),
    name: "James Wilson",
    headline: "Partner at Sequoia Capital",
    bio: "Investing in the next generation of founders. Focus on AI, fintech, and developer tools. Always happy to chat.",
    skills: ["Venture Capital", "Strategy", "Fintech", "AI/ML"],
    lookingFor: ["Founders", "Deal Flow", "Industry Experts"],
    avatarUrl: null,
  },
  {
    username: "sarah_ai",
    passwordHash: hashPassword("password123"),
    name: "Sarah Kim",
    headline: "AI Research Scientist at OpenAI",
    bio: "Working on making AI safer and more beneficial. PhD from Stanford. Looking to collaborate with builders who want to use AI responsibly.",
    skills: ["Machine Learning", "Python", "PyTorch", "NLP", "Computer Vision"],
    lookingFor: ["AI Startups", "Research Collaborations", "Advisors"],
    avatarUrl: null,
  },
  {
    username: "marcus_growth",
    passwordHash: hashPassword("password123"),
    name: "Marcus Thompson",
    headline: "Head of Growth at Notion",
    bio: "Scaled Notion from 1M to 30M users. Love helping early-stage startups figure out their growth engine.",
    skills: ["Growth Marketing", "Analytics", "SEO", "Content Strategy"],
    lookingFor: ["Advisory Roles", "Angel Investments", "Speakers"],
    avatarUrl: null,
  },
];

async function seed() {
  console.log("Seeding database...");
  for (const user of seedUsers) {
    try {
      await db.insert(users).values(user).onConflictDoNothing();
      console.log("Created user:", user.name);
    } catch (error) {
      console.log("User may already exist:", user.username);
    }
  }
  console.log("Done!");
  process.exit(0);
}

seed();
