// 豆の名前とGモードのマッピング定義

export type BeanName =
  | 'ブラジル'
  | 'ジャマイカ'
  | 'ドミニカ'
  | 'ベトナム'
  | 'ハイチ'
  | 'ペルー'
  | 'エルサルバドル'
  | 'グアテマラ'
  | 'エチオピア'
  | 'コロンビア'
  | 'インドネシア'
  | 'タンザニア'
  | 'ルワンダ'
  | 'マラウイ'
  | 'インド';

export type RoastMachineMode = 'G1' | 'G2' | 'G3';

// G1の豆リスト
export const G1_BEANS: BeanName[] = ['ブラジル', 'ジャマイカ', 'ドミニカ', 'ベトナム', 'ハイチ'];

// G2の豆リスト
export const G2_BEANS: BeanName[] = ['ペルー', 'エルサルバドル', 'グアテマラ'];

// G3の豆リスト
export const G3_BEANS: BeanName[] = [
  'エチオピア',
  'コロンビア',
  'インドネシア',
  'タンザニア',
  'ルワンダ',
  'マラウイ',
  'インド',
];

// 全豆リスト
export const ALL_BEANS: BeanName[] = [...G1_BEANS, ...G2_BEANS, ...G3_BEANS];

// 豆の名前からGモードを取得する関数
export function getRoastMachineMode(beanName: BeanName): RoastMachineMode | undefined {
  if (G1_BEANS.includes(beanName)) {
    return 'G1';
  }
  if (G2_BEANS.includes(beanName)) {
    return 'G2';
  }
  if (G3_BEANS.includes(beanName)) {
    return 'G3';
  }
  return undefined;
}

// Gモードの優先順位（数字が小さい方が優先）
const MODE_PRIORITY: Record<RoastMachineMode, number> = {
  G1: 1,
  G2: 2,
  G3: 3,
};

// ブレンド時のGモードを取得する関数
export function getRoastMachineModeForBlend(
  beanName1: BeanName | undefined,
  beanName2: BeanName | undefined,
  blendRatio: string | undefined
): RoastMachineMode | undefined {
  // 単体焙煎の場合
  if (!beanName2 || !blendRatio) {
    if (beanName1) {
      return getRoastMachineMode(beanName1);
    }
    return undefined;
  }

  // ブレンドの場合
  if (!beanName1) {
    return undefined;
  }

  // 割合をパース（例：「5:5」「8:2」）
  const ratioMatch = blendRatio.match(/^(\d+):(\d+)$/);
  if (!ratioMatch) {
    // 無効な形式の場合はbeanName1のG設定を返す
    return getRoastMachineMode(beanName1);
  }

  const ratio1 = parseInt(ratioMatch[1], 10);
  const ratio2 = parseInt(ratioMatch[2], 10);

  const mode1 = getRoastMachineMode(beanName1);
  const mode2 = getRoastMachineMode(beanName2);

  if (!mode1 || !mode2) {
    // どちらかの豆が無効な場合は、有効な方のG設定を返す
    return mode1 || mode2;
  }

  // 割合が異なる場合：割合が多い豆のG設定を採用
  if (ratio1 > ratio2) {
    return mode1;
  }
  if (ratio2 > ratio1) {
    return mode2;
  }

  // 割合が同じ場合（5:5など）：数字が小さい方のG設定を採用
  return MODE_PRIORITY[mode1] <= MODE_PRIORITY[mode2] ? mode1 : mode2;
}

