// ============================================================================
// Exercise 06 — Checkpoint: GitHub Repo Search
// ============================================================================
//
// Consolidation checkpoint. No TODO-by-TODO scaffold — a spec. You decide the
// components, the state shape, and the structure. Use everything from 1–5.
//
// (Was "Country Search" — REST Countries v5 now needs an API key + per-origin
//  CORS setup. GitHub search is keyless and CORS-open from localhost.)
//
// ----------------------------------------------------------------------------
// WHAT TO BUILD
//
//   A search box. As the user types, fetch matching GitHub repos and show them
//   as a list of cards. Let the user "pin" repos to a list at the top that
//   survives further searching.
//
// API (NO auth header — GitHub rejects a bad one. Unauthenticated search is
// rate-limited to ~10/min; a 403 "rate limit" means you hit it, wait a minute.)
//
//   GET https://api.github.com/search/repositories?q=<query>&per_page=20
//     200 -> { total_count: number, items: RawRepo[] }
//     no matches -> 200 with items: []   (NOT a 404 — "no results" is an empty
//                   items array, so it's `repos.length === 0`, not a caught error)
//     403 -> rate limited (a real error)
//
//   fetchRepos() below maps the raw response to Repo[] for you.
//
// ----------------------------------------------------------------------------
// REQUIRED BEHAVIOUR
//
//   1. Controlled search input.
//   2. Fetch when the query changes. Empty query => show nothing, no request.
//   3. Visible states: idle (no query), loading, error (network / 403),
//      results, and "no matches" (empty result) as its own message.
//   4. Results render as a list — real keys (repo id), NOT the array index.
//      Each card: owner avatar, fullName as a link to `url`, description
//      (handle null), language (handle null), stars via toLocaleString().
//   5. A "pin" button per result card. Pinned repos show in a separate list
//      above the results and stay while you keep searching. Pinning the same
//      repo twice does nothing. Each pinned card has an "unpin" button.
//   6. The pinned list and the results list are SEPARATE components taking
//      data + callbacks as props. State lives in the one parent that owns both.
//   7. Do the fetch effect with cleanup — fast typing WILL race here.
//
// ----------------------------------------------------------------------------
// OPTIONAL
//   - Debounce the search (setTimeout in the effect, cleared in cleanup).
//   - Sort results by stars or name, toggled by a button.
//   - Show "{total_count} results".
//
// ----------------------------------------------------------------------------
// SWITCH TO THIS EXERCISE
//   Point src/App.tsx at Exercise06.
//
// Tell me when repos show on screen — I'll review structure, state placement,
// the effect, keys, conditionals. Do that BEFORE adding the pin list.
// ============================================================================
import { useState, useEffect } from 'react'

interface Repo {
  id: number
  fullName: string
  description: string | null
  stars: number
  language: string | null
  url: string
  ownerAvatar: string
}

interface SearchBoxProps {
  query: string
  onChange: (query: string) => void
}

interface PinnedListProps {
  pinned: Repo[]
  onUnpin: (repo: Repo) => void
}

interface ResultsListProps {
  results: Repo[]
  onPin: (repo: Repo) => void
}

type Status = 'idle' | 'loading' | 'error' | 'results' | 'empty'

const SearchBox = ({ query, onChange }: SearchBoxProps) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Search GitHub repos..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

const PinnedList = ({ pinned, onUnpin }: PinnedListProps) => {
  return (
    pinned.length > 0 && (
      <div>
        <h2>Pinned Repos</h2>
        {pinned.map((repo) => (
          <div key={repo.id}>
            <img src={repo.ownerAvatar} alt={`${repo.fullName} avatar`} width={50} height={50} />
            <a href={repo.url} target="_blank" rel="noopener noreferrer">
              {repo.fullName}
            </a>
            <p>{repo.description || 'No description'}</p>
            <p>Language: {repo.language || 'N/A'}</p>
            <p>Stars: {repo.stars.toLocaleString()}</p>
            <button onClick={() => onUnpin(repo)}>Unpin</button>
          </div>
        ))}
      </div>
    )
  )
}

const ResultsList = ({ results, onPin }: ResultsListProps) => {
  return (
    <div>
      <h2>Results</h2>
      {results.map((repo) => (
        <div key={repo.id}>
          <img src={repo.ownerAvatar} alt={`${repo.fullName} avatar`} width={50} height={50} />
          <a href={repo.url} target="_blank" rel="noopener noreferrer">
            {repo.fullName}
          </a>
          <p>{repo.description || 'No description'}</p>
          <p>Language: {repo.language || 'N/A'}</p>
          <p>Stars: {repo.stars.toLocaleString()}</p>
          <button onClick={() => onPin(repo)}>Pin</button>
        </div>
      ))}
    </div>
  )
}

// Fetches repos for a query and maps GitHub's response to Repo[].
// Throws on a non-ok response; network failures reject on their own.
async function fetchRepos(query: string): Promise<Repo[]> {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=10`
  
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(res.status === 403 ? 'Rate limited — wait a minute' : `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.items.map((it: any): Repo => ({
    id: it.id,
    fullName: it.full_name,
    description: it.description?.substring(0, 100) || null,
    stars: it.stargazers_count,
    language: it.language,
    url: it.html_url,
    ownerAvatar: it.owner.avatar_url,
  }))
}

export default function Exercise06() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Repo[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [pinned, setPinned] = useState<Repo[]>([])
  // Your work from here:
  //   - state for results (Repo[]) and status (the Status type)
  //   - wire this effect: empty query => idle, no fetch. Otherwise: loading,
  //     call fetchRepos, then set results + status ('results' or 'empty'), or
  //     'error' on a throw. Add the cleanup flag so a stale response can't win.
  //   - separate state for pinned repos + pin/unpin handlers (no duplicate ids)
  useEffect(() => {
    if (!query) {
      setResults([])
      setStatus('idle')
      return
    }
    
    let ignore = false

    const fetchData = async () => {
      return await fetchRepos(query)
    }

    setStatus('loading')
    fetchData().then((repos) => {
      if (!ignore) {
        setResults(repos)
        setStatus('results')
      }
    }).catch(() =>{
      if (!ignore) {
        setStatus('error')
      }
    })

    return () => {
      ignore = true
    }
    
  }, [query])

  return (
    <section>
      <h1>Exercise 06 — GitHub Repo Search</h1>
      <SearchBox query={query} onChange={setQuery} />
      {status === 'idle' && <p>Type to search for GitHub repos.</p>}
      {status === 'loading' && <p>Loading...</p>}
      {status === 'error' && <p>Error fetching repos. Try again later.</p>}
      {status === 'results' && results.length === 0 && <p>No matches found.</p>}
      {status === 'results' && results.length > 0 && (
        <div>
          <p>{results.length} result{results.length > 1 ? 's' : ''} found.</p>
          <ResultsList results={results} onPin={(repo) => setPinned((prev) => prev.some((p) => p.id === repo.id) ? prev : [...prev, repo])} />
        </div>
      )}
      {/* render: pinned list, then the status-driven results list */}
      <PinnedList pinned={pinned} onUnpin={(repo) => setPinned((prev) => prev.filter((p) => p.id !== repo.id))} />
    </section>
  )
}
