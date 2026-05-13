import { useRouter } from 'next/router'
import versions from '../versions.json'

const groupMap: Record<string, string> = {
  '/internal/requirements': 'requirements',
  '/guides': 'guides',
  '/features': 'features',
  '/developer': 'developer'
}

export default function VersionDropdown() {
  const router = useRouter()
  const path = router.asPath

  // Determine which group we're in
  let activeGroup = ''
  for (const [prefix, group] of Object.entries(groupMap)) {
    if (path.startsWith(prefix)) {
      activeGroup = group
      break
    }
  }

  if (!activeGroup) return null

  const group = versions.groups[activeGroup as keyof typeof versions.groups]
  if (!group || group.versions.length === 0) return null

  return (
    <select
      onChange={(e) => {
        if (e.target.value !== 'current') {
          window.open(
            `https://github.com/Hairscope/hairscope-clinic-platform-requirements/tree/${e.target.value}`,
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
      {group.versions.map((v) => (
        <option key={v.version} value={v.version === group.current ? 'current' : v.tag}>
          v{v.version} {v.version === group.current ? '(current)' : `(${v.date})`}
        </option>
      ))}
    </select>
  )
}
