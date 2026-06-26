/**
 * 数值雷达图（纯 SVG，无依赖）
 */
'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { motion as motionTokens } from '@/lib/motion-tokens'

export interface RadarPoint {
  label: string
  value: number
  max: number
}

export interface StatRadarProps {
  data: RadarPoint[]
  size?: number
  className?: string
}

export const StatRadar: React.FC<StatRadarProps> = ({
  data,
  size = 280,
  className,
}) => {
  const center = size / 2
  const radius = size / 2 - 40
  const count = data.length

  // 计算数据点坐标（memo 化避免父组件重渲染时重复算）
  const points = React.useMemo(() => {
    if (count === 0) return []
    const angle = (2 * Math.PI) / count
    return data.map((d, i) => {
      const ratio = d.value / d.max
      const r = radius * ratio
      const theta = -Math.PI / 2 + i * angle // 从正上方开始
      return {
        x: center + r * Math.cos(theta),
        y: center + r * Math.sin(theta),
        labelX: center + (radius + 18) * Math.cos(theta),
        labelY: center + (radius + 18) * Math.sin(theta),
        label: d.label,
        value: d.value,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, size])

  if (count === 0 || points.length === 0) return null

  // 每个维度的角度
  const angle = (2 * Math.PI) / count

  // 计算每层的同心圆
  const layers = [0.25, 0.5, 0.75, 1]

  // 多边形路径
  const polygonPath =
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') +
    ' Z'

  // 屏幕阅读器友好：详细数值
  const detailLabel =
    '能力雷达：' + data.map((d) => `${d.label} ${d.value}/${d.max}`).join('，')

  return (
    <div className={className}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto"
        role="img"
        aria-label={detailLabel}
      >
        {/* 同心圆背景 */}
        {layers.map((scale, idx) => (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
            strokeDasharray={idx === 0 ? '0' : '2 4'}
          />
        ))}

        {/* 轴线 */}
        {data.map((_, i) => {
          const theta = -Math.PI / 2 + i * angle
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(theta)}
              y2={center + radius * Math.sin(theta)}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          )
        })}

        {/* 数据多边形 */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: motionTokens.duration.slower, ease: motionTokens.easing.easeOut }}
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="rgba(255, 182, 193, 0.4)"
          stroke="#FFB6C1"
          strokeWidth={2}
        />

        {/* 数据点 */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: motionTokens.stagger.dramatic + i * motionTokens.stagger.loose }}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="#FFB6C1"
          />
        ))}

        {/* 标签 */}
        {points.map((p, i) => (
          <g key={i} aria-hidden>
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-700 text-xs font-medium"
            >
              {p.label}
            </text>
            <text
              x={p.labelX}
              y={p.labelY + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-500 text-[10px]"
            >
              {p.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
