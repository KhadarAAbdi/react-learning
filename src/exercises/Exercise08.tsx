// ============================================================================
// Exercise 08 — Custom Hooks
// ============================================================================
//
// GOAL
//   Extract two pieces of logic you've now written from scratch multiple
//   times — "state synced to localStorage" and "fetch with loading/error/
//   cleanup" — into reusable custom hooks. Then use them.
//
// CONCEPTS THIS DRILLS
//   - a custom hook is just a function whose name starts with `use` and that
//     calls other hooks inside it. Nothing more magic than that.
//   - what you're reusing is STATEFUL LOGIC, not markup (that's what a
//     component reuses). A custom hook returns values/setters, not JSX.
//   - Rules of Hooks still apply INSIDE a custom hook: called at the top
//     level only — never in a loop, an if, or a nested function.
//   - generics on a hook (useFetch<T>, useLocalStorage<T>) so it's reusable
//     across different data shapes, not just one.
//   - each COMPONENT that calls a custom hook gets its OWN independent copy
//     of that hook's state — calling useLocalStorage twice in two different
//     components does not share state between them (unless the key is the
//     same AND you're talking to storage itself, which is the one exception —
//     more on this in TODO 2).
//
// RULES
//   - Define both hooks in this file, above Exercise08. Real projects usually
//     put each in its own src/hooks/useX.ts file — not required here.
//   - No new UI concepts. This is entirely about extracting logic you already
//     know how to write.
//
// ----------------------------------------------------------------------------
// TODO 1 — useLocalStorage<T>(key: string, initialValue: T)
//
//   Returns a [value, setValue] pair, same shape as useState's return.
//   Behaviour:
//     - on first render, read `key` from localStorage. If it's there, parse
//       it (JSON.parse) and use it as the initial value. If it's missing, OR
//       parsing throws (corrupt/foreign data), fall back to `initialValue`.
//     - setValue updates React state AND writes the new value to localStorage
//       (JSON.stringify) so it survives a refresh.
//     - the initial localStorage read should only happen ONCE per mount, not
//       on every render — think about which hook enforces "only run once".
//
//   Try it: a small standalone component with a text input using
//   useLocalStorage instead of useState for its value. Type something,
//   refresh the page (F5), confirm it's still there.
//
// ----------------------------------------------------------------------------
// TODO 2 — a persisted theme toggle, using TODO 1
//
//   Build a tiny light/dark toggle (button + a styled box, nothing fancy)
//   whose state is `useLocalStorage<'light' | 'dark'>('theme', 'light')`
//   instead of plain useState. Refresh the page — the theme should survive.
//
//   Now render TWO of this toggle component side by side in Exercise08.
//   Click one. Does the other change too, without a refresh? Figure out why
//   or why not — it's about when each component's hook actually reads
//   storage vs. when React re-renders it. (This is the nuance from the
//   CONCEPTS note above — answer it, don't just observe it.)
//
// ----------------------------------------------------------------------------
// TODO 3 — useFetch<T>(url: string | null)
//
//   Generalizes the fetch-with-status pattern from Exercises 05 and 06 into
//   one reusable hook. Returns an object:
//     { data: T | null, status: 'idle' | 'loading' | 'success' | 'error', error: string | null }
//
//   Behaviour (all of this you've already built once — now make it generic):
//     - url === null  =>  status 'idle', data null, no fetch. This is how a
//       caller says "nothing to fetch right now" (mirrors the empty-query case).
//     - otherwise: status 'loading', fire the request, then 'success' + data,
//       or 'error' + a message, on completion.
//     - MUST include the cleanup/ignore-flag pattern from Exercise 05/06 —
//       this hook will be reused by multiple components, so a stale response
//       from a superseded url must not overwrite a newer one. This one isn't
//       optional: it's the exact bug this hook needs to not have, baked in
//       once, so every caller gets it for free forever.
//
// ----------------------------------------------------------------------------
// TODO 4 — use it
//
//   Rebuild a mini version of the Exercise 05 GitHub user lookup: a
//   controlled username input, and
//     const { data, status, error } = useFetch<GitHubUser>(
//       username.trim() ? `https://api.github.com/users/${username.trim()}` : null
//     )
//   Render loading/error/success same as before. Compare how much of
//   Exercise05's effect code you no longer have to write here.
// ============================================================================

import { useState } from 'react'

interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
}

type SetValue<T> =  (newValue: T | ((prev: T) => T)) => void
// TODO 1
// function useLocalStorage<T>(key: string, initialValue: T) { ... }
function useLocalStorage<T>(key: string, initialValue: T) : [T, SetValue<T>] {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key)
    if(storedValue !== null){
      try {
        initialValue = JSON.parse(storedValue) as T
      } catch(e) {
        console.error(`Error parsing localStorage key "${key}":`, e)
      }
    }
    return initialValue
  })

  const setValueAndStore = (newValue : T | ((prev: T) => T)) : void => {
    setValue((prev) => {
      const next = newValue instanceof Function ? newValue(prev) : newValue
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }
  return [value, setValueAndStore]
}
// TODO 3
// function useFetch<T>(url: string | null) { ... }

export default function Exercise08() {
  return (
    <section>
      <h1>Exercise 08 — Custom Hooks</h1>
    </section>
  )
}
