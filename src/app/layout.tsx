import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { RequirementsProvider } from "@/contexts/RequirementsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import AuthHashErrorHandler from "@/components/auth/AuthHashErrorHandler";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";

export const metadata: Metadata = {
  title: "CONREQ Multi-Agent | AI-powered Requirements Specification",
  description: "An approach to generating software requirements specifications with uncertainty using a multi-agent AI system. PESC/UFRJ.",
};

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
          <AuthHashErrorHandler />
          <ThemeProvider>
            <AuthProvider>
              <ProjectProvider>
                <RequirementsProvider>
                  <SettingsProvider>
                    <OnboardingWrapper>
                      {children}
                    </OnboardingWrapper>
                  </SettingsProvider>
                </RequirementsProvider>
              </ProjectProvider>
            </AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
