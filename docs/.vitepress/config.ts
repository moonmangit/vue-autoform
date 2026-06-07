import { defineConfig } from 'vitepress'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  title: 'VueAutoform',
  description: 'Headless Vue 3 form library with Zod validation & responsive grid layout',
  base: '/',
  lang: 'en',
  
  vite: {
    resolve: {
      alias: {
        'vue-autoform': resolve(__dirname, '../../src/index.ts'),
      },
    },
    ssr: {
      noExternal: ['vue-autoform'],
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/reference' },
      { text: 'Examples', link: '/examples/' },
      { text: 'npm', link: 'https://www.npmjs.com/package/@moonmangit/vue-autoform' },
      { text: 'GitHub', link: 'https://github.com/moonmangit/vue-autoform' },
    ],

    sidebar: {
      '/guide/': [
        { text: 'Getting Started', link: '/guide/getting-started' },
        { text: 'Field Components', link: '/guide/field-components' },
        { text: 'Layout', link: '/guide/layout' },
        { text: 'Validation', link: '/guide/validation' },
        { text: 'Submit Handling', link: '/guide/submit' },
        { text: 'Error Rendering', link: '/guide/error-rendering' },
        { text: 'CSS Variables', link: '/guide/css-variables' },
        { text: 'Custom Breakpoints', link: '/guide/custom-breakpoints' },
      ],
      '/api/': [
        { text: 'Props Reference', link: '/api/reference' },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/moonmangit/vue-autoform' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 moonmangit',
    },
  },
})
