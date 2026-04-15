import { defineConfig } from 'vitepress'
import path from 'path'

const powerEditorSidebar = [
    {
        text: 'PowerEditor 主编辑器',
        items: [
            { text: '快速开始', link: '/components/powerEditor/quick-start' },
            { text: '概览与 API', link: '/components/powerEditor/' }
        ]
    },
    {
        text: '进阶能力',
        items: [
            { text: 'MentionItem 提及项', link: '/components/powerEditor/mention-item' },
            { text: 'Markdown Decoder Plugins', link: '/components/powerEditor/markdown-decoder-plugins' },
            { text: 'ImgInterceptor 图片拦截器', link: '/components/powerEditor/img-interceptor' }
        ]
    },
    {
        text: '实验室',
        items: [
            { text: 'Dev 实验室', link: '/components/devC/' }
        ]
    }
]

const powerEditorSidebarEn = [
    {
        text: 'PowerEditor',
        items: [
            { text: 'Quick Start', link: '/en/components/powerEditor/quick-start' },
            { text: 'Overview and API', link: '/en/components/powerEditor/' }
        ]
    },
    {
        text: 'Advanced',
        items: [
            { text: 'MentionItem', link: '/en/components/powerEditor/mention-item' },
            { text: 'Markdown Decoder Plugins', link: '/en/components/powerEditor/markdown-decoder-plugins' },
            { text: 'ImgInterceptor', link: '/en/components/powerEditor/img-interceptor' }
        ]
    }
]

export default defineConfig({
    title: 'PowerEditor3',
    description: '基于 VFluent3 封装的 Vue3 富文本编辑器组件',
    lang: 'zh-CN',
    base: '/via/',
    lastUpdated: true,
    vite: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '../../')
            }
        }
    },
    themeConfig: {
        logo: '/favicon.ico',
        siteTitle: 'PowerEditor3',
        footer: {
            message: 'MIT Licensed',
            copyright: 'Copyright Creator SN - 2025'
        },
        search: {
            provider: 'local'
        },
        outline: 3,
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Creator-SN/PowerEditor3' }
        ],
        nav: [
            { text: 'PowerEditor3', link: '/' },
            { text: '主编辑器', link: '/components/powerEditor/' },
            {
                text: 'VFluent3',
                link: 'https://github.com/Creator-SN/VFluent3'
            },
            {
                text: '关于',
                items: [
                    { text: 'Creator SN', link: 'https://github.com/Creator-SN' }
                ]
            }
        ],
        sidebar: {
            '/components/': powerEditorSidebar
        }
    },
    locales: {
        root: {
            label: '简体中文',
            lang: 'zh-CN'
        },
        en: {
            label: 'English',
            lang: 'en-US',
            title: 'PowerEditor3',
            description: 'A Vue 3 rich text editor component built on VFluent3',
            themeConfig: {
                nav: [
                    { text: 'PowerEditor3', link: '/en/' },
                    { text: 'Editor', link: '/en/components/powerEditor/' },
                    {
                        text: 'VFluent3',
                        link: 'https://github.com/Creator-SN/VFluent3'
                    },
                    {
                        text: 'About',
                        items: [
                            { text: 'Creator SN', link: 'https://github.com/Creator-SN' }
                        ]
                    }
                ],
                sidebar: {
                    '/en/components/': powerEditorSidebarEn
                }
            }
        }
    },
    markdown: {
        config(md) {

        }
    }
})
