# Tether - Design Guidelines

## Authentication Architecture
**Auth Required** - This is a social networking app with user accounts, matching, and backend integration.

**Implementation:**
- Use email/password authentication initially (can be enhanced with SSO later)
- Store session tokens using `SecureStore` (expo-secure-store)
- Redirect to `(auth)` group if no valid token exists
- Auth Flow Screens:
  - Login Screen: `(auth)/login.tsx`
  - Sign Up Screen: `(auth)/register.tsx`
  - Include placeholder links for Privacy Policy & Terms of Service

## Navigation Structure
**Tab Navigation** (3 distinct feature areas)

Root navigation uses Bottom Tab Bar with 3 tabs:
1. **Deck** (Home/Main Feed) - The swipe interface
2. **Matches** - Connections established
3. **Profile** - User settings and account management

File structure:
- `(tabs)/_layout.tsx` - Bottom Tab Navigator
- `(tabs)/index.tsx` - Main Swipe Deck (default route)
- `(tabs)/matches.tsx` - Matches screen
- `(tabs)/profile.tsx` - Profile screen

## Design System

### Color Palette
**Theme:** Dark Mode "Cyberpunk"
- **Background:** `#0f172a` (Slate-950)
- **Primary Accent:** `#00f0ff` (Cyan) - For positive actions, highlights
- **Secondary Accent:** `#bc13fe` (Purple) - For secondary actions, gradients
- **Text Primary:** White/off-white for readability on dark background
- **Text Secondary:** Muted gray for supporting text

### Visual Effects
- **Glassmorphism:** Use `<BlurView>` (expo-blur) for:
  - Bottom tab bar (floating, semi-transparent)
  - Profile cards on the swipe deck
  - Modal overlays
- **StatusBar:** Set to `light-content` for visibility on dark background

### Typography
- Use system fonts optimized for readability
- Hierarchy:
  - **Headings:** Bold, larger sizing for names/headlines
  - **Body:** Regular weight for bios and descriptions
  - **Labels:** Smaller, muted for metadata (skills, location)

### Icons
- Use **Lucide-react-native** for all iconography
- Consistent sizing across navigation and actions
- Cyan/purple accent colors for active states

## Screen Specifications

### 1. Login/Register Screens `(auth)/*`
- **Layout:** Stack-only navigation (linear flow)
- **Header:** None or minimal, custom branded header
- **Content:** 
  - Centered forms with input fields
  - Submit buttons using primary accent color (cyan)
  - Link to alternate screen (Login ↔ Register)
- **Safe Area:** Top inset: `insets.top + Spacing.xl`, Bottom inset: `insets.bottom + Spacing.xl`

### 2. Deck Screen `(tabs)/index.tsx`
**Purpose:** Swipe through professional profiles to make connections

- **Layout:**
  - Custom header with app branding (transparent)
  - Main content: Full-screen card stack (non-scrollable)
  - Floating action area at bottom
- **Components:**
  - Card stack using `react-native-gesture-handler` or `rn-tinder-card`
  - Each card displays: Avatar, Name, Headline, Bio, Skills
  - Cards use glassmorphism effect (BlurView)
  - Swipe indicators (left/right visual feedback)
  - Action buttons below cards: Pass (left), Like (right)
- **Interactions:**
  - Swipe right = Like (send API request with `direction: 'right'`)
  - Swipe left = Pass (skip)
  - On match: Show modal with "Connection Established" animation
- **Safe Area:** 
  - Top inset: `headerHeight + Spacing.xl`
  - Bottom inset: `tabBarHeight + Spacing.xl`

### 3. Matches Screen `(tabs)/matches.tsx`
**Purpose:** View established connections

- **Layout:**
  - Default navigation header with title "Matches"
  - Scrollable list/grid of matched profiles
- **Components:**
  - List of match cards (avatar, name, headline)
  - Tap to open chat/profile detail (future feature)
- **Safe Area:** 
  - Top inset: `Spacing.xl` (with default header)
  - Bottom inset: `tabBarHeight + Spacing.xl`

### 4. Profile Screen `(tabs)/profile.tsx`
**Purpose:** Manage user profile and settings

- **Layout:**
  - Default navigation header with title "Profile"
  - Scrollable form/content area
- **Components:**
  - User avatar (editable)
  - Editable fields: Name, Headline, Bio, Skills
  - Account section with:
    - Log out button (with confirmation alert)
    - Delete account (nested under Settings > Account > Delete, double confirmation)
- **Safe Area:** 
  - Top inset: `Spacing.xl` (with default header)
  - Bottom inset: `tabBarHeight + Spacing.xl`

### 5. Bottom Tab Bar
- **Style:** Floating, glassmorphism effect using BlurView
- **Spacing:** Elevated above safe area with padding
- **Icons:** Lucide icons, cyan accent for active tab
- **Labels:** Optional, can be icon-only for cleaner aesthetic

## Interaction Design
- **Touchable Feedback:** All interactive elements have visual feedback (opacity change, scale)
- **Swipe Animations:** Smooth, physics-based using react-native-reanimated
- **Floating Buttons:** Subtle drop shadow:
  - shadowOffset: `{width: 0, height: 2}`
  - shadowOpacity: `0.10`
  - shadowRadius: `2`
- **Match Modal:** Celebratory animation (scale/fade-in) with cyan/purple gradient overlay

## Assets & Iconography
**Required Assets:**
- App logo/branding for auth screens and deck header
- Placeholder avatar for profiles without images
- Match celebration icon/animation graphic

**Icon Usage:**
- Use Lucide-react-native system icons for all UI actions
- No custom emojis; rely on professional iconography
- Examples: Deck (cards icon), Matches (users icon), Profile (user icon)

## Accessibility
- Ensure sufficient contrast between text and dark background
- All touchable areas meet minimum size requirements (44x44 pts)
- Swipe gestures have alternative button actions for accessibility
- Form inputs have clear labels and validation feedback