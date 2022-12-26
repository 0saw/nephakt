import { SearchResult } from '../types'
import { store } from './store'
import { getURLParts } from '../utils'
import * as historyStore from './history'
import { getSuggestionsDebounced } from '../api'

interface Option {
  type: 'search' | 'history'
  title: string
  value: number
  rawTitle: string
  originalTitle: string
}

export interface SuggestionsState {
  isSuggestFocused: boolean
  inputValue: string
  lastInputValue: string
  suggestions: SearchResult[]
}

export const state = store<SuggestionsState>({
  isSuggestFocused: false,
  inputValue: getURLParts().searchParams.get('q') ?? '',
  lastInputValue: '',
  suggestions: []
})

export const subscribe = state.subscribe

export const fetchSuggestions = async (): Promise<void> => {
  if (state.lastInputValue === state.inputValue) {
    return
  }

  state.lastInputValue = state.inputValue
  getSuggestionsDebounced.cancel('abort')

  if (state.inputValue.trim() === '') {
    state.suggestions = []
    return
  }

  try {
    const { results } = await getSuggestionsDebounced(state.inputValue)
    state.suggestions = results
  } catch (e) {
    if (e !== 'abort') {
      throw e
    }
  }
}

const purifySearchString = (str: string): string => (
  str.toLowerCase().replaceAll(/[^a-zа-яё]/g, '')
)

export const getVisibleOptions = (): Option[] => {
  const inputValuePrepared = purifySearchString(state.inputValue)
  const itemsFromHistory: Option[] = historyStore.state.items
    .filter((item) => (
      purifySearchString(item.title).includes(inputValuePrepared) ||
      purifySearchString(item.originalTitle).includes(inputValuePrepared)
    ))
    .slice(0, 5)
    .map((item) => ({
      type: 'history',
      title: `${item.title}${item.originalTitle !== '' ? ` (${item.originalTitle})` : ''}`,
      value: item.id,
      rawTitle: item.title,
      originalTitle: item.originalTitle
    }))

  const historyIds = itemsFromHistory.map((item) => item.value)

  const itemsFromSuggestions: Option[] = state.suggestions
    .filter((suggestion) => !historyIds.includes(suggestion.id))
    .slice(0, 10 - itemsFromHistory.length)
    .map((suggestion) => {
      const parenthesisBits: string[] = []

      if (suggestion.original_title !== '' && suggestion.original_title !== suggestion.title) {
        parenthesisBits.push(suggestion.original_title)
      }

      if (suggestion.release_date !== '' && typeof suggestion.release_date.split('-')[0] !== 'undefined') {
        parenthesisBits.push(suggestion.release_date.split('-')[0])
      }

      return ({
        type: 'search',
        title: `${suggestion.title}${parenthesisBits.length > 0 ? ` (${parenthesisBits.join(', ')})` : ''}`,
        value: suggestion.id,
        rawTitle: suggestion.title,
        originalTitle: suggestion.original_title
      })
    })

  return [...itemsFromHistory, ...itemsFromSuggestions]
}
