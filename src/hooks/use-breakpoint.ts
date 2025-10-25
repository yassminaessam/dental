import * as React from 'react'

// Generic hook to track a max-width media query (in px)
export function useMaxWidth(maxWidth: number) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const m = 'matches' in e ? (e as MediaQueryListEvent).matches : (e as MediaQueryList).matches
      setMatches(m)
    }
    setMatches(mql.matches)
    mql.addEventListener('change', onChange as EventListener)
    return () => mql.removeEventListener('change', onChange as EventListener)
  }, [maxWidth])

  return matches
}
