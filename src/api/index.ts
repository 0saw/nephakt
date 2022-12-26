import type { MovieResponse, SearchResponse } from '../types'
import { debounce } from 'ts-debounce'
import { makeRequest } from '../request'

export const getSuggestions = async (query: string): Promise<SearchResponse> => {
  return await makeRequest(`/search/movie?query=${query}`)
}

export const getSuggestionsDebounced = debounce(getSuggestions, 300)

export const getMovie = async (id: number): Promise<MovieResponse | { success: false }> => {
  return await makeRequest(`/movie/${id}`)
}
