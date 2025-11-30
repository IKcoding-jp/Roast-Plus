/**
 * 音声ファイル一覧（自動生成）
 * このファイルは scripts/generate-sound-list.ts によって自動生成されます
 * 音声ファイルを追加・削除した場合は、npm run generate:sound-list を実行してください
 */

export interface SoundFile {
  value: string;
  label: string;
}

export const alarmSoundFiles: SoundFile[] = [];

export const roastTimerSoundFiles: SoundFile[] = [
  {
    "value": "/sounds/roasttimer/alarm.mp3",
    "label": "alarm"
  }
];

export const handpickStartSoundFiles: SoundFile[] = [
  {
    "value": "/sounds/handpicktimer/start/start1.mp3",
    "label": "start1"
  },
  {
    "value": "/sounds/handpicktimer/start/start2.mp3",
    "label": "start2"
  },
  {
    "value": "/sounds/handpicktimer/start/start3.mp3",
    "label": "start3"
  },
  {
    "value": "/sounds/handpicktimer/start/start4.mp3",
    "label": "start4"
  }
];

export const handpickCompleteSoundFiles: SoundFile[] = [
  {
    "value": "/sounds/handpicktimer/complete/complete1.mp3",
    "label": "complete1"
  },
  {
    "value": "/sounds/handpicktimer/complete/complete2.mp3",
    "label": "complete2"
  },
  {
    "value": "/sounds/handpicktimer/complete/complete3.mp3",
    "label": "complete3"
  },
  {
    "value": "/sounds/handpicktimer/complete/complete4.mp3",
    "label": "complete4"
  },
  {
    "value": "/sounds/handpicktimer/complete/complete5.mp3",
    "label": "complete5"
  }
];
