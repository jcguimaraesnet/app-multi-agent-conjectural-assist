import { Requirement, RequirementType } from '@/types';

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

export const AI_MODELS = [
  "OpenAI GPT-4",
  "Anthropic Claude 3",
  "Meta Llama 3"
];
