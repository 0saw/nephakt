import type { Genre } from '../types'
import { store } from './store'
import { getMovie } from '../api'

export interface DetailItem {
  genres: Genre[]
  id: number
  imdbId: string
  originalTitle: string
  title: string
  overview: string
  tagline: string
  posterPath: string
  year: string
}

export interface DetailState {
  item: DetailItem | null
}

export const state = store<DetailState>({
  item: null
})

export const subscribe = state.subscribe

export const fetchItem = async (id: number): Promise<void> => {
  try {
    const movieResponse = await getMovie(id)

    if ('success' in movieResponse && !movieResponse.success) {
      state.item = null

      return
    }

    if (!('id' in movieResponse)) {
      return
    }

    state.item = {
      genres: movieResponse.genres,
      id: movieResponse.id,
      imdbId: movieResponse.imdb_id,
      tagline: movieResponse.tagline,
      originalTitle: movieResponse.original_title,
      overview: movieResponse.overview,
      title: movieResponse.title,
      posterPath: movieResponse.poster_path,
      year: movieResponse.release_date.split('-')[0]
    }
  } catch (error: any) {
    state.item = null
    console.error('Произошла ошибка при запросе данных')
  }
}

export const clearItem = (): void => {
  state.item = null
}
