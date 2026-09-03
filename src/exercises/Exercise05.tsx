// ============================================================================
// Exercise 05 — useEffect & Data Fetching
// ============================================================================
//
// GOAL
//   Type a GitHub username; fetch that user from the GitHub API and show their
//   card. Handle loading, error (bad username = 404), and success states.
//
// CONCEPTS THIS DRILLS
//   - useEffect(fn, deps): when it runs — [] once, [dep] on change, none = every render
//   - side effects (network, timers, subscriptions) belong in an effect, not in render
//   - the effect callback cannot itself be async — work out the way around that
//   - modelling async UI: status = 'idle' | 'loading' | 'success' | 'error'
//   - the cleanup function, and the stale-response race it fixes
//   - the classic infinite loop: setState in an effect with wrong/missing deps
//
// RULES
//   - One component is fine (a small <UserCard> child is optional).
//   - No Redux, no router. Just useState + useEffect + fetch.
//   - Do TODO 4 in TWO passes: first WITHOUT cleanup (observe the bug), then add it.
//
// SWITCH TO THIS EXERCISE
//   Point src/App.tsx at Exercise05.
//
// WHEN IT WORKS
//   Typing a valid name shows the card; a nonsense name shows an error; while
//   the request is in flight you see "Loading…". Type fast and confirm the card
//   that lands always matches the text in the box. Then tell me.
// ============================================================================

import { useState, useEffect } from 'react'

// The subset of the GitHub /users/:name response we care about.
interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  public_repos: number
  followers: number
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function Exercise05() {
  // TODO 1 — state:
  //   - `username` : string, controlled input. Start with something real, e.g. 'gaearon'
  //   - `user`     : GitHubUser | null, the fetched data. Start null
  //   - `status`   : Status. Start 'idle'
  //   - `errorMsg` : string. Start '' (fill it when a fetch fails)
  const [username, setUsername] = useState('gaearon')
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // TODO 2 — the effect: fetch whenever the username changes.
  //   Requirements:
  //     - trim the username; if it's empty, don't fetch — put the UI back to
  //       the idle state (no user) and return early.
  //     - before firing the request: status = loading, clear any old error.
  //     - the callback you hand useEffect must stay synchronous. await needs an
  //       async function, so you need one somewhere that isn't that callback's
  //       own signature. Figure out where it goes.
  //     - GET https://api.github.com/users/<name>. If the response is not ok,
  //       turn it into an error (tell 404 "no such user" apart from other
  //       statuses). If it is ok, parse the JSON as GitHubUser.
  //     - drive status + user (or status + errorMsg) from the outcome. Make a
  //       thrown/network error land in your error state, not the console.
  //     - dependency array: what does this effect actually read that should
  //       re-trigger it?
  //   Get this working before TODO 3 or 4.
  useEffect(() => {
    const trimmed = username.trim()
    if (!trimmed) {
      setStatus('idle')
      setUser(null)
      return
    }
  
    const fetchUser = async () => {
      try {
        setStatus('loading')
        const res = await fetch(`https://api.github.com/users/${trimmed}`)

        if (!res.ok) {
          const message = res.status === 404 ? 'No such user' : `HTTP ${res.status}`
          throw new Error(message)
        }

        const user: GitHubUser = await res.json()
        setUser(user)
        setStatus('success')
      } catch (err: any) {
        setErrorMsg(err.message || 'Something went wrong')
        setStatus('error')
      }
    }
      fetchUser()

  }, [username])
  // TODO 3 — the dependency array.
  //   You put [username] above. Answer these before moving on (I'll ask):
  //     - what happens with []   instead?
  //     - what happens with no array at all?
  //     - why would calling setUser with NO array cause an infinite loop?

  return (
    <section>
      <h1>Exercise 05 — GitHub Lookup</h1>

      {/* TODO 5 — the input:
          controlled <input> bound to `username` (value + onChange).
      */}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter GitHub username"
      />

      {/* TODO 6 — render by status:
          - 'loading'  -> <p>Loading…</p>
          - 'error'    -> <p>{errorMsg}</p>
          - 'success'  -> the card: avatar <img>, name || login, @login, bio,
                          "{public_repos} repos · {followers} followers"
          - 'idle'     -> nothing, or a hint
          A switch on `status`, or a chain of ifs with early returns, or
          ternaries — your call. Don't render `user` unless status === 'success'.
      */}
      {status === 'loading' ? <p>Loading…</p> : null}
      {status === 'error' ? <p>{errorMsg}</p> : null}
      {status === 'success' && user ? (
        <div>
          <img style={{ width: '100px', height: '100px' }} src={user.avatar_url} alt={user.login} />
          <h2>{user.name || user.login}</h2>
          <p>@{user.login}</p>
          <p>{user.bio}</p>
          <p>{user.public_repos} repos · {user.followers} followers</p>
        </div>
      ) : null}
    </section>
  )
}
