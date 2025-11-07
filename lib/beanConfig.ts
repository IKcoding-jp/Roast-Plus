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

