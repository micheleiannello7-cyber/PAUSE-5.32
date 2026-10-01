// PAUSE — identità sonora dell'interfaccia: pochi feedback brevi e discreti
// (transizioni e conferme), MAI la lettura/narrazione, che ha il suo player.
// Interruttore globale "Effetti sonori" in Profilo → Impostazioni, salvato in
// locale e letto all'avvio (stesso schema di `haptics.ts`).
// I file sono generati da `scripts/make_sounds.py` (firma comune: toni di
// vetro in Re, soffio d'aria, attacchi lenti).
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AudioPlayer, createAudioPlayer } from "expo-audio";

const KEY = "pause.sounds.v1";
let enabled = true;
const listeners = new Set<(v: boolean) => void>();

AsyncStorage.getItem(KEY).then((raw) => {
  if (raw === "0") { enabled = false; listeners.forEach((l) => l(false)); }
}).catch(() => {});

export function isSoundsEnabled() { return enabled; }

export async function setSoundsEnabled(value: boolean) {
  enabled = value;
  listeners.forEach((l) => l(value));
  try { await AsyncStorage.setItem(KEY, value ? "1" : "0"); } catch {}
}

export function useSoundsEnabled(): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(enabled);
  useEffect(() => {
    listeners.add(setValue);
    setValue(enabled);
    return () => { listeners.delete(setValue); };
  }, []);
  return [value, setSoundsEnabled];
}

export type UiSound = "enter" | "return" | "complete" | "tick";

const SOURCES: Record<UiSound, number> = {
  enter: require("../assets/sounds/enter.wav"),
  return: require("../assets/sounds/return.wav"),
  complete: require("../assets/sounds/complete.wav"),
  tick: require("../assets/sounds/tick.wav"),
};
// Volume basso e uniforme; il micro-tocco delle card ancora più sotto.
const VOLUME: Record<UiSound, number> = { enter: 0.3, return: 0.3, complete: 0.32, tick: 0.16 };
// Scorrimento veloce: al massimo un tocco ogni tanto, mai una raffica.
const MIN_GAP_MS: Partial<Record<UiSound, number>> = { tick: 140 };

const players: Partial<Record<UiSound, AudioPlayer>> = {};
const lastPlayed: Partial<Record<UiSound, number>> = {};

function player(name: UiSound): AudioPlayer {
  let p = players[name];
  if (!p) {
    p = createAudioPlayer(SOURCES[name]);
    p.volume = VOLUME[name];
    players[name] = p;
  }
  return p;
}

/** Riproduce un effetto dall'inizio (un solo player per suono: niente sovrapposizioni). */
export function play(name: UiSound) {
  if (!enabled) return;
  const now = Date.now();
  const gap = MIN_GAP_MS[name];
  if (gap && now - (lastPlayed[name] ?? 0) < gap) return;
  lastPlayed[name] = now;
  try {
    const p = player(name);
    p.seekTo(0).then(() => p.play()).catch(() => {});
  } catch {}
}

/** Precarica i player (prima apertura senza ritardo). */
export function preload() {
  (Object.keys(SOURCES) as UiSound[]).forEach((n) => { try { player(n); } catch {} });
}
