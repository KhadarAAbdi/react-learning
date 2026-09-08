// App is just a shell. It renders whichever exercise we're currently working on.
// When we move to the next exercise, swap the import + the tag below.
import Exercise06 from './exercises/Exercise06'
import Exercise07 from './exercises/Exercise07'
import Exercise08 from './exercises/Exercise08'
import Exercise09 from './exercises/Exercise09'

export default function App() {
  return (
    <main className="app">
      <Exercise09 />
    </main>
  )
}
