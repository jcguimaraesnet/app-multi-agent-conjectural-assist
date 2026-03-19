"use client";

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([ScatterChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, MarkLineComponent, CanvasRenderer]);

export interface ScatterPoint {
  requirement_id: string;
  attempt: number;
  human_avg: number;
  llm_avg: number;
}

export interface ScatterData {
  points: ScatterPoint[];
  spearman_rho: number | null;
  has_data: boolean;
}

const ATTEMPT_COLORS: Record<number, string> = {
  1: '#c7d2fe',
  2: '#a5b4fc',
  3: '#6366f1',
};

function buildOption(data: ScatterData, dark: boolean): echarts.EChartsCoreOption {
  const textColor = dark ? '#e5e7eb' : '#1f2937';
  const subTextColor = dark ? '#9ca3af' : '#6b7280';
  const labelColor = dark ? '#d1d5db' : '#374151';
  const lineColor = dark ? '#374151' : '#d1d5db';
  const splitColor = dark ? '#1f2937' : '#f3f4f6';

  const attempts = [1, 2, 3];
  const series = attempts.map((attempt, idx) => {
    const pts = data.points
      .filter((p) => p.attempt === attempt)
      .map((p) => [p.human_avg, p.llm_avg]);

    return {
      name: `Attempt ${attempt}`,
      type: 'scatter' as const,
      data: pts,
      symbolSize: 12,
      itemStyle: { color: ATTEMPT_COLORS[attempt] ?? '#6366f1' },
      ...(idx === 0
        ? {
            markLine: {
              silent: true,
              symbol: 'none',
              lineStyle: { type: 'dashed' as const, color: dark ? '#6b7280' : '#9ca3af', width: 1.5 },
              data: [[{ coord: [1, 1] }, { coord: [5, 5] }]],
              label: { show: false },
            },
          }
        : {}),
    };
  });

  const spearmanText =
    data.spearman_rho !== null
      ? `Global Spearman Correlation: ${data.spearman_rho.toFixed(2)}`
      : 'Global Spearman Correlation: N/A';

  return {
    title: [
      {
        text: 'LLM-as-Judge vs Human Score Correlation',
        left: 'center',
        textStyle: { fontSize: 13, fontWeight: 600, color: textColor },
      },
      {
        text: spearmanText,
        left: 'center',
        top: 32,
        textStyle: { fontSize: 11, fontWeight: 400, fontStyle: 'italic', color: subTextColor },
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: (p: { data: number[]; seriesName: string }) => {
        if (!p.data) return '';
        return `${p.seriesName}<br/>Human: <b>${p.data[0]}</b><br/>LLM: <b>${p.data[1]}</b>`;
      },
    },
    legend: { bottom: 4, textStyle: { color: subTextColor } },
    grid: { left: 55, right: 20, top: 65, bottom: 72 },
    xAxis: {
      name: 'Human Evaluation',
      nameLocation: 'center',
      nameGap: 24,
      nameTextStyle: { color: labelColor, fontSize: 11 },
      type: 'value',
      min: 1,
      max: 5,
      axisLabel: { color: labelColor },
      axisLine: { lineStyle: { color: lineColor } },
      splitLine: { lineStyle: { color: splitColor } },
    },
    yAxis: {
      name: 'LLM-as-Judge Evaluation',
      nameLocation: 'center',
      nameGap: 25,
      nameTextStyle: { color: labelColor, fontSize: 11 },
      type: 'value',
      min: 1,
      max: 5,
      axisLabel: { color: labelColor },
      axisLine: { lineStyle: { color: lineColor } },
      splitLine: { lineStyle: { color: splitColor } },
    },
    series,
  };
}

export const SAMPLE_DATA: ScatterData = {
  points: [
    { requirement_id: 'r1', attempt: 1, human_avg: 3.4, llm_avg: 3.8 },
    { requirement_id: 'r2', attempt: 1, human_avg: 4.2, llm_avg: 4.0 },
    { requirement_id: 'r3', attempt: 1, human_avg: 2.6, llm_avg: 3.0 },
    { requirement_id: 'r1', attempt: 2, human_avg: 3.8, llm_avg: 4.2 },
    { requirement_id: 'r2', attempt: 2, human_avg: 4.4, llm_avg: 4.6 },
    { requirement_id: 'r3', attempt: 2, human_avg: 3.2, llm_avg: 3.4 },
    { requirement_id: 'r1', attempt: 3, human_avg: 4.0, llm_avg: 4.4 },
    { requirement_id: 'r2', attempt: 3, human_avg: 4.6, llm_avg: 4.8 },
    { requirement_id: 'r3', attempt: 3, human_avg: 3.6, llm_avg: 3.8 },
  ],
  spearman_rho: 0.85,
  has_data: true,
};

interface Props {
  data: ScatterData;
  dark?: boolean;
}

export default function DashboardScatterChart({ data, dark = true }: Props) {
  return <ReactEChartsCore echarts={echarts} option={buildOption(data, dark)} style={{ width: '100%', height: '100%' }} />;
}
