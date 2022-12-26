export const ErrRequest = new Error('ошибка при обращении к серверу')

export const makeRequest = async <T = any>(url: string): Promise<T> => {
  const urlObject = new URL(`${process.env.API_BASE}${url}`)
  urlObject.searchParams.set('api_key', process.env.API_KEY)
  urlObject.searchParams.set('language', 'ru-RU')

  return await fetch(urlObject)
    .then((response) => {
      if (response.ok) {
        return response
      }

      throw ErrRequest
    })
    .then(async (response) => await response.json())
}
