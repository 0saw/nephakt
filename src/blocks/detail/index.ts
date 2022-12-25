import * as detailStore from '../../store/detail'
import { getURLParts } from '../../utils'

const imdbSvg = new URL('imdb.svg', import.meta.url)
const noImageSvg = new URL('no-image.svg', import.meta.url)

export const init = (): void => {
  const detailElement = document.querySelector<HTMLDivElement>('.js-detail')
  if (detailElement === null) {
    return
  }

  const render = (): void => {
    const {
      item
    } = detailStore.state

    if (item === null) {
      detailElement.innerHTML = ''

      return
    }

    const {
      genres,
      imdbId,
      title,
      overview,
      tagline,
      posterPath,
      year
    } = item

    detailElement.innerHTML = `
      ${posterPath !== ''
        ? (`
          <a class="hidden md:block" href="https://image.tmdb.org/t/p/original${posterPath}" target="_blank" rel="nofollow noopener">
            <img 
              class="rounded" src="https://image.tmdb.org/t/p/w300${posterPath}" 
              alt="постер к фильму ${title}" 
              onerror="this.src = '${noImageSvg.toString()}'"
            />
          </a>
        `)
        : ''
      }
      
      <div class="prose prose-slate">
        <h1 class="mb-0">${title}${year === '' ? ` (${year})` : ''}</h1>
      
        ${tagline !== '' ? `<blockquote class="my-2">${tagline}</blockquote>` : ''}
      
        ${overview !== '' ? `<p>${overview}</p>` : ''}
      
        ${genres.length > 0
          ? (`
            <div class="my-4 flex flex-wrap gap-2">
              Жанры:
              ${genres.map(({ name }) => (`
                <div class="rounded border border-slate-300 bg-slate-200 px-2">${name}</div>
              `)).join('')}
            </div>
          `)
          : ''
        }
        
        ${imdbId !== ''
          ? (`
            <div class="my-4 flex flex-wrap gap-2 not-prose">
              <a href="https://www.imdb.com/title/${imdbId}/" target="_blank" rel="noopener nofollow">
                <img src="${imdbSvg.toString()}" alt="">
              </a>
            </div>
          `)
          : ''
        }
      </div>
    `
  }

  const parseHashAndFetchItem = async (): Promise<void> => {
    const { path } = getURLParts()

    const match = path.match(/^\/movie\/(\d+)/)
    if (match === null || match.length <= 1) {
      detailStore.clearItem()

      return
    }

    const movieId = parseInt(match[1], 10)
    if (Number.isNaN(movieId)) {
      detailStore.clearItem()

      return
    }

    await detailStore.fetchItem(movieId)
  }

  window.addEventListener('hashchange', parseHashAndFetchItem)

  void parseHashAndFetchItem()
  detailStore.subscribe(render)
  render()
}
