"use client";

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

export interface MetricsAttempt {
  attempt: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface MetricsData {
  attempts: MetricsAttempt[];
}

const ATTEMPT_COLORS: Record<number, string> = {
  1: '#a5b4fc', // light
  2: '#6366f1', // medium
  3: '#3730a3', // dark
};

function buildOption(data: MetricsData): echarts.EChartsCoreOption {
  const categories = ['Precision', 'Recall', 'F1-Score'];

  const series = data.attempts.map((a) => ({
    name: `Attempt ${a.attempt}`,
    type: 'bar' as const,
    data: [a.precision, a.recall, a.f1],
    itemStyle: { color: ATTEMPT_COLORS[a.attempt] ?? '#6366f1' },
    barGap: '10%',
    label: { show: true, position: 'top' as const, fontSize: 10, color: '#d1d5db', formatter: (p: { value: number }) => p.value.toFixed(2) },
  }));

  return {
    title: { text: 'Classification Metrics by Attempt', left: 'center', textStyle: { fontSize: 13, fontWeight: 600, color: '#e5e7eb' } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 10, textStyle: { color: '#9ca3af' } },
    grid: { left: 50, right: 20, top: 50, bottom: 50 },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#d1d5db' },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 1,
      axisLabel: { color: '#d1d5db', formatter: (v: number) => v.toFixed(1) },
      axisLine: { lineStyle: { color: '#374151' } },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series,
  };
}

export const SAMPLE_DATA: MetricsData = {
  attempts: [
    { attempt: 1, precision: 0.65, recall: 0.58, f1: 0.61 },
    { attempt: 2, precision: 0.78, recall: 0.72, f1: 0.75 },
    { attempt: 3, precision: 0.85, recall: 0.82, f1: 0.83 },
  ],
};

interface Props {
  data: MetricsData;
}

export default function DashboardMetricsChart({ data }: Props) {
  return <ReactEChartsCore echarts={echarts} option={buildOption(data)} style={{ width: '100%', height: '100%' }} />;
}
