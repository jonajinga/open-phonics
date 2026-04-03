# OPEN PHONICS

A free, open-source web application that teaches children to read using the Direct Instruction methodology.

## What is Open Phonics?

Open Phonics provides 100 structured lessons that teach reading through systematic phonics. Each lesson has two parts:

- **Child View** — Large, distraction-free text with an animated tracking pointer
- **Teacher Script** — Step-by-step instructions telling the parent or teacher exactly what to say and do

No teaching experience required. No accounts. No tracking. No cost.

## Features

- 100 lessons across 5 phases, from first sounds to fluent reading
- 44 sounds following the Direct Instruction scope and sequence
- Animated pointer engine (Web Animations API) with adjustable speed
- Student profiles with independent progress tracking
- Progress export/import for backup and device transfer
- Dark/light mode with WCAG AA contrast compliance
- Keyboard shortcuts for lesson navigation
- Print-friendly lesson layouts
- PWA with offline support
- Independent reading stories organized by phase
- Pronunciation guide with complete sound chart

## Tech Stack

- **Static Site Generator:** [Eleventy v3](https://www.11ty.dev/) (ESM)
- **Templating:** Nunjucks
- **Styling:** Vanilla CSS with custom properties (no frameworks)
- **Interactivity:** Vanilla JavaScript, Web Animations API
- **Fonts:** [Bunny Fonts](https://fonts.bunny.net/) — Lora (headings), Source Sans 3 (body), Comic Neue (child text)
- **State:** localStorage (progress, profiles, theme preference)
- **Hosting:** Cloudflare Pages

## Getting Started

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/open-phonics.git
cd open-phonics

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The development server runs at `http://localhost:8080`.

## Project Structure

```
src/
  _data/          Data files (lessons, sounds, phases, navigation, meta)
  _includes/      Layouts and partials
  assets/
    css/          Vanilla CSS (concatenated at build time)
    js/           Vanilla JS (theme, pointer, progress, nav)
    img/          Favicon, OG image
  lessons/        Lesson pagination template
  phases/         Phase page pagination template
  pages/          Static pages (parent guide, about, contact, etc.)
  stories/        Markdown story files
```

## Lesson Data

All 100 lessons live in `src/_data/lessons.js`. Each lesson has:

```js
{
  id: 1,
  title: "Lesson 1",
  target: "m, s",
  phase: 1,
  steps: [
    {
      display: "m",        // What the child sees
      track: "arrow",      // "arrow" | "stop" | "none"
      action: "move",      // "move" | "fast" | "tap"
      say: "...",          // What the parent says
      do: "...",           // What the parent does
      praise: "...",       // Feedback for correct response
      correct: "..."       // Feedback for incorrect response
    }
  ]
}
```

## Contributing

Contributions are welcome. Areas where help is needed:

- **Lesson content review** — Verify pedagogical accuracy of lessons 21-100
- **Additional stories** — More reading practice at each phase level
- **Translations** — Adapt for other languages
- **Accessibility testing** — Screen reader and keyboard navigation testing
- **Design** — Proper PNG favicon, OG image, and PWA icons

## License

MIT

## Credits

Built by [Pikes Peak Web Designs](https://www.pikespeakwebdesigns.com).

Based on the Direct Instruction methodology developed by Siegfried Engelmann.
