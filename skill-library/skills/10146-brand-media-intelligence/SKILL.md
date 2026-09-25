---
name: brand-media-intelligence
description: >
  母婴品牌媒体资产全量分析工作流。对品牌图片和视频进行内容提取、
  色彩DNA分析、运镜推断、Whisper本地音频转录、AIGC逆向Prompt生成，
  最终产出品牌级视觉DNA和竞品竞争矩阵。Use when the user asks to:
  (1) analyze brand media assets (images/videos),
  (2) extract visual DNA from product photos or marketing videos,
  (3) transcribe video audio content locally,
  (4) generate AIGC prompts to replicate or surpass competitor visuals,
  (5) build a visual competition matrix across brands,
  (6) run the media analysis pipeline for any brand or SKU.
  Trigger on keywords: media pipeline, visual DNA, brand assets analysis,
  video transcription, image analysis, competitor visual matrix,
  Whisper transcription, AIGC prompt generation.
---

# Brand Media Intelligence Pipeline

## Quick Start

Run the unified orchestrator with one command:

```bash
cd Brand_Data_Lake/scripts
python media_pipeline.py --all
```

For a single brand:
```bash
python media_pipeline.py --brand Momcozy
```

Resume from interruption:
```bash
python media_pipeline.py --all --resume
```

Start from a specific stage (e.g. after adding new videos):
```bash
python media_pipeline.py --all --stage transcribe
```

## Pipeline Stages

| # | Stage | Script | Output | Time |
|---|-------|--------|--------|------|
| 1 | **analyze** | `media_analyzer.py` | `_image_analysis.md` + `_video_analysis.md` + `12_media_dna.md` per SKU | ~1-2h |
| 2 | **transcribe** | `whisper_transcriber.py` | `*.whisper.json` per video | ~1-2h |
| 3 | **merge** | `merge_transcription.py` | Enhanced `_video_analysis.md` with subtitles | ~1min |
| 4 | **aggregate** | `brand_visual_dna_aggregator.py` | `_visual_dna_master.md` per brand | ~1min |
| 5 | **matrix** | `global_visual_matrix.py` | `00_GLOBAL_VISUAL_MATRIX.md` | ~1min |

## Architecture

```
Brand_Data_Lake/
├── scripts/
│   └── media_pipeline.py          ← UNIFIED ENTRYPOINT
│   └── media_analyzer.py          ← Stage 1
│   └── whisper_transcriber.py     ← Stage 2
│   └── merge_transcription.py     ← Stage 3
│   └── brand_visual_dna_aggregator.py ← Stage 4
│   └── global_visual_matrix.py    ← Stage 5
├── [Brand]/
│   └── _visual_dna_master.md      ← Brand-level output
│   └── SKU??_*/
│       ├── assets/_image_analysis.md
│       ├── videos/_video_analysis.md
│       ├── videos/*.whisper.json
│       └── 12_media_dna.md
└── 00_GLOBAL_VISUAL_MATRIX.md     ← Global output
```

## State & Recovery

Pipeline state is persisted to `Brand_Data_Lake/.pipeline_state.json`.
Use `--resume` to continue from the last incomplete stage.
Use `--force` to ignore existing results and re-run everything.

## Prerequisites

- Python 3.14+ with: Pillow, numpy, opencv-python, requests
- ffmpeg + ffprobe (for video analysis)
- openai-whisper (for local transcription)

Install:
```bash
pip install Pillow numpy opencv-python requests openai-whisper
```

## Detailed Workflows

For stage-specific details, see references:
- **Image analysis**: See [references/image-analysis.md](references/image-analysis.md)
- **Video analysis + Whisper**: See [references/video-analysis.md](references/video-analysis.md)
- **AIGC prompt generation**: See [references/aigc-prompts.md](references/aigc-prompts.md)
