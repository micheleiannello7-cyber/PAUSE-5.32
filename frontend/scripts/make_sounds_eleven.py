"""PAUSE — generazione dei suoni UI con ElevenLabs Sound Effects (una tantum).

Mood: Calm/Headspace — caldo, soffuso, quasi un respiro. Produce varianti in
/tmp/sfx/<nome>-<n>.mp3 da cui scegliere; la scelta viene poi copiata in
assets/sounds/. La chiave resta in variabile d'ambiente, mai nel repo.

Usage: ELEVEN_API_KEY=... python3 scripts/make_sounds_eleven.py [nome ...]
"""
import os
import sys
from pathlib import Path

from elevenlabs import ElevenLabs

OUT = Path("/tmp/sfx")
VARIANTS = 3
PROMPTS = {
    "enter": (
        "Soft warm airy whoosh like a slow gentle inhale, calm meditation app screen transition, "
        "breathy rising pad with a smooth short reverb tail, intimate, very quiet and soothing, "
        "no clicks, no beeps, no percussion",
        1.2,
    ),
    "return": (
        "Soft warm airy whoosh like a slow gentle exhale, calm meditation app screen transition going back, "
        "breathy falling pad with a smooth short reverb tail, intimate, very quiet and soothing, "
        "no clicks, no beeps, no percussion",
        1.2,
    ),
    "complete": (
        "Single warm singing bowl tone with a soft felt mallet, gentle shimmering overtones, slow natural fade, "
        "calm meditation app completion sound, intimate and quiet, no harsh attack, no chime melody",
        2.2,
    ),
    "tick": (
        "Extremely soft and short muted felt tap, tiny warm wooden tick, calm meditation app UI micro feedback, "
        "very quiet, close and intimate, subtle, single hit",
        0.5,
    ),
}


def main() -> None:
    client = ElevenLabs(api_key=os.environ["ELEVEN_API_KEY"])
    names = sys.argv[1:] or list(PROMPTS)
    OUT.mkdir(parents=True, exist_ok=True)
    for name in names:
        prompt, seconds = PROMPTS[name]
        for i in range(1, VARIANTS + 1):
            audio = client.text_to_sound_effects.convert(
                text=prompt, duration_seconds=seconds, prompt_influence=0.75, output_format="mp3_44100_128",
            )
            path = OUT / f"{name}-{i}.mp3"
            with open(path, "wb") as f:
                for chunk in audio:
                    f.write(chunk)
            print(f"{path} {path.stat().st_size} bytes", flush=True)


if __name__ == "__main__":
    main()
