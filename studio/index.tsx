import {createRoot} from 'react-dom/client'
import {StudioProvider, Studio} from 'sanity'
import config from './sanity.config'

const rootElement = document.getElementById('sanity')
const root = createRoot(rootElement!)

root.render(
  <StudioProvider config={config}>
    <Studio config={config} />
  </StudioProvider>
)

