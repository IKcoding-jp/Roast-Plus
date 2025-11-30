/**
 * 音声ファイル一覧を生成するスクリプト
 * フォルダ内の .mp3 ファイルをスキャンして TypeScript の定数ファイルを生成
 */

import { readdir, writeFile } from 'fs/promises';
import { join } from 'path';

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

/**
 * 指定されたディレクトリから音声ファイル一覧を取得
 */
async function getSoundFilesFromDirectory(
  soundsDir: string,
  basePath: string
): Promise<SoundFile[]> {
  try {
    console.log('Scanning sound files in:', soundsDir);
    
    // ディレクトリ内のファイルを取得
    const files = await readdir(soundsDir);
    
    // .mp3 ファイルのみをフィルタリング
    const mp3Files = files
      .filter(file => file.toLowerCase().endsWith('.mp3'))
      .sort(naturalSort);
    
    console.log(`Found ${mp3Files.length} sound files:`, mp3Files);
    
    // SoundFile 形式に変換（拡張子を除去）
    const soundFiles: SoundFile[] = mp3Files.map(file => {
      const labelWithoutExt = file.replace(/\.mp3$/i, '');
      return {
        value: `${basePath}/${file}`,
        label: labelWithoutExt,
      };
    });
    
    return soundFiles;
  } catch (error) {
    console.error(`Failed to scan sound files in ${soundsDir}:`, error);
    return [];
  }
}

async function generateSoundFilesConstant() {
  const baseDir = join(process.cwd(), 'public', 'sounds');
  const outputFile = join(process.cwd(), 'lib', 'soundFiles.ts');
  
  // 各フォルダから音声ファイル一覧を取得
  const [alarmFiles, roastTimerFiles, startFiles, completeFiles] = await Promise.all([
    getSoundFilesFromDirectory(join(baseDir, 'alarm'), '/sounds/alarm'),
    getSoundFilesFromDirectory(join(baseDir, 'roasttimer'), '/sounds/roasttimer'),
    getSoundFilesFromDirectory(join(baseDir, 'handpicktimer', 'start'), '/sounds/handpicktimer/start'),
    getSoundFilesFromDirectory(join(baseDir, 'handpicktimer', 'complete'), '/sounds/handpicktimer/complete'),
  ]);
  
  // TypeScript の定数ファイルを生成
  const tsContent = `/**
 * 音声ファイル一覧（自動生成）
 * このファイルは scripts/generate-sound-list.ts によって自動生成されます
 * 音声ファイルを追加・削除した場合は、npm run generate:sound-list を実行してください
 */

export interface SoundFile {
  value: string;
  label: string;
}

export const alarmSoundFiles: SoundFile[] = ${JSON.stringify(alarmFiles, null, 2)};

export const roastTimerSoundFiles: SoundFile[] = ${JSON.stringify(roastTimerFiles, null, 2)};

export const handpickStartSoundFiles: SoundFile[] = ${JSON.stringify(startFiles, null, 2)};

export const handpickCompleteSoundFiles: SoundFile[] = ${JSON.stringify(completeFiles, null, 2)};
`;
  
  await writeFile(outputFile, tsContent, 'utf-8');
  
  console.log(`Generated sound files constant: ${outputFile}`);
  console.log(`Alarm files: ${alarmFiles.length}`);
  console.log(`Roast timer files: ${roastTimerFiles.length}`);
  console.log(`Handpick start files: ${startFiles.length}`);
  console.log(`Handpick complete files: ${completeFiles.length}`);
  console.log('All sound files constant generated successfully');
}

// スクリプト実行
generateSoundFilesConstant().catch((error) => {
  console.error('Failed to generate sound files constant:', error);
  process.exit(1);
});

