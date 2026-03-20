/**
 * SettingsTooltip.tsx
 * Small draggable panel for quick camera hints inside the 3D view.
 */

export function SettingsTooltip() {
  return (
    <div style={{ padding: '8px 14px 14px', minWidth: 230 }}>

      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        margin: '4px 0 12px 0',
      }}>Быстрые действия</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>

        <ActionRow icon="🎥" label="Управление камерой">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {([
              ['Перетащить', 'вращение'],
              ['Прокрутка',  'зум'],
              ['ПКМ',        'панорама'],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 10px', background: 'var(--ui-surface)', borderRadius: 8,
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </ActionRow>

      </div>
    </div>
  )
}

function ActionRow({ icon, label, children }: {
  icon: string; label: string; children?: React.ReactNode
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}
