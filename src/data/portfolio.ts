export const profile = {
  name: "Chris Paolo Caral",
  fullName: "Chris Paolo Sumilang Caral",
  role: "Computer Engineer & Software Engineer",
  location: "Cebu, Philippines",
  email: "cchrispaolo@gmail.com",
  github: "https://github.com/chris-rizu",
  linkedin: "https://www.linkedin.com/in/chris-paolo-caral-0466a1236/",
  resume: "/resume.pdf",
  education: {
    degree: "B.S. Computer Engineering",
    school: "Cebu Technological University",
  },
  summary:
    "Computer Engineer and Software Engineer with a track record in full-stack web development, system optimization, and user-centric applications — from commuter navigation tools to complete hotel management systems.",
};

export type Project = {
  title: string;
  kind: string;
  description: string;
  tech: string[];
  image: string;
  link?: string;
};

export const projects: Project[] = [
  {
    title: "SugboGas",
    kind: "Fuel Price Tracker",
    description:
      "Community-driven app for Cebu drivers to track, compare, and report real-time fuel prices across local gas stations.",
    tech: ["Web", "Real-time", "Community"],
    image: "/images/projects/sugbogas.webp",
    link: "https://sugbogas.me",
  },
  {
    title: "GovHub",
    kind: "Government Documents",
    description:
      "Exact, real-time checklists and verified updates for Cebu government documents, so citizens never get turned away for a missing requirement.",
    tech: ["Web", "Real-time", "Community"],
    image: "/images/projects/govhub.webp",
    link: "https://gov-hub.live",
  },
  {
    title: "Banly (Biz-Sapo)",
    kind: "WordPress Development",
    description:
      "Main WordPress developer for Biz-Sapo, an accounting and bookkeeping outsourcing service for SMEs.",
    tech: ["WordPress", "PHP", "MySQL"],
    image: "/images/projects/banly.webp",
    link: "https://biz-saku.com/",
  },
  {
    title: "Hotel Management System",
    kind: "Full-stack App",
    description:
      "Hotel operations app with a real-time room status dashboard and automated billing.",
    tech: ["C++", "PostgreSQL", "Qt Framework"],
    image: "/images/projects/hotelmanagement.webp",
  },
  {
    title: "ReceiptBot",
    kind: "Discord Bot",
    description:
      "Node.js Discord bot that processes receipt images, using Gemini for text extraction.",
    tech: ["Node.js", "Discord.js", "Gemini"],
    image: "/images/projects/receiptbot.webp",
  },
  {
    title: "Kana Quest",
    kind: "Gamified Web App",
    description:
      "Interactive web game that helps students master Hiragana and Katakana.",
    tech: ["React", "Next.js", "Gamification"],
    image: "/images/projects/kanaquest.webp",
    link: "https://v0-kana-quest-game.vercel.app/",
  },
  {
    title: "Logistics Flow System",
    kind: "Container Tracker",
    description:
      "Internal dashboard that streamlines back-office operations and container management.",
    tech: ["Dashboard", "Internal Tool"],
    image: "/images/projects/logisticsflow.webp",
  },
  {
    title: "NexusShift",
    kind: "WFH Monitoring",
    description:
      "Work-from-home monitoring system that captures worker screens whenever they switch tabs.",
    tech: ["Monitoring", "Remote Work"],
    image: "/images/projects/nexusshift.webp",
  },
  {
    title: "Material Control",
    kind: "Inventory & Receipts",
    description:
      "Tracks purchase receipts and materials bought, giving the company transparency into spending.",
    tech: ["Inventory", "Receipts"],
    image: "/images/projects/materialcontrol.webp",
  },
  {
    title: "Electrical Billing System",
    kind: "Java Console App",
    description:
      "Console application built on core OOP fundamentals to automate monthly electricity bill calculations.",
    tech: ["Java", "OOP"],
    image: "/images/projects/electricalbilling.webp",
  },
  {
    title: "Lakbai",
    kind: "Commuter Navigation",
    description: "Cebu jeepney navigation tool providing route guidance for commuters.",
    tech: ["Next.js", "React", "Tailwind CSS"],
    image: "/images/projects/lakbai.webp",
    link: "https://lakbai-pi.vercel.app/",
  },
  {
    title: "ChronicleBot",
    kind: "Automation",
    description: "Discord bot for n8n automation workflow integration.",
    tech: ["Node.js", "Discord.js", "n8n"],
    image: "/images/projects/chroniclebot.webp",
  },
  {
    title: "Squirtle Robot",
    kind: "Robotics",
    description: "Autonomous plant-watering robot with sensor integration.",
    tech: ["Arduino", "C++", "Sensors"],
    image: "/images/projects/squirtle.webp",
  },
];

