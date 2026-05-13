import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import versions from './versions.json'

const config: DocsThemeConfig = {
  logo: (
    <>
      <img src="/logo.png" alt="Hairscope" className="nextra-logo" />
      <style>{`
        .nextra-logo { height: 16px; }
        @media (min-width: 768px) { .nextra-logo { height: 28px; } }
      `}</style>
    </>
  ),
  project: {
    link: ''
  },
  docsRepositoryBase: 'https://github.com/Hairscope/hairscope-clinic-platform-requirements/tree/main/docs',
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Hairscope Documentation — Platform guides, features, and resources for clinics and teams." />
      <meta name="og:title" content="Hairscope Documentation" />
      <meta name="og:description" content="Platform guides, features, and resources for clinics and teams." />
      <link rel="icon" href="/favicon.png" />
      <title>Hairscope Docs</title>
    </>
  ),
  footer: {
    content: <span>© {new Date().getFullYear()} Hairscope. All rights reserved.</span>
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  toc: {
    backToTop: true
  },
  navigation: {
    prev: true,
    next: true
  },
  navbar: {
    extraContent: (
      <select
        onChange={(e) => {
          if (e.target.value !== 'current') {
            const tag = e.target.value
            window.open(
              `https://github.com/Hairscope/hairscope-clinic-platform-requirements/tree/${tag}`,
              '_blank'
            )
          }
        }}
        defaultValue="current"
        style={{
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          background: 'transparent',
          fontSize: '13px',
          cursor: 'pointer'
        }}
      >
        {versions.versions.map((v) => (
          <option key={v.version} value={v.status === 'current' ? 'current' : v.tag}>
            v{v.version} {v.status === 'current' ? '(current)' : `(${v.date})`}
          </option>
        ))}
      </select>
    )
  }
}

export default config
