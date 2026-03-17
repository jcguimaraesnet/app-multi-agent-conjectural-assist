"use client";

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, VisualMapComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([HeatmapChart, TitleComponent, TooltipComponent, GridComponent, VisualMapComponent, CanvasRenderer]);

export interface ConfusionData {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

function buildOption(data: ConfusionData): echarts.EChartsCoreOption {
  // Matrix layout:
  //              Predicted Negative | Predicted Positive
  // Actual Neg:       TN                  FP
  // Actual Pos:       FN                  TP
  const xLabels = ['Predicted\nNegative', 'Predicted\nPositive'];
  const yLabels = ['Actual\nPositive', 'Actual\nNegative'];

  // [x, y, value] — y=0 is bottom (Actual Positive), y=1 is top (Actual Negative)
  const heatmapData = [
    [0, 1, data.tn],  // Actual Neg, Pred Neg = TN
    [1, 1, data.fp],  // Actual Neg, Pred Pos = FP
    [0, 0, data.fn],  // Actual Pos, Pred Neg = FN
    [1, 0, data.tp],  // Actual Pos, Pred Pos = TP
  ];

  const maxVal = Math.max(data.tp, data.fp, data.fn, data.tn, 1);

  return {
    title: { text: 'Confusion Matrix (LLM vs Human)', left: 'center', textStyle: { fontSize: 13, fontWeight: 600, color: '#e5e7eb' } },
    tooltip: {
      formatter: (params: { data: number[] }) => {
        const [x, y, val] = params.data;
        const label = y === 1
          ? (x === 0 ? 'TN' : 'FP')
          : (x === 0 ? 'FN' : 'TP');
        return `${label}: ${val}`;
      },
    },
    grid: { left: 80, right: 40, top: 50, bottom: 60 },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { color: '#d1d5db', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      axisLabel: { color: '#d1d5db', fontSize: 11 },
      axisLine: { lineStyle: { color: '#374151' } },
      splitArea: { show: true },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      calculable: false,
      show: false,
      inRange: {
        color: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
      },
    },
    series: [{
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: true,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e5e7eb',
        formatter: (params: { data: number[] }) => `${params.data[2]}`,
      },
      itemStyle: { borderColor: '#111827', borderWidth: 2 },
    }],
  };
}

export const SAMPLE_DATA: ConfusionData = { tp: 12, fp: 3, fn: 5, tn: 20 };

interface Props {
  data: ConfusionData;
}

export default function DashboardConfusionMatrix({ data }: Props) {
  return <ReactEChartsCore echarts={echarts} option={buildOption(data)} style={{ width: '100%', height: '100%' }} />;
}
