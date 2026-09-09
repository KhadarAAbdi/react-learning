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

import { useEffect, useReducer, useState, createContext, useContext, type ReactNode, type Dispatch } from 'react'
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
  switch(action.type){
    case 'load':
      return action.contacts 
    case 'add':
      return [...state, action.contact]
    case 'update':
      return state.map((c) => c.id === action.contact.id ? action.contact : c)
    case 'delete':
      return state.filter((c) => c.id !== action.id)
    default:
      return state
  }
}

// ---------------------------------------------------------------------------
// TODO 2 — context + provider + hook
// ---------------------------------------------------------------------------
interface ContactsContextValue {
  contacts: Contact[]
  dispatch: Dispatch<ContactAction>
}

// null default => useContacts() can detect "no provider above me" and throw.
const ContactsContext = createContext<ContactsContextValue | null>(null)

// shape of one https://jsonplaceholder.typicode.com/users record (the bits we use)
interface JsonUser {
  id: number
  name: string
  email: string
  phone: string
}

function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, dispatch] = useReducer(contactReducer, [])
  const { data } = useFetch<JsonUser[]>('https://jsonplaceholder.typicode.com/users')

  // when the seed data arrives, load it into the reducer once
  useEffect(() => {
    if (!data) return
    dispatch({
      type: 'load',
      contacts: data.map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone,
        note: '',
      })),
    })
  }, [data])

  return (
    <ContactsContext.Provider value={{ contacts, dispatch }}>
      {children}
    </ContactsContext.Provider>
  )
}

function useContacts(): ContactsContextValue {
  const ctx = useContext(ContactsContext)
  if (!ctx) {
    throw new Error('useContacts must be used inside <ContactsProvider>')
  }
  return ctx
}


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
// TODO 3 — <ContactList>  (route: "/")
// ---------------------------------------------------------------------------
function ContactList() {
  const { contacts, dispatch } = useContacts()

  if (contacts.length === 0) {
    return (
      <p>
        No contacts yet. <Link to="/new">Add one</Link>.
      </p>
    )
  }

  return (
    <div>
      <p>
        <Link to="/new">+ New contact</Link>
      </p>
      <ul>
        {contacts.map((c) => (
          <li key={c.id}>
            <Link to={`/contacts/${c.id}`}>{c.name}</Link>{' '}
            <button onClick={() => dispatch({ type: 'delete', id: c.id })}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// TODO 4 — replace this stub
function ContactDetail() {
  const { id } = useParams()
  return <p>ContactDetail for {id} — TODO 4</p>
}

// TODO 5 — replace this stub
function ContactForm({ mode }: { mode: 'new' | 'edit' }) {
  return <p>ContactForm ({mode}) — TODO 5</p>
}

export default function Exercise10() {
  return (
    <section>
      <h1>Exercise 10 — Contacts Manager</h1>
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
    </section>
  )
}
