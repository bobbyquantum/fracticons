import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Fracticons',
  tagline: 'Beautiful fractal avatars from any string',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  url: 'https://bobbyquantum.github.io',
  baseUrl: '/fracticons/',

  organizationName: 'bobbyquantum',
  projectName: 'fracticons',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/bobbyquantum/fracticons/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Fracticons',
      logo: {
        alt: 'Fracticons Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/demo',
          label: 'Demo',
          position: 'left',
        },
        {
          href: 'https://www.npmjs.com/package/fracticons',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/bobbyquantum/fracticons',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Quick Start',
              to: '/docs/quickstart',
            },
            {
              label: 'API Reference',
              to: '/docs/api',
            },
            {
              label: 'How It Works',
              to: '/docs/algorithm',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Demo',
              to: '/demo',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/bobbyquantum/fracticons',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/fracticons',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Fracticons. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
