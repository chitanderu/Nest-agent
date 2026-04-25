interface UseAudioOptions {
  // 0 = 美音, 1 = 英音（有道发音 API）
  type?: 0 | 1
}

export function useAudio(options: UseAudioOptions = {}) {
  const { type = 0 } = options

  const playAudio = (word: string) => {
    if (!word) return
    const url = `https://dict.youdao.com/dictvoice?type=${type}&audio=${encodeURIComponent(word)}`
    const audio = new Audio(url)
    audio.play().catch((err) => {
      console.warn('audio play failed:', err)
    })
  }

  return { playAudio }
}
