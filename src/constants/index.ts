import { Requirement, RequirementType, Project } from '@/types';

export const MOCK_REQUIREMENTS: Requirement[] = [
  {
    id: "REQ-001",
    title: "User Authentication System",
    description: "Integration with OAuth2 providers",
    type: RequirementType.Functional,
    author: "Sarah Jenkins"
  },
  {
    id: "REQ-002",
    title: "API Response Time Latency",
    description: "Must respond within 200ms",
    type: RequirementType.NonFunctional,
    author: "Mike Chen"
  },
  {
    id: "REQ-003",
    title: "Predictive AI Text Analysis",
    description: "Potential future implementation",
    type: RequirementType.Conjectural,
    author: "Rahul Sharma"
  },
  {
    id: "REQ-004",
    title: "Data Encryption At Rest",
    description: "AES-256 standard compliance",
    type: RequirementType.Functional,
    author: "Sarah Jenkins"
  },
  {
    id: "REQ-005",
    title: "Legacy System Bridge",
    description: "Connect to COBOL mainframe",
    type: RequirementType.Conjectural,
    author: "David Ross"
  },
  {
    id: "REQ-006",
    title: "User Interface Redesign",
    description: "Improve UX for mobile devices",
    type: RequirementType.Functional,
    author: "Alice Johnson"
  },
  {
    id: "REQ-007",
    title: "Database Performance Tuning",
    description: "Optimize queries for large datasets",
    type: RequirementType.NonFunctional,
    author: "Mike Chen"
  },
  {
    id: "REQ-008",
    title: "AI-driven User Anomaly Detection",
    description: "Detect unusual user behavior",
    type: RequirementType.Conjectural,
    author: "Rahul Sharma"
  }
];

export const MOCK_PROJECTS = [
  "Project Selector",
  "Project A",
  "Project B",
  "Project C"
];

export const MOCK_PROJECTS_LIST: Project[] = [
  {
    id: "PRJ-001",
    title: "E-Commerce Platform",
    description: "Online shopping platform with payment integration",
    author: "Sarah Jenkins"
  },
  {
    id: "PRJ-002",
    title: "Healthcare Management System",
    description: "Patient records and appointment scheduling",
    author: "Mike Chen"
  },
  {
    id: "PRJ-003",
    title: "Banking Mobile App",
    description: "Digital banking solution for retail customers",
    author: "Rahul Sharma"
  },
  {
    id: "PRJ-004",
    title: "Inventory Control System",
    description: "Warehouse and stock management solution",
    author: "Alice Johnson"
  },
  {
    id: "PRJ-005",
    title: "Learning Management Platform",
    description: "Educational content delivery and tracking",
    author: "David Ross"
  }
];

export const AI_MODELS = [
  "OpenAI GPT-4",
  "Anthropic Claude 3",
  "Meta Llama 3"
];
