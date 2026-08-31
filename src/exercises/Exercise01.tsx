// ============================================================================
// Exercise 01 — JSX & Props
// ============================================================================
//
// GOAL
//   Render three profile cards from the `people` data below. No interactivity.
//
// CONCEPTS THIS DRILLS
//   - function components + `export`
//   - JSX rules: one root element, `className` (not `class`), `{}` to embed
//     JS expressions, self-closing tags
//   - props: passing data into a component
//   - destructuring props in the function signature
//   - `children`: content passed between a component's opening/closing tags
//   - composing components (a component that renders another component)
//
// RULES FOR THIS ONE
//   - NO useState, NO useEffect, NO event handlers. Pure: props in -> UI out.
//   - NO .map yet. Write the three cards out by hand. (We'll kill the
//     repetition with .map in a later exercise — the pain is the point.)
//
// HOW TO RUN
//   npm run dev   ->   open the printed localhost URL
//   Edits hot-reload. A red error overlay = read the message, it's usually exact.
//
// WHEN IT WORKS
//   Three cards visible, each showing a name, a "role · N yrs" line, and the
//   languages. Tell me and I'll review your file.
// ============================================================================

import type { ReactNode } from "react"

type Person = {
  name: string
  role: string
  yearsExperience: number
  languages: string[]
}

const people: Person[] = [
  { name: 'Ada Lovelace', role: 'Backend', yearsExperience: 12, languages: ['C#', 'F#', 'SQL'] },
  { name: 'Grace Hopper', role: 'Compilers', yearsExperience: 30, languages: ['COBOL', 'C'] },
  { name: 'Linus Torvalds', role: 'Kernel', yearsExperience: 34, languages: ['C', 'Rust'] },
]

// ---------------------------------------------------------------------------
// TODO 1 — <Badge>
//   Takes ONE prop: `children`. Render `children` inside a
//   <span className="badge">.
//   Type the props. In TS the simplest way here:
//     function Badge({ children }: { children: React.ReactNode }) { ... }
// ---------------------------------------------------------------------------
function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>
}

// ---------------------------------------------------------------------------
// TODO 2 — <ProfileCard>
//   Props: name (string), role (string), yearsExperience (number),
//          languages (string[]).
//   Destructure them in the signature. Give the props an inline object type
//   (or reuse `Person` — your call; think about which is more honest here).
//   Render:
//     <article className="card">
//       <h2> the name </h2>
//       <p> `${role} · ${yearsExperience} yrs` </p>
//       <Badge> the languages joined with " · " </Badge>
//     </article>
// ---------------------------------------------------------------------------
function ProfileCard({ name, role, yearsExperience, languages }: Person) {
  return (
    <article className="card">
      <h2>{name}</h2>
      <p>{role} · {yearsExperience} yrs</p>
      <Badge>{languages.join(' · ')}</Badge>
    </article>
  )
}

// ---------------------------------------------------------------------------
// TODO 3 — render three <ProfileCard>s, one per entry in `people`.
//   Pass every field as its own prop, e.g.
//     <ProfileCard name={people[0].name} role={people[0].role} ... />
//   Repeat by hand for indices 0, 1, 2.
// ---------------------------------------------------------------------------
export default function Exercise01() {
  return (
    <section>
      <h1>Exercise 01 — Profiles</h1>
      <ProfileCard name={people[0].name} role={people[0].role} yearsExperience={people[0].yearsExperience} languages={people[0].languages} />
      <ProfileCard name={people[1].name} role={people[1].role} yearsExperience={people[1].yearsExperience} languages={people[1].languages} />
      <ProfileCard name={people[2].name} role={people[2].role} yearsExperience={people[2].yearsExperience} languages={people[2].languages} />
    </section>
  )
}
