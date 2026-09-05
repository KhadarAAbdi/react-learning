// ============================================================================
// Exercise 07 — Context API
// ============================================================================
//
// GOAL
//   A dashboard with a theme (light/dark) that a couple of deeply-nested leaf
//   components need. First build it by drilling the theme through every
//   layer by hand — feel the pain — then refactor to Context and delete the
//   drilling.
//
// CONCEPTS THIS DRILLS
//   - the problem Context solves: passing data through layers that don't use
//     it themselves, just to reach something deep below
//   - createContext(defaultValue)
//   - <SomeContext.Provider value={...}> — wraps a subtree, supplies the value
//   - useContext(SomeContext) — reads the nearest Provider's value, in ANY
//     descendant, no matter how deep
//   - the default value passed to createContext is only used if a component
//     calls useContext with NO Provider above it in the tree
//   - a small custom hook wrapping useContext (common, idiomatic pattern)
//
// RULES
//   - No useReducer, no Redux. useState + Context only.
//   - Do this in order: TODO 1-2 (prop drilling) before TODO 3+ (Context).
//     Don't skip straight to Context — the drilling is the point of comparison.
//
// THE TREE
//
//   Exercise07 (owns theme state)
//     └─ Dashboard
//          ├─ Sidebar
//          │    └─ SidebarSection
//          │         └─ SidebarLink        <- needs `theme` (styling only)
//          └─ MainPanel
//               └─ Widget
//                    └─ WidgetHeader       <- needs `theme` AND `toggleTheme`
//
//   Sidebar, SidebarSection, MainPanel, Widget never use the theme themselves.
//   They're pure passthrough in TODO 1-2, and should need ZERO theme-related
//   props once TODO 3+ is done.
//
// SWITCH TO THIS EXERCISE
//   Point src/App.tsx at Exercise07.
// ============================================================================

import { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

// ---------------------------------------------------------------------------
// TODO 1 — build the tree with PROP DRILLING.
//   Exercise07 owns: const [theme, setTheme] = useState<Theme>('light')
//   and a toggleTheme function.
//
//   Write these components, each taking theme (and toggleTheme, only where
//   actually needed) as props and passing them straight down:
//     Dashboard({ theme, toggleTheme })
//       renders <Sidebar theme={theme} /> and <MainPanel theme={theme} toggleTheme={toggleTheme} />
//     Sidebar({ theme })
//       renders <SidebarSection theme={theme} />
//     SidebarSection({ theme })
//       renders <SidebarLink theme={theme} />
//     SidebarLink({ theme })
//       renders <a style={{ color: theme === 'dark' ? '#eee' : '#111' }}>Settings</a>
//     MainPanel({ theme, toggleTheme })
//       renders <Widget theme={theme} toggleTheme={toggleTheme} />
//     Widget({ theme, toggleTheme })
//       renders <WidgetHeader theme={theme} toggleTheme={toggleTheme} />
//     WidgetHeader({ theme, toggleTheme })
//       renders a <div> with background/color based on theme, and a button
//       calling toggleTheme
//
// TODO 2 — wire it up in Exercise07, render <Dashboard>, confirm the toggle
//   button flips styling in BOTH SidebarLink and WidgetHeader.
//   Count how many components had to mention "theme" just to relay it:
//   Dashboard, Sidebar, SidebarSection, MainPanel, Widget — five components
//   that don't use theme at all, but every one of their signatures has it.
// ---------------------------------------------------------------------------
const useTheme = () => useContext(ThemeContext)
const useToggleTheme = () => useContext(ThemeSetterContext)

function SidebarLink() {
  const theme = useTheme()
  return (
    <a href="#" style={{ color: theme === 'dark' ? '#eee' : '#111' }}>
      Settings
    </a>
  )
}

function SidebarSection() {
  return (
    <div>
      <h3>Section</h3>
      <SidebarLink />
    </div>
  )
}

function Sidebar() {
  return (
    <aside>
      <h2>Sidebar</h2>
      <SidebarSection />
    </aside>
  )
}

function WidgetHeader() {
  const theme = useTheme()
  const toggleTheme = useToggleTheme()
  return (
    <div
      style={{
        background: theme === 'dark' ? '#222' : '#eee',
        color: theme === 'dark' ? '#eee' : '#111',
        padding: '0.5rem',
      }}
    >
      <span>Widget ({theme})</span>
      <button onClick={toggleTheme}>Toggle theme</button>
    </div>
  )
}

function Widget() {
  return (
    <div>
      <WidgetHeader />
      <p>Widget body content.</p>
    </div>
  )
}

function MainPanel() {
  return (
    <main>
      <h2>Main Panel</h2>
      <Widget />
    </main>
  )
}

function Dashboard() {
  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <Sidebar />
      <MainPanel />
    </div>
  )
}

// ---------------------------------------------------------------------------
// TODO 3 — create the context.
//   const ThemeContext = createContext<Theme>('light')
//   const ThemeSetterContext = createContext<() => void>(() => {})
//   (two contexts: one for the value, one for the updater — a common split,
//   since components that only toggle don't need to re-render on every theme
//   change if you later optimize this. Not required to get why yet, just do it.)
// ---------------------------------------------------------------------------
const ThemeContext = createContext<Theme>('light')
const ThemeSetterContext = createContext<() => void>(() => {})
// ---------------------------------------------------------------------------
// TODO 4 — wrap the tree in Exercise07:
//   <ThemeContext.Provider value={theme}>
//     <ThemeSetterContext.Provider value={toggleTheme}>
//       <Dashboard />
//     </ThemeSetterContext.Provider>
//   </ThemeContext.Provider>
//   Dashboard now takes NO props.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// TODO 5 — delete the drilling.
//   Remove theme/toggleTheme from the props and signatures of Dashboard,
//   Sidebar, SidebarSection, MainPanel, Widget — they pass NOTHING now,
//   just <Sidebar />, <MainPanel />, etc.
//   In SidebarLink and WidgetHeader, delete the props and instead call:
//     const theme = useContext(ThemeContext)
//     const toggleTheme = useContext(ThemeSetterContext)   // WidgetHeader only
//   Confirm the toggle still works identically. Nothing about the RESULT
//   should change — only how the value gets to the two components that need it.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// TODO 6 (optional) — a custom hook.
//   function useTheme() {
//     return useContext(ThemeContext)
//   }

//   Use it in place of the raw useContext call. This is the idiomatic form
//   you'll see in real codebases — it also gives you one place to add a
//   "must be used inside a Provider" check later, if you want to push further.
// ---------------------------------------------------------------------------

export default function Exercise07() {
  const [theme, setTheme] = useState<Theme>('light')
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <section>
      <h1>Exercise 07 — Theme Context</h1>
      <ThemeContext.Provider value={theme}>
        <ThemeSetterContext.Provider value={toggleTheme}>
          <Dashboard />
        </ThemeSetterContext.Provider>
      </ThemeContext.Provider>
    </section>
  )
}
