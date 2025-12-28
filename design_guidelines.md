# Tether Design Guidelines

## Design Approach
**Aesthetic:** Dark Mode Futuristic/Cyberpunk Professional - a high-tech, polished interface with glassmorphic elements and neon accents.

## Color Palette
- **Backgrounds:** Deep dark (slate-950 or black) with subtle animated gradients or mesh gradients
- **Primary Actions:** Electric Cyan (#00f0ff) OR Neon Purple (#bc13fe) for buttons like "Connect"
- **Text:** White or very light grey (slate-200) for high readability
- **Card Backgrounds:** Translucent white/grey with blur effects (glassmorphism)
- **Borders:** Thin white borders on glass elements
- **Accents:** Glowing effects on interactive elements

## Typography
- **Hierarchy:** Clear distinction between headlines, body text, and labels
- **Hero Text:** Glowing gradient text effect for "Build the Future Together"
- **Body Text:** Clean, modern sans-serif in slate-200
- **Labels:** Floating labels that animate on focus
- **Readability:** High contrast against dark backgrounds

## Layout System
- **Spacing:** Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- **Mobile-First:** All layouts must scale from mobile up
- **Centering:** Primary actions and card stacks centered on viewport
- **Breathing Room:** Generous padding around glassmorphic cards

## Component Library

### Navigation
- Bottom navigation bar (mobile) with glowing active states
- Clean, minimal top bar for desktop

### Cards (Swipe Profiles)
- **Style:** High-tech ID badge aesthetic with glassmorphism
- **Background:** Translucent with backdrop-blur
- **Border:** Thin white/cyan glow
- **Content:** Avatar, name, headline, bio, skill chips
- **Animation:** Smooth drag gestures (Framer Motion required)

### Buttons
- **Primary:** Glowing effect on hover with cyan/purple accent
- **Secondary:** Subtle borders with hover glow
- **CTA:** "Enter App" button with prominent glow effect

### Form Inputs
- **Style:** Floating labels that animate upward on focus
- **Focus State:** Glowing border in primary color
- **Background:** Translucent with subtle blur

### Skill Tags/Chips
- **Style:** Small glowing chips with rounded corners
- **Colors:** Cyan or purple glow with translucent background
- **Border:** Thin accent border

### Match Overlay
- **Style:** Full-screen overlay with dramatic reveal
- **Animation:** "LINK ESTABLISHED" text with neon glow effect
- **Background:** Dark with animated gradient burst

### Chat Interface
- **Style:** Modern terminal or sleek messenger aesthetic
- **Message Bubbles:** Glassmorphic with sender/receiver distinction
- **Input:** Glowing focus state with cyber-inspired styling

## Icons
- **Library:** Lucide-React exclusively
- **Stroke:** Thin, clean strokes (1-1.5px weight)
- **Color:** Match interface (white/cyan/purple)

## Animations
- **Framework:** Framer Motion (required)
- **Card Swiping:** Smooth 60fps drag gestures with spring physics
- **Page Transitions:** Seamless, no jarring loads
- **Hover States:** Subtle glow and scale effects
- **Match Animation:** Dramatic full-screen reveal
- **Gradients:** Subtle movement in backgrounds

## Images
**Landing Page Hero:** No large hero image - use glowing gradient text effect as the focal point with dark animated gradient background.

**Profile Cards:** Avatar images within glassmorphic cards, circular or rounded-square format with subtle glow borders.

## Key UX Principles
- High-frame-rate smoothness throughout
- Immediate visual feedback on all interactions
- Glassmorphism creates depth and hierarchy
- Neon accents guide primary actions
- Dark theme reduces eye strain for professional use
- Gesture-based interactions feel natural and fluid