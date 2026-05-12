import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <img src="/logo.png" alt="Hairscope" style={{ height: '28px' }} />,
  project: {
    link: 'https://github.com/Hairscope/hairscope-clinic-platform-requirements'
  },
  docsRepositoryBase: 'https://github.com/Hairscope/hairscope-clinic-platform-requirements/tree/main/docs',
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Hairscope Documentation — Platform guides, features, and resources for clinics and teams." />
      <meta name="og:title" content="Hairscope Documentation" />
      <meta name="og:description" content="Platform guides, features, and resources for clinics and teams." />
      <link rel="icon" href="/logo.png" />
    </>
  ),
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Hairscope Docs'
    }
  },
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
    extraContent: () => {
      return (
        <select
          onChange={(e) => {
            if (e.target.value !== 'current') {
              window.location.href = `/versions/${e.target.value}`
            }
          }}
          defaultValue="current"
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid var(--nextra-border-color)',
            background: 'transparent',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="current">v1.0.0 (current)</option>
        </select>
      )
    }
  }
}

export default config
