'use client';

import { useEffect, useRef } from 'react';

interface CountryFlagEmojiProps {
  countryName: string;
  className?: string;
}

type TwemojiInstance = {
  parse: (element: Element, options: { folder: string; ext: string; size: string }) => void;
};

type TwemojiWindow = typeof window & { twemoji?: TwemojiInstance };

// 国名と国旗のマッピング
const getCountryFlag = (countryName: string): string => {
  const flagMap: Record<string, string> = {
    'ブラジル': '\u{1F1E7}\u{1F1F7}', // 🇧🇷
    'ジャマイカ': '\u{1F1EF}\u{1F1F2}', // 🇯🇲
    'ドミニカ': '\u{1F1E9}\u{1F1F2}', // 🇩🇲
    'ベトナム': '\u{1F1FB}\u{1F1F3}', // 🇻🇳
    'ハイチ': '\u{1F1ED}\u{1F1F9}', // 🇭🇹
    'ペルー': '\u{1F1F5}\u{1F1EA}', // 🇵🇪
    'エルサルバドル': '\u{1F1F8}\u{1F1FB}', // 🇸🇻
    'グアテマラ': '\u{1F1EC}\u{1F1F9}', // 🇬🇹
    'エチオピア': '\u{1F1EA}\u{1F1F9}', // 🇪🇹
    'コロンビア': '\u{1F1E8}\u{1F1F4}', // 🇨🇴
    'インドネシア': '\u{1F1EE}\u{1F1E9}', // 🇮🇩
    'タンザニア': '\u{1F1F9}\u{1F1FF}', // 🇹🇿
    'ルワンダ': '\u{1F1F7}\u{1F1FC}', // 🇷🇼
    'マラウイ': '\u{1F1F2}\u{1F1FC}', // 🇲🇼
    'インド': '\u{1F1EE}\u{1F1F3}', // 🇮🇳
  };
  
  return flagMap[countryName] || '';
};

export function CountryFlagEmoji({ countryName, className = '' }: CountryFlagEmojiProps) {
  const flagElementRef = useRef<HTMLSpanElement>(null);
  const flag = getCountryFlag(countryName);
  const isParsedRef = useRef(false);

  // Twemojiで国旗を変換
  useEffect(() => {
    if (!flag || !flagElementRef.current) return;

    isParsedRef.current = false;

    // 既にimgタグに変換されている場合はスキップ
    if (flagElementRef.current.querySelector('img')) {
      isParsedRef.current = true;
      return;
    }

    const parseFlag = () => {
      const twemoji = (window as TwemojiWindow).twemoji;
      if (twemoji && flagElementRef.current && !isParsedRef.current) {
        // 既にimgタグに変換されている場合はスキップ
        if (flagElementRef.current.querySelector('img')) {
          isParsedRef.current = true;
          return;
        }
        
        try {
          twemoji.parse(flagElementRef.current, {
            folder: 'svg',
            ext: '.svg',
            size: '16x16',
          });
          isParsedRef.current = true;
        } catch (error) {
          console.error('Error parsing flag emoji:', error);
        }
      }
    };
    
    // Twemojiが既に読み込まれている場合
    if ((window as TwemojiWindow).twemoji) {
      parseFlag();
    } else {
      // Twemojiの読み込みを待つ
      let checkInterval: NodeJS.Timeout | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      
      checkInterval = setInterval(() => {
        if ((window as TwemojiWindow).twemoji) {
          parseFlag();
          if (checkInterval) clearInterval(checkInterval);
          if (timeoutId) clearTimeout(timeoutId);
        }
      }, 100);
      
      // 5秒後にタイムアウト
      timeoutId = setTimeout(() => {
        if (checkInterval) clearInterval(checkInterval);
      }, 5000);
      
      return () => {
        if (checkInterval) clearInterval(checkInterval);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [flag, countryName]);

  if (!flag) {
    // デバッグ用: マッピングが見つからない場合
    if (countryName) {
      console.warn(`Country flag not found for: "${countryName}"`);
    }
    return null;
  }

  return (
    <span 
      ref={flagElementRef} 
      className={`emoji inline-block ${className}`} 
      aria-label={`${countryName}の国旗`}
      style={{ minWidth: '16px', minHeight: '16px', display: 'inline-block', verticalAlign: 'middle' }}
    >
      {flag}
    </span>
  );
}

