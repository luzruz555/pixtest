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

    // 🛠️ 수정된 Payload 구조
    const payload = {
      modelId: model, // 모델 ID는 최상위에 위치
      prompts: prompt, // 프롬프트도 최상위에 위치
      parameters: {
        // PixAI API에 맞는 변수명(snake_case)으로 변환
        negative_prompt: negativePrompt, 
        width: parseInt(width),
        height: parseInt(height),
        cfg_scale: parseFloat(cfgScale),
        step: parseInt(steps),
        sampler: sampler,
        
        // 🚨 LoRA 핵심 수정: loraId를 modelId로 변경하여 매핑
        lora: loras.map((l: any) => ({
          modelId: l.loraId,
          weight: l.weight
        }))
      }
    }

    // 필요하다면 rescaleCfg 추가 (API 지원 여부에 따라)
    if (rescaleCfg) {
      // @ts-ignore
      payload.parameters.rescale_cfg = parseFloat(rescaleCfg)
    }

    console.log('Sending Payload:', JSON.stringify(payload, null, 2)) // 디버깅용 로그

    const createResponse = await fetch(`${BASE_URL}/task`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('API Error:', errorText)
      return NextResponse.json({ error: `태스크 생성 실패: ${errorText}` }, { status: createResponse.status })
    }

    const createData = await createResponse.json()
    const taskId = createData.task?.id || createData.id

    if (!taskId) {
      return NextResponse.json({ error: '태스크 ID를 찾을 수 없습니다' }, { status: 500 })
    }

    // 폴링 로직 (기존과 동일)
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
    console.error('Server Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
