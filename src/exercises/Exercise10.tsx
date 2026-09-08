// ============================================================================
// Exercise 10 — Capstone: Contacts Manager  (covers 10–13)
// ============================================================================
//
// One small app that exercises the four remaining topics at once:
//   - React Router      : list / detail / new / edit pages, URL params
//   - useReducer        : the contacts collection as a reducer (Redux's model)
//   - Context           : expose { state, dispatch } so pages don't prop-drill
//   - Forms in depth     : the new/edit form — multi-field, validation, per-field
//                          errors, submit handling
//   (plus useFetch from Exercise 08 to seed initial data)
//
// ----------------------------------------------------------------------------
// SETUP — install the router first:
//
//     npm install react-router-dom
//
// Then point src/App.tsx at Exercise10.
//
// ----------------------------------------------------------------------------
// WHAT'S PROVIDED (below, working): the Router wiring, <Layout>, a minimal
// useFetch, and all the types. What's yours: the reducer, the context wiring,
// and the four page components.
//
// ----------------------------------------------------------------------------
// TODO 1 — contactReducer(state, action)
//   Handle these actions immutably (never mutate `state`):
//     { type: 'load';   contacts: Contact[] }      -> replace the whole list
//     { type: 'add';    contact: Contact }         -> append
//     { type: 'update'; contact: Contact }         -> replace the one with same id
//     { type: 'delete'; id: string }               -> remove by id
//   Return the unchanged state for any unknown action.
//
// TODO 2 — ContactsContext + useContacts()
//   - createContext holding { contacts: Contact[]; dispatch: Dispatch<ContactAction> }
//   - In <ContactsProvider>: useReducer(contactReducer, []), and a useFetch call
//     that loads https://jsonplaceholder.typicode.com/users once, maps each user
//     to a Contact ({ id: String(u.id), name, email, phone, note: '' }), and
//     dispatches { type: 'load' } when it arrives. Provide { contacts, dispatch }.
//   - useContacts(): a hook that returns the context value, throwing a clear
//     error if called with no provider above (the "must be inside Provider"
//     guard — one reason to wrap useContext in a custom hook).
//
// TODO 3 — <ContactList>  (route: "/")
//   Read `contacts` from useContacts(). Render each as a <Link to={`/contacts/${c.id}`}>
//   showing the name, plus a "delete" button that dispatches { type: 'delete' }.
//   A <Link to="/new"> to add one. Handle the empty list.
//
// TODO 4 — <ContactDetail>  (route: "/contacts/:id")
//   useParams() to get :id. Find that contact in `contacts`. If not found,
//   render a "not found" message. Otherwise show all fields and a
//   <Link to={`/contacts/${id}/edit`}>Edit</Link> and a back link to "/".
//
// TODO 5 — <ContactForm mode="new" | "edit">   (routes: "/new", "/contacts/:id/edit")
//   The real work. One controlled form, fields: name, email, phone, note.
//   - In "edit" mode, initialise the fields from the existing contact
//     (useParams + find). In "new" mode, start blank.
//   - Validation, computed on every render from the current field values:
//       name  : required, min 2 chars
//       email : required, must match a basic email regex
//       phone : optional, but if present must be at least 7 chars
//       note  : optional, max 200 chars
//   - Show each field's error text UNDER that field, but only after the user
//     has touched it (track a `touched` object) OR after a submit attempt.
//   - The submit button is disabled while any error exists.
//   - onSubmit: preventDefault; if valid, build a Contact (new id via
//     crypto.randomUUID() for "new", keep the id for "edit"), dispatch 'add'
//     or 'update', then navigate back to that contact's detail page
//     (useNavigate()).
//
// ============================================================================

import { useEffect, useReducer, useState, createContext, useContext, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, Outlet, useParams, useNavigate } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Contact {
  id: string
  name: string
  email: string
  phone: string
  note: string
}

type ContactAction =
  | { type: 'load'; contacts: Contact[] }
  | { type: 'add'; contact: Contact }
  | { type: 'update'; contact: Contact }
  | { type: 'delete'; id: string }

// ---------------------------------------------------------------------------
// Provided: a minimal useFetch (same idea as Exercise 08)
// ---------------------------------------------------------------------------
function useFetch<T>(url: string | null) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: !!url,
    error: null,
  })

  useEffect(() => {
    if (!url) return
    let ignore = false
    setState({ data: null, loading: true, error: null })
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<T>
      })
      .then((data) => {
        if (!ignore) setState({ data, loading: false, error: null })
      })
      .catch((e: unknown) => {
        if (!ignore) setState({ data: null, loading: false, error: e instanceof Error ? e.message : 'failed' })
      })
    return () => {
      ignore = true
    }
  }, [url])

  return state
}

// ---------------------------------------------------------------------------
// TODO 1 — the reducer
// ---------------------------------------------------------------------------
function contactReducer(state: Contact[], action: ContactAction): Contact[] {
  // handle 'load' | 'add' | 'update' | 'delete', immutably
  return state
}

// ---------------------------------------------------------------------------
// TODO 2 — context + provider + hook
// ---------------------------------------------------------------------------
// const ContactsContext = createContext<...>(...)
// function ContactsProvider({ children }: { children: ReactNode }) { ... }
// function useContacts() { ... }

// ---------------------------------------------------------------------------
// Provided: layout with nav + <Outlet> for the routed page
// ---------------------------------------------------------------------------
function Layout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <Link to="/">Contacts</Link>
        <Link to="/new">New</Link>
      </nav>
      <Outlet />
    </div>
  )
}

// ---------------------------------------------------------------------------
// TODO 3 — <ContactList>
// TODO 4 — <ContactDetail>
// TODO 5 — <ContactForm mode="new" | "edit">
// ---------------------------------------------------------------------------

export default function Exercise10() {
  return (
    <section>
      <h1>Exercise 10 — Contacts Manager</h1>
      {/*
        Wrap the routes in <ContactsProvider> (TODO 2) once it exists:

        <ContactsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<ContactList />} />
                <Route path="new" element={<ContactForm mode="new" />} />
                <Route path="contacts/:id" element={<ContactDetail />} />
                <Route path="contacts/:id/edit" element={<ContactForm mode="edit" />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ContactsProvider>
      */}
    </section>
  )
}
