#!/usr/bin/env bash
# Runs every probe in order (tts before asr). Needs: source a local env file outside the repo
cd "$(dirname "$0")" && mkdir -p ../../.qoder-runs/probe
for p in chat json tools vision ocr embed translate manglish ratelimit tts asr image; do node $p.mjs; done
