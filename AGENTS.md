# Agents

Agents are the main components of the system.

## UI Guidelines

## Core Responsibilities

- Follow user requirements precisely and to the letter
- Think step-by-step: describe your component architecture plan in detailed pseudocode first
- Confirm approach, then write complete, working component code
- Write correct, best practice, DRY, bug-free, fully functional components
- Prioritize accessibility and user experience over complexity
- Implement all requested functionality completely
- Leave NO todos, placeholders, or missing pieces
- Include all required imports, types, and proper component exports
- Be concise and minimize unnecessary prose

### Component Architecture

- Use forwardRef for all interactive components
- Implement proper TypeScript interfaces for all props
- Use CVA for variant management and conditional styling
- Follow shadcn/ui naming conventions and file structure
- Create compound components when appropriate (Card.Header, Card.Content)
- Export components with proper display names

### Styling Guidelines

- Always use Tailwind classes with shadcn design tokens
- Use CSS variables for theme-aware styling (hsl(var(--primary)))
- Implement proper focus states and accessibility indicators
- Follow shadcn/ui spacing and typography scales
- Use conditional classes with cn() utility function
- Support dark mode through CSS variables

### Accessibility Standards

- Implement ARIA labels, roles, and properties correctly
- Ensure keyboard navigation works properly
- Provide proper focus management and visual indicators
- Include screen reader support with appropriate announcements
- Follow WCAG 2.1 AA guidelines

### shadcn/ui Specific

- Extend existing shadcn components rather than rebuilding from scratch
- Use Radix UI primitives as the foundation when building new components
- Follow the shadcn/ui component API patterns and conventions
- Implement proper variant systems with sensible defaults
- Support theming through CSS custom properties
- Create components that integrate seamlessly with existing shadcn components

### Server Actions & Forms

- Use "use server" directive for Server Actions
- Create shared Zod schemas for client and server validation
- Implement server-side validation as primary security layer
- Use useActionState for form state management
- Handle both success and error states with proper return objects
- Use revalidatePath and revalidateTag for cache invalidation
- Ensure progressive enhancement works without JavaScript

## Response Protocol

1. If uncertain about shadcn/ui patterns, state so explicitly
2. If you don't know a specific Radix primitive, admit it rather than guessing
3. Search for latest shadcn/ui and Radix documentation when needed
4. Provide component usage examples only when requested
5. Stay focused on component implementation over general explanations

# Commit Rules

Element beside specify what you need to do before commit

# Restricted files

Files in the list contain sensitive data, THEY MOST NOT be read :

- env

# Strict Rules

Rules beside is strict rules that you need to respect for any actions that you should do

- If you need to rewrite completly a files delete it and recreate it instead try to use edit_files
- Every time use context7 for analysis avoid try to provide code wih=thout verify funcdtion using context7
- Avoid have files up to 300 lines dispath logic in many files for better code lisibilty and understanding
- Avoid create many react components in one files create files per compoenents and import/export it
