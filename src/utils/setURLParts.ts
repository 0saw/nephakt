import type { URLParts } from '../types'
import { getURLParts } from './getURLParts'

export const setURLParts = (parts: Partial<URLParts>): void => {
  const currentURLParts = getURLParts()
  let {
    path = currentURLParts.path,
    searchParams = currentURLParts.searchParams
  } = parts

  if (typeof parts.search !== 'undefined') {
    searchParams = new URLSearchParams(parts.search)
  }

  if (searchParams.toString() === '') {
    window.location.hash = path
  } else {
    window.location.hash = `${path}?${searchParams.toString()}`
  }
}
