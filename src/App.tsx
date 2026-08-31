// App is just a shell. It renders whichever exercise we're currently working on.
// When we move to the next exercise, swap the import + the tag below.
import Exercise01 from './exercises/Exercise01'

export default function App() {
  return (
    <main className="app">
      <Exercise01 />
    </main>
  )
}
