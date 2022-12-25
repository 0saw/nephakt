import { getURLParts, setURLParts } from '../../utils'
import * as historyStore from '../../store/history'
import * as suggestionsStore from '../../store/suggestions'

export const init = (): void => {
  const formElement = document.querySelector<HTMLFormElement>('.js-suggest-form')
  const clearElement = document.querySelector<HTMLButtonElement>('.js-suggest-clear')
  const inputElement = document.querySelector<HTMLInputElement>('.js-suggest-input')
  const suggestionsElement = document.querySelector<HTMLUListElement>('.js-suggest-options')

  if (formElement === null || clearElement === null || inputElement === null || suggestionsElement === null) {
    return
  }

  const render = (): void => {
    const {
      isSuggestFocused,
      inputValue,
      suggestions
    } = suggestionsStore.state

    const { search } = getURLParts()

    inputElement.value = inputValue

    suggestionsElement.style.display = isSuggestFocused && suggestions.length !== 0 ? '' : 'none'
    suggestionsElement.innerHTML = suggestionsStore.getVisibleOptions()
      .map((suggestion) => (`
        <li>
          <a 
            class="block px-3 py-1 focus-visible:bg-slate-100 hover:bg-slate-100${suggestion.type === 'history' ? ' text-purple-800' : ''}"
            href="#/movie/${suggestion.value}${search !== '' ? `?${search}` : ''}"
          >${suggestion.title}</a>
        </li>
      `))
      .join('')
  }

  formElement.addEventListener('submit', (e) => {
    e.preventDefault()
  })

  clearElement.addEventListener('click', () => {
    suggestionsStore.state.inputValue = ''
    suggestionsStore.state.suggestions = []
    suggestionsStore.state.isSuggestFocused = false
    setURLParts({ search: '' })
  })

  inputElement.addEventListener('input', async ({ currentTarget }) => {
    if (!(currentTarget instanceof HTMLInputElement)) {
      return
    }

    suggestionsStore.state.inputValue = currentTarget.value
    setURLParts({
      search: currentTarget.value.trim() !== '' ? `q=${currentTarget.value}` : ''
    })

    await suggestionsStore.fetchSuggestions()
  })

  inputElement.addEventListener('click', suggestionsStore.fetchSuggestions)

  formElement.addEventListener('keydown', (e) => {
    const index = Array.prototype.indexOf.call(suggestionsElement.children, document.activeElement?.closest('li'))
    let newIndex = index

    if (e.key === 'ArrowUp') {
      newIndex = Math.max(0, newIndex - 1)
    } else if (e.key === 'ArrowDown') {
      newIndex = Math.min(suggestionsElement.children.length - 1, newIndex + 1)
    } else if (e.key === 'Escape') {
      suggestionsStore.state.isSuggestFocused = false
    }

    if (index !== newIndex && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
      suggestionsElement.children[newIndex]?.querySelector('a')?.focus()
    }
  })

  inputElement.addEventListener('focus', () => {
    suggestionsStore.state.isSuggestFocused = true
  })

  document.addEventListener('click', (e) => {
    if (!suggestionsStore.state.isSuggestFocused) {
      return
    }

    const newState = e.target instanceof Node && formElement.contains(e.target)
    if (suggestionsStore.state.isSuggestFocused !== newState) {
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      suggestionsStore.state.isSuggestFocused = newState
    }
  })

  suggestionsElement.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) {
      return
    }

    const liElement = e.target.closest('li')
    if (liElement === null) {
      return
    }

    const clickedIndex = Array.prototype.indexOf.call(suggestionsElement.children, liElement)
    const options = suggestionsStore.getVisibleOptions()

    if (typeof options[clickedIndex] !== 'undefined') {
      const { rawTitle, value, originalTitle } = options[clickedIndex]

      historyStore.append({
        title: rawTitle,
        id: value,
        originalTitle
      })
    }

    suggestionsStore.state.isSuggestFocused = false
  })

  historyStore.subscribe(render)
  suggestionsStore.subscribe(render)
  render()
}
