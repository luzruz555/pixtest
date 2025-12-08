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

    // 1. LoRA 배열을 API가 원하는 { "ID": 가중치 } 객체 형태로 변환
    const loraObject = loras.reduce((acc: any, current: any) => {
      if (current.loraId && current.weight > 0) {
        acc[current.loraId] = current.weight
      }
      return acc
    }, {})

    // 2. Payload 구성
    const payload = {
      modelId: model,
      prompts: prompt,
      parameters: {
        negative_prompt: negativePrompt,
        width: parseInt(width),
        height: parseInt(height),
        cfg_scale: parseFloat(cfgScale),
        step: parseInt(steps),
        sampler: sampler,
        
        // 🚨 여기가 수정된 부분입니다 (배열 -> 객체)
        lora: loraObject
      }
    }

    // rescaleCfg 옵션 추가
    if (rescaleCfg) {
      // @ts-ignore
      payload.parameters.rescale_cfg = parseFloat(rescaleCfg)
    }

    // 디버깅을 위해 서버 로그에 출력 (터미널에서 확인 가능)
    console.log('Sending Payload:', JSON.stringify(payload, null, 2))

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

    // 3. 결과 대기 (폴링)
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
