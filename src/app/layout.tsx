import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { RequirementsProvider } from "@/contexts/RequirementsContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
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
        <CopilotKit publicApiKey="ck_pub_5acb553c22b36526ed920447b52f0b24" showDevConsole={true}>
          <ThemeProvider>
            <AuthProvider>
              <ProjectProvider>
                <RequirementsProvider>
                  <SettingsProvider>
                    {children}
                  </SettingsProvider>
                </RequirementsProvider>
              </ProjectProvider>
            </AuthProvider>
          </ThemeProvider>
        </CopilotKit>
      </body>
    </html>
  );
}
