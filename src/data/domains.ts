import type { Bi } from "@/lib/types";

/**
 * The capability map's five axes.
 *
 * Nothing here asserts a skill level. Each domain is a bag of tags, and the scene counts
 * how many real pieces of work carry each one — so every number on that screen is a count
 * of evidence, and a tag that appears in no work simply vanishes from the map rather than
 * padding it. Change the grouping here and the scene re-derives itself.
 *
 * AI leads: the order here is the order the capability map reads in, and the reel now opens
 * on the AI works, so the map opens on the axis they prove.
 */
export type Domain = {
  readonly name: Bi;
  readonly tags: readonly string[];
};

export const DOMAINS = [
  {
    name: { ko: "AI · 데이터", en: "AI & Data" },
    tags: [
      "AI", "Deep Learning", "Computer Vision", "Segmentation", "Pose Generation",
      "Object Detection", "Detection", "Vision", "TTS", "Python", "Data Viz", "Timeline", "Evidence",
      "Big Data", "Data", "Dashboard", "Streamlit", "Plotly", "Research", "Experiment",
    ],
  },
  {
    name: { ko: "자율주행 · 모빌리티", en: "Autonomy & Mobility" },
    tags: [
      "ROS2", "Nav2", "Gazebo", "CARLA", "Pixhawk", "Mission Planner", "Autonomous",
      "Mobility", "Vehicle", "EV", "Drone", "Arduino", "Control", "Simulation", "AirSim", "Safety",
    ],
  },
  {
    name: { ko: "하드웨어 · 펌웨어", en: "Hardware & Firmware" },
    tags: [
      "PCB", "Altium", "ESP32", "Firmware", "3D", "CATIA", "Hardware", "Prototype",
      "Sensor", "Peltier", "Cooling", "Energy", "ESS", "Robot", "Robot Arm", "IoT",
    ],
  },
  {
    name: { ko: "소프트웨어 · 웹 · 앱", en: "Software, Web & App" },
    tags: [
      "Next.js 15", "TypeScript", "Supabase", "FastAPI", "MariaDB", "Swift", "App", "Java",
      "Socket", "OOP", "C#", "Windows Forms", ".NET", "AWS", "Slack Bot", "Kakao Map API",
      "Linux", "GitHub", "UX", "Game UX", "Interactive", "Unreal Engine",
    ],
  },
  {
    name: { ko: "창업 · 사업화", en: "Venture & Commercialisation" },
    tags: [
      "Startup", "Upcycling", "Re:cap", "Product", "Commercialization", "Brand", "Goods",
      "Filament", "ESG", "Fintech", "Public Data", "Design", "Teamwork", "Instruction",
    ],
  },
] as const satisfies readonly Domain[];
