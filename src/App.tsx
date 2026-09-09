// App is just a shell. It renders whichever exercise we're currently working on.
// When we move to the next exercise, swap the import + the tag below.

import Exercise10 from "./exercises/Exercise10";

export default function App() {
  return (
    <main className="app">
      <Exercise10 />
    </main>
  )
}
