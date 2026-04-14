import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export async function downloadModelAsZip(modelUrl: string, panelName: string): Promise<void> {
  const response = await fetch(modelUrl)
  if (!response.ok) throw new Error(`Failed to fetch model: HTTP ${response.status}`)
  const blob = await response.blob()

  const extension = modelUrl.split('.').pop() || 'glb'
  const safeName = panelName.replace(/\s+/g, '_')
  const fileName = `${safeName}.${extension}`

  const zip = new JSZip()
  zip.file(fileName, blob)

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, `${safeName}_3D_Model.zip`)
}
