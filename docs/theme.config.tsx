import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <img src="/logo.png" alt="Hairscope" style={{ height: '28px' }} />,
  project: {
    link: 'https://github.com/Hairscope/hairscope-clinic-platform-requirements'
  },
  docsRepositoryBase: 'https://github.com/Hairscope/hairscope-clinic-platform-requirements/tree/main/docs',
  footer: {
    content: <span>Hairscope Clinic Platform — Requirements &amp; Design Documentation</span>
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
