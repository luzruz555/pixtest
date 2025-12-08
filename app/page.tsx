'use client'

import { useState, useEffect } from 'react'
import { Download, Settings, Sparkles, Image as ImageIcon, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const MODELS = {
  'Tsubaki (DIT)': '1894092844569363483',
  'Tsubaki v1.1 (DIT)': '1935090615918113018',
  'Haruka v2 (SDXL)': '1861558740588989558',
}

const DEFAULT_BASE_PROMPT = `(na tarapisu153:0.8), (say hana:0.8), (Azuuru:0.7), (kozimo123456:1.4), (freng:0.45), (patzzi:0.4), year 2024, year 2025, delicate face, kawaii aesthetic, 32k uhd, masterpiece, best quality, ultra-detailed, beautiful, nai3, (no halo:1.9), (no accessories:1.9), (no accessory:1.5), (no ornaments:1.8), blurry background`

const DEFAULT_NEGATIVE_PROMPT = `bad quality, low quality, worst quality, lowres, nsfw, jpeg artifacts, scan artifacts, mosaic, cropped, error, fewer digits, bad reflection, bad composition, bad anatomy, bad hands, bad fingers, missing fingers, extra hands, extra legs, excess fingers, light particles, artist name, text, watermark, username, copyright name, bright, creature, creatures, sensei, teacher, (((halo))), hosino, accessory, 2girls, multiple people, chibi, multiple characters, sketched characters, blue archive characters, hairpin, thick eyebrows, piercing , brooch, text, (red blood:1.3), ornament`

const TRIGGER_WORDS = 'soft skin, bold lineart, black lineart'

const DEFAULT_LORAS = [
  { loraId: '1950426337578887524', weight: 0.2 },
  { loraId: '1844622188231356208', weight: 0.2 },
]

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState(DEFAULT_NEGATIVE_PROMPT)
  const [basePrompt, setBasePrompt] = useState(DEFAULT_BASE_PROMPT)
  const [useBasePrompt, setUseBasePrompt] = useState(true)
  const [useTrigger, setUseTrigger] = useState(true)
  const [model, setModel] = useState('Tsubaki (DIT)')
  const [width, setWidth] = useState(768)
  const [height, setHeight] = useState(1024)
  const [lora1Weight, setLora1Weight] = useState(0.2)
  const [lora2Weight, setLora2Weight] = useState(0.2)
  
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const savedApiKey = localStorage.getItem('pixai_api_key')
    if (savedApiKey) setApiKey(savedApiKey)
    const savedBasePrompt = localStorage.getItem('pixai_base_prompt')
    if (savedBasePrompt) setBasePrompt(savedBasePrompt)
    const savedNegativePrompt = localStorage.getItem('pixai_negative_prompt')
    if (savedNegativePrompt) setNegativePrompt(savedNegativePrompt)
  }, [])

  const saveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('pixai_api_key', key)
  }

  const saveBasePrompt = (p: string) => {
    setBasePrompt(p)
    localStorage.setItem('pixai_base_prompt', p)
  }

  const saveNegativePrompt = (p: string) => {
    setNegativePrompt(p)
    localStorage.setItem('pixai_negative_prompt', p)
  }

  const generateImage = async () => {
    if (!apiKey) { setError('API 키를 입력해주세요'); return }
    if (!prompt) { setError('프롬프트를 입력해주세요'); return }

    setLoading(true)
    setError('')
    setImageUrl('')

    let finalPrompt = prompt
    if (useBasePrompt) finalPrompt = `${basePrompt}, ${finalPrompt}`
    if (useTrigger) finalPrompt = `${finalPrompt}, ${TRIGGER_WORDS}`

    const loras = [
      { loraId: DEFAULT_LORAS[0].loraId, weight: lora1Weight },
      { loraId: DEFAULT_LORAS[1].loraId, weight: lora2Weight },
    ]

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey, prompt: finalPrompt, negativePrompt,
          model: MODELS[model as keyof typeof MODELS],
          width, height, loras
        })
      })

      const data = await response.json()
      if (data.success) setImageUrl(data.imageUrl)
      else setError(data.error || '생성 실패')
    } catch (err) {
      setError('요청 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const downloadImage = async () => {
    if (!imageUrl) return
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pixai_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('다운로드 실패')
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-mesh">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            ✨ Pixai Generator
          </h1>
          <p className="text-white/60">LUZ 전용 이미지 생성기</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <label className="block text-sm text-white/70 mb-2">🔑 API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="sk-..."
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/30"
              />
            </div>

            <div className="glass-card rounded-2xl p-5">
              <label className="block text-sm text-white/70 mb-2">✨ 프롬프트</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="1girl, silver hair, blue eyes, school uniform..."
                rows={3}
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/30 resize-none"
              />
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">📦 모델</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="glass-input w-full px-4 py-3 rounded-xl text-white bg-transparent"
                  >
                    {Object.keys(MODELS).map((m) => (
                      <option key={m} value={m} className="bg-gray-900">{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">너비: {width}</label>
                  <input type="range" min={512} max={1536} step={64} value={width}
                    onChange={(e) => setWidth(parseInt(e.target.value))}
                    className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-2">높이: {height}</label>
                  <input type="range" min={512} max={1536} step={64} value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full accent-indigo-500" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">🎯 기본 프롬프트 적용</span>
                  <input type="checkbox" checked={useBasePrompt}
                    onChange={(e) => setUseBasePrompt(e.target.checked)}
                    className="toggle-checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80">🔧 트리거 워드 적용</span>
                  <input type="checkbox" checked={useTrigger}
                    onChange={(e) => setUseTrigger(e.target.checked)}
                    className="toggle-checkbox" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <label className="block text-sm text-white/70 mb-3">🎚️ LoRA 가중치</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-white/50">LoRA 1: {lora1Weight}</span>
                  <input type="range" min={0} max={1} step={0.05} value={lora1Weight}
                    onChange={(e) => setLora1Weight(parseFloat(e.target.value))}
                    className="w-full accent-purple-500" />
                </div>
                <div>
                  <span className="text-xs text-white/50">LoRA 2: {lora2Weight}</span>
                  <input type="range" min={0} max={1} step={0.05} value={lora2Weight}
                    onChange={(e) => setLora2Weight(parseFloat(e.target.value))}
                    className="w-full accent-pink-500" />
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <button onClick={() => setShowSettings(!showSettings)}
                className="w-full px-5 py-4 flex items-center justify-between text-white/80 hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2"><Settings size={18} />고급 설정</span>
                {showSettings ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {showSettings && (
                <div className="p-5 pt-0 space-y-4 border-t border-white/10">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">기본 프롬프트</label>
                    <textarea value={basePrompt} onChange={(e) => saveBasePrompt(e.target.value)}
                      rows={4} className="glass-input w-full px-4 py-3 rounded-xl text-white text-sm resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">네거티브 프롬프트</label>
                    <textarea value={negativePrompt} onChange={(e) => saveNegativePrompt(e.target.value)}
                      rows={4} className="glass-input w-full px-4 py-3 rounded-xl text-white text-sm resize-none" />
                  </div>
                </div>
              )}
            </div>

            <button onClick={generateImage} disabled={loading}
              className="glass-button w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="animate-spin" size={20} />생성 중...</>)
                : (<><Sparkles size={20} />이미지 생성</>)}
            </button>

            {error && (
              <div className="glass-card rounded-xl p-4 border-red-500/50 text-red-400 text-sm">❌ {error}</div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 flex items-center gap-2"><ImageIcon size={18} />생성된 이미지</span>
              {imageUrl && (
                <button onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                  <Download size={16} />다운로드
                </button>
              )}
            </div>
            <div className="flex-1 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
              {loading ? (
                <div className="text-center">
                  <Loader2 className="animate-spin mx-auto mb-4 text-indigo-400" size={48} />
                  <p className="text-white/50">이미지 생성 중...</p>
                  <p className="text-white/30 text-sm mt-1">최대 5분 소요</p>
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="Generated" className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-center text-white/30">
                  <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                  <p>이미지가 여기에 표시됩니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-white/30 text-sm">Made with 💜 for LUZ</div>
      </div>
    </main>
  )
}
