/**
 * クイズ用サウンドユーティリティ
 * Web Audio APIを使用して効果音を生成
 */

// AudioContext（シングルトン）
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * シンプルなトーンを再生
 */
function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  try {
    const ctx = getAudioContext();

    // AudioContextが一時停止している場合は再開
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // フェードイン・アウト
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Failed to play tone:', error);
  }
}

/**
 * 正解音を再生（上昇する2音）
 */
export function playCorrectSound(volume: number = 0.25): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 明るい上昇音（C5 → E5）
    playTone(523.25, 0.12, 'sine', volume); // C5
    setTimeout(() => {
      playTone(659.25, 0.15, 'sine', volume); // E5
    }, 100);
  } catch (error) {
    console.warn('Failed to play correct sound:', error);
  }
}

/**
 * 不正解音を再生（下降する低い音）
 */
export function playIncorrectSound(volume: number = 0.2): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 低い下降音
    playTone(220, 0.2, 'triangle', volume); // A3
  } catch (error) {
    console.warn('Failed to play incorrect sound:', error);
  }
}

/**
 * レベルアップ音を再生（明るいファンファーレ風）
 */
export function playLevelUpSound(volume: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // C5 → E5 → G5 の上昇アルペジオ
    playTone(523.25, 0.15, 'sine', volume); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', volume), 120); // E5
    setTimeout(() => playTone(783.99, 0.25, 'sine', volume), 240); // G5
  } catch (error) {
    console.warn('Failed to play level up sound:', error);
  }
}

/**
 * バッジ獲得音を再生
 */
export function playBadgeSound(volume: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // キラキラ音（高めの音で明るく）
    playTone(880, 0.1, 'sine', volume); // A5
    setTimeout(() => playTone(1174.66, 0.1, 'sine', volume), 80); // D6
    setTimeout(() => playTone(1318.51, 0.2, 'sine', volume), 160); // E6
  } catch (error) {
    console.warn('Failed to play badge sound:', error);
  }
}

/**
 * XP獲得音を再生（短いポップ音）
 */
export function playXPSound(volume: number = 0.15): void {
  try {
    playTone(880, 0.08, 'sine', volume); // A5
  } catch (error) {
    console.warn('Failed to play XP sound:', error);
  }
}

/**
 * クイズ開始音を再生
 */
export function playStartSound(volume: number = 0.2): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    playTone(440, 0.1, 'sine', volume); // A4
    setTimeout(() => playTone(554.37, 0.15, 'sine', volume), 100); // C#5
  } catch (error) {
    console.warn('Failed to play start sound:', error);
  }
}

/**
 * セッション完了音を再生
 */
export function playCompleteSound(volume: number = 0.3): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 完了ファンファーレ
    playTone(523.25, 0.12, 'sine', volume); // C5
    setTimeout(() => playTone(659.25, 0.12, 'sine', volume), 100); // E5
    setTimeout(() => playTone(783.99, 0.12, 'sine', volume), 200); // G5
    setTimeout(() => playTone(1046.50, 0.25, 'sine', volume), 300); // C6
  } catch (error) {
    console.warn('Failed to play complete sound:', error);
  }
}

/**
 * バイブレーションを実行
 * @param pattern ミリ秒のパターン（振動, 休止, 振動, ...）
 */
export function vibrate(pattern: number | number[]): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (error) {
    console.warn('Vibration not supported:', error);
  }
}

/**
 * 正解時のバイブレーション
 */
export function vibrateCorrect(): void {
  vibrate([30, 50, 30]); // 軽い2回振動
}

/**
 * 不正解時のバイブレーション
 */
export function vibrateIncorrect(): void {
  vibrate(100); // 長めの1回振動
}

/**
 * レベルアップ時のバイブレーション
 */
export function vibrateLevelUp(): void {
  vibrate([50, 30, 50, 30, 100]); // パターン振動
}

/**
 * バッジ獲得時のバイブレーション
 */
export function vibrateBadge(): void {
  vibrate([30, 20, 30, 20, 30, 20, 50]); // キラキラパターン
}

/**
 * AudioContextを初期化（ユーザー操作時に呼び出し推奨）
 */
export function initializeAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
  } catch (error) {
    console.warn('Failed to initialize audio:', error);
  }
}

/**
 * AudioContextをクリーンアップ
 */
export function cleanupAudio(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
