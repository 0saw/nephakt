import { store } from './store'

export interface HistoryItem {
  title: string
  id: number
  originalTitle: string
}

export interface HistoryState {
  items: HistoryItem[]
}

export const state = store<HistoryState>({
  items: []
})

export const subscribe = state.subscribe

export const append = (item: HistoryItem): void => {
  const newItems = [...state.items]
  const indexOfSimilar = newItems.findIndex((lookupItem) => lookupItem.id === item.id)

  if (indexOfSimilar !== -1) {
    newItems.splice(indexOfSimilar, 1)
  }

  newItems.unshift(item)

  state.items = newItems
  updateStorage(newItems)
}

export const updateFromStorage = (): void => {
  state.items = getFromStorage()
}

const STORAGE_KEY = 'nephakt-history'

const getFromStorage = (): HistoryItem[] => {
  try {
    const newItemsRaw = window.localStorage.getItem(STORAGE_KEY)
    if (newItemsRaw === null) {
      return []
    }

    const newItems = JSON.parse(newItemsRaw)
    if (
      Array.isArray(newItems) &&
      newItems.length > 0 &&
      'title' in newItems[0] &&
      'id' in newItems[0] &&
      'originalTitle' in newItems[0]
    ) {
      return newItems
    }
  } catch (e) {
    // no-op
  }

  return []
}

const updateStorage = (items: HistoryItem[]): void => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)))
}
