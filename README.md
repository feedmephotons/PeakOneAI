# SaaSX Platform - All-in-One Communication & AI Productivity Suite

A comprehensive SaaS platform combining communication tools, AI assistance, project management, and cloud storage - inspired by the convergence of WhatsApp, Zoom, Asana, and Dropbox with integrated AI capabilities.

## Features

### 🎨 Modern UI with Customizable Theme
- **CSS Variables**: Easily customizable design system using CSS custom properties
- **Dark Mode Ready**: Pre-configured dark mode theme variables
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Custom Animations**: Smooth transitions and micro-interactions

### 📱 Main Features (Based on PDF Specifications)

#### Communication Layer
- Secure messaging, voice calls, and video conferencing
- End-to-end encrypted messaging
- Group chats and one-on-one calls
- Voice command integration

#### AI Assistant
- Real-time meeting transcription
- Auto-summaries and key takeaways
- Task extraction from conversations
- Smart knowledge base
- Multi-language support

#### Project Management Suite
- Task automation from meetings
- Shared workspaces with boards, lists, calendars
- Team dashboards with metrics
- Progress tracking and workload management

#### Cloud Storage Hub
- File and media storage
- Smart AI-powered organization
- Automatic file tagging and categorization
- Seamless attachment syncing

#### Integrations
- Slack, Microsoft Teams
- Gmail, Outlook
- Salesforce
- Third-party marketplace

## Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Styling**: Tailwind CSS with custom CSS variables
- **Language**: TypeScript
- **UI Components**: Custom React components
- **Icons**: Emoji icons (can be replaced with icon libraries)

## Project Structure

```
saasx-platform/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with CSS variables
│   └── page.tsx           # Main dashboard page
├── components/
│   ├── dashboard/         # Dashboard components
│   │   └── DashboardWidgets.tsx
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   ├── ResponsiveLayout.tsx
│   │   └── Sidebar.tsx
│   └── ui/               # Reusable UI components
│       └── MobileMenu.tsx
└── public/               # Static assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd saasx-platform
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Customization

### Theme Colors
Edit the CSS variables in `/app/globals.css`:
```css
:root {
  --brand-primary: 99 102 241;    /* Indigo */
  --brand-secondary: 139 92 246;  /* Purple */
  --brand-accent: 59 130 246;     /* Blue */
  /* ... more variables */
}
```

### Sidebar Menu
Modify the menu structure in `/components/layout/Sidebar.tsx`:
```typescript
const menuItems: MenuItem[] = [
  // Add or modify menu items here
];
```

### Dashboard Widgets
Customize dashboard cards and widgets in `/components/dashboard/DashboardWidgets.tsx`

## Key Features Implementation

### Responsive Design
- Mobile menu for screens < 1024px
- Collapsible sidebar on desktop
- Responsive grid layouts
- Touch-friendly interface

### State Management
- Currently using React useState for local state
- Ready for integration with state management libraries (Redux, Zustand, etc.)

### AI Integration Points
- Meeting transcription placeholder
- Task extraction interface
- Smart search functionality
- AI insights dashboard widget

## Future Enhancements

Based on the product roadmap:
- [ ] WebRTC integration for video/voice calls
- [ ] Real-time messaging with WebSockets
- [ ] AI model integration (Whisper, GPT)
- [ ] File upload and management system
- [ ] User authentication and authorization
- [ ] Team collaboration features
- [ ] Analytics and reporting dashboard
- [ ] Third-party integrations

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

Private - Peak One AI

## Support

For support or questions about the SaaSX platform, please contact the development team.