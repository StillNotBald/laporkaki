# 02 — Winning patterns for a 1–2 day AI hackathon, and Qwen capabilities beyond a chatbot

Researched 2026-11-19 via web search/fetch. Every line is `[stated]` (with URL) or `[inferred]` (my reasoning/guess).
Model names below were verified on official Alibaba Cloud Model Studio (international, Singapore/ap-southeast-1) doc pages on this date.

## 1. Patterns in winning projects (2025–2026)

- [stated] Judges (JetBrains x Codex Hackathon, 2026): "A strong project with a confusing demo loses to a simpler project that the judges understand." https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/
- [stated] Scope: "The best projects do one thing really well rather than five things halfway"; if the demo runs long, "cut down on your features" (Colin Lowenberg, Nebius). Same URL.
- [stated] First seconds: "You have to be able to show something working within about 90 seconds" (Jono Bacon); start by making judges feel the problem (Avi Press, Scarf). Same URL.
- [stated] Staging: "Mock everything you can and make sure all your forms are filled"; pre-fill data, mock slow API calls, remove every stall point; be direct about what works and what doesn't. Same URL.
- [stated] Organiser data (Socia, ~90 projects judged in 2026; 26 of 30 teams shipped at a 3-hour event): judges weigh idea, wow, completeness, feasibility — multiplied by the pitch; "judges only score what they understood." https://socia.ae/blog/how-to-win-your-first-hackathon
- [stated] Socia's 3-minute pitch shape: 30s meet one named user and their pain → 90s live journey with the wow in the middle → 30s feasibility (cost/data/who pays) → 30s next. Same URL.
- [stated] Wow moments that win: "It acts, not just answers… It meets people where they already are (WhatsApp, a phone camera, a voice note)… It's fast at something that is slow today." Same URL.
- [stated] Failing live call: "Keep the backup video open in another tab. A live demo that crashes with a recording behind it is a good story… with nothing behind it is a long silence." Same URL.
- [stated] Serial winner: "Do a live demo of your core features… Always have a backup video, just in case." https://szeyusim.medium.com/how-i-win-most-hackathons-stories-pro-tips-from-a-serial-hacker-1969c6470f92 (search snippet)
- [stated] lablab.ai guide: winning = focused problem + working demo fast + judging rubric + delivery. https://lablab.ai/guide/how-to-win-an-ai-hackathon (search snippet)
- [inferred] For a 1–2 day build: one journey of 5–7 steps, deployed URL before halfway, real data, freeze features 30 min before deadline, rehearse out loud with a timer.

## 2. Why strong builds lose

- [stated] Confusing demo beats no demo: strong project + confusing pitch loses to simpler, understood project. https://blog.jetbrains.com/ai/2026/06/how-to-win-a-hackathon-notes-from-the-judging-table/
- [stated] Feature-itis: "Trying to do too much… guaranteeing that nothing in your demo works end to end." Same URL.
- [stated] Skipping the problem statement because the tech feels self-evident (Avi Press). Same URL.
- [stated] Lopsided effort: "Everyone builds until the last ten minutes, then someone improvises a pitch" — the most common way strong teams lose. https://socia.ae/blog/how-to-win-your-first-hackathon
- [stated] Generic ideas: models nudge everyone to the same study planners / "chat with your PDF" apps; judges stop being impressed by the third one. Same URL.
- [stated] Incompleteness: "the agent will tell you a feature is done when it isn't"; dead buttons and faked integrations lose points; one real integration beats five fakes. Same URL.
- [stated] "AI slop" look (same purple gradients, emoji headings, placeholder copy) registers as generic "in the first two seconds." Same URL.
- [stated] No feasibility answers (cost per user, data rights, what breaks at 1,000 users) makes a team "sound like a project," not a company. Same URL.

## 3. Qwen on Model Studio, Singapore region — capability, model, <20s demo idea

All model IDs [stated] on the linked official pages; demo ideas are [inferred]. Overview: https://www.alibabacloud.com/help/en/model-studio/models

