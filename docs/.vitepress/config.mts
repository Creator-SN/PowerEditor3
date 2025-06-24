import { defineConfig } from 'vitepress'
import path from 'path';

export default defineConfig({
    title: 'PowerEditor3',
    description: '基于VFluent3基础组件封装使用',
    lang: 'cn-ZH',
    base: '/via/',
    lastUpdated: true,
    vite: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '../../'),
            },
        },
    },
    themeConfig: {
        logo: '/favicon.ico',
        siteTitle: 'PowerEditor3',
        footer: {
            message: 'MIT Licensed',
            copyright: 'Copyright © Creator SN - 2025'
        },
        search: {
            provider: 'local'
        },
        outline: 3,
        socialLinks: [
            { icon: 'github', link: 'https://github.com/wocwin/t-ui-plus' }
        ],
        nav: [
            { text: 'PowerEditor3', link: '/' },
            {
                text: 'VFluent3',
                link: 'https://github.com/Creator-SN/VFluent3'
            },
            {
                text: '关于',
                items: [
                    { text: 'Creator SN', link: 'https://github.com/Creator-SN' },
                ]
            }
        ],
        sidebar: {
            '/components': [
                {
                    text: 'Main',
                    items: [
                        { text: 'Power Editor', link: '/components/powerEditor/index.md' },
                        { text: '下拉选择表格组件', link: '/components/TSelectTable/base.md' },
                    ]
                },
                {
                    text: 'Dev',
                    items: [
                        { text: 'Dev测试', link: '/components/devC/index.md' },
                    ]
                }
            ]
        }
    },
    markdown: {
        config(md) {

        }
    }
})
