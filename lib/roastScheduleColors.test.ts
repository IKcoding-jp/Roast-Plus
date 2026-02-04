import { describe, it, expect } from 'vitest';
import {
  getRoastLevelColor,
  getModeColor,
  getWeightColor,
} from './roastScheduleColors';

describe('getRoastLevelColor', () => {
  it('浅煎りは黄色系を返す', () => {
    expect(getRoastLevelColor('浅煎り')).toBe('text-yellow-900');
  });

  it('中煎りは白文字を返す', () => {
    expect(getRoastLevelColor('中煎り')).toBe('text-white');
  });

  it('中深煎りは白文字を返す', () => {
    expect(getRoastLevelColor('中深煎り')).toBe('text-white');
  });

  it('深煎りは白文字を返す', () => {
    expect(getRoastLevelColor('深煎り')).toBe('text-white');
  });

  it('未定義の場合はデフォルト色を返す', () => {
    expect(getRoastLevelColor()).toBe('bg-gray-100 text-gray-800');
  });

  it('不明な焙煎度の場合はデフォルト色を返す', () => {
    expect(getRoastLevelColor('極浅煎り')).toBe('bg-gray-100 text-gray-800');
  });
});

describe('getModeColor', () => {
  it('G1モードは青系を返す', () => {
    expect(getModeColor('G1')).toBe('bg-blue-100 text-blue-800');
  });

  it('G2モードは黄色系を返す', () => {
    expect(getModeColor('G2')).toBe('bg-yellow-100 text-yellow-900');
  });

  it('G3モードは紫系を返す', () => {
    expect(getModeColor('G3')).toBe('bg-purple-100 text-purple-800');
  });

  it('未定義の場合はデフォルト色を返す', () => {
    expect(getModeColor()).toBe('bg-gray-100 text-gray-800');
  });

  it('不明なモードの場合はデフォルト色を返す', () => {
    expect(getModeColor('G4')).toBe('bg-gray-100 text-gray-800');
  });
});

describe('getWeightColor', () => {
  it('200gは水色系を返す', () => {
    expect(getWeightColor('200g')).toBe('bg-sky-100 text-sky-800');
  });

  it('300gは緑系を返す', () => {
    expect(getWeightColor('300g')).toBe('bg-lime-100 text-lime-900');
  });

  it('500gはオレンジ系を返す', () => {
    expect(getWeightColor('500g')).toBe('bg-orange-200 text-orange-900');
  });

  it('未定義の場合はデフォルト色を返す', () => {
    expect(getWeightColor()).toBe('bg-gray-100 text-gray-800');
  });

  it('不明な重さの場合はデフォルト色を返す', () => {
    expect(getWeightColor('1000g')).toBe('bg-gray-100 text-gray-800');
  });
});
