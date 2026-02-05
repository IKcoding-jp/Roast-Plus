import { describe, it, expect } from 'vitest';
import {
  getRoastMachineMode,
  getRoastMachineModeForBlend,
  G1_BEANS,
  G2_BEANS,
  G3_BEANS,
  ALL_BEANS,
} from './beanConfig';

describe('beanConfig', () => {
  describe('定数の整合性', () => {
    it('G1_BEANS に5つの豆が定義されている', () => {
      expect(G1_BEANS).toHaveLength(5);
      expect(G1_BEANS).toContain('ブラジル');
      expect(G1_BEANS).toContain('ジャマイカ');
      expect(G1_BEANS).toContain('ドミニカ');
      expect(G1_BEANS).toContain('ベトナム');
      expect(G1_BEANS).toContain('ハイチ');
    });

    it('G2_BEANS に3つの豆が定義されている', () => {
      expect(G2_BEANS).toHaveLength(3);
      expect(G2_BEANS).toContain('ペルー');
      expect(G2_BEANS).toContain('エルサルバドル');
      expect(G2_BEANS).toContain('グアテマラ');
    });

    it('G3_BEANS に7つの豆が定義されている', () => {
      expect(G3_BEANS).toHaveLength(7);
      expect(G3_BEANS).toContain('エチオピア');
      expect(G3_BEANS).toContain('コロンビア');
      expect(G3_BEANS).toContain('インドネシア');
      expect(G3_BEANS).toContain('タンザニア');
      expect(G3_BEANS).toContain('ルワンダ');
      expect(G3_BEANS).toContain('マラウイ');
      expect(G3_BEANS).toContain('インド');
    });

    it('ALL_BEANS は全ての豆を含む（15種類）', () => {
      expect(ALL_BEANS).toHaveLength(15);
      expect(ALL_BEANS).toEqual([...G1_BEANS, ...G2_BEANS, ...G3_BEANS]);
    });

    it('重複する豆が存在しない', () => {
      const allBeansSet = new Set(ALL_BEANS);
      expect(allBeansSet.size).toBe(ALL_BEANS.length);
    });
  });

  describe('getRoastMachineMode', () => {
    describe('G1豆の判定', () => {
      it('ブラジルはG1を返す', () => {
        expect(getRoastMachineMode('ブラジル')).toBe('G1');
      });

      it('ジャマイカはG1を返す', () => {
        expect(getRoastMachineMode('ジャマイカ')).toBe('G1');
      });

      it('ドミニカはG1を返す', () => {
        expect(getRoastMachineMode('ドミニカ')).toBe('G1');
      });

      it('ベトナムはG1を返す', () => {
        expect(getRoastMachineMode('ベトナム')).toBe('G1');
      });

      it('ハイチはG1を返す', () => {
        expect(getRoastMachineMode('ハイチ')).toBe('G1');
      });
    });

    describe('G2豆の判定', () => {
      it('ペルーはG2を返す', () => {
        expect(getRoastMachineMode('ペルー')).toBe('G2');
      });

      it('エルサルバドルはG2を返す', () => {
        expect(getRoastMachineMode('エルサルバドル')).toBe('G2');
      });

      it('グアテマラはG2を返す', () => {
        expect(getRoastMachineMode('グアテマラ')).toBe('G2');
      });
    });

    describe('G3豆の判定', () => {
      it('エチオピアはG3を返す', () => {
        expect(getRoastMachineMode('エチオピア')).toBe('G3');
      });

      it('コロンビアはG3を返す', () => {
        expect(getRoastMachineMode('コロンビア')).toBe('G3');
      });

      it('インドネシアはG3を返す', () => {
        expect(getRoastMachineMode('インドネシア')).toBe('G3');
      });

      it('タンザニアはG3を返す', () => {
        expect(getRoastMachineMode('タンザニア')).toBe('G3');
      });

      it('ルワンダはG3を返す', () => {
        expect(getRoastMachineMode('ルワンダ')).toBe('G3');
      });

      it('マラウイはG3を返す', () => {
        expect(getRoastMachineMode('マラウイ')).toBe('G3');
      });

      it('インドはG3を返す', () => {
        expect(getRoastMachineMode('インド')).toBe('G3');
      });
    });
  });

  describe('getRoastMachineModeForBlend', () => {
    describe('単体焙煎（ブレンドなし）', () => {
      it('beanName2とblendRatioがundefinedの場合、beanName1のモードを返す', () => {
        expect(getRoastMachineModeForBlend('ブラジル', undefined, undefined)).toBe('G1');
        expect(getRoastMachineModeForBlend('ペルー', undefined, undefined)).toBe('G2');
        expect(getRoastMachineModeForBlend('エチオピア', undefined, undefined)).toBe('G3');
      });

      it('beanName1がundefinedの場合、undefinedを返す', () => {
        expect(getRoastMachineModeForBlend(undefined, undefined, undefined)).toBeUndefined();
      });

      it('beanName2が空文字列の場合も単体焙煎として扱う', () => {
        expect(getRoastMachineModeForBlend('ブラジル', undefined, '')).toBe('G1');
      });
    });

    describe('ブレンド焙煎（同じ割合）', () => {
      it('5:5のブレンド時、優先度が低い方（G1）を返す', () => {
        // G1（優先度1） vs G2（優先度2） → G1
        expect(getRoastMachineModeForBlend('ブラジル', 'ペルー', '5:5')).toBe('G1');
      });

      it('5:5のブレンド時、優先度が低い方（G1）を返す（G1 vs G3）', () => {
        // G1（優先度1） vs G3（優先度3） → G1
        expect(getRoastMachineModeForBlend('ブラジル', 'エチオピア', '5:5')).toBe('G1');
      });

      it('5:5のブレンド時、優先度が低い方（G2）を返す（G2 vs G3）', () => {
        // G2（優先度2） vs G3（優先度3） → G2
        expect(getRoastMachineModeForBlend('ペルー', 'エチオピア', '5:5')).toBe('G2');
      });

      it('同じGモード同士のブレンド時、そのモードを返す', () => {
        // G1 vs G1 → G1
        expect(getRoastMachineModeForBlend('ブラジル', 'ジャマイカ', '5:5')).toBe('G1');
        // G2 vs G2 → G2
        expect(getRoastMachineModeForBlend('ペルー', 'グアテマラ', '5:5')).toBe('G2');
        // G3 vs G3 → G3
        expect(getRoastMachineModeForBlend('エチオピア', 'コロンビア', '5:5')).toBe('G3');
      });
    });

    describe('ブレンド焙煎（異なる割合）', () => {
      it('8:2のブレンド時、割合が多い方（beanName1）のモードを返す', () => {
        expect(getRoastMachineModeForBlend('ブラジル', 'ペルー', '8:2')).toBe('G1');
        expect(getRoastMachineModeForBlend('エチオピア', 'ブラジル', '7:3')).toBe('G3');
      });

      it('2:8のブレンド時、割合が多い方（beanName2）のモードを返す', () => {
        expect(getRoastMachineModeForBlend('ブラジル', 'ペルー', '2:8')).toBe('G2');
        expect(getRoastMachineModeForBlend('ブラジル', 'エチオピア', '3:7')).toBe('G3');
      });

      it('9:1のような極端な割合でも正しく判定する', () => {
        expect(getRoastMachineModeForBlend('ブラジル', 'エチオピア', '9:1')).toBe('G1');
        expect(getRoastMachineModeForBlend('ブラジル', 'エチオピア', '1:9')).toBe('G3');
      });
    });

    describe('エッジケースと異常系', () => {
      it('無効な割合形式の場合、beanName1のモードを返す', () => {
        expect(getRoastMachineModeForBlend('ブラジル', 'ペルー', 'invalid')).toBe('G1');
        expect(getRoastMachineModeForBlend('ペルー', 'エチオピア', '5-5')).toBe('G2');
        expect(getRoastMachineModeForBlend('エチオピア', 'ブラジル', '')).toBe('G3');
      });

      it('beanName1が無効でbeanName2が有効な場合、beanName2のモードを返す', () => {
        expect(getRoastMachineModeForBlend(undefined, 'ペルー', '5:5')).toBeUndefined();
      });

      it('beanName2が無効な場合、beanName1のモードを返す', () => {
        // ブレンド形式だが、beanName2が無効
        expect(getRoastMachineModeForBlend('ブラジル', undefined, '5:5')).toBe('G1');
      });

      it('0:10のような特殊な割合でも処理できる', () => {
        expect(getRoastMachineModeForBlend('ブラジル', 'ペルー', '0:10')).toBe('G2');
        expect(getRoastMachineModeForBlend('ブラジル', 'ペルー', '10:0')).toBe('G1');
      });
    });

    describe('実際のユースケース', () => {
      it('ブラジル8:ペルー2のブレンドはG1', () => {
        expect(getRoastMachineModeForBlend('ブラジル', 'ペルー', '8:2')).toBe('G1');
      });

      it('エチオピア5:コロンビア5のブレンドはG3（同じGモード）', () => {
        expect(getRoastMachineModeForBlend('エチオピア', 'コロンビア', '5:5')).toBe('G3');
      });

      it('ブラジル5:エチオピア5のブレンドはG1（優先度）', () => {
        expect(getRoastMachineModeForBlend('ブラジル', 'エチオピア', '5:5')).toBe('G1');
      });
    });
  });
});
