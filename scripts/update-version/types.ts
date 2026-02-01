// バージョン更新スクリプトの型定義

export type VersionType = 'major' | 'minor' | 'patch';
export type ChangelogEntryType =
  | 'update'
  | 'story'
  | 'feature'
  | 'bugfix'
  | 'improvement'
  | 'docs'
  | 'style';

export interface PRLabel {
  name: string;
  color?: string;
}

export interface VersionBumpResult {
  versionType: VersionType;
  changelogType: ChangelogEntryType;
  skip?: boolean; // バージョン更新をスキップするか
}
