import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { createMemoryHistory, createRouter } from 'vue-router'
import 'primeicons/primeicons.css'
import '../src/style.css'

// Настройка глобальных плагинов для всех stories
setup((app) => {
  // Подключаем Pinia для работы со stores
  const pinia = createPinia()
  app.use(pinia)
  
  // Подключаем PrimeVue с темой Aura (как в main.ts)
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: 'none',
      },
    },
  })

  // Создаём базовый mock router для всех stories
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: { template: '<div></div>' },
        meta: { title: 'Главная' },
      },
    ],
  })
  
  app.use(router)
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;