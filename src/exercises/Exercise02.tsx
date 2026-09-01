// ============================================================================
// Exercise 02 — useState & Events
// ============================================================================
//
// GOAL
//   A counter with an adjustable step, an "Add 3 steps" button, and a running
//   tally of how many times you've gone up vs down.
//
// CONCEPTS THIS DRILLS
//   - const [x, setX] = useState(initial)
//   - you never mutate state directly — always call the setter
//   - the updater form: setX(prev => ...) and WHY it exists
//   - event handlers: onClick, and passing args without calling immediately
//   - holding an object in state + updating it immutably (spread)
//
// RULES FOR THIS ONE
//   - NO useEffect, NO extra components, NO .map. One component, local state.
//
// SWITCH TO THIS EXERCISE
//   In src/App.tsx, change the import + the tag from Exercise01 to Exercise02.
//
// WHEN IT WORKS
//   All buttons behave, "Add 3 steps" moves by exactly 3 * step, and the
//   up/down tally is right. Then tell me — and be ready to explain TODO 3.
// ============================================================================

import { useState } from 'react'

export default function Exercise02() {
  // TODO 1 — declare state:
  //   - `count`  : number, starts at 0
  //   - `step`   : number, starts at 1
  //   - `tally`  : an object { ups: number; downs: number }, starts { ups: 0, downs: 0 }
  //   Give the tally state an explicit type argument: useState<{...}>(...)
  const [count, setCount] = useState<number>(0);
  const [step, setStep] = useState<number>(1);
  const [tally, setTally] = useState<{ups: number; downs:number }>({ups:0, downs: 0})
  // TODO 2 — write these handlers.
  //   up()      : count + step, and tally.ups + 1
  //   down()    : count - step, and tally.downs + 1
  //   reset()   : count back to 0 (leave step and tally alone)
  //   For the tally object: do NOT mutate it. Build a new object with spread:
  //     setTally(prev => ({ ...prev, ups: prev.ups + 1 }))
  //   Question to hold in your head: does `up` need the updater form
  //   (prev => ...) for `count`, or is `count + step` fine? Why?
  const up = () : void  => {
    setCount(prev => prev + step);
    setTally(prev => ({ ...prev, ups: prev.ups + 1}))
  }

  const down = () : void => {
    setCount(prev => prev - step);
    setTally(prev => ({...prev, downs: prev.downs + 1}))
  }

  const reset = () : void => {
    setCount(0)
  } 
  
  // TODO 3 — the interesting one. Add `addThreeSteps()`.
  //   Implement it by calling your `up()` handler three times in a row:
  //       up(); up(); up();
  //   First write `up` as:  setCount(count + step)   (the "obvious" way)
  //   Run it. Click "Add 3 steps". Watch what actually happens.
  //   Then switch `up` to the updater form and try again.
  //   You'll be explaining the difference to me.

  const addThreeSteps = () => {
    up(); up(); up();
  }

  // TODO 4 — step controls:
  //   "step -" button: decrease step, but never below 1 (clamp it)
  //   "step +" button: increase step
  //   Show the current step in the label, e.g. "step: 2"
  function stepUp(): void {
    setStep(prev => prev + 1);
  }

  function stepDown(): void {
    setStep(prev => Math.max(1, prev - 1));
  }

  return (
    <section>
      <h1>Exercise 02 — Counter</h1>

      {/* TODO 5 — render the UI:
          - a big <p> showing the count
          - a <p> showing the tally, e.g.  "↑ 3 · ↓ 1"
          - buttons:  - (down)   + (up)   Add 3 steps   reset
          - buttons:  step -   [step: N]   step +

          Wiring reminder:
            onClick={down}      -> good: passes the function
            onClick={down()}    -> BUG: calls it during render, every render
            onClick={() => down()}  -> also fine, needed when passing arguments
      */}
      <p>{count}</p>
      <p>↑ {tally.ups} · ↓ {tally.downs}</p>
      <p>step: {step}</p>
      <button onClick={down}>-</button>
      <button onClick={up}>+</button>
      <button onClick={addThreeSteps}>Add 3 steps</button>
      <button onClick={stepUp}>step +</button>
      <button onClick={stepDown}>step -</button>
      <button onClick={reset}>reset</button>
    </section>
  )
}