- Long context — `qwen-long` (10M tokens, file upload); `qwen4-max` / `qwen3.7-plus` / `qwen3.8-flash` all 1M context. Demo: drop a 300-page supplier contract, ask "what changed in payment terms?" — answer streams while judges watch. https://www.alibabacloud.com/help/en/model-studio/text-generation-model and https://www.alibabacloud.com/help/en/model-studio/long-context-qwen-long
- Vision/video understanding — `qwen4-max`, `qwen3.7-plus` accept text+images+video natively (up to 2h video, 2048 images); no separate VL model needed. Demo: point the phone camera at a mamak menu board → itemised prices appear. https://www.alibabacloud.com/help/en/model-studio/text-generation-model
- OCR — `qwen3.5-ocr` (PDF parsing, certificates incl. Malaysian ID, multi-turn), `qwen-vl-ocr` / `qwen-vl-ocr-2025-11-20` (tables, formulas, handwriting, skew correction, text localisation). Demo: photo of a crumpled handwritten kedai receipt → line items + total as JSON. https://www.alibabacloud.com/help/en/model-studio/qwen-vl-ocr
- Image generation — `qwen-image-3.0-pro`: complex layouts (menus, posters), renders text down to 10px, multilingual fonts, up to 6 variants, 2048². `z-image-turbo`: ~10x faster, ~1/5 cost, photorealistic. Demo: type "Raya promo poster, nasi lemak RM5.90" → poster with correct Malay text (use turbo live, pro pre-baked). https://www.alibabacloud.com/help/en/model-studio/image-model
- Image editing — same ID `qwen-image-3.0-pro` edits (1–3 reference images); `wan2.7-image-pro` for up to 9 refs, bbox editing, brand colours, 4096². Demo: upload a product photo → "batik background, add 20% off badge." https://www.alibabacloud.com/help/en/model-studio/image-model
- Speech-to-text — `qwen-audio-3.1-asr-flash-streaming` (live captions), `-message` (dictation), `qwen-audio-3.1-asr-flash` (≤5 min files, diarization), `-filetrans` (long files); hotwords, dialect-expression preservation, filler cleanup. Demo: speak a voice order → words appear live, fillers cleaned. https://www.alibabacloud.com/help/en/model-studio/asr-model
- Text-to-speech — `qwen-audio-3.1-tts-flash` (low latency, emotion tags, voice cloning/design), `-plus` (quality); `qwen3-tts-flash(-realtime)`, `cosyvoice-v3-plus/flash` also in Singapore. Demo: paste one promo line → hear it in a designed "warm aunty" voice. https://www.alibabacloud.com/help/en/model-studio/tts-model
- Realtime voice — `qwen3.8-omni-flash-realtime`: full-duplex, text/image/audio/video in, text+audio out, WebRTC/WebSocket/AOQ, semantic VAD, function calling + MCP + web search; understands 113 languages, speaks 36. Demo: interrupt it mid-sentence in Malay; it stops and answers instantly. https://www.alibabacloud.com/help/en/model-studio/realtime
- Live translation — `qwen3.8-livetranslate-flash-realtime` (also `qwen3.5-…`): 60 languages (29 audio+text, 31 text-only), ~2.3s latency, speaker diarization, camera-image disambiguation, free real-time voice cloning. Demo: speak Malay → English speech in your own voice ~2s later. https://www.alibabacloud.com/help/en/model-studio/qwen3-5-livetranslate-flash-realtime
- Text translation — `qwen-mt-flash` (92 langs, streaming), `-plus` (best quality), `-lite` (31 langs, fastest); glossary terms, translation memory, domain prompts. Demo: paste a Manglish WhatsApp order → clean Mandarin reply, brand terms kept. https://www.alibabacloud.com/help/en/model-studio/machine-translation
- Embeddings & rerank — `text-embedding-v4`, `qwen3.7-text-embedding`, `tongyi-embedding-vision-plus` (multimodal), `qwen3-rerank`. Demo: type a misspelled product name → right SKU tops 500 items instantly. https://www.alibabacloud.com/help/en/model-studio/models (IDs) and https://www.alibabacloud.com/help/en/model-studio/embedding-rerank-model
- Tool calling — `qwen4-max`/`qwen3.7-plus`/`qwen3.8-flash` support Function Calling + built-in web search/code interpreter. Demo: "order more teh tarik if stock < 10" → visible function call places the order. https://www.alibabacloud.com/help/en/model-studio/tool-calls
- Structured output — same three models output valid JSON from text/images/video. Demo: business-card photo → validated contact JSON fills a form live. https://www.alibabacloud.com/help/en/model-studio/qwen-structured-output
- Coding — `qwen3-coder-flash` (1M context, tools, structured output); `qwen4-max` billed for complex reasoning/coding. Demo: describe a stall-profit calculator → generated app runs on screen. https://www.alibabacloud.com/help/en/model-studio/text-generation-model
- Note: `qwen3.8-omni-flash` (non-realtime) does audio/video analysis with thinking + tools, text out; use `qwen3.5-omni-plus` when you need spoken replies over HTTP. [stated] https://www.alibabacloud.com/help/en/model-studio/qwen-omni

