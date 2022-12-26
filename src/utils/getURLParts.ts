import type { URLParts } from '../types'

const PATH_REGEXP = /^#(?<path>[^?]+)?\??(?<search>.*)?$/

export const getURLParts = (): URLParts => {
  const match = window.location.hash.match(PATH_REGEXP)

  if (match === null || typeof match.groups === 'undefined') {
    return {
      path: '',
      search: '',
      searchParams: new URLSearchParams('')
    }
  }

  try {
    const searchParams = new URLSearchParams(match.groups.search)

    return {
      path: match.groups.path ?? '',
      search: searchParams.toString(),
      searchParams
    }
  } catch (e) {
    return {
      path: match.groups.path ?? '',
      search: '',
      searchParams: new URLSearchParams('')
    }
  }
}
