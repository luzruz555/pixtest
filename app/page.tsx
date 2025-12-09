'use client'

import { useState, useEffect } from 'react'
import { Download, Settings, Sparkles, Image as ImageIcon, Loader2, ChevronDown, ChevronUp, Zap, Key } from 'lucide-react'

const MODELS = {
  'Tsubaki (DIT)': '1894092844569363483',
  'Tsubaki v1.1 (DIT)': '1935090615918113018',
  'Haruka v2 (SDXL)': '1861558740588989558',
}

const SAMPLERS = ['Euler a', 'Euler', 'DPM++ 2M', 'DPM++ 2M Karras', 'DPM++ SDE', 'DPM++ SDE Karras', 'DDIM']

// 유저 프리셋
const USER_PRESETS: { [key: string]: any } = {
  'LUZ555': {
    basePrompt: `(na tarapisu153:0.8), (say hana:0.8), (Azuuru:0.7), (kozimo123456:1.4), (freng:0.45), (patzzi:0.4), year 2024, year 2025, delicate face, kawaii aesthetic, 32k uhd, masterpiece, best quality, ultra-detailed, beautiful, nai3, (no halo:1.9), (no accessories:1.9), (no accessory:1.5), (no ornaments:1.8), blurry background, black lineart, bold lineart, soft skin`,
    negativePrompt: `bad quality, low quality, worst quality, lowres, nsfw, jpeg artifacts, scan artifacts, mosaic, cropped, error, fewer digits, bad reflection, bad composition, bad anatomy, bad hands, bad fingers, missing fingers, extra hands, extra legs, excess fingers, light particles, artist name, text, watermark, username, copyright name, bright, creature, creatures, sensei, teacher, (((halo))), hosino, accessory, 2girls, multiple people, chibi, multiple characters, sketched characters, blue archive characters, hairpin, thick eyebrows, piercing , brooch, text, (red blood:1.3), ornament`,
    loras: [
      { url: 'https://pixai.art/model/1950426337578887524', weight: 0.2 },
      { url: 'https://pixai.art/model/1844622188231356208', weight: 0.2 },
      { url: '', weight: 0.2 },
    ],
    emotions: [
      { id: 'happy', name: '기쁨', tags: 'smile, happy, (head tilt:0.6)', enabled: false },
      { id: 'smile', name: '미소', tags: 'light smile', enabled: false },
      { id: 'front', name: '정면샷', tags: 'facing at viewer, expressionless', enabled: false },
      { id: 'sad', name: '슬픔', tags: 'sad, looking down, crying, tears on face', enabled: false },
      { id: 'angry', name: '분노', tags: 'angry, glare, scawl', enabled: false },
      { id: 'shy', name: '부끄러움', tags: 'shy, blush, looking another, embarrassed', enabled: false },
      { id: 'dead', name: '사망', tags: 'empty eyes, dead eyes, death scene, black blood on face, black blood on cloth, lying, black blood on floor, lifeless body', enabled: false },
    ],
    steps: 25,
    sampler: 'Euler a',
    cfgScale: 6.7,
    rescaleCfg: 0.7,
  }
}

// 기본 빈 감정 태그
const DEFAULT_EMOTIONS = [
  { id: 'emotion1', name: '감정 1', tags: '', enabled: false },
  { id: 'emotion2', name: '감정 2', tags: '', enabled: false },
  { id: 'emotion3', name: '감정 3', tags: '', enabled: false },
  { id: 'emotion4', name: '감정 4', tags: '', enabled: false },
  { id: 'emotion5', name: '감정 5', tags: '', enabled: false },
]

