"use client";

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([BarChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent, CanvasRenderer]);

export interface PassRateBucket {
  count: number;
  percent: number;
}

export interface PassRateGroup {
  total: number;
  pass_at_1: PassRateBucket;
  pass_at_2: PassRateBucket;
  pass_at_3: PassRateBucket;
  fail: PassRateBucket;
}

export interface PassRateData {
  llm: PassRateGroup | null;
  human: PassRateGroup | null;
}

const SEGMENT_COLORS = ['#c7d2fe', '#a5b4fc', '#6366f1', '#3730a3'];
const SEGMENT_LABELS = ['Pass@1', 'Pass@2', 'Pass@3', 'Fail'];
const SEGMENT_KEYS: (keyof Omit<PassRateGroup, 'total'>)[] = ['pass_at_1', 'pass_at_2', 'pass_at_3', 'fail'];

function buildOption(data: PassRateData, dark: boolean): echarts.EChartsCoreOption {
  const textColor = dark ? '#e5e7eb' : '#1f2937';
  const subTextColor = dark ? '#9ca3af' : '#6b7280';
  const labelColor = dark ? '#d1d5db' : '#374151';
  const lineColor = dark ? '#374151' : '#d1d5db';

  const categories: string[] = [];
  if (data.llm) categories.push('LLM');
  if (data.human) categories.push('Human');
  if (categories.length === 0) categories.push('LLM');

  const series = SEGMENT_KEYS.map((key, i) => {
    const values: number[] = [];
    if (data.llm) values.push(data.llm[key].percent);
    if (data.human) values.push(data.human[key].percent);
    if (!data.llm && !data.human) values.push(0);

    return {
      name: SEGMENT_LABELS[i],
      type: 'bar' as const,
      stack: 'total',
      data: values,
      itemStyle: { color: SEGMENT_COLORS[i] },
      barWidth: 36,
      label: {
        show: true,
        position: 'inside' as const,
        fontSize: 11,
        fontWeight: 600 as const,
        color: i >= 2 ? '#ffffff' : '#1f2937',
        formatter: (p: { value: number }) => p.value > 0 ? `${p.value}%` : '',
      },
    };
  });

  return {
    title: {
      text: 'Pass Rate by Attempt (Pass@k)',
      left: 'center',
      textStyle: { fontSize: 13, fontWeight: 600, color: textColor },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: { seriesName: string; value: number; marker: string }[]) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const header = `<b>${params[0].value !== undefined ? categories[0] : ''}</b>`;
        const rows = params.map(
          (p) => `${p.marker} ${p.seriesName}: <b>${p.value}%</b>`
        );
        return [header, ...rows].join('<br/>');
      },
    },
    legend: { bottom: 4, textStyle: { color: subTextColor } },
    grid: { left: 60, right: 30, top: 50, bottom: 60 },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: labelColor, fontWeight: 600 },
      axisLine: { lineStyle: { color: lineColor } },
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: labelColor, formatter: (v: number) => `${v}%` },
      axisLine: { lineStyle: { color: lineColor } },
      splitLine: { lineStyle: { color: dark ? '#1f2937' : '#f3f4f6' } },
    },
    series,
  };
}

export const SAMPLE_DATA: PassRateData = {
  llm: {
    total: 10,
    pass_at_1: { count: 5, percent: 50 },
    pass_at_2: { count: 2, percent: 20 },
    pass_at_3: { count: 1, percent: 10 },
    fail: { count: 2, percent: 20 },
  },
  human: {
    total: 10,
    pass_at_1: { count: 6, percent: 60 },
    pass_at_2: { count: 1, percent: 10 },
    pass_at_3: { count: 2, percent: 20 },
    fail: { count: 1, percent: 10 },
  },
};

interface Props {
  data: PassRateData;
  dark?: boolean;
}

export default function DashboardPassRateChart({ data, dark = true }: Props) {
  return <ReactEChartsCore echarts={echarts} option={buildOption(data, dark)} style={{ width: '100%', height: '100%' }} />;
}
