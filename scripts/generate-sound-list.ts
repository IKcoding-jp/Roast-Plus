/**
 * 音声ファイル一覧を生成するスクリプト
 * /public/sounds/alarm/ フォルダ内の .mp3 ファイルをスキャンして
 * /public/sounds/alarm/list.json を生成する
 */

import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

const SOUNDS_DIR = join(process.cwd(), 'public', 'sounds', 'alarm');
const OUTPUT_FILE = join(process.cwd(), 'public', 'sounds', 'alarm', 'list.json');

interface SoundFile {
  value: string;
  label: string;
}

/**
 * 自然順ソート（日本語対応）
 */
function naturalSort(a: string, b: string): number {
  const aParts = a.match(/(\d+|\D+)/g) || [];
  const bParts = b.match(/(\d+|\D+)/g) || [];
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || '';
    const bPart = bParts[i] || '';
    
    const aIsNum = /^\d+$/.test(aPart);
    const bIsNum = /^\d+$/.test(bPart);
    
    if (aIsNum && bIsNum) {
      const diff = parseInt(aPart, 10) - parseInt(bPart, 10);
      if (diff !== 0) return diff;
    } else {
      const diff = aPart.localeCompare(bPart, 'ja', { numeric: true });
      if (diff !== 0) return diff;
    }
  }
  
  return 0;
}

async function generateSoundList() {
  try {
    console.log('Scanning sound files in:', SOUNDS_DIR);
    
    // ディレクトリ内のファイルを取得
    const files = await readdir(SOUNDS_DIR);
    
    // .mp3 ファイルのみをフィルタリング
    const mp3Files = files
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .sort(naturalSort);
    
    console.log(`Found ${mp3Files.length} sound files:`, mp3Files);
    
    // SoundFile 形式に変換（拡張子を除去）
    const soundFiles: SoundFile[] = mp3Files.map(file => {
      const labelWithoutExt = file.replace(/\.mp3$/i, '');
      return {
        value: `/sounds/alarm/${file}`,
        label: labelWithoutExt,
      };
    });
    
    // JSON ファイルとして出力
    await writeFile(OUTPUT_FILE, JSON.stringify(soundFiles, null, 2), 'utf-8');
    
    console.log(`Generated sound list: ${OUTPUT_FILE}`);
    console.log(`Total files: ${soundFiles.length}`);
  } catch (error) {
    console.error('Failed to generate sound list:', error);
    process.exit(1);
  }
}

// スクリプト実行
generateSoundList();

