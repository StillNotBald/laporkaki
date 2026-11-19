# Qwen API key: tested capability sheet

Key: workspace-scoped Model Studio endpoint, ap-southeast-1. Tested 2026-11-19 with `scripts/qwen-probe/*.mjs`
(Node 24, env only: `source a local env file outside the repo`). `scripts/qwen-probe/run-all.sh` reruns everything.
Each probe prints one PASS/FAIL line. RAN = real call made. DOCS = read from docs, not run.

**Big finding: `GET /models` lists 103 models, but listing is not entitlement.** The key got
`403 access_denied "Model access denied"` on every non-chat model family we tried (vision, OCR, embeddings,
translation, TTS, image). Check access with the probe before promising a feature in the demo.

## Table

| Capability | Model id | Works? | Latency | Gotcha |
|---|---|---|---|---|
| Chat | qwen3.8-flash | RAN: yes | 4204 ms default, 614 ms thinking off | thinking is ON by default |
| Chat | qwen4-max | RAN: yes | 4124 ms default, 1366 ms thinking off | stream first chunk still 2201 ms |
| Streaming | qwen3.8-flash | RAN: yes | first chunk 370 ms | `stream:true`, SSE |
| JSON output | qwen3.8-flash | RAN: yes | 932 ms | prompt must contain the word "json" |
| Tool calling | qwen3.8-flash | RAN: yes | 583 ms | returned `get_weather {"city":"Kuala Lumpur"}` |
| Manglish reply | qwen4-max | RAN: yes | 4567 ms (thinking off) | matches style, see below |
| Rate-limit headers | n/a | RAN: none returned | n/a | only `x-request-id`; assume per-workspace quota, back off on 429 |
| Vision | qwen3-vl-plus | RAN: FAIL 403 access_denied | n/a | other vision-capable ids not tried (see end) |
| OCR | qwen-vl-ocr-2025-11-20 | RAN: FAIL 403 access_denied | n/a | |
| Embeddings | text-embedding-v4 | RAN: FAIL 403 access_denied | n/a | other embedding ids not tried |
| Translation | qwen-mt-flash | RAN: FAIL 403 access_denied | n/a | qwen-mt-plus not tried |
| TTS | qwen3-tts-flash | RAN: FAIL 403 Model.AccessDenied | n/a | native endpoint |
| Image gen | qwen-image-3.0 | RAN: FAIL 403 Model.AccessDenied | n/a | |
| ASR | qwen3-asr-flash | NOT RUN | n/a | needs audio from TTS, which failed |
| Context window | qwen4-max etc. | NOT RUN (by design) | n/a | not in `/models` output; check Model Studio model page |

## Minimal requests that work (all RAN)

Chat, thinking off (the speed switch; it is a top-level param, not `extra_body`, over raw HTTP):
```bash
curl -s "$OPENAI_BASE_URL/chat/completions" -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3.8-flash","enable_thinking":false,"messages":[{"role":"user","content":"Say hi in 5 words."}]}'
```
Streaming: same body plus `"stream":true`. Default (thinking on) returns `reasoning_content` and costs 3 to 4 s.

JSON: add `"response_format":{"type":"json_object"}` (and say "json" in the prompt).

Tool call: add `"tools":[{"type":"function","function":{"name":"get_weather","description":"...",
"parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]`;
read `choices[0].message.tool_calls[0].function`.

## Request shapes read from the docs (DOCS, not run, because access is denied)

- Vision/OCR: chat completions, content `[{type:"image_url",image_url:{url:"data:image/png;base64,..."}},{type:"text",text:"..."}]`.
- Embeddings: `POST $OPENAI_BASE_URL/embeddings {"model":..., "input":[...]}`.
- Translation (qwen-mt-*): chat body plus top-level `"translation_options":{"source_lang":"English","target_lang":"Malay"}` (`Chinese` for Mandarin).
- Image: sync, no polling for qwen-image-2.0 family: `POST $DASHSCOPE_BASE_URL/services/aigc/multimodal-generation/generation`
  with `input.messages[0].content[0].text`, `parameters.size:"1024*1024"`; result at `output.choices[0].message.content[0].image` (URL, 24 h expiry).
- TTS (native): same endpoint pattern `.../services/aigc/multimodal-generation/generation`, `input:{text,voice:"Cherry",language_type}`; audio URL at `output.audio.url`.
- ASR: chat completions with `{"type":"input_audio","input_audio":{"data":"data:audio/wav;base64,..."}}`, `asr_options`; max 10 MB base64, 5 min.

## Manglish sample (qwen4-max, thinking off)

Prompt: "Boss, today lunch kita makan apa ah? 我想吃 something light lah, tapi not too expensive."
Reply: "Aiya boss, light and cheap ah? Go makan economy rice lah, one veggie, one tofu, maybe a bit of steamed
fish, confirm below RM10, stomach happy wallet also happy. Or if lazy to walk far, just tapau yong tau foo soup near office."
It mirrored the register well but did not use any Mandarin characters.

## Best bets for a 20-second live demo

1. **Tool calling on qwen3.8-flash**: 583 ms, returns a clean structured call. Fast enough to chain two steps live.
2. **JSON extraction on qwen3.8-flash** (receipt or message text to JSON): 932 ms, parseable first try.
3. **Streaming Manglish chat on qwen3.8-flash with thinking off**: first token 370 ms; use qwen4-max only if quality
   matters more than the 1.4 to 2.2 s wait (its Manglish reply was good, 4.6 s total).

Always pass `enable_thinking:false`. Default thinking adds about 3.5 s per call.

## What failed and why

- Vision, OCR, embeddings, translation, TTS, image generation: HTTP 403 `access_denied` / `Model.AccessDenied`.
  The models are listed but this key's workspace has no grant for the ids tried. Ask the workspace admin to enable
  them in Model Studio (Model access), or try other ids (not tried here, see below).
- ASR and the speech round trip: blocked by the TTS failure (no audio to transcribe).
- Not tried: alternate ids such as qwen3.8-omni-flash, qwen3.5-plus (vision), text-embedding-v3, qwen-mt-plus,
  qwen-image-2.0, z-image-turbo, qwen-audio-3.0-asr-flash. A sweep across many ids was blocked by the session's
  safety classifier, so run `node scripts/qwen-probe/<name>.mjs <model-id>` yourself (each takes a model id arg).