// LoRA URL에서 ID 추출
const extractLoraId = (url: string): string | null => {
  const match = url.match(/model\/(\d+)/)
  if (match) return match[1]
  if (/^\d+$/.test(url.trim())) return url.trim()
  return null
}

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [basePrompt, setBasePrompt] = useState('')
  const [useBasePrompt, setUseBasePrompt] = useState(true)
  const [model, setModel] = useState('Tsubaki (DIT)')
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  
  const [loras, setLoras] = useState([
    { url: '', weight: 0.2 },
    { url: '', weight: 0.2 },
    { url: '', weight: 0.2 },
  ])
  
  const [steps, setSteps] = useState(25)
  const [sampler, setSampler] = useState('Euler a')
  const [cfgScale, setCfgScale] = useState(6.7)
  const [rescaleCfg, setRescaleCfg] = useState(0.7)
  const [fastMode, setFastMode] = useState(true)
  
  const [emotions, setEmotions] = useState(DEFAULT_EMOTIONS)
  const [showEmotions, setShowEmotions] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<{name: string, url: string}[]>([])
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [progress, setProgress] = useState('')
  
  // 유저코드
  const [userCode, setUserCode] = useState('')
  const [codeMessage, setCodeMessage] = useState('')

  useEffect(() => {
    const savedApiKey = localStorage.getItem('pixai_api_key')
    if (savedApiKey) setApiKey(savedApiKey)
    const savedBasePrompt = localStorage.getItem('pixai_base_prompt')
    if (savedBasePrompt) setBasePrompt(savedBasePrompt)
    const savedNegativePrompt = localStorage.getItem('pixai_negative_prompt')
    if (savedNegativePrompt) setNegativePrompt(savedNegativePrompt)
    const savedEmotions = localStorage.getItem('pixai_emotions')
    if (savedEmotions) setEmotions(JSON.parse(savedEmotions))
    const savedLoras = localStorage.getItem('pixai_loras')
    if (savedLoras) setLoras(JSON.parse(savedLoras))
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

  const updateLora = (index: number, field: 'url' | 'weight', value: string | number) => {
    const newLoras = [...loras]
    newLoras[index] = { ...newLoras[index], [field]: value }
    setLoras(newLoras)
    localStorage.setItem('pixai_loras', JSON.stringify(newLoras))
  }

  const updateEmotion = (id: string, field: 'enabled' | 'tags' | 'name', value: boolean | string) => {
    const newEmotions = emotions.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    )
    setEmotions(newEmotions)
    localStorage.setItem('pixai_emotions', JSON.stringify(newEmotions))
  }

  // 유저코드 적용
  const applyUserCode = () => {
    const preset = USER_PRESETS[userCode.toUpperCase()]
    if (preset) {
      setBasePrompt(preset.basePrompt)
      setNegativePrompt(preset.negativePrompt)
      setLoras(preset.loras)
      setEmotions(preset.emotions)
      setSteps(preset.steps)
      setSampler(preset.sampler)
      setCfgScale(preset.cfgScale)
      setRescaleCfg(preset.rescaleCfg)
      
      localStorage.setItem('pixai_base_prompt', preset.basePrompt)
      localStorage.setItem('pixai_negative_prompt', preset.negativePrompt)
      localStorage.setItem('pixai_loras', JSON.stringify(preset.loras))
      localStorage.setItem('pixai_emotions', JSON.stringify(preset.emotions))
      
      setCodeMessage('✅ 프리셋이 적용되었습니다!')
      setTimeout(() => setCodeMessage(''), 3000)
    } else {
      setCodeMessage('❌ 존재하지 않는 코드입니다')
      setTimeout(() => setCodeMessage(''), 3000)
    }
  }

  const generateSingleImage = async (finalPrompt: string, label: string) => {
    const loraData = loras
      .map(l => ({ loraId: extractLoraId(l.url), weight: l.weight }))
      .filter(l => l.loraId)

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey, 
        prompt: finalPrompt, 
        negativePrompt,
        model: MODELS[model as keyof typeof MODELS],
        width, height, 
        loras: loraData,
        steps, sampler, cfgScale, rescaleCfg,
        priority: fastMode
      })
    })

    const data = await response.json()
    if (data.success) {
      return { name: label, url: data.imageUrl }
    } else {
      throw new Error(data.error || '생성 실패')
    }
  }

  const generateImage = async () => {
    if (!apiKey) { setError('API 키를 입력해주세요'); return }
    if (!prompt) { setError('프롬프트를 입력해주세요'); return }

    setLoading(true)
    setError('')
    setGeneratedImages([])

    let basePromptFinal = prompt
    if (useBasePrompt && basePrompt) {
      basePromptFinal = `${basePrompt}, ${basePromptFinal}`
    }

    const imagesToGenerate = [
      { label: '기본', prompt: basePromptFinal }
    ]

    emotions.filter(e => e.enabled && e.tags).forEach(e => {
      imagesToGenerate.push({
        label: e.name,
        prompt: `${basePromptFinal}, ${e.tags}`
      })
    })

    try {
      const results: {name: string, url: string}[] = []
      
      for (let i = 0; i < imagesToGenerate.length; i++) {
        const img = imagesToGenerate[i]
        setProgress(`${img.label} 생성 중... (${i + 1}/${imagesToGenerate.length})`)
        
        const result = await generateSingleImage(img.prompt, img.label)
        results.push(result)
        setGeneratedImages([...results])
      }
      
      setProgress('')
    } catch (err: any) {
      setError(err.message || '요청 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const downloadImage = async (url: string, name: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `pixai_${name}_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      setError('다운로드 실패')
    }
  }

  const downloadAll = () => {
    generatedImages.forEach(img => downloadImage(img.url, img.name))
               }
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-mesh">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            ✨ Pixai Generator
          </h1>
          <p className="text-white/60">AI 이미지 생성기</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* API Key */}
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

            {/* 프롬프트 */}
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

            {/* 모델 & 크기 */}
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

            {/* LoRA 설정 */}
            <div className="glass-card rounded-2xl p-5">
              <label className="block text-sm text-white/70 mb-3">🎨 LoRA 설정 (최대 3개)</label>
              <div className="space-y-3">
                {loras.map((lora, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={lora.url}
                      onChange={(e) => updateLora(idx, 'url', e.target.value)}
                      placeholder="LoRA URL 또는 ID"
                      className="glass-input flex-1 px-3 py-2 rounded-lg text-white text-sm placeholder-white/30"
                    />
                    <div className="flex items-center gap-1 min-w-[100px]">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={lora.weight}
                        onChange={(e) => updateLora(idx, 'weight', parseFloat(e.target.value))}
                        className="w-16 accent-purple-500"
                      />
                      <span className="text-xs text-white/50 w-8">{lora.weight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 샘플링 설정 */}
            <div className="glass-card rounded-2xl p-5">
              <label className="block text-sm text-white/70 mb-3">🎛️ 샘플링 설정</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">샘플링 단계: {steps}</label>
                  <input type="range" min={10} max={50} step={1} value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">샘플링 방식</label>
                  <select value={sampler} onChange={(e) => setSampler(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm bg-transparent">
                    {SAMPLERS.map((s) => (
                      <option key={s} value={s} className="bg-gray-900">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">CFG 스케일: {cfgScale}</label>
                  <input type="range" min={2.5} max={20} step={0.1} value={cfgScale}
                    onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">리스케일 CFG: {rescaleCfg}</label>
                  <input type="range" min={0} max={1} step={0.05} value={rescaleCfg}
                    onChange={(e) => setRescaleCfg(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500" />
                </div>
              </div>
            </div>

            {/* 토글 옵션 */}
            <div className="glass-card rounded-2xl p-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">🎯 기본 프롬프트 적용</span>
                  <input type="checkbox" checked={useBasePrompt}
                    onChange={(e) => setUseBasePrompt(e.target.checked)}
                    className="toggle-checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/80 flex items-center gap-2"><Zap size={16} />빠른 생성</span>
                  <input type="checkbox" checked={fastMode}
                    onChange={(e) => setFastMode(e.target.checked)}
                    className="toggle-checkbox" />
                </div>
              </div>
            </div>

            {/* 감정 태그 */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <button onClick={() => setShowEmotions(!showEmotions)}
                className="w-full px-5 py-4 flex items-center justify-between text-white/80 hover:bg-white/5 transition-colors">
                <span className="flex items-center gap-2">😊 감정 태그</span>
                {showEmotions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {showEmotions && (
                <div className="p-5 pt-0 space-y-3 border-t border-white/10">
                  {emotions.map((emotion) => (
                    <div key={emotion.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={emotion.name}
                          onChange={(e) => updateEmotion(emotion.id, 'name', e.target.value)}
                          className="glass-input px-2 py-1 rounded text-white text-sm w-20"
                        />
                        <input type="checkbox" checked={emotion.enabled}
                          onChange={(e) => updateEmotion(emotion.id, 'enabled', e.target.checked)}
                          className="toggle-checkbox" />
                      </div>
                      <input
                        type="text"
                        value={emotion.tags}
                        onChange={(e) => updateEmotion(emotion.id, 'tags', e.target.value)}
                        placeholder="감정 태그 입력..."
                        className="glass-input w-full px-3 py-2 rounded-lg text-white text-xs placeholder-white/30"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 고급 설정 */}
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
                      rows={4} placeholder="기본으로 적용될 프롬프트..."
                      className="glass-input w-full px-4 py-3 rounded-xl text-white text-sm resize-none placeholder-white/30" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">네거티브 프롬프트</label>
                    <textarea value={negativePrompt} onChange={(e) => saveNegativePrompt(e.target.value)}
                      rows={4} placeholder="제외할 태그..."
                      className="glass-input w-full px-4 py-3 rounded-xl text-white text-sm resize-none placeholder-white/30" />
                  </div>
                </div>
              )}
            </div>

            {/* 생성 버튼 */}
            <button onClick={generateImage} disabled={loading}
              className="glass-button w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2">
              {loading ? (<><Loader2 className="animate-spin" size={20} />{progress || '생성 중...'}</>)
                : (<><Sparkles size={20} />이미지 생성 ({1 + emotions.filter(e => e.enabled && e.tags).length}장)</>)}
            </button>

            {error && (
              <div className="glass-card rounded-xl p-4 border-red-500/50 text-red-400 text-sm">❌ {error}</div>
            )}

            {/* 유저코드 */}
            <div className="glass-card rounded-2xl p-5">
              <label className="block text-sm text-white/70 mb-2 flex items-center gap-2"><Key size={16} />프리셋 코드</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="코드 입력..."
                  className="glass-input flex-1 px-4 py-3 rounded-xl text-white placeholder-white/30"
                />
                <button onClick={applyUserCode}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium">
                  적용
                </button>
              </div>
              {codeMessage && (
                <p className="mt-2 text-sm">{codeMessage}</p>
              )}
            </div>
          </div>

          {/* 이미지 출력 영역 */}
          <div className="glass-card rounded-2xl p-5 min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70 flex items-center gap-2"><ImageIcon size={18} />생성된 이미지</span>
              {generatedImages.length > 1 && (
                <button onClick={downloadAll}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                  <Download size={16} />전체 다운로드
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading && !generatedImages.length ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-indigo-400" size={48} />
                    <p className="text-white/50">{progress || '이미지 생성 중...'}</p>
                    <p className="text-white/30 text-sm mt-1">최대 5분 소요</p>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <div className="rounded-xl overflow-hidden bg-black/20">
                        <img src={img.url} alt={img.name} className="w-full h-auto object-contain" />
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/50 text-white text-xs">
                        {img.name}
                      </div>
                      <button 
                        onClick={() => downloadImage(img.url, img.name)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100">
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-white/30">
                  <div>
                    <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
                    <p>이미지가 여기에 표시됩니다</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-white/30 text-sm">Pixai Generator</div>
      </div>
    </main>
  )
                                                         }
