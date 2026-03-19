import { useState } from 'react'
import { useVisualizerStore } from '../../store/visualizer'
import { Button }     from '../ui/Button'
import { InputField } from '../ui/InputField'

export default function WallSizeStep() {
  const { wallWidth, wallHeight, setWallSize, setStep } = useVisualizerStore()

  const [w, setW] = useState(wallWidth.toString())
  const [h, setH] = useState(wallHeight.toString())
  const [errs, setErrs] = useState<{ w?: string; h?: string }>({})

  const wv = parseFloat(w)
  const hv = parseFloat(h)
  const valid = !isNaN(wv) && !isNaN(hv) && wv >= 0.5 && wv <= 10 && hv >= 0.5 && hv <= 10
  const area  = valid ? (wv * hv).toFixed(2) : '—'

  function validate() {
    const e: typeof errs = {}
    if (isNaN(wv) || wv < 0.5 || wv > 10) e.w = '0.5 — 10 м'
    if (isNaN(hv) || hv < 0.5 || hv > 10) e.h = '0.5 — 10 м'
    setErrs(e)
    return !Object.keys(e).length
  }

  function next() {
    if (!validate()) return
    setWallSize(wv, hv)
    setStep('panel_select')
  }

  return (
    <div style={{
      position:'absolute', inset:0, display:'flex',
      alignItems:'center', justifyContent:'center',
      zIndex:'var(--z-overlay)', pointerEvents:'none',
    }}>
      <div className="card anim-fadeup" style={{
        pointerEvents:'auto', width:'100%', maxWidth:420, margin:'0 16px',
      }}>
        {/* Header */}
        <p className="step-label">Шаг 1 из 3</p>
        <h2 style={{ fontSize:'var(--text-2xl)', fontWeight:'var(--weight-bold)', color:'var(--c-black)', lineHeight:1.15, marginBottom:6 }}>
          Размер стены
        </h2>
        <p style={{ fontSize:'var(--text-md)', color:'var(--c-gray-400)', marginBottom:28 }}>
          Введите ширину и высоту в метрах
        </p>

        {/* Inputs */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
          <InputField
            label="Ширина" suffix="м" error={errs.w}
            value={w} type="number" min={0.5} max={10} step={0.1}
            placeholder="3.0" autoFocus
            onChange={v => { setW(v); setErrs({}) }}
          />
          <InputField
            label="Высота" suffix="м" error={errs.h}
            value={h} type="number" min={0.5} max={10} step={0.1}
            placeholder="2.7"
            onChange={v => { setH(v); setErrs({}) }}
          />
        </div>

        {/* Area preview */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'13px 16px', background:'var(--c-gray-50)',
          borderRadius:'var(--r-md)', marginBottom:24,
        }}>
          <span style={{ fontSize:'var(--text-sm)', color:'var(--c-gray-400)' }}>Площадь стены</span>
          <span style={{ fontSize:'var(--text-lg)', fontWeight:'var(--weight-bold)', color:'var(--c-black)' }}>
            {area} м²
          </span>
        </div>

        <Button full size="lg" disabled={!valid} onClick={next}>
          Выбрать панели →
        </Button>
      </div>
    </div>
  )
}
