'use client';

import { useState, useEffect, useRef } from 'react';
import type { TastingRecord } from '@/types';

interface TastingRadarChartProps {
  record: Pick<TastingRecord, 'bitterness' | 'acidity' | 'body' | 'sweetness' | 'aroma'>;
  size?: number;
}

export function TastingRadarChart({ record, size }: TastingRadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [chartSize, setChartSize] = useState(size ?? 200);
  const [isVisible, setIsVisible] = useState(false);
  const [pathLength, setPathLength] = useState(0);

  const effectiveSize = size ?? chartSize;
  const centerX = effectiveSize / 2;
  const centerY = effectiveSize / 2;
  const radius = effectiveSize * 0.35;

  useEffect(() => {
    if (size) {
      return;
    }

    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const sizeBasedOnWidth = containerWidth * 0.85;
        const sizeBasedOnHeight = containerHeight * 0.85;
        const calculatedSize = Math.min(
          500,
          Math.max(60, Math.min(sizeBasedOnWidth, sizeBasedOnHeight))
        );
        setChartSize(calculatedSize);
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);
    requestAnimationFrame(updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      resizeObserver.disconnect();
    };
  }, [size]);

  // Intersection Observerで表示領域に入ったことを検知
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1, // 10%以上表示されたら検知
        rootMargin: '0px',
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  // パスの長さを計算（recordやchartSizeが変更されたときに再計算）
  useEffect(() => {
    if (pathRef.current) {
      requestAnimationFrame(() => {
        if (pathRef.current) {
          const length = pathRef.current.getTotalLength();
          setPathLength(length);
        }
      });
    }
  }, [record.bitterness, record.acidity, record.body, record.sweetness, record.aroma, effectiveSize]);

  // 5軸のレーダーチャート（苦味、酸味、ボディ、甘み、香り）
  // 5つの軸を等間隔（72度ずつ）に配置
  const axisLabels = [
    { label: '苦味', value: record.bitterness },
    { label: '酸味', value: record.acidity },
    { label: 'ボディ', value: record.body },
    { label: '甘み', value: record.sweetness },
    { label: '香り', value: record.aroma },
  ];
  
  // 上から時計回りに等間隔で配置（-90度から開始、72度ずつ）
  const axes = axisLabels.map((item, index) => ({
    ...item,
    angle: -Math.PI / 2 + (2 * Math.PI / 5) * index,
  }));

  // 値の範囲は1.0〜5.0
  const normalizeValue = (value: number) => {
    return Math.max(0, Math.min(1, (value - 1.0) / 4.0));
  };

  // 各軸のポイントを計算
  const points = axes.map((axis) => {
    const normalizedValue = normalizeValue(axis.value);
    const x = centerX + radius * normalizedValue * Math.cos(axis.angle);
    const y = centerY + radius * normalizedValue * Math.sin(axis.angle);
    return { x, y, label: axis.label, value: axis.value };
  });

  // パス文字列を生成
  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ') + ' Z';

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col items-center justify-center w-full h-full"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-in',
      }}
    >
      <svg 
        ref={svgRef}
        width={effectiveSize} 
        height={effectiveSize} 
        className="overflow-visible"
      >
        {/* グリッド線（同心円） */}
        {[0.25, 0.5, 0.75, 1.0].map((scale) => (
          <circle
            key={scale}
            cx={centerX}
            cy={centerY}
            r={radius * scale}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        ))}

        {/* 軸線 */}
        {axes.map((axis, index) => {
          const x = centerX + radius * Math.cos(axis.angle);
          const y = centerY + radius * Math.sin(axis.angle);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          );
        })}

        {/* データエリア */}
        <path
          ref={pathRef}
          d={pathData}
          fill="#D97706"
          fillOpacity={isVisible ? 0.3 : 0}
          stroke="#D97706"
          strokeWidth="2"
          strokeDasharray={pathLength > 0 ? pathLength : 0}
          strokeDashoffset={isVisible ? 0 : pathLength}
          style={{
            transition: isVisible 
              ? 'stroke-dashoffset 1s ease-out, fill-opacity 0.3s ease-out 0.7s' 
              : 'none',
          }}
        />

        {/* データポイント */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={isVisible ? 4 : 0}
            fill="#D97706"
            opacity={isVisible ? 1 : 0}
            style={{
              transition: isVisible
                ? `r 0.3s ease-out ${0.7 + index * 0.1}s, opacity 0.3s ease-out ${0.7 + index * 0.1}s`
                : 'none',
              transformOrigin: `${point.x}px ${point.y}px`,
            }}
          />
        ))}

        {/* 軸ラベルと値 */}
        {points.map((point, index) => {
          const axis = axes[index];
          const labelX = centerX + (radius + 20) * Math.cos(axis.angle);
          const labelY = centerY + (radius + 20) * Math.sin(axis.angle);
          
          return (
            <g key={index}>
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                {point.label}
              </text>
              <text
                x={labelX}
                y={labelY + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-amber-600 font-semibold"
              >
                {point.value.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

