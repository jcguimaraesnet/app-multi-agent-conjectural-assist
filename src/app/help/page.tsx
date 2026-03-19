"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import PageTitle from "@/components/ui/PageTitle";
import { Minus, Plus, Mail } from "lucide-react";

const categories = [
  "Getting Started",
  "Projects",
  "Requirements",
  "AI Agents",
  "Account & Settings",
];

const faqData = [
  {
    category: "Getting Started",
    question: "How do I get started with CONREQ Multi-Agent?",
    answer:
      "Getting started is simple! First, create a new project from the Projects page. Then, add your initial requirements to the project. Once you have requirements in place, you can use the AI agents to help you refine, analyze, and generate conjectural requirements based on your inputs.",
  },
  {
    category: "Getting Started",
    question: "What is a conjectural requirement?",
    answer:
      "A conjectural requirement is a requirement that is generated or suggested by AI agents based on your existing requirements. These are hypotheses about what additional requirements might be needed, helping you explore uncertain or incomplete areas of your specification.",
  },
  {
    category: "Projects",
    question: "How do I create and manage projects?",
    answer:
      "Navigate to the Projects page from the sidebar. Click the 'New Project' button to create a project. You can give it a name and description. Each project serves as a container for organizing your requirements and conjectural analyses.",
  },
  {
    category: "Requirements",
    question: "How do I add requirements to a project?",
    answer:
      "Open a project and navigate to its Requirements page. You can add requirements manually by clicking 'Add Requirement' or use the AI chat assistant to help you draft them. Requirements can be edited, moved between statuses on the Kanban board, and analyzed by the AI agents.",
  },
  {
    category: "Requirements",
    question: "What are the different requirement statuses?",
    answer:
      "Requirements follow a Kanban workflow with statuses like 'To Do', 'In Progress', and 'Done'. You can drag and drop requirements between columns on the board to update their status as you refine them.",
  },
  {
    category: "AI Agents",
    question: "How do the AI agents work?",
    answer:
      "The multi-agent system consists of specialized AI agents that collaborate to help you with requirements engineering. You can interact with them through the chat interface. They can analyze your requirements, suggest improvements, identify gaps, and generate conjectural requirements to address uncertainty.",
  },
  {
    category: "AI Agents",
    question: "Can I customize the AI agent behavior?",
    answer:
      "Yes! Go to Settings to configure options like batch mode, the number of requirements generated per batch, and whether brief descriptions are required. These settings allow you to tailor the AI agent behavior to your workflow preferences.",
  },
  {
    category: "Account & Settings",
    question: "How do I change my account settings?",
    answer:
      "Click on your profile icon in the top-right corner of the header, or navigate to Settings from the sidebar. From there, you can update your profile information, adjust AI agent preferences, and configure application behavior.",
  },
];

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = activeCategory
    ? faqData.filter((faq) => faq.category === activeCategory)
    : faqData;

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-7.5rem)]">
        {/* Page title — fixed at top */}
        <div className="shrink-0">
          <PageTitle
            title="Help"
            subtitle="Everything you need to know about features, usage, and troubleshooting."
          />
        </div>

        {/* Tags + FAQ — scrollable middle area */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8">
          {/* Category Tags */}
          <div className="flex flex-col gap-2 w-56 shrink-0">
            <button
              onClick={() => {
                setActiveCategory(null);
                setOpenIndex(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors text-left ${
                activeCategory === null
                  ? "bg-primary text-black"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All Topics
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setOpenIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors text-left ${
                  activeCategory === category
                    ? "bg-primary text-black"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion — own scroll */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-2 styled-scrollbar">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFaqs.map((faq, index) => (
                <div key={index}>
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between py-5 text-left"
                  >
                    <span className="text-base font-medium text-gray-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    {openIndex === index ? (
                      <Minus className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                    ) : (
                      <Plus className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0" />
                    )}
                  </button>
                  {openIndex === index && (
                    <p className="pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Still have questions? — fixed at bottom */}
        <div className="shrink-0 mt-6 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm p-8 relative overflow-hidden">
          {/* Contact-themed background decoration */}
          <svg className="absolute inset-0 w-full h-full text-gray-400 dark:text-gray-500" viewBox="0 0 800 130" preserveAspectRatio="none" style={{ opacity: 0.08 }}>
            <defs>
              <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
                <stop offset="40%" stopColor="white" stopOpacity="0" />
                <stop offset="100%" stopColor="white" stopOpacity="1" />
              </linearGradient>
              <mask id="fadeMask">
                <rect width="800" height="130" fill="url(#fadeRight)" />
              </mask>
            </defs>
            <g mask="url(#fadeMask)">
              {/* Envelope */}
              <rect x="420" y="15" width="60" height="42" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
              <polyline points="420,15 450,40 480,15" fill="none" stroke="currentColor" strokeWidth="3" />
              {/* Chat bubble */}
              <rect x="520" y="55" width="65" height="45" rx="10" fill="none" stroke="currentColor" strokeWidth="3" />
              <polygon points="530,100 540,115 550,100" fill="currentColor" />
              <line x1="533" y1="70" x2="572" y2="70" stroke="currentColor" strokeWidth="2.5" />
              <line x1="533" y1="82" x2="560" y2="82" stroke="currentColor" strokeWidth="2.5" />
              {/* @ symbol */}
              <circle cx="670" cy="45" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
              <circle cx="670" cy="45" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <path d="M680,45 C680,58 670,62 660,56" fill="none" stroke="currentColor" strokeWidth="2.5" />
              {/* Send / paper plane */}
              <polygon points="500,10 540,28 508,34" fill="currentColor" />
              <polygon points="508,34 540,28 522,52" fill="currentColor" opacity="0.6" />
              {/* Phone */}
              <rect x="620" y="75" width="28" height="48" rx="5" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <line x1="630" y1="113" x2="642" y2="113" stroke="currentColor" strokeWidth="2.5" />
              {/* Dots */}
              <circle cx="730" cy="85" r="4" fill="currentColor" />
              <circle cx="750" cy="85" r="4" fill="currentColor" />
              <circle cx="770" cy="85" r="4" fill="currentColor" />
              {/* Lines */}
              <rect x="710" y="20" width="50" height="6" rx="3" fill="currentColor" />
              <rect x="710" y="35" width="35" height="6" rx="3" fill="currentColor" />
            </g>
          </svg>

          <div className="relative">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Still have questions?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-xl">
              Contact me if you have any questions about this research.
            </p>
            <a
              href="mailto:jcguimaraes@cos.ufrj.br"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-primary text-black font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Mail className="w-4 h-4" />
              jcguimaraes@cos.ufrj.br
            </a>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
