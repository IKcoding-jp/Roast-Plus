// 更新履歴・開発秘話の型定義

// 更新履歴・開発秘話のカテゴリ（レガシー、後方互換用）
export type ChangelogEntryType = 'update' | 'story' | 'feature' | 'bugfix' | 'improvement' | 'docs' | 'style';

// 更新履歴・開発秘話エントリ（レガシー、後方互換用）
export interface ChangelogEntry {
  id: string;
  type: ChangelogEntryType; // カテゴリ
  title: string; // タイトル
  content: string; // 本文
  version?: string; // バージョン番号（例: "0.5.17"）
  date: string; // YYYY-MM-DD
  tags?: string[]; // タグ（例: ["UI", "焙煎", "Firebase"]）
  order?: number; // 表示順序
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}

// ========================================
// 開発秘話 - キャラクター対話形式
// ========================================

// キャラクターID
export type CharacterId =
  | 'asairi'
  | 'fukairi'
  | 'dori'
  | 'server'
  | 'mill'
  | 'kettle'
  | 'press'
  | 'siphon';

// エピソードIDとキャラクターペアのマッピング
export type EpisodeCharacterPair = {
  left: CharacterId;
  right: CharacterId;
};

// キャラクターペア情報
export interface CharacterPairInfo {
  left: {
    id: CharacterId;
    name: string;
    emoji: string;
    subtitle: string;
    description: string;
  };
  right: {
    id: CharacterId;
    name: string;
    emoji: string;
    subtitle: string;
    description: string;
  };
  relationship: string;
}

// キャラクター設定
export interface Character {
  id: CharacterId;
  name: string; // 表示名（例: "アサイリ"）
  shortName: string; // 短縮名（例: "アサイリ"）
  position: 'left' | 'right'; // 対話での表示位置
  bubbleColor: string; // 吹き出しの背景色
  textColor: string; // テキスト色
}

// 対話メッセージ
export interface DialogueMessage {
  id: string;
  characterId: CharacterId;
  content: string; // メッセージ内容（改行対応）
}

// 開発秘話エピソード
export interface DevStoryEpisode {
  id: string;
  title: string; // エピソードタイトル
  subtitle?: string; // サブタイトル（任意）
  imageUrl?: string; // エピソード画像URL（任意）
  dialogues: DialogueMessage[]; // 対話パート
  detailContent: string; // 詳細説明パート
  tags?: string[]; // タグ（例: ["UI", "焙煎", "新機能"]）
  publishedAt: string; // 公開日（YYYY-MM-DD）
  order: number; // 表示順序
}

// 更新履歴（設定ページ用シンプル版）
export interface VersionHistoryEntry {
  version: string; // バージョン番号（例: "0.5.18"）
  date: string; // リリース日（YYYY-MM-DD）
  summary?: string; // 簡単な説明（任意）
}
