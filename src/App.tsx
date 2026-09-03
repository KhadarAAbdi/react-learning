// App is just a shell. It renders whichever exercise we're currently working on.
// When we move to the next exercise, swap the import + the tag below.
import Exercise03 from './exercises/Exercise03'
import Exercise04 from './exercises/Exercise04'
import Exercise05 from './exercises/Exercise05'

export default function App() {
  return (
    <main className="app">
      <Exercise05 />
    </main>
  )
}
