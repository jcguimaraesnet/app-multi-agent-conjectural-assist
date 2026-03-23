"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ConjecturalEvaluation } from '@/types';
import { X, Maximize2 } from 'lucide-react';

echarts.use([RadarChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const CRITERIA_KEYS = ['unambiguous', 'completeness', 'atomicity', 'verifiable', 'conforming'] as const;
const CRITERIA_LABELS = ['Unambiguous', 'Completeness', 'Atomicity', 'Verifiable', 'Conforming'];

function avgScores(evals: ConjecturalEvaluation[]) {
  return CRITERIA_KEYS.map((key) =>
    evals.length > 0
      ? Math.round((evals.reduce((sum, e) => sum + e[key], 0) / evals.length) * 100) / 100
      : 0
  );
}

function avgOverall(evals: ConjecturalEvaluation[]) {
  return evals.length > 0
    ? Math.round((evals.reduce((sum, e) => sum + e.overall_score, 0) / evals.length) * 100) / 100
    : null;
}

function buildOption(
  requirementId: string | null,
  llmScores: number[],
  humanScores: number[],
  hasHuman: boolean,
  fontSize: 'sm' | 'lg',
): echarts.EChartsCoreOption {
  const isLg = fontSize === 'lg';

  const series: echarts.EChartsCoreOption[] = [
    {
      name: 'LLM-as-judge',
      type: 'radar',
      data: [{ value: llmScores, name: 'LLM-as-judge', label: { show: true, formatter: '{c}', fontSize: isLg ? 12 : 10 } }],
      lineStyle: { color: '#3730a3', width: 2 },
      itemStyle: { color: '#3730a3' },
      areaStyle: { color: 'rgba(55, 48, 163, 0.35)' },
    },
  ];

  if (hasHuman) {
    series.push({
      name: 'Human',
      type: 'radar',
      data: [{ value: humanScores, name: 'Human', label: { show: true, formatter: '{c}', fontSize: isLg ? 12 : 10 } }],
      lineStyle: { color: '#a5b4fc', width: 2 },
      itemStyle: { color: '#a5b4fc' },
      areaStyle: { color: 'rgba(165, 180, 252, 0.2)' },
    });
  }

  return {
    title: {
      text: `Quality Evaluation — ${requirementId ?? 'Requirement'}`,
      left: 'center',
      textStyle: { fontSize: isLg ? 16 : 13, fontWeight: 600, color: '#e5e7eb' },
    },
    tooltip: { trigger: 'item' },
    legend: {
      bottom: isLg ? 20 : 30,
      data: hasHuman ? ['LLM-as-judge', 'Human'] : ['LLM-as-judge'],
      textStyle: { color: '#9ca3af' },
    },
    radar: {
      indicator: CRITERIA_LABELS.map((name) => ({ name, max: 5 })),
      axisName: { color: '#d1d5db', fontSize: isLg ? 13 : 11 },
      shape: 'polygon',
      radius: isLg ? '60%' : '55%',
      splitArea: { areaStyle: { color: 'transparent' } },
      splitLine: { lineStyle: { color: '#374151' } },
      axisLine: { lineStyle: { color: '#374151' } },
    },
    series,
  };
}

interface EvaluationRadarCardProps {
  evaluations: ConjecturalEvaluation[];
  requirementId: string | null;
}

export default function EvaluationRadarCard({ evaluations, requirementId }: EvaluationRadarCardProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!showModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setShowModal(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showModal]);

  if (evaluations.length === 0) return <span>No evaluations available.</span>;

  const llmEvals = evaluations.filter((e) => e.type === 'llm');
  const humanEvals = evaluations.filter((e) => e.type === 'human');
  const llmScores = avgScores(llmEvals);
  const humanScores = avgScores(humanEvals);
  const llmOverall = avgOverall(llmEvals);
  const humanOverall = avgOverall(humanEvals);
  const hasHuman = humanEvals.length > 0;

  const overallParts: string[] = [];
  if (llmOverall !== null) overallParts.push(`LLM: ${llmOverall}`);
  if (humanOverall !== null) overallParts.push(`Human: ${humanOverall}`);

  const cardOption = buildOption(requirementId, llmScores, humanScores, hasHuman, 'sm');
  const modalOption = buildOption(requirementId, llmScores, humanScores, hasHuman, 'lg');

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        style={{
          margin: '25px 0px 45px 0px',
          width: '100%',
          maxWidth: 360,
          border: '1px solid #374151',
          borderRadius: 10,
          padding: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          backgroundColor: '#111827',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 8, right: 8, color: '#6b7280' }}>
          <Maximize2 size={14} />
        </div>
        <ReactEChartsCore echarts={echarts} option={cardOption} style={{ height: 300, pointerEvents: 'none' }} />
        {overallParts.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 3, marginBottom: 4 }}>
            Overall Score: {overallParts.join(' / ')}
          </p>
        )}
      </div>

      {showModal && createPortal(
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 600,
              border: '1px solid #374151',
              borderRadius: 12,
              padding: 20,
              backgroundColor: '#111827',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                color: '#9ca3af',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
            <ReactEChartsCore echarts={echarts} option={modalOption} style={{ height: 450 }} />
            {overallParts.length > 0 && (
              <p style={{ textAlign: 'center', fontSize: 14, color: '#9ca3af', marginTop: 6 }}>
                Overall Score: {overallParts.join(' / ')}
              </p>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