## 4. Malaysian languages (text and speech)

- Malay text: `qwen-mt-plus/flash` list Malay among 92 languages (also `qwen-mt-lite`, 31). [stated] https://www.alibabacloud.com/help/en/model-studio/machine-translation
- Mandarin + Cantonese text: Chinese and Cantonese both in the 92-language MT list. [stated] Same URL.
- Tamil text: Tamil in the 92-language MT list. [stated] Same URL.
- Speech in — Malay, Mandarin, Cantonese: explicitly listed for `qwen-audio-3.1-asr-flash*`, `fun-asr`, `qwen3-asr-flash*` (also Hokkien, Hakka, many Chinese regional accents). [stated] https://www.alibabacloud.com/help/en/model-studio/asr-model
- Speech in — Tamil: NOT listed on the ASR page's language lists; unverified for dedicated ASR. Omni claims 113 input languages but the full input list wasn't retrievable; Tamil input via Omni is a guess. [stated absence / inferred] Same URL; https://www.alibabacloud.com/help/en/model-studio/qwen-omni
- Speech out — Malay AND Tamil AND Cantonese: Qwen3.5-Omni speaks 74 languages (incl. Malay, Tamil) + 39 dialects (incl. Cantonese, HK Cantonese, Hokkien, Hakka). [stated] https://www.alibabacloud.com/help/en/model-studio/qwen-omni
- TTS: `qwen-audio-3.1-tts-flash` cloned voices support "Malaysian", Tamil and Cantonese; `qwen3-tts-flash` system voices include Cantonese (varies by voice); CosyVoice v3-flash has Cantonese/Hokkien system voices. [stated] https://www.alibabacloud.com/help/en/model-studio/tts-model
- Live translation: Malay (`ms`) is audio+text target; Cantonese (`yue`) is text-only target; Tamil is absent from the 60-language table. [stated] https://www.alibabacloud.com/help/en/model-studio/qwen3-5-livetranslate-flash-realtime
- Manglish / code-switching: no official doc states Manglish support. [inferred] Malay+English+Chinese mixing is plausible given the multilingual lists, ASR hotwords/context and dialect-preservation features; treat as a guess and rehearse the exact demo utterance beforehand.

## 5. Ten "first 30 seconds" openers — Malaysian small-business/everyday life, no login (all [inferred])

1. Judge scans a QR on the slide → phone opens the app; snap a photo of a handwritten resit order → itemised bill with total in RM appears (OCR + structured output).
2. Speak a Manglish voice note — "boss, hantar dua nasi lemak, satu teh tarik kurang manis" → live transcript becomes a confirmed order ticket (ASR + tools).
3. Hold a crumpled supplier invoice to the camera → cost-per-dish breakdown and "your margin dropped 8% this week" (OCR + qwen3.7-plus).
4. Speak Malay into the mic; the room hears English in the speaker's own cloned voice ~2s later (livetranslate voice clone).
5. Type "menu poster for Nasi Lemak Antarabangsa, RM5.90, Raya promo" → poster with readable Malay text renders on screen (z-image-turbo live; qwen-image-3.0-pro backup).
6. Photograph a stall's product shelf → out-of-stock items flagged and a reorder message drafted to the supplier (vision + tool call).
7. Interrupt a voice assistant mid-sentence in Cantonese; it stops, switches language, and answers the price question (omni-realtime semantic VAD).
8. Paste a 200-message customer WhatsApp export → "3 complaints about delivery, 12 asks for halal cert" summary card (long context + structured output).
9. Upload one product photo → three lifestyle ad variants with the brand colour preserved appear side by side (wan2.7-image-pro / qwen-image editing).
10. Say a promo line in Tamil; the app speaks it back as a natural Malay announcement for the shop's PA (MT text + TTS; note Tamil ASR gap — pre-type the Tamil text if needed).

## Caveats

- Model line-up moves fast; re-check the console model market for Singapore before the build. [inferred]
- Image generation and long-file transcription can exceed 20s; pre-generate assets and keep a cached result + backup video for every live call. [inferred from §1 sources]
- Endpoints are workspace-specific (`https://{WorkspaceId}.ap-southeast-1.maas.aliyuncs.com/...`); keys are region-specific, server-side only. [stated] https://www.alibabacloud.com/help/en/model-studio/qwen3-5-livetranslate-flash-realtime