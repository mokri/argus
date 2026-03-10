# **App Name**: AegisCore Dashboard

## Core Features:

- AI Agent Project Management: Create, configure, and oversee AI agent projects through a guided three-step flow, specifying LLMs, frameworks, and optional vector databases.
- AI Blueprint Library: Explore and utilize pre-defined AI agent architecture patterns from a categorized library to jumpstart new projects.
- AI Framework Compiler: Translate abstract Aegis logic into concrete, framework-specific code (e.g., LangChain, CrewAI), leveraging a tool to generate tailored implementation details.
- AI Safety Scanning & Remediation: Execute on-demand safety scans, review detailed reports of identified vulnerabilities (like SQL Injection or loop risks), and apply suggested fixes to AI agents.
- Interactive Dashboard Views: Navigate dynamic views for projects, blueprints, safety scans, framework compilation, integrations, analytics, and settings via a responsive SPA interface.
- Integrated System Analytics: Gain insights into API usage, cost efficiency, and safety issue trends through summary cards and visually rich bar charts (without external libraries).
- Universal Command Palette & Notifications: Access system-wide search and quick actions via a ⌘K triggered command palette, and receive timely notifications for critical events and system updates.

## Style Guidelines:

- The chosen color palette evokes a professional, sophisticated, and high-tech feel, suitable for an engineering tool in a dark interface.
- Primary color: A vibrant indigo (`#6366F1`) (HSL: 239, 81%, 67%), used for key interactive elements like buttons, progress indicators, and active states. This bold color provides a strong contrast against the dark background.
- Backgrounds: The main background is a deep, desaturated blue-black (`#0A0A0F`) (HSL: 240, 19%, 5%). Complementary surfaces like the top bar and sidebar use a slightly lighter shade (`#0D0D14`), and card backgrounds are a dark grey (`#111118`). These tones maintain a consistent deep, serious mood.
- Functional accents: Clearly defined success (`#22C55E`), warning (`#F59E0B`), and danger (`#EF4444`) colors provide immediate visual feedback for status and alerts, standing out against the muted backgrounds.
- Text colors: Primary text uses a light, neutral off-white (`#F1F5F9`), while muted or secondary information utilizes a cool grey (`#64748B`), ensuring legibility and information hierarchy.
- The font 'Inter' (sans-serif) provides a clean, modern, and highly legible appearance across all text elements, suitable for a data-dense engineering dashboard. Note: currently only Google Fonts are supported.
- All icons will be implemented as inline SVG graphics, allowing for scalable, crisp visuals and easy color customization to match the accent palette and hover states.
- A classic three-column layout (top bar, sidebar, main content) ensures logical organization and clear navigation. Elements like the top bar and sidebar are sticky, with content responsively filling available space, designed for efficient information display.
- Smooth and snappy user experience is prioritized with consistent `150ms ease` transitions. Specific animations include fade-in for SPA content swaps, slide-in effects for panels (e.g., notifications, issue details), and subtle scale/opacity transitions for modals (e.g., command palette) to enhance interactivity.