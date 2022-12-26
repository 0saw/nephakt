import * as suggestionsStore from '../../store/suggestions'
import * as historyStore from '../../store/history'
import { getURLParts } from '../../utils'

export const init = (): void => {
  const historyElement = document.querySelector<HTMLDivElement>('.js-history')
  const historyList = document.querySelector<HTMLUListElement>('.js-history-list')

  if (historyElement === null || historyList === null) {
    return
  }

  const render = (): void => {
    const { search } = getURLParts()

    historyElement.style.display = historyStore.state.items.length === 0 ? 'none' : ''

    historyList.innerHTML = historyStore.state.items
      .slice(0, 3)
      .map(({ title, id }) => (`
        <li>
          <a
            class="block outline-none text-emerald-600 hover:text-emerald-500 focus-visible:text-emerald-500"
            href="#/movie/${id}${search !== '' ? `?${search}` : ''}"
          >${title}</a>
        </li>
      `))
      .join('')
  }

  window.addEventListener('storage', historyStore.updateFromStorage)

  historyStore.updateFromStorage()
  suggestionsStore.subscribe(render)
  historyStore.subscribe(render)
  render()
}
