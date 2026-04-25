import React from "react";
import { Droplets, Globe, MessageSquare, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// GitHub SVG (Twitter/Github removed in this lucide-react version)
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const EcosystemLinks = [
  {
    icon: <Droplets style={{ width: 20, height: 20 }} />,
    text: "Antigravity Faucet",
    href: "https://testnet-faucet.genlayer.foundation/",
  },
  {
    icon: <Globe style={{ width: 20, height: 20 }} />,
    text: "Official Website",
    href: "https://www.genlayer.com/",
  },
  {
    icon: <X style={{ width: 20, height: 20 }} />,
    text: "GenLayer Twitter",
    href: "https://x.com/GenLayer",
  },
  {
    icon: <MessageSquare style={{ width: 20, height: 20 }} />,
    text: "Discord Community",
    href: "https://discord.gg/At59nyxx",
  },
  {
    icon: <GithubIcon />,
    text: "GenLayer Simulator",
    href: "https://github.com/yeagerai/genlayer-simulator",
  },
];

export function GenDomainsLogo() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, position: "relative", zIndex: 10 }}>
            {/* GenLayer triangular icon */}
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #b040fb 0%, #7c3aed 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 16px rgba(176,64,251,0.5)",
              flexShrink: 0, padding: 5,
            }}>
              <svg viewBox="0 0 100 100" fill="none" style={{ width: "100%", height: "100%" }}>
                <polygon points="0,95 38,5 50,30 20,95" fill="#000" />
                <polygon points="100,95 62,5 50,30 80,95" fill="#000" />
                <polygon points="50,32 62,55 50,72 38,55" fill="#000" />
                <polygon points="38,5 50,30 38,55 22,90" fill="#22d3ee" />
                <polygon points="62,5 50,30 62,55 78,90" fill="#22d3ee" />
              </svg>
            </div>

            {/* Wordmark */}
            <span style={{
              fontSize: 20,
              fontWeight: 800,
              background: "linear-gradient(135deg, #b040fb 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              filter: "drop-shadow(0 0 10px rgba(176,64,251,0.4))",
              fontFamily: "Inter, sans-serif",
              transition: "filter 0.2s",
            }}>
              GenDomains
            </span>
          </div>
        </TooltipTrigger>

        {/* ── Vertical dropdown panel ── */}
        <TooltipContent
          side="bottom"
          sideOffset={12}
          align="start"
          style={{
            padding: 6,
            background: "rgba(5, 0, 18, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(176, 64, 251, 0.25)",
            borderRadius: 14,
            boxShadow: "0 0 40px rgba(176,64,251,0.2), 0 12px 40px rgba(0,0,0,0.7)",
            width: 220,
            zIndex: 9999,
            outline: "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: 4 }}>
            {EcosystemLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: "#9ca3af",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(176,64,251,0.12)";
                  e.currentTarget.style.color = "#c084fc";
                  e.currentTarget.querySelector(".link-text").style.color = "#e9d5ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca3af";
                  e.currentTarget.querySelector(".link-text").style.color = "rgba(255,255,255,0.85)";
                }}
              >
                {/* Icon */}
                <div style={{ display: "flex", alignItems: "center", color: "inherit", flexShrink: 0, transition: "color 0.2s" }}>
                  {link.icon}
                </div>

                {/* Label */}
                <span
                  className="link-text"
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: "Inter, sans-serif",
                    color: "rgba(255,255,255,0.85)",
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.text}
                </span>
              </a>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
