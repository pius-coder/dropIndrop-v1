# Shadcn/UI Components Registry

## @shadcn Registry Components

### UI Components

- accordion
- alert
- alert-dialog
- aspect-ratio
- avatar
- badge
- breadcrumb
- button
- button-group
- calendar
- card
- carousel
- chart
- checkbox
- collapsible
- command
- context-menu
- dialog
- drawer
- dropdown-menu
- empty
- field
- form
- hover-card
- input
- input-group
- input-otp
- item
- label
- menubar
- navigation-menu
- pagination
- popover
- progress
- radio-group
- resizable
- scroll-area
- select
- separator
- sheet
- sidebar
- skeleton
- slider
- sonner
- spinner
- switch
- table
- tabs
- textarea
- toggle
- toggle-group
- tooltip
- kbd

### Block Components (Layouts & Pages)

- dashboard-01
- sidebar-01 through sidebar-16
- login-01 through login-05
- signup-01 through signup-05
- otp-01 through otp-05
- calendar-01 through calendar-32
- chart-area-_, chart-bar-_, chart-line-_, chart-pie-_, chart-radar-_, chart-radial-_, chart-tooltip-\*

### Examples & Demos

- accordion-demo, alert-demo, alert-destructive, badge-demo, etc.
- form-rhf-_, form-tanstack-_
- data-table-demo
- date-picker-demo, date-picker-form, date-picker-with-presets, date-picker-with-range
- input-demo, input-disabled, input-file, input-form, input-with-button, etc.
- table-demo
- And many more examples for each component

### Internal Components

- sidebar-demo, sidebar-header, sidebar-footer, sidebar-group, etc.

## @kokonutui Registry Components

### Interactive Components

- ai-prompt, command-button, card-flip, smooth-drawer, shape-hero, ai-text-loading, shimmer-text, carousel-cards, file-upload, action-search-bar, ai-input-search, currency-transfer, background-paths, beams-background, apple-activity-card, ai-voice, smooth-tab, team-selector, switch-button, bento-grid, social-button, hold-button, attract-button, gradient-button, v0-button, toolbar, ai-loading, card-stack, avatar-picker, type-writer, swoosh-text, sliced-text, glitch-text, matrix-text, dynamic-text, particle-button, tweet-card, scroll-text, liquid-glass-card, profile-dropdown

### Text Effects

- ai-prompt, ai-text-loading, shimmer-text, type-writer, swoosh-text, sliced-text, glitch-text, matrix-text, dynamic-text, scroll-text

### Buttons & Interactions

- command-button, hold-button, attract-button, gradient-button, v0-button, particle-button, switch-button, social-button

### Cards & Layouts

- card-flip, carousel-cards, bento-grid, card-stack, tweet-card, liquid-glass-card, apple-activity-card

### Advanced UI

- smooth-drawer, smooth-tab, avatar-picker, profile-dropdown, action-search-bar, toolbar

## @magicui Registry Components

### Core UI Components

- magic-card, android, warp-background, line-shadow-text, aurora-text, morphing-text, scroll-progress, lens, pointer, smooth-cursor, progressive-blur, neon-gradient-card, meteors, grid-pattern, striped-pattern, interactive-grid-pattern, dot-pattern, flickering-grid, hero-video-dialog, code-comparison, marquee, globe, shimmer-button, tweet-card, client-tweet-card, bento-grid, particles, number-ticker, ripple, retro-grid, animated-list, animated-shiny-text, animated-grid-pattern, border-beam, animated-beam, text-reveal, hyper-text, animated-gradient-text, orbiting-circles, dock, word-rotate, avatar-circles, typing-animation, sparkles-text, spinning-text, comic-text, icon-cloud, text-animate, scroll-based-velocity, shiny-button, shine-border, animated-circular-progress-bar, confetti, cool-mode, pulsating-button, ripple-button, file-tree, blur-fade, safari, iphone, rainbow-button, interactive-hover-button, terminal, video-text, pixel-image, highlighter, animated-theme-toggler, light-rays, dotted-map

### Animation Components

- morphing-text, aurora-text, animated-shiny-text, animated-gradient-text, typing-animation, sparkles-text, spinning-text, comic-text, text-animate, hyper-text, word-rotate, scroll-based-velocity, pulsating-button, ripple-button, cool-mode, confetti, animated-beam, border-beam, orbiting-circles, animated-list, number-ticker, particles, meteors, retro-grid, light-rays, animated-theme-toggler

### Interactive Components

- lens, pointer, smooth-cursor, interactive-grid-pattern, interactive-hover-button, cool-mode, dock, icon-cloud, file-tree, hero-video-dialog, code-comparison

### Background Effects

- warp-background, grid-pattern, striped-pattern, dot-pattern, flickering-grid, retro-grid, animated-grid-pattern, light-rays, dotted-map, meteors, progressive-blur

### Text Effects

- line-shadow-text, aurora-text, morphing-text, animated-shiny-text, animated-gradient-text, sparkles-text, spinning-text, comic-text, hyper-text, text-animate, word-rotate, scroll-based-velocity

### Buttons & Controls

- shimmer-button, shiny-button, pulsating-button, ripple-button, rainbow-button, interactive-hover-button

### Data Display

- globe, bento-grid, animated-list, number-ticker, animated-circular-progress-bar, file-tree, marquee, tweet-card, client-tweet-card

### Device Mockups

- android, safari, iphone

## @kibo-ui Registry Components

### Advanced UI Components

- announcement, avatar-stack, banner, calendar, choicebox, code-block, color-picker, combobox, comparison, contribution-graph, credit-card, cursor, deck, dialog-stack, dropzone, editor, gantt, glimpse, image-crop, image-zoom, kanban, list, marquee, mini-calendar, pill, qr-code, rating, reel, relative-time, sandbox, snippet, spinner, status, stories, table, tags, theme-switcher, ticker, tree, video-player

### Style Components

- typography

## Usage Notes

### Adding Components

```bash
# Add from @shadcn registry
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add dialog

# Add from @kibo-ui registry
pnpm dlx shadcn@latest add @kibo-ui/gantt
pnpm dlx shadcn@latest add @kibo-ui/dropzone
```

### Key Components for Product Management

- `table` - For product listing
- `form` - For product creation/editing
- `dialog` - For modals
- `input`, `textarea`, `select` - Form fields
- `button` - Actions
- `card` - Product cards
- `dropzone` (@kibo-ui) - Image uploads
- `image-crop` (@kibo-ui) - Image editing

### Key Components for Category Management

- `table` - Category listing
- `tree` (@kibo-ui) - Hierarchical display
- `form` - Category creation/editing
- `dialog` - Category modals
- `input` - Category fields
- `button` - Actions

This registry provides comprehensive UI components for building modern admin interfaces with excellent accessibility, theming, and TypeScript support.

## Design Patterns & Libraries

### Rough Notation
- **Library**: `rough-notation` (/rough-stuff/rough-notation)
- **Purpose**: Create and animate hand-drawn annotations on web pages
- **React Integration**: Use `annotate()` function with DOM elements
- **Usage Patterns**:
  - Highlight important UI elements with underlines, boxes, circles
  - Create sequential animations with `annotationGroup`
  - Dynamic color updates after creation
  - Perfect for onboarding flows and feature highlights
- **Installation**: `npm install rough-notation`
- **Trust Score**: 7.4 | **Code Snippets**: 6
