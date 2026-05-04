import type { Meta, StoryObj } from '@storybook/vue3-vite'
// import { fn } from 'storybook/test'
import Header from './Header.vue'
import { useRouter } from 'vue-router'
// import { useModalStore } from '@/stores/useModalStore'

/**
 * Компонент Header отображает заголовок страницы и опциональную кнопку создания.
 * 
 * Использует:
  * - vue-router для получения заголовка из route.meta.title
  * - useModalStore для открытия модальных окон
  * - PrimeVue Button компонент
  */

  // настройки для Storybook:
  const meta = {
    title: "Components/Header", // название компонента
    component: Header, // сам компонент
    tags: ["autodocs"], // позволяет Storybook автоматически генерировать документацию
    argTypes: {
      // управление пропсами
      showAddButton: {
        control: "boolean",
        description: 'Показывать ли кнопку "Создать заявку"',
      },
    },
  } satisfies Meta<typeof Header>; // “проверь, что я правильно описал компонент”

export default meta
type Story = StoryObj<typeof meta>

/**
 * Базовый Header без кнопки создания
 */
export const Default: Story = {
  args: {
    showAddButton: false,
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        const router = useRouter()
        
        // Добавляем маршрут и переходим на него
        router.addRoute({
          path: '/',
          name: 'home',
          component: { template: '<div></div>' },
          meta: { title: 'Главная' },
        })
        router.push('/')
        
        return {}
      },
      template: '<div style="background: #f5f5f5;"><story /></div>',
    }),
  ],
}

/**
 * Header с кнопкой "Создать заявку" на странице заявок на ремонт
 */
export const RepairRequestsPage: Story = {
  args: {
    showAddButton: true,
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        const router = useRouter()
        
        router.addRoute({
          path: '/repair-requests',
          name: 'repair-requests',
          component: { template: '<div></div>' },
          meta: { title: 'Заявки на ремонт' },
        })
        router.push('/repair-requests')
        
        return {}
      },
      template: '<div style="background: #f5f5f5;"><story /></div>',
    }),
  ],
}

/**
 * Header с кнопкой "Создать заявку" на странице заявок на запчасти
 */
export const PartsRequestsPage: Story = {
  args: {
    showAddButton: true,
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        const router = useRouter()
        
        router.addRoute({
          path: '/parts-requests',
          name: 'parts-requests',
          component: { template: '<div></div>' },
          meta: { title: 'Заявки на запчасти' },
        })
        router.push('/parts-requests')
        
        return {}
      },
      template: '<div style="background: #f5f5f5;"><story /></div>',
    }),
  ],
}

/**
 * Header без кнопки на странице склада
 */
export const WarehousePage: Story = {
  args: {
    showAddButton: false,
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        const router = useRouter()
        
        router.addRoute({
          path: '/warehouse',
          name: 'warehouse',
          component: { template: '<div></div>' },
          meta: { title: 'Склад' },
        })
        router.push('/warehouse')
        
        return {}
      },
      template: '<div style="background: #f5f5f5;"><story /></div>',
    }),
  ],
}

/**
 * Header с длинным заголовком для проверки отображения
 */
export const LongTitle: Story = {
  args: {
    showAddButton: true,
  },
  decorators: [
    (story) => ({
      components: { story },
      setup() {
        const router = useRouter()
        
        router.addRoute({
          path: '/custom',
          name: 'custom',
          component: { template: '<div></div>' },
          meta: { title: 'Очень длинный заголовок страницы для проверки отображения' },
        })
        router.push('/custom')
        
        return {}
      },
      template: '<div style="background: #f5f5f5;"><story /></div>',
    }),
  ],
}
