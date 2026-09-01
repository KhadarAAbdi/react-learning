// App is just a shell. It renders whichever exercise we're currently working on.
// When we move to the next exercise, swap the import + the tag below.
import Exercise03 from './exercises/Exercise03'

export default function App() {
  return (
    <main className="app">
      <Exercise03 />
    </main>
  )
}
