# Animated Hero & shadcn-style UI Integration

## What was done

- **shadcn-style structure**: `src/components/ui/` holds reusable UI primitives (Button, Animated Hero). This matches the [shadcn/ui](https://ui.shadcn.com/) convention.
- **Tailwind CSS**: Added via `tailwind.config.js`, `postcss.config.js`, and `src/index.css` with `@tailwind` directives and CSS variables for theming.
- **TypeScript**: `tsconfig.json` and `tsconfig.node.json` added. New UI components are `.tsx`; existing app code remains `.jsx` and works with the new setup.
- **Path alias**: `@/*` → `./src/*` in Vite and TypeScript so imports like `@/components/ui/button` resolve correctly.
- **Dependencies**: `lucide-react`, `framer-motion`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, plus Tailwind/PostCSS/TypeScript dev dependencies.

## Why `/components/ui` matters

- **Convention**: shadcn and many React design systems put primitives (Button, Input, Card) under `components/ui/`. Keeping the same path makes it easy to add more shadcn-style or custom components and to follow docs/tutorials.
- **Composition**: App-specific components (e.g. `VideoLoader`, `RAGSearch`) live in `components/` and import from `components/ui/`, so UI primitives stay in one place.
- **Theming**: `index.css` defines CSS variables (e.g. `--primary`, `--background`) that `components/ui` use via Tailwind. Changing the theme in one file updates all UI components.

## Default paths

| Purpose        | Path                    |
|----------------|-------------------------|
| UI primitives  | `src/components/ui/`   |
| App components | `src/components/`       |
| Utilities      | `src/lib/` (e.g. `utils.ts`) |
| Styles         | `src/index.css` (Tailwind + vars), `src/App.css` (app-specific) |

## Adding more shadcn components

1. **Manual**: Copy the component into `src/components/ui/` (e.g. from [shadcn/ui](https://ui.shadcn.com/docs/components)) and fix imports to use `@/components/ui/...` and `@/lib/utils`.
2. **shadcn CLI** (optional): Install the CLI and run `npx shadcn@latest init` in the frontend folder, then `npx shadcn@latest add button` etc. Ensure the CLI is configured to use `src/components/ui` and the existing `@/` alias so it matches this setup.

## Running the app

```bash
cd frontend
npm install   # already done
npm run dev   # http://localhost:5500
```

The **Animated Hero** renders at the top of the app; the existing Semantic Video Search sections (Load Video, Basic Search, RAG Search) appear below it.
