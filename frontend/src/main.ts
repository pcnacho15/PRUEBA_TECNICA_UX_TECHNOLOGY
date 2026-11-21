import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { env } from './config/env'
import { createOrdenesService, ORDENES_SERVICE_KEY } from './modules/ordenes/services/ordenes.service'
import { FetchHttpClient } from './shared/http/http-client'
import './style.css'

// Raíz de composición: aquí se eligen las implementaciones concretas.
const httpClient = new FetchHttpClient(env.apiBaseUrl)

createApp(App)
  .use(createPinia())
  .provide(ORDENES_SERVICE_KEY, createOrdenesService(httpClient))
  .mount('#app')
