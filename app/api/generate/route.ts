import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const GENERATION_LIMITS: Record<string, number> = { free: 5, creator: 100, pro: Infinity }

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, generations_used_this_month, billing_period_start')
      .eq('id', user.id)
      .single()

    const plan = profile?.plan || 'free'
    const limit = GENERATION_LIMITS[plan] ?? 5
    const used = profile?.generations_used_this_month || 0

    const periodStart = new Date(profile?.billing_period_start || Date.now())
    const now = new Date()
    const monthsSinceStart = (now.getFullYear() - periodStart.getFullYear()) * 12 + (now.getMonth() - periodStart.getMonth())
    
    let currentUsed = used
    if (monthsSinceStart >= 1) {
      await supabase.from('profiles').update({ 
        generations_used_this_month: 0,
        billing_period_start: now.toISOString()
      }).eq('id', user.id)
      currentUsed = 0
    }

    if (currentUsed >= limit) {
      return NextResponse.json({ 
        error: `You've reached your ${plan} plan limit of ${limit} generations/month. Upgrade to generate more content.`,
        limitReached: true
      }, { status: 429 })
    }

    const { inputText, tone, selectedHook } = await request.json()

    if (!inputText?.trim()) {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 })
    }

    const hookContext = selectedHook ? `\n\nSelected hook to use: "${selectedHook}"` : ''
    const toneContext = tone || 'Professional'

    const [hooksResult, linkedinResult, twitterResult, tiktokResult] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Extract 7 high-performing social media hooks from this content. Each hook should be attention-grabbing and under 15 words. Return ONLY a JSON array of strings.

Content: ${inputText.slice(0, 2000)}

Return format: ["hook1", "hook2", ...]`
        }],
        temperature: 0.8,
      }),
      
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate 3 LinkedIn posts from this content.
Tone: ${toneContext}${hookContext}

Rules for each post:
- 150-300 words
- Professional tone with storytelling
- Strong opening hook
- Clear takeaway
- Version A: story-driven
- Version B: contrarian/bold
- Version C: data/insight-driven

Return ONLY valid JSON: {"a": "post A text", "b": "post B text", "c": "post C text"}

Content: ${inputText.slice(0, 2000)}`
        }],
        temperature: 0.8,
      }),
      
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate 3 Twitter/X threads from this content.
Tone: ${toneContext}${hookContext}

Rules for each thread:
- 8-10 tweets
- Each tweet under 280 characters
- Strong opening tweet (hook)
- Good flow and structure
- Version A: engaging/storytelling
- Version B: value-packed tips
- Version C: thought-leadership

Return ONLY valid JSON: {"a": ["tweet1", "tweet2", ...], "b": [...], "c": [...]}

Content: ${inputText.slice(0, 2000)}`
        }],
        temperature: 0.8,
      }),
      
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `Generate 3 TikTok/Reels scripts from this content.
Tone: ${toneContext}${hookContext}

Rules for each script:
- 30-60 second script
- Strong hook in first 3 seconds (must grab attention immediately)
- Conversational tone
- Include [ACTION] stage directions
- Version A: hook-focused/dramatic
- Version B: tutorial/how-to style
- Version C: trending audio/relatable

Return ONLY valid JSON: {"a": "script A", "b": "script B", "c": "script C"}

Content: ${inputText.slice(0, 2000)}`
        }],
        temperature: 0.8,
      }),
    ])

    let hooks: string[] = []
    let linkedin = { a: '', b: '', c: '' }
    let twitter: { a: string[]; b: string[]; c: string[] } = { a: [], b: [], c: [] }
    let tiktok = { a: '', b: '', c: '' }

    try {
      const hooksText = hooksResult.choices[0].message.content || '[]'
      hooks = JSON.parse(hooksText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch (e) {
      console.error('Failed to parse hooks JSON:', e)
      hooks = ['Great insight worth sharing', 'This changed how I think about things']
    }

    try {
      const linkedinText = linkedinResult.choices[0].message.content || '{}'
      linkedin = JSON.parse(linkedinText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch (e) {
      console.error('Failed to parse linkedin JSON:', e)
      linkedin = { a: 'Generation failed', b: 'Generation failed', c: 'Generation failed' }
    }

    try {
      const twitterText = twitterResult.choices[0].message.content || '{}'
      twitter = JSON.parse(twitterText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch (e) {
      console.error('Failed to parse twitter JSON:', e)
      twitter = { a: [], b: [], c: [] }
    }

    try {
      const tiktokText = tiktokResult.choices[0].message.content || '{}'
      tiktok = JSON.parse(tiktokText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch (e) {
      console.error('Failed to parse tiktok JSON:', e)
      tiktok = { a: 'Generation failed', b: 'Generation failed', c: 'Generation failed' }
    }

    await supabase.from('generations').insert({
      user_id: user.id,
      input_text: inputText,
      tone,
      hooks,
      selected_hook: selectedHook,
      linkedin,
      twitter,
      tiktok,
    })

    await supabase.from('profiles').update({ 
      generations_used_this_month: currentUsed + 1 
    }).eq('id', user.id)

    return NextResponse.json({ hooks, linkedin, twitter, tiktok })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
