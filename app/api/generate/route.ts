import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://api.pixai.art/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, prompt, negativePrompt, model, width, height, loras, steps, sampler, cfgScale, rescaleCfg } = body

    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 필요합니다' }, { status: 400 })
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }

    const payload = {
      parameters: {
        prompts: prompt,
        modelId: model,
        width: parseInt(width),
        height: parseInt(height),
        batchSize: 1,
        priority: 1000,
        negativePrompts: negativePrompt,
        loras: loras,
        steps: parseInt(steps),
        samplingMethod: sampler,
        cfgScale: parseFloat(cfgScale),
        rescaleCfg: parseFloat(rescaleCfg)
      }
    }

    const createResponse = await fetch(`${BASE_URL}/task`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      return NextResponse.json({ error: `태스크 생성 실패: ${errorText}` }, { status: createResponse.status })
    }

    const createData = await createResponse.json()
    const taskId = createData.task?.id || createData.id

    if (!taskId) {
      return NextResponse.json({ error: '태스크 ID를 찾을 수 없습니다' }, { status: 500 })
    }

    for (let i = 0; i < 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000))

      const statusResponse = await fetch(`${BASE_URL}/task/${taskId}`, { headers })
      const task = await statusResponse.json()
      const status = task.status

      if (status === 'completed') {
        const mediaUrls = task.outputs?.mediaUrls
        if (mediaUrls && mediaUrls.length > 0) {
          return NextResponse.json({ success: true, imageUrl: mediaUrls[0], taskId })
        }
        return NextResponse.json({ error: '이미지 URL을 찾을 수 없습니다', task }, { status: 500 })
      }

      if (status === 'failed' || status === 'cancelled') {
        return NextResponse.json({ error: `생성 실패: ${status}`, task }, { status: 500 })
      }
    }

    return NextResponse.json({ error: '시간 초과 (5분)' }, { status: 408 })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
