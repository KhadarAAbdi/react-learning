// ============================================================================
// Exercise 09 — useRef / useMemo / useCallback
// ============================================================================
//
// GOAL
//   Four small demos, one per idea. Each is built so you FEEL what the hook
//   fixes — several are "make it janky first, then apply the hook."
//
// THE BIG PICTURE (read before starting)
//   These three hooks are NOT things you sprinkle everywhere. Each has a cost
//   (a deps array to compare every render, plus memory). Most components are
//   fast enough that memoizing them is pure noise that makes the code harder
//   to read for zero benefit. Reach for them when:
//     - useRef: you need a DOM node, OR a value that survives renders but must
//       NOT trigger a re-render when it changes
//     - useMemo: a computation is genuinely expensive AND runs on renders where
//       its inputs didn't change
//     - useCallback: a function identity must stay stable because something
//       downstream compares it (a React.memo child, an effect dependency)
//
// RULES
//   - One file, several small components. No router, no context.
//   - Do the demos in order — B and C depend on seeing A's pattern first.
//
// SWITCH TO THIS EXERCISE
//   Point src/App.tsx at Exercise09.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState, memo, type JSX } from 'react'

// A deliberately slow pure function — provided, don't optimize it. It's here so
// the useMemo demo has something real to lag on.
function slowSquareSum(n: number): number {
  let total = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < 3000; j++) {
      total += Math.sqrt(i * j)
    }
  }
  return Math.round(total)
}

// ---------------------------------------------------------------------------
// DEMO A — useRef for a DOM node
//
//   TODO A1: <AutoFocusInput /> — an <input> that focuses itself on mount.
//     - useRef<HTMLInputElement>(null), attached via ref={...}
//     - useEffect(() => { ... }, []) that calls .focus() on the node
//     - a "Refocus" <button> that also focuses it (on click, not via state)
//   The ref gives you the actual DOM element to call imperative methods on
//   (.focus(), .scrollIntoView(), .play(), measuring size...). You are NOT
//   allowed to do this by putting the node in state.
// ---------------------------------------------------------------------------
const AutoFocusInput = () : JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = () : void => {
    inputRef.current?.focus()
    console.log(inputRef.current?.value)
  }

  return (
    <div>
      <input ref={inputRef} type='text' />
      <button onClick={handleFocus}>Focus</button>
    </div>
  )
}
// ---------------------------------------------------------------------------
// DEMO B — useRef for a value that must NOT cause re-renders
//
//   TODO B1: <RenderInfo /> — a component with:
//     - a number in useState, and a button that increments it
//     - a ref `renderCount` that you increment by 1 on EVERY render (just
//       `renderCount.current++` in the component body — this is allowed for a
//       ref, it would be a bug for state)
//     - a ref `prevValue` that, via an effect, always holds the PREVIOUS
//       value of the state number
//     - render: "count: X | previous: Y | renders: Z"
//   Confirm: clicking the button bumps count and renders; "previous" trails by
//   one; "renders" keeps climbing. Then answer for yourself: why would doing
//   `renderCount` with useState instead of useRef create an infinite loop?
// ---------------------------------------------------------------------------
const RenderInfo = () : JSX.Element => {
  const [value, setValue] = useState<number>(0)
  const renderCount = useRef(0)
  renderCount.current++

  const prevValue = useRef(value)

  useEffect(() => {
    prevValue.current = value
  }, [value])
  
  
  return (
    <div>
      <p>count: {value} | previous: {prevValue.current} | renders: {renderCount.current}</p>
      <input onClick={() => setValue(v => v + 1)} type='button' />
    </div>
  )
}
// ---------------------------------------------------------------------------
// DEMO C — useMemo for an expensive computation
//
//   TODO C1: <HeavyWidget /> with TWO pieces of state:
//     - `size` (number, controlled by an <input type="number">), fed into
//       slowSquareSum(size) and displayed
//     - `clicks` (number, a plain counter button, totally unrelated to size)
//   First write it with a bare `const result = slowSquareSum(size)` in the
//   body. Click the counter button a few times — notice the whole UI stutters,
//   because slowSquareSum re-runs on every render even though `size` didn't
//   change.
//   TODO C2: wrap it: `const result = useMemo(() => slowSquareSum(size), [size])`.
//   Now the counter is snappy; the slow work only runs when `size` changes.
// ---------------------------------------------------------------------------
const HeavyWidget = (): JSX.Element => {
  const [size, setSize] = useState(2000)
  const [clicks, setClicks] = useState(0)

  // useMemo caches the result and only recomputes when `size` changes. To feel
  // the problem it solves, swap this for the bare line and click the counter:
  //   const result = slowSquareSum(size)   // re-runs slowSquareSum EVERY render
  const result = useMemo(() => slowSquareSum(size), [size])

  return (
    <div>
      <label>
        size:{' '}
        <input
          type="number"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
      </label>
      <p>
        slowSquareSum({size}) = {result}
      </p>
      <button onClick={() => setClicks((c) => c + 1)}>clicks: {clicks}</button>
    </div>
  )
}
// ---------------------------------------------------------------------------
// DEMO D — useCallback + React.memo
//   (this is the "why does my child keep re-rendering" thing from Exercise 06)
//
//   TODO D1: a child `const Row = React.memo(function Row({ label, onPing }) {...})`
//     that renders `label` + a button calling onPing, and has
//     `console.log('Row render', label)` in its body.
//   TODO D2: parent <PingBoard /> with:
//     - an unrelated `tick` counter + button (re-renders the parent)
//     - render <Row label="A" onPing={...} />
//   First pass onPing as an inline arrow. Click the tick button — "Row render"
//   logs every time, even though nothing about Row changed. React.memo compares
//   props shallowly and the inline arrow is a NEW function each render.
//   TODO D3: wrap onPing in useCallback([]). Click tick again — "Row render"
//   stops logging. Row's props are now referentially stable.
// ---------------------------------------------------------------------------

interface RowProps {
  label: string
  onPing: () => void
}

// memo(...) makes React skip re-rendering this component when its props are
// shallow-equal to last render. The console.log lets you watch when it renders.
const Row = memo(function Row({ label, onPing }: RowProps) {
  console.log('Row render', label)
  return (
    <div>
      <span>Row {label} </span>
      <button onClick={onPing}>ping</button>
    </div>
  )
})

const PingBoard = (): JSX.Element => {
  const [tick, setTick] = useState(0)

  // useCallback returns the SAME function object across renders (deps []), so
  // <Row>'s props don't change identity and memo can skip it. To see the
  // problem: replace `handlePing` below with an inline `() => console.log('ping A')`
  // and watch "Row render A" log on every tick click.
  const handlePing = useCallback(() => {
    console.log('ping A')
  }, [])

  return (
    <div>
      <button onClick={() => setTick((t) => t + 1)}>tick: {tick}</button>
      <Row label="A" onPing={handlePing} />
    </div>
  )
}

export default function Exercise09() {
  return (
    <section>
      <h1>Exercise 09 — useRef / useMemo / useCallback</h1>
      <AutoFocusInput />
      <RenderInfo />
      <HeavyWidget />
      <PingBoard />
    </section>
  )
}
