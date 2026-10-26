import { Provider } from 'react-redux'
import { store } from '@/app/store.js'

export function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>
}
