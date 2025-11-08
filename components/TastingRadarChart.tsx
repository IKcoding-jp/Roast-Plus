'use client';

import { useState, useEffect, useRef } from 'react';
import type { TastingRecord } from '@/types';

interface TastingRadarChartProps {
  record: Pick<TastingRecord, 'bitterness' | 'acidity' | 'body' | 'sweetness' | 'aroma'>;
  size?: number;
}

export function TastingRadarChart({ record, size }: TastingRadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState(size || 200);

  useEffect(() => {
    if (size) {
      setChartSize(size);
      return;
    }

    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // コンテナの幅に基づいてサイズを計算（最大400px、最小60px）
        const calculatedSize = Math.min(400, Math.max(60, containerWidth * 0.8));
        setChartSize(calculatedSize);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = chartSize * 0.35;
  
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
    <div ref={containerRef} className="flex flex-col items-center w-full">
      <svg width={chartSize} height={chartSize} className="overflow-visible">
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
          d={pathData}
          fill="#8B4513"
          fillOpacity="0.3"
          stroke="#8B4513"
          strokeWidth="2"
        />

        {/* データポイント */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#8B4513"
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
                className="text-xs fill-[#8B4513] font-semibold"
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

