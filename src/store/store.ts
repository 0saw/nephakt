export const store = <T extends Record<string | symbol | number, any>>(data: T): T & { _isProxy: boolean, subscribe: (arg0: (state: T) => void) => void } => {
  const subscribers: Array<(state: T) => void> = []

  const subscribe = (subscriber: typeof subscribers[0]): void => {
    subscribers.push(subscriber)
  }

  const emit = (): void => {
    subscribers.forEach((subscriber): void => {
      subscriber(data)
    })
  }

  const handler = (dataObj: T): ProxyHandler<T> => {
    return {
      get: function (obj, prop) {
        if (prop === '_isProxy') {
          return true
        }

        if (prop === 'subscribe') {
          return subscribe
        }

        if (['object', 'array'].includes(Object.prototype.toString.call(obj[prop]).slice(8, -1).toLowerCase()) && obj[prop]._isProxy === false) {
          Reflect.set(obj, prop, new Proxy(obj[prop], handler(dataObj)))
        }

        return obj[prop]
      },

      set: function (obj, prop, value) {
        if (obj[prop] === value) {
          return true
        }

        Reflect.set(obj, prop, value)
        emit()

        return true
      },

      deleteProperty: function (obj, prop) {
        Reflect.deleteProperty(obj, prop)
        emit()

        return true
      }
    }
  }

  return new Proxy(data, handler(data)) as T & { _isProxy: boolean, subscribe: (arg0: (state: T) => void) => void }
}
