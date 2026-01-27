import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { RequirementsProvider } from "@/contexts/RequirementsContext";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";

export const metadata: Metadata = {
  title: "Conjectural Assist",
  description: "AI-powered requirements management",
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
        <CopilotKit runtimeUrl="/api/copilotkit" agent="sample_agent" showDevConsole={true}>
          <ThemeProvider>
            <AuthProvider>
              <ProjectProvider>
                <RequirementsProvider>
                  {children}
                </RequirementsProvider>
              </ProjectProvider>
            </AuthProvider>
          </ThemeProvider>
        </CopilotKit>
      </body>
    </html>
  );
}