export const projectFilters = ["All", "Web apps", "Automation", "Internal tools", "Software", "Hardware"] as const;

/** Gallery filter each project belongs to, keyed by title. */
export const projectCategory: Record<string, (typeof projectFilters)[number]> = {
  SugboGas: "Web apps",
  GovHub: "Web apps",
  "Banly (Biz-Sapo)": "Web apps",
  "Hotel Management System": "Software",
  ReceiptBot: "Automation",
  "Kana Quest": "Web apps",
  "Logistics Flow System": "Internal tools",
  NexusShift: "Internal tools",
  "Material Control": "Internal tools",
  "Electrical Billing System": "Software",
  Lakbai: "Web apps",
  ChronicleBot: "Automation",
  "Squirtle Robot": "Hardware",
};

export const skillGroups = [
  { label: "Languages", pin: "P1", skills: ["JavaScript", "TypeScript", "Python", "C/C++", "Java"] },
  { label: "Web", pin: "P2", skills: ["React", "Next.js", "Node.js", "HTML/CSS", "Tailwind CSS", "WordPress"] },
  { label: "Data", pin: "P3", skills: ["PostgreSQL", "MySQL", "Supabase", "Microsoft Access", "Excel", "Google Sheets"] },
  { label: "Automation & Tools", pin: "P4", skills: ["n8n.io", "AI Workflows", "Git", "GitHub", "Notion"] },
  { label: "Hardware", pin: "P5", skills: ["Arduino", "Raspberry Pi", "PIC16F84A", "Sensors", "PCB Design", "Proteus", "Simulink"] },
];

export const experience = [
  {
    role: "Software Engineer Intern",
    company: "CIS (合同会社)",
    period: "2025 – Present",
    current: true,
    description: "Developing clean, reliable code for company projects, improving the tools teams use across CIS.",
  },
  {
    role: "QA Specialist & SaaS Developer",
    company: "Freelance",
    period: "2025 – 2026",
    current: false,
    description: "Encoded project data, reports, and documentation into the company's system to keep digital records organized.",
  },
  {
    role: "Data Entry Specialist",
    company: "EWU Media LLC",
    period: "2024 – 2025",
    current: false,
    description: "Handled data input and management, maintaining and updating company records with precision.",
  },
  {
    role: "Civil Engineer Assistant",
    company: "Office of the Building Official",
    period: "Apr – Jun 2022",
    current: false,
    description: "Coordinated the blueprint approval process, facilitating sign-offs from architects and civil engineers.",
  },
];

export const certifications = [
  {
    name: "Data Analytics Level III",
    issuer: "TESDA · 120 hours",
    date: "May 2026",
    detail: "Advanced data processing, analysis, and visualization.",
  },
  {
    name: "HTML Fundamentals",
    issuer: "CodeCred",
    date: "Mar 2026",
    detail: "Accessible, standards-compliant web pages.",
  },
  {
    name: "Data Analytics Essentials",
    issuer: "Cisco Networking Academy",
    date: "Dec 2025",
    detail: "Data life cycle, Tableau visualization, data cleaning.",
    link: "https://www.credly.com/badges/8a148a83-6aac-4c10-a686-f8dbe8be86a8/public_url",
  },
];

export const awards = [
  {
    name: "Cebu Solution Fest",
    result: "Finalist",
    date: "Jun 2026",
    detail: "Built and deployed a working prototype under strict deadlines for a panel of industry judges.",
  },
  {
    name: "Solana x AI Hackathon",
    result: "3rd Place",
    date: "Oct 2024",
    detail: "A project at the intersection of AI and blockchain on Solana.",
  },
];
