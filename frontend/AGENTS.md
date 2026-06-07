<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 📚 Frontend Development Guidelines

Before writing any code in this project, you MUST read the comprehensive documentation:

## 🎯 START HERE: `.docs/FRONTEND_GUIDELINES.md`

This file contains:
- Complete project setup and structure
- Tailwind CSS usage and examples
- shadcn/ui component library guide
- Aceternity UI animations and integration
- Best practices (TypeScript, accessibility, performance)
- Common component patterns with code examples
- Troubleshooting tips

## ⚠️ Key Requirements

1. **TypeScript mandatory** - All components must be properly typed
2. **Use shadcn/ui** - Add components with: `npx shadcn@latest add <component-name>`
3. **Use Aceternity UI** - For animated, premium-looking sections
4. **Tailwind CSS only** - Use utility classes, no raw CSS without good reason
5. **Import aliases** - Always use `@/` prefix (e.g., `@/components/ui/button`)
6. **Responsive first** - Mobile-first design with `sm:`, `md:`, `lg:`, `xl:` breakpoints
7. **Dark mode support** - Include `dark:` prefix classes
8. **Run ESLint** - Always run `npm run lint` before committing

## 🚀 Quick Start

```bash
npm run dev              # Start development server
npm run lint             # Check code quality
npx shadcn@latest add   # Add UI components
```

## 📁 Folder Structure

```
frontend/
├── .docs/                       # 📚 Documentation (REQUIRED READING)
│   └── FRONTEND_GUIDELINES.md  # Read this before coding!
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── features/          # Feature-specific components
│   │   ├── layouts/           # Layout components
│   │   └── common/            # Utility components
│   ├── lib/                   # Helper utilities
│   └── types/                 # TypeScript definitions
├── AGENTS.md                  # This file (agent guidelines)
└── package.json
```

## 💡 Before You Code

- [ ] Read `.docs/FRONTEND_GUIDELINES.md`
- [ ] Check existing shadcn components in `src/components/ui/`
- [ ] Review component examples in the guidelines
- [ ] Follow TypeScript best practices
- [ ] Test responsive design

## 🔗 Resources

- **Local Guide**: `.docs/FRONTEND_GUIDELINES.md` ← START HERE!
- **shadcn/ui**: https://ui.shadcn.com/
- **Aceternity UI**: https://aceternity.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Next.js 16**: https://nextjs.org/docs
