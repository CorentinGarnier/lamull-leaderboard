import { Space_Grotesk, Bungee } from "next/font/google";
import "./globals.css";

const text = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--f-text" });
// Police d'enseigne de casino pour les titres, chiffres et boutons.
const display = Bungee({ subsets: ["latin"], weight: "400", variable: "--f-logo" });

export const metadata = { title: "LaMull | Leaderboard", description: "Classement mensuel en direct" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${text.variable} ${display.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}