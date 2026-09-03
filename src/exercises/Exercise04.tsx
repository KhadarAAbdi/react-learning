// ============================================================================
// Exercise 04 — Lifting State Up (component communication)
// ============================================================================
//
// GOAL
//   Same todo app as Exercise 03, but split into four components that talk to
//   each other through props. No behaviour changes — this is pure restructuring
//   to learn how data flows.
//
// CONCEPTS THIS DRILLS
//   - state lives in ONE place (the closest common parent) and flows DOWN as props
//   - children report events UP by calling callback props (onAdd, onToggle, ...)
//   - a child CAN own local state that doesn't need to be shared (the form's
//     draft text) — not everything lifts
//   - typing props for each component
//   - the naming convention: data props are nouns (todos, value), callback
//     props are onSomething
//
// THE SHAPE
//
//   Exercise04            <- owns `todos` + `filter`, owns add/toggle/remove
//   ├─ AddTodoForm        <- owns its own `draft`; calls onAdd(text)
//   ├─ FilterBar          <- stateless; calls onChange(filter)
//   └─ TodoList           <- stateless; gets todos + onToggle + onRemove
//      └─ TodoItem        <- stateless; one todo + onToggle + onRemove
//
// RULES
//   - No useEffect, no Context (that's a later exercise).
//   - Only Exercise04 calls useState for `todos`/`filter`. AddTodoForm calls
//     useState for its own `draft` and nothing else.
//   - TodoList and TodoItem call NO hooks at all — pure props in, JSX out.
//
// SWITCH TO THIS EXERCISE
//   Point src/App.tsx at Exercise04.
//
// WHEN IT WORKS
//   Behaves exactly like Exercise 03. Then tell me — and be ready to answer:
//   why does `draft` live in AddTodoForm but `todos` live in Exercise04?
// ============================================================================

import { useState } from 'react'

interface Todo {
  id: string
  text: string
  done: boolean
}

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

interface FilterBarProps {
  value: Filter
  onChange: (next: Filter) => void
}

interface AddTodoFormProps {
  onAdd: (text: string) => void
}

type Filter = 'all' | 'active' | 'done'

// ---------------------------------------------------------------------------
// TodoItem — one row. No state. No hooks.
// Props:
//   todo: Todo
//   onToggle: (id: string) => void
//   onRemove: (id: string) => void
// Render the <li> body from Exercise 03 (checkbox + strike-through text + x
// button). The checkbox/button handlers call onToggle(todo.id) / onRemove(todo.id).
// NOTE: the `key` does NOT go here — it goes on <TodoItem> where it's rendered
// in the .map. (Ask me why if that's surprising.)
// ---------------------------------------------------------------------------
// TODO 1
function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  return (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => onToggle(todo.id)}
              />
              <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
                {todo.text}
              </span>
              <button onClick={() => onRemove(todo.id)}>x</button>
            </li>
  )
}

// ---------------------------------------------------------------------------
// TodoList — the <ul>. No state. No hooks.
// Props:
//   todos: Todo[]          (already filtered by the parent)
//   onToggle: (id: string) => void
//   onRemove: (id: string) => void
// - If todos.length === 0, render <p>Nothing to show.</p>
// - Otherwise <ul> of <TodoItem key={t.id} ... /> — forward onToggle/onRemove
//   straight through.
// ---------------------------------------------------------------------------
// TODO 2
function TodoList({todos, onToggle, onRemove}: TodoListProps) {
  return (
    todos.length === 0 ? (
      <p>Nothing to show.</p>
    ) : (
      <ul>
        {todos.map((todo: Todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </ul>
    )
  )
}

// ---------------------------------------------------------------------------
// FilterBar — three buttons. No state. No hooks.
// Props:
//   value: Filter
//   onChange: (next: Filter) => void
// Each button calls onChange('all' | 'active' | 'done') and is disabled when
// it matches `value`.
// ---------------------------------------------------------------------------
// TODO 3
function FilterBar({ value, onChange }: FilterBarProps) {
  return(
    <div>
      <button onClick={() => onChange('all')} disabled={value === 'all'}>All</button>
      <button onClick={() => onChange('active')} disabled={value === 'active'}>Active</button>
      <button onClick={() => onChange('done')} disabled={value === 'done'}>Done</button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AddTodoForm — owns its OWN draft state.
// Props:
//   onAdd: (text: string) => void
// - useState for `draft` (string, '')
// - controlled <input> + <form onSubmit>
// - on submit: preventDefault, trim, bail if empty, call onAdd(trimmed),
//   clear the draft
// This component does NOT know about the todos array at all. It just emits text.
// ---------------------------------------------------------------------------
// TODO 4
function AddTodoForm({ onAdd }: AddTodoFormProps) {
  const [draft, setDraft] = useState<string>('');
  return(
    <form onSubmit={(e) => {
      e.preventDefault();
      const trimmedDraft: string = draft.trim();
      if (trimmedDraft === '') return;
      onAdd(trimmedDraft);
      setDraft('');
    }}>
      <input value={draft} onChange={e => setDraft(e.target.value)} />
      <button type="submit">Add</button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Exercise04 — the parent. Owns the shared state.
// ---------------------------------------------------------------------------
export default function Exercise04() {
  // TODO 5 — state: `todos` (Todo[]), `filter` (Filter, 'all').
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  // TODO 6 — the three operations, all immutable:
  //   addTodo(text: string)   -> append { id: crypto.randomUUID(), text, done: false }
  //   toggle(id: string)      -> flip done on the match
  //   remove(id: string)      -> drop the match
  //   (These are the SAME bodies as Exercise 03. addTodo now receives clean
  //    text — the trimming/guarding moved into AddTodoForm.)
  const addTodo = (text: string): void => { 
    const newTodo: Todo = { id: crypto.randomUUID(), text: text, done: false };
    setTodos([...todos, newTodo]);
  }

  const toggle =(id: string): void => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done} : t));
  }

  const remove = (id: string): void => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }
  // TODO 7 — derive `visible` from todos + filter (same as Exercise 03).
  const visible: Todo[] = filter === 'all' ? todos : filter === 'active' ? todos.filter(t => !t.done) : todos.filter(t => t.done);

  return (
    <section>
      <h1>Exercise 04 — Todos (split)</h1>
      {/* TODO 8 — compose:
          <AddTodoForm onAdd={addTodo} />
          <FilterBar value={filter} onChange={setFilter} />
          <TodoList todos={visible} onToggle={toggle} onRemove={remove} />
      */}
      <AddTodoForm onAdd={addTodo} />
      <FilterBar value={filter} onChange={setFilter} />
      <TodoList todos={visible} onToggle={toggle} onRemove={remove} />
    </section>
  )
}
