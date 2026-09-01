// ============================================================================
// Exercise 03 — Conditional Rendering & Lists
// ============================================================================
//
// GOAL
//   A todo list: add items, toggle them done, delete them, and filter the view
//   by all / active / done.
//
// CONCEPTS THIS DRILLS
//   - .map() to turn an array of data into an array of elements
//   - the `key` prop — and why array index is a bad key
//   - conditional rendering: early return, ternary in JSX, && short-circuit
//   - a controlled input (value tied to state, updated via onChange)
//   - <form> onSubmit + e.preventDefault()
//   - immutable array updates: add / toggle-one / remove-one
//
// RULES FOR THIS ONE
//   - Still ONE component. No child components yet, no useEffect, no .map key
//     shortcuts. We extract <TodoItem> in the next exercise (lifting state up).
//
// SWITCH TO THIS EXERCISE
//   In src/App.tsx, import Exercise03 and render <Exercise03 /> (you can drop
//   the earlier ones or leave them — your call).
//
// WHEN IT WORKS
//   Add a few todos, toggle some, delete one, flip through the filters, and
//   empty the whole list. Every state change must be immutable. Then tell me.
// ============================================================================

import { useState } from 'react'

interface Todo {
  id: string
  text: string
  done: boolean
}

type Filter = 'all' | 'active' | 'done'

export default function Exercise03() {
  // TODO 1 — state:
  //   - `todos`  : Todo[], start with 2-3 hard-coded items so there's something
  //                on screen (give them real ids: crypto.randomUUID())
  //   - `draft`  : string, the text box contents, start ''
  //   - `filter` : Filter, start 'all'
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState<string>('');
  const [filter, setFilter] = useState<Filter>('all');

  // TODO 2 — addTodo(e): the form submit handler.
  //   - e is a React.FormEvent<HTMLFormElement>; call e.preventDefault() FIRST
  //     (without it the browser reloads the page on submit)
  //   - trim the draft; if it's empty, do nothing
  //   - build a new Todo { id: crypto.randomUUID(), text: <trimmed>, done: false }
  //   - setTodos to a NEW array with the new todo appended  ([...prev, newTodo])
  //   - clear the draft
  const addTodo = (e: React.SubmitEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmedDraft : string = draft.trim()
    if (trimmedDraft === '') return;
    const newTodo : Todo = {id: crypto.randomUUID(), text: trimmedDraft, done: false};
    setTodos(prev => [...prev, newTodo]);
    setDraft('');
  }

  // TODO 3 — toggle(id): flip `done` on the one todo whose id matches.
  //   setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  //   Note: map returns a new array; the matched item is a new object; every
  //   other item is the SAME object reference (that's fine and good).
  const toggle = (id: string): void => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }
  // TODO 4 — remove(id): drop the todo with that id.
  //   setTodos(prev => prev.filter(t => t.id !== id))
  const remove = (id: string): void => {
    setTodos(prev => prev.filter(t => t.id !== id));
  }

  // TODO 5 — derive the visible list from `todos` + `filter`.
  //   Don't store this in state — compute it during render:
  //     const visible = filter === 'all'  ? todos
  //                   : filter === 'active' ? todos.filter(t => !t.done)
  //                   : todos.filter(t => t.done)
  const visible: Todo[] = filter === 'all' ? todos : filter === 'active' ? todos.filter(t => !t.done) : todos.filter(t => t.done);
  const activeCount: number = todos.filter(t => !t.done).length;

  return (
    <section>
      <h1>Exercise 03 — Todos</h1>

      {/* TODO 6 — the add form:
          <form onSubmit={addTodo}>
            a CONTROLLED <input>:  value={draft}  onChange={e => setDraft(e.target.value)}
            a <button type="submit">Add</button>
          </form>
          (Leave off value= and it's "uncontrolled"; leave off onChange and React
           warns it's read-only. You need both.)
      */}
      <form onSubmit={addTodo}>
        <input value={draft} onChange={e => setDraft(e.target.value)} />
        <button type="submit">Add</button>
      </form>

      {/* TODO 7 — filter buttons: All / Active / Done.
          Each sets `filter`. Bonus: mark the active one, e.g. disable it or
          bold it, using a conditional in JSX.
      */}
      <div>
        <button onClick={() => setFilter('all')} disabled={filter === 'all'}>All</button>
        <button onClick={() => setFilter('active')} disabled={filter === 'active'}>Active</button>
        <button onClick={() => setFilter('done')} disabled={filter === 'done'}>Done</button>
      </div>

      {/* TODO 8 — the list.
          - If `todos.length === 0`: render <p>Nothing here yet.</p> instead of
            the list. (Early return at the top of the component, or a ternary
            here — your pick. Try the early return.)
          - Otherwise map `visible` to <li>s. Each <li>:
              key={todo.id}   <-- NOT the array index. Ask me why if unsure.
              a checkbox: checked={todo.done} onChange={() => toggle(todo.id)}
              the text (strike-through it when done, via a conditional style)
              a <button onClick={() => remove(todo.id)}>x</button>
          - Under the list, ONLY when there are unfinished items, show a count:
              {activeCount > 0 && <p>{activeCount} left</p>}
            (this is the && short-circuit pattern)
      */}
      {todos.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        <ul>
          {visible.map(todo => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggle(todo.id)}
              />
              <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
                {todo.text}
              </span>
              <button onClick={() => remove(todo.id)}>x</button>
            </li>
          ))}
          {activeCount > 0 ? <p>{activeCount} left</p> : null}
        </ul>
      )}
    </section>
  )
}
