/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw, 
  User, 
  Calendar, 
  Hash, 
  Maximize, 
  Settings,
  Search,
  Info,
  Plus,
  Trash2,
  Table as TableIcon,
  Calculator,
  Thermometer,
  Download,
  BarChart2,
  TrendingUp,
  PieChart as PieChartIcon
} from 'lucide-react';
import { RingMillData, RingMillDataInput, MeasurementRecord } from '../types/RingMillData';

interface DataEntryFormProps {
  onSave: (data: RingMillDataInput) => void;
  allRecords: RingMillData[];
}

interface DimensionSet {
  od: string;
  id: string;
  t: string;
}

interface FormState extends Omit<RingMillDataInput, 'size' | 'margin' | 'appliedMargin' | 'coldDimension' | 'hotDimension' | 'measurements'> {
  size: DimensionSet;
  margin: DimensionSet;
  appliedMargin: DimensionSet;
  coldDimension: DimensionSet;
  hotDimension: DimensionSet;
  measurements: MeasurementRecord[];
  shift: 'Day' | 'Night';
  appliedThermalExpansionCoefficient: number;
}

const initialDimension: DimensionSet = { od: '', id: '', t: '' };

const createInitialMeasurement = (round: number): MeasurementRecord => ({
  round,
  measuredOD: '',
  measuredID: '',
  measuredT: '',
  remainingOD: '0.00',
  remainingID: '0.00',
  remainingT: '0.00',
  averageDimension: '0.00',
  averageMargin: '0.00',
});

const initialFormState: FormState = {
  manufacturingNo: '',
  sn: '',
  size: { ...initialDimension },
  margin: { ...initialDimension },
  appliedMargin: { ...initialDimension },
  coldDimension: { ...initialDimension },
  hotDimension: { ...initialDimension },
  material: '',
  heatTreatmentType: '',
  measurements: [createInitialMeasurement(1), createInitialMeasurement(2)],
  workDate: new Date().toISOString().split('T')[0],
  shift: 'Day',
  worker: '',
  thermalExpansionCoefficient: 0.000012,
  appliedThermalExpansionCoefficient: 0.000012,
};

/**
 * MeasurementRow Component
 */
const MeasurementRow = React.memo(({ 
  record, 
  onUpdate, 
  onRemove, 
  canRemove,
  errors,
  targetSize
}: { 
  record: MeasurementRecord; 
  onUpdate: (id: number, field: keyof MeasurementRecord, value: string) => void;
  onRemove: (round: number) => void;
  canRemove: boolean;
  errors?: Partial<Record<keyof MeasurementRecord, string>>;
  targetSize: { od: string; id: string; t: string };
}) => {
  const getMargin = (measured: string, target: string) => {
    const m = parseFloat(measured);
    const t = parseFloat(target);
    if (!isNaN(m) && !isNaN(t) && t > 0) {
      const margin = m - t;
      return margin > 0 ? `+${margin.toFixed(2)}` : margin.toFixed(2);
    }
    return null;
  };

  const marginOD = getMargin(record.measuredOD, targetSize.od);
  const marginID = getMargin(record.measuredID, targetSize.id);
  const marginT = getMargin(record.measuredT, targetSize.t);

  return (
    <tr className="group hover:bg-slate-50 transition-all duration-300">
      <td className="py-6 px-8 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-black text-xs border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
          {record.round}
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="relative group/input flex flex-col items-center">
          <div className="relative w-full">
            <input 
              type="number" 
              step="any"
              value={record.measuredOD} 
              onChange={(e) => onUpdate(record.round, 'measuredOD', e.target.value)} 
              className={`w-full px-4 py-4 bg-slate-50 border ${errors?.measuredOD ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100'} rounded-2xl text-center font-mono text-sm font-black text-slate-700 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-inner`}
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-focus-within/input:text-blue-400">OD</div>
          </div>
          {marginOD && (
            <div className={`text-[10px] font-black mt-2 ${parseFloat(marginOD) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              여유치: {marginOD}
            </div>
          )}
          {errors?.measuredOD && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full whitespace-nowrap z-10">
              {errors.measuredOD}
            </motion.div>
          )}
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="relative group/input flex flex-col items-center">
          <div className="relative w-full">
            <input 
              type="number" 
              step="any"
              value={record.measuredID} 
              onChange={(e) => onUpdate(record.round, 'measuredID', e.target.value)} 
              className={`w-full px-4 py-4 bg-slate-50 border ${errors?.measuredID ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100'} rounded-2xl text-center font-mono text-sm font-black text-slate-700 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-inner`}
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-focus-within/input:text-blue-400">ID</div>
          </div>
          {marginID && (
            <div className={`text-[10px] font-black mt-2 ${parseFloat(marginID) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              여유치: {marginID}
            </div>
          )}
          {errors?.measuredID && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full whitespace-nowrap z-10">
              {errors.measuredID}
            </motion.div>
          )}
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="relative group/input flex flex-col items-center">
          <div className="relative w-full">
            <input 
              type="number" 
              step="any"
              value={record.measuredT} 
              onChange={(e) => onUpdate(record.round, 'measuredT', e.target.value)} 
              className={`w-full px-4 py-4 bg-slate-50 border ${errors?.measuredT ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100'} rounded-2xl text-center font-mono text-sm font-black text-slate-700 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-inner`}
              placeholder="0.00"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-focus-within/input:text-blue-400">T</div>
          </div>
          {marginT && (
            <div className={`text-[10px] font-black mt-2 ${parseFloat(marginT) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              여유치: {marginT}
            </div>
          )}
          {errors?.measuredT && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full whitespace-nowrap z-10">
              {errors.measuredT}
            </motion.div>
          )}
        </div>
      </td>
      <td className="py-6 px-8 text-center">
        <button 
          type="button"
          onClick={() => onRemove(record.round)} 
          disabled={!canRemove}
          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          title="기록 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});

MeasurementRow.displayName = 'MeasurementRow';

/**
 * FormFieldTooltip Component
 */
const FormFieldTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1">
    <Info className="w-3 h-3 text-slate-300 cursor-help hover:text-blue-500 transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-900 text-white text-[10px] font-medium rounded-lg shadow-xl z-50 text-center normal-case tracking-normal">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
    </div>
  </div>
);

/**
 * DimensionInput Component
 */
const DimensionInput = React.memo(({ 
  label, 
  data, 
  onChange, 
  highlight = false,
  isHot = false,
  isTarget = false,
  max,
  errors,
  tooltip
}: { 
  label: string; 
  data: DimensionSet; 
  onChange: (field: keyof DimensionSet, value: string) => void;
  highlight?: boolean;
  isHot?: boolean;
  isTarget?: boolean;
  max?: number;
  errors?: Partial<Record<keyof DimensionSet, string>>;
  tooltip?: string;
}) => (
  <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${highlight ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'} ${Object.values(errors || {}).some(e => e) ? 'ring-2 ring-red-500/50' : ''}`}>
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${isHot ? 'bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]' : highlight ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-300'}`} />
        <label className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center ${highlight ? 'text-blue-400' : 'text-slate-400'}`}>
          {label}
          {tooltip && <FormFieldTooltip text={tooltip} />}
        </label>
      </div>
      {isTarget && <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest bg-blue-500/5 px-2 py-1 rounded-md">Reference</span>}
    </div>
    <div className="grid grid-cols-3 gap-3">
      <div className="relative group/input">
        <input 
          type="number" 
          step={isTarget ? "0.01" : "any"}
          max={max}
          value={data.od} 
          onChange={(e) => {
            const val = e.target.value;
            if (max && parseFloat(val) > max) return;
            onChange('od', val);
          }} 
          className={`w-full px-2 py-4 rounded-xl text-center font-mono text-sm font-black outline-none border transition-all ${errors?.od ? 'border-red-500 ring-4 ring-red-500/10' : highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10'}`}
          placeholder="0.00"
        />
        <span className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-[7px] font-black px-1.5 py-0.5 rounded-full ${errors?.od ? 'bg-red-500 text-white' : highlight ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>OD</span>
        {errors?.od && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg z-10">
            {errors.od}
          </motion.div>
        )}
      </div>
      <div className="relative group/input">
        <input 
          type="number" 
          step={isTarget ? "0.01" : "any"}
          max={max}
          value={data.id} 
          onChange={(e) => {
            const val = e.target.value;
            if (max && parseFloat(val) > max) return;
            onChange('id', val);
          }} 
          className={`w-full px-2 py-4 rounded-xl text-center font-mono text-sm font-black outline-none border transition-all ${errors?.id ? 'border-red-500 ring-4 ring-red-500/10' : highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10'}`}
          placeholder="0.00"
        />
        <span className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-[7px] font-black px-1.5 py-0.5 rounded-full ${errors?.id ? 'bg-red-500 text-white' : highlight ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>ID</span>
        {errors?.id && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg z-10">
            {errors.id}
          </motion.div>
        )}
      </div>
      <div className="relative group/input">
        <input 
          type="number" 
          step={isTarget ? "0.01" : "any"}
          max={max}
          value={data.t} 
          onChange={(e) => {
            const val = e.target.value;
            if (max && parseFloat(val) > max) return;
            onChange('t', val);
          }} 
          className={`w-full px-2 py-4 rounded-xl text-center font-mono text-sm font-black outline-none border transition-all ${errors?.t ? 'border-red-500 ring-4 ring-red-500/10' : highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10'}`}
          placeholder="0.00"
        />
        <span className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-[7px] font-black px-1.5 py-0.5 rounded-full ${errors?.t ? 'bg-red-500 text-white' : highlight ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>T</span>
        {errors?.t && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-lg z-10">
            {errors.t}
          </motion.div>
        )}
      </div>
    </div>
  </div>
));

DimensionInput.displayName = 'DimensionInput';

/**
 * StatsDashboard Component
 */
const StatsDashboard = ({ records }: { records: RingMillData[] }) => {
  if (!records || records.length === 0) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-4">
        <BarChart2 className="w-16 h-16 opacity-20" />
        <p className="font-black uppercase tracking-widest text-xs">데이터가 없습니다. 먼저 데이터를 입력해 주세요.</p>
      </div>
    );
  }

  const materialStats = records.reduce((acc: any, curr) => {
    acc[curr.material] = (acc[curr.material] || 0) + 1;
    return acc;
  }, {});

  const materialData = Object.keys(materialStats).map(key => ({
    name: key,
    value: materialStats[key]
  }));

  const shiftStats = records.reduce((acc: any, curr) => {
    acc[curr.shift] = (acc[curr.shift] || 0) + 1;
    return acc;
  }, {});

  const shiftData = Object.keys(shiftStats).map(key => ({
    name: key,
    value: shiftStats[key]
  }));

  const heatStats = records.reduce((acc: any, curr) => {
    acc[curr.heatTreatmentType || 'N/A'] = (acc[curr.heatTreatmentType || 'N/A'] || 0) + 1;
    return acc;
  }, {});

  const heatData = Object.keys(heatStats).map(key => ({
    name: key,
    value: heatStats[key]
  }));

  const timelineData = records.slice(-15).map(r => ({
    date: r.workDate,
    od: parseFloat(r.measurements[r.measurements.length - 1]?.measuredOD || '0'),
    id: parseFloat(r.measurements[r.measurements.length - 1]?.measuredID || '0'),
    t: parseFloat(r.measurements[r.measurements.length - 1]?.measuredT || '0'),
    margin: parseFloat(r.measurements[r.measurements.length - 1]?.averageMargin || '0'),
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleExportAll = () => {
    let csvContent = "제조번호,S/N,규격,재질,열처리,작업자,작업일자,교대,최종 측정 OD,최종 측정 ID,최종 측정 T,평균 여유치\n";
    records.forEach(record => {
      const lastM = record.measurements[record.measurements.length - 1];
      csvContent += `${record.manufacturingNo},${record.sn},"${record.size}",${record.material},${record.heatTreatmentType},${record.worker},${record.workDate},${record.shift},${lastM?.measuredOD || '-'},${lastM?.measuredID || '-'},${lastM?.measuredT || '-'},${lastM?.averageMargin || '-'}\n`;
    });

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ring_mill_all_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportChartData = () => {
    let csvContent = "--- 재질 분포 (Material Distribution) ---\n";
    csvContent += "재질,수량\n";
    materialData.forEach(d => csvContent += `${d.name},${d.value}\n`);
    
    csvContent += "\n--- 열처리 분포 (Heat Treatment Distribution) ---\n";
    csvContent += "유형,수량\n";
    heatData.forEach(d => csvContent += `${d.name},${d.value}\n`);
    
    csvContent += "\n--- 교대 분석 (Shift Analysis) ---\n";
    csvContent += "교대,수량\n";
    shiftData.forEach(d => csvContent += `${d.name},${d.value}\n`);
    
    csvContent += "\n--- 최근 측정 추세 (Recent Trends - Last 15) ---\n";
    csvContent += "일자,OD,ID,T,평균 여유치\n";
    timelineData.forEach(d => csvContent += `${d.date},${d.od},${d.id},${d.t},${d.margin}\n`);

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ring_mill_chart_stats_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 p-6 sm:p-10">
      <div className="flex flex-wrap justify-end gap-4">
        <button 
          onClick={handleExportChartData}
          className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl text-xs font-black hover:bg-slate-50 transition-all shadow-lg uppercase tracking-widest"
        >
          <BarChart2 className="w-4 h-4 text-blue-500" /> 차트 데이터 내보내기
        </button>
        <button 
          onClick={handleExportAll}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest"
        >
          <Download className="w-4 h-4" /> 전체 데이터 내보내기 (CSV)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-500" /> 재질 및 열처리 분포
          </h3>
          <div className="h-[300px] w-full flex flex-col sm:flex-row">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {materialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={heatData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {heatData.map((entry, index) => (
                    <Cell key={`cell-heat-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase">Material</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase">Heat Treatment</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> 최근 측정 추세 및 여유치 분석
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Line type="monotone" dataKey="od" stroke="#3b82f6" strokeWidth={3} name="OD" dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="margin" stroke="#ef4444" strokeWidth={3} name="Avg Margin" dot={{ r: 4, fill: '#ef4444' }} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-orange-500" /> 작업자별 생산량 및 교대 분석
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={records.reduce((acc: any[], curr) => {
                const worker = acc.find(a => a.name === curr.worker);
                if (worker) {
                  worker.count++;
                  worker[curr.shift] = (worker[curr.shift] || 0) + 1;
                } else {
                  acc.push({ name: curr.worker, count: 1, [curr.shift]: 1 });
                }
                return acc;
              }, [])}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                <Bar dataKey="Day" stackId="a" fill="#3b82f6" name="Day Shift" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Night" stackId="a" fill="#1e293b" name="Night Shift" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-500" /> 교대별 가동률 분포
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#1e293b" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DataEntryForm({ onSave, allRecords }: DataEntryFormProps) {
  const [activeTab, setActiveTab] = useState<'entry' | 'history' | 'stats'>('entry');
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [searchResults, setSearchResults] = useState<RingMillData[] | null>(null);

  // Search state
  const [searchMfgNo, setSearchMfgNo] = useState('');
  const [searchSN, setSearchSN] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');

  // Auto-calculation logic
  useEffect(() => {
    const sOD = parseFloat(formData.size.od) || 0;
    const sID = parseFloat(formData.size.id) || 0;
    const sT = parseFloat(formData.size.t) || 0;

    const mOD = parseFloat(formData.margin.od) || 0;
    const mID = parseFloat(formData.margin.id) || 0;
    const mT = parseFloat(formData.margin.t) || 0;

    const amOD = parseFloat(formData.appliedMargin.od) || 0;
    const amID = parseFloat(formData.appliedMargin.id) || 0;
    const amT = parseFloat(formData.appliedMargin.t) || 0;

    const coeff = formData.appliedThermalExpansionCoefficient || 0;

    setFormData(prev => {
      // 1. Target Cold Dimension Calculation
      // Target Cold = Size + Applied Margin
      const targetColdOD = sOD + amOD;
      const targetColdID = sID + amID;
      const targetColdT = sT + amT;

      const newColdDimension = {
        od: targetColdOD > 0 ? targetColdOD.toFixed(2) : prev.coldDimension.od,
        id: targetColdID > 0 ? targetColdID.toFixed(2) : prev.coldDimension.id,
        t: targetColdT > 0 ? targetColdT.toFixed(2) : prev.coldDimension.t,
      };

      // 2. Target Hot Dimension Calculation
      // Target Hot = Target Cold * (1 + Coeff)
      const targetHotOD = targetColdOD * (1 + coeff);
      const targetHotID = targetColdID * (1 + coeff);
      const targetHotT = targetColdT * (1 + coeff);

      const newHotDimension = {
        od: targetHotOD > 0 ? targetHotOD.toFixed(2) : prev.hotDimension.od,
        id: targetHotID > 0 ? targetHotID.toFixed(2) : prev.hotDimension.id,
        t: targetHotT > 0 ? targetHotT.toFixed(2) : prev.hotDimension.t,
      };

      // 3. Remaining Margin Calculation for Measurements
      const updatedMeasurements = prev.measurements.map(m => {
        const measuredOD = parseFloat(m.measuredOD) || 0;
        const measuredID = parseFloat(m.measuredID) || 0;
        const measuredT = parseFloat(m.measuredT) || 0;

        const rOD = measuredOD > 0 ? (measuredOD - sOD) : 0;
        const rID = measuredID > 0 ? (measuredID - sID) : 0;
        const rT = measuredT > 0 ? (measuredT - sT) : 0;

        const avgDim = measuredOD > 0 && measuredID > 0 && measuredT > 0 
          ? (measuredOD + measuredID + measuredT) / 3 
          : 0;
        
        const avgMargin = measuredOD > 0 && measuredID > 0 && measuredT > 0
          ? (rOD + rID + rT) / 3
          : 0;

        return {
          ...m,
          remainingOD: rOD !== 0 ? rOD.toFixed(2) : '0.00',
          remainingID: rID !== 0 ? rID.toFixed(2) : '0.00',
          remainingT: rT !== 0 ? rT.toFixed(2) : '0.00',
          averageDimension: avgDim > 0 ? avgDim.toFixed(2) : '0.00',
          averageMargin: avgMargin !== 0 ? avgMargin.toFixed(2) : '0.00',
        };
      });

      // Prevent unnecessary updates
      const hasColdChanged = JSON.stringify(newColdDimension) !== JSON.stringify(prev.coldDimension);
      const hasHotChanged = JSON.stringify(newHotDimension) !== JSON.stringify(prev.hotDimension);
      const hasMeasurementsChanged = JSON.stringify(updatedMeasurements) !== JSON.stringify(prev.measurements);

      if (!hasColdChanged && !hasHotChanged && !hasMeasurementsChanged) return prev;

      return {
        ...prev,
        coldDimension: newColdDimension,
        hotDimension: newHotDimension,
        measurements: updatedMeasurements,
      };
    });
  }, [formData.size, formData.margin, formData.appliedMargin, formData.appliedThermalExpansionCoefficient, formData.measurements]);

  const applyThermalExpansion = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      appliedThermalExpansionCoefficient: prev.thermalExpansionCoefficient
    }));
  }, []);

  const handleExportCSV = useCallback(() => {
    if (!searchResults || searchResults.length === 0) return;

    let csvContent = "";
    
    if (searchResults.length === 1 && searchSN) {
      // Single record full export
      const record = searchResults[0];
      csvContent += `제조번호,${record.manufacturingNo}\n`;
      csvContent += `S/N,${record.sn}\n`;
      csvContent += `규격,${record.size}\n`;
      csvContent += `재질,${record.material}\n`;
      csvContent += `열처리,${record.heatTreatmentType}\n`;
      csvContent += `작업자,${record.worker}\n`;
      csvContent += `작업일자,${record.workDate}\n`;
      csvContent += `목표 냉간치수,${record.coldDimension}\n`;
      csvContent += `목표 열간치수,${record.hotDimension}\n\n`;
      
      csvContent += "회차,측정 OD,측정 ID,측정 T,남은 OD,남은 ID,남은 T,평균치수,평균여유치\n";
      record.measurements.forEach(m => {
        csvContent += `${m.round},${m.measuredOD},${m.measuredID},${m.measuredT},${m.remainingOD},${m.remainingID},${m.remainingT},${m.averageDimension},${m.averageMargin}\n`;
      });
    } else {
      // List export
      const headers = ["제조번호", "S/N", "규격", "재질", "열처리", "작업자", "작업일자", "최종 측정 OD"];
      csvContent += headers.join(",") + "\n";
      searchResults.forEach(record => {
        const lastOD = record.measurements[record.measurements.length - 1]?.measuredOD || "-";
        csvContent += `${record.manufacturingNo},${record.sn},"${record.size}",${record.material},${record.heatTreatmentType},${record.worker},${record.workDate},${lastOD}\n`;
      });
    }

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ring_mill_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [searchResults, searchSN]);

  const handleMfgNoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 20) value = value.slice(0, 20);
    setFormData(prev => ({ ...prev, manufacturingNo: value }));
  }, []);

  const handleSNBlur = useCallback(() => {
    setFormData(prev => {
      if (prev.sn) {
        const num = parseInt(prev.sn, 10);
        if (!isNaN(num)) {
          const padded = num.toString().padStart(3, '0');
          if (padded !== prev.sn) return { ...prev, sn: padded };
        }
      }
      return prev;
    });
  }, []);

  const handleSearch = useCallback(() => {
    if (!searchMfgNo && !searchSN && !searchStartDate && !searchEndDate) {
      setSearchResults([]);
      return;
    }
    
    const searchTerm = searchMfgNo.toLowerCase();
    const filtered = allRecords.filter(record => {
      const mfgMatch = !searchMfgNo || record.manufacturingNo.toLowerCase().includes(searchTerm);
      const snMatch = !searchSN || record.sn === searchSN.padStart(3, '0');
      
      // Date range match
      let dateMatch = true;
      if (searchStartDate) {
        dateMatch = dateMatch && record.workDate >= searchStartDate;
      }
      if (searchEndDate) {
        dateMatch = dateMatch && record.workDate <= searchEndDate;
      }
      
      return mfgMatch && snMatch && dateMatch;
    });
    setSearchResults(filtered);
  }, [searchMfgNo, searchSN, searchStartDate, searchEndDate, allRecords]);

  // Validation Logic
  const validateField = useCallback((name: string, value: any) => {
    let error = '';
    if (name === 'manufacturingNo') {
      if (!value) error = '제조번호를 입력해주세요.';
    } else if (name === 'sn') {
      if (!value) error = 'S/N을 입력해주세요.';
      else if (parseFloat(value) <= 0) error = 'S/N은 0보다 커야 합니다.';
    } else if (name === 'worker') {
      if (!value) error = '작업자 성명을 입력해주세요.';
    } else if (name === 'thermalExpansionCoefficient') {
      if (value === '' || value === undefined) error = '계수를 입력해주세요.';
      else if (parseFloat(value) < 0) error = '0 이상 입력';
    }
    return error;
  }, []);

  const validateDimension = useCallback((category: string, field: string, value: string) => {
    if (!value) return '필수';
    const num = parseFloat(value);
    if (isNaN(num)) return '숫자';
    if (num <= 0) return '> 0';
    if (num > 12000) return '< 12k';
    return '';
  }, []);

  const handleCategoryChange = useCallback((category: keyof FormState, field: keyof DimensionSet, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...(prev[category] as DimensionSet), [field]: value }
    }));
    
    const error = validateDimension(category, field, value);
    setErrors(prev => ({ ...prev, [`${category}.${field}`]: error }));
  }, [validateDimension]);

  const handleMeasurementUpdate = useCallback((round: number, field: keyof MeasurementRecord, value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.map(m => m.round === round ? { ...m, [field]: value } : m)
    }));

    const error = validateDimension('측정', field, value);
    setErrors(prev => ({ ...prev, [`measurements.${round}.${field}`]: error }));
  }, [validateDimension]);

  const addMeasurementRow = useCallback(() => {
    setFormData(prev => {
      if (prev.measurements.length >= 8) return prev;
      return { ...prev, measurements: [...prev.measurements, createInitialMeasurement(prev.measurements.length + 1)] };
    });
  }, []);

  const removeMeasurementRow = useCallback((round: number) => {
    setFormData(prev => {
      if (prev.measurements.length <= 2) return prev;
      const filtered = prev.measurements.filter(m => m.round !== round);
      const reindexed = filtered.map((m, idx) => ({ ...m, round: idx + 1 }));
      return { ...prev, measurements: reindexed };
    });
    // Clear errors for removed row
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`measurements.${round}`)) delete newErrors[key];
      });
      return newErrors;
    });
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
    
    const error = validateField(name, val);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    
    // Basic fields
    newErrors.manufacturingNo = validateField('manufacturingNo', formData.manufacturingNo);
    newErrors.sn = validateField('sn', formData.sn);
    newErrors.worker = validateField('worker', formData.worker);
    
    // Size fields
    ['od', 'id', 't'].forEach(f => {
      const err = validateDimension('수주치수', f, formData.size[f as keyof DimensionSet]);
      if (err) newErrors[`size.${f}`] = err;
    });

    // Measurements
    formData.measurements.forEach(m => {
      ['measuredOD', 'measuredID', 'measuredT'].forEach(f => {
        const err = validateDimension('측정', f, m[f as keyof MeasurementRecord] as string);
        if (err) newErrors[`measurements.${m.round}.${f}`] = err;
      });
    });

    const filteredErrors = Object.fromEntries(Object.entries(newErrors).filter(([_, v]) => v));
    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const formatDim = (dim: DimensionSet) => `${dim.od} x ${dim.id} x ${dim.t} mm`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        size: formatDim(formData.size),
        margin: formatDim(formData.margin),
        appliedMargin: formatDim(formData.appliedMargin),
        coldDimension: formatDim(formData.coldDimension),
        hotDimension: formatDim(formData.hotDimension),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const getAverages = () => {
    const validMeasurements = formData.measurements.filter(m => m.measuredOD || m.measuredID || m.measuredT);
    const count = validMeasurements.length || 1;
    
    const sumOD = validMeasurements.reduce((acc, m) => acc + (parseFloat(m.measuredOD) || 0), 0);
    const sumID = validMeasurements.reduce((acc, m) => acc + (parseFloat(m.measuredID) || 0), 0);
    const sumT = validMeasurements.reduce((acc, m) => acc + (parseFloat(m.measuredT) || 0), 0);
    
    const avgOD = sumOD / count;
    const avgID = sumID / count;
    const avgT = sumT / count;

    const sOD = parseFloat(formData.size.od) || 0;
    const sID = parseFloat(formData.size.id) || 0;
    const sT = parseFloat(formData.size.t) || 0;

    return {
      od: avgOD.toFixed(2),
      id: avgID.toFixed(2),
      t: avgT.toFixed(2),
      marginOD: sOD > 0 ? (avgOD - sOD).toFixed(2) : '0.00',
      marginID: sID > 0 ? (avgID - sID).toFixed(2) : '0.00',
      marginT: sT > 0 ? (avgT - sT).toFixed(2) : '0.00'
    };
  };

  const averages = getAverages();

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Tab Navigation - Refined Technical Style */}
      <div className="flex items-center justify-center pt-4 overflow-x-auto pb-2 px-4">
        <div className="flex p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-inner whitespace-nowrap">
          <button
            onClick={() => setActiveTab('entry')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'entry' 
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10 ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <Settings className={`w-3.5 h-3.5 ${activeTab === 'entry' ? 'text-blue-600' : 'text-slate-400'}`} />
            데이터 입력
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'today' 
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10 ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${activeTab === 'today' ? 'text-blue-600' : 'text-slate-400'}`} />
            오늘 기록
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'history' 
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10 ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-400'}`} />
            이력 조회
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'stats' 
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10 ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
            }`}
          >
            <BarChart2 className={`w-3.5 h-3.5 ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400'}`} />
            통계 분석
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'stats' ? (
          <motion.section
            key="stats"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden"
          >
            <div className="bg-slate-900 px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="bg-orange-600 p-3 rounded-2xl shadow-xl shadow-orange-500/20">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight font-serif italic">통계 분석 및 추세</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Production Insights & Trends</p>
                </div>
              </div>
            </div>
            <StatsDashboard records={allRecords} />
          </motion.section>
        ) : activeTab === 'today' ? (
          <motion.section
            key="today"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden"
          >
            <div className="bg-slate-900 px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight font-serif italic">오늘의 작업 기록</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Today's Production Log</p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-10">
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const todayRecords = allRecords.filter(r => r.workDate === todayStr);
                
                if (todayRecords.length === 0) {
                  return (
                    <div className="p-12 bg-slate-50 rounded-2xl text-slate-400 text-center flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-bold">오늘 기록된 작업이 없습니다.</p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">제조번호</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">S/N</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">규격</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">작업자</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">최종 측정 OD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {todayRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono font-black text-slate-800">{record.manufacturingNo}</td>
                            <td className="px-6 py-4 text-sm font-mono font-black text-slate-800">{record.sn}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">{record.size}</td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">{record.worker}</td>
                            <td className="px-6 py-4 text-sm font-mono font-black text-blue-600">
                              {record.measurements[record.measurements.length - 1]?.measuredOD || '-'} mm
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </motion.section>
        ) : activeTab === 'history' ? (
          <motion.section
            key="history"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden"
          >
            <div className="bg-slate-900 px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight font-serif italic">이력 조회 및 검색</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Manufacturing Database v3.0</p>
                </div>
              </div>
              {searchResults && (
                <button onClick={() => setSearchResults(null)} className="text-[10px] font-black text-slate-400 hover:text-white flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 transition-all uppercase tracking-widest">
                  <RefreshCcw className="w-3.5 h-3.5" /> Reset Results
                </button>
              )}
            </div>
            <div className="p-4 sm:p-10">
              <div className="bg-slate-50 p-8 rounded-[1.5rem] border border-slate-200 mb-10 shadow-inner space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Manufacturing Number</label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        value={searchMfgNo} 
                        onChange={(e) => setSearchMfgNo(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="제조번호 키워드 입력 (예: 1234)" 
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-mono text-sm font-bold shadow-sm" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Serial Number</label>
                    <input 
                      type="text" 
                      value={searchSN} 
                      onChange={(e) => setSearchSN(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="001" 
                      className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-mono text-sm font-bold text-center shadow-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Start Date</label>
                    <input 
                      type="date" 
                      value={searchStartDate} 
                      onChange={(e) => setSearchStartDate(e.target.value)} 
                      className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">End Date</label>
                    <input 
                      type="date" 
                      value={searchEndDate} 
                      onChange={(e) => setSearchEndDate(e.target.value)} 
                      className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-sm font-bold shadow-sm" 
                    />
                  </div>
                  <button onClick={handleSearch} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 h-[54px]">
                    <Search className="w-4 h-4" /> Search Records
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {searchResults !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-6">
                    {searchResults.length === 0 ? (
                      <div className="p-12 bg-slate-50 rounded-2xl text-slate-400 text-center flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-bold">일치하는 기록을 찾을 수 없습니다.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500" /> 검색 결과 <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">{searchResults.length}건</span>
                          </h4>
                          <button 
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-lg shadow-green-500/20"
                          >
                            <Download className="w-3.5 h-3.5" /> CSV 내보내기
                          </button>
                        </div>
                        
                        {searchSN && searchResults.length === 1 ? (
                          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">제조번호 / S/N</p>
                                <p className="text-sm font-mono font-black text-slate-800">{searchResults[0].manufacturingNo} / {searchResults[0].sn}</p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">규격 (SIZE)</p>
                                <p className="text-sm font-black text-slate-800">{searchResults[0].size}</p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">열처리 / 재질</p>
                                <p className="text-sm font-black text-slate-800">{searchResults[0].heatTreatmentType} / {searchResults[0].material}</p>
                              </div>
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">작업자 / 일자</p>
                                <p className="text-sm font-black text-slate-800">{searchResults[0].worker} ({searchResults[0].workDate})</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">목표 냉간치수</p>
                                <p className="text-lg font-mono font-black text-blue-700">{searchResults[0].coldDimension}</p>
                              </div>
                              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">목표 열간치수</p>
                                <p className="text-lg font-mono font-black text-orange-700">{searchResults[0].hotDimension}</p>
                              </div>
                              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">적용 여유치</p>
                                <p className="text-lg font-mono font-black text-slate-700">{searchResults[0].appliedMargin}</p>
                              </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                              <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <TableIcon className="w-4 h-4 text-slate-400" /> 상세 측정 이력 ({searchResults[0].measurements.length}회차)
                              </p>
                              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                  <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">회차</th>
                                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">측정 OD</th>
                                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">측정 ID</th>
                                      <th className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">측정 T</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {searchResults[0].measurements.map((m) => (
                                      <tr key={m.round} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 text-sm font-black text-slate-400 text-center">{m.round}차</td>
                                        <td className="px-6 py-3 text-sm font-mono font-black text-slate-700 text-center">{m.measuredOD}</td>
                                        <td className="px-6 py-3 text-sm font-mono font-black text-slate-700 text-center">{m.measuredID}</td>
                                        <td className="px-6 py-3 text-sm font-mono font-black text-slate-700 text-center">{m.measuredT}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">S/N</th>
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">규격</th>
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">작업자</th>
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">최종 측정 OD</th>
                                  <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">일자</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {searchResults.map((record) => (
                                  <tr key={record.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                    <td className="px-6 py-4 text-sm font-mono font-black text-slate-800">{record.sn}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{record.size}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{record.worker}</td>
                                    <td className="px-6 py-4 text-sm font-mono font-black text-blue-600 group-hover:scale-105 transition-transform origin-left">
                                      {record.measurements[record.measurements.length - 1]?.measuredOD || '-'} mm
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{record.workDate}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="entry"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden"
          >
            <div className="bg-slate-900 px-10 py-8 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-5">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-serif italic text-2xl tracking-tight">Cold Dimension Recording</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Ring Mill Forging System v3.0</p>
                </div>
              </div>
              <button onClick={() => setFormData(initialFormState)} className="text-[10px] font-black text-slate-400 hover:text-white transition-all flex items-center gap-2 bg-slate-800 px-5 py-2.5 rounded-xl border border-slate-700 uppercase tracking-widest">
                <RefreshCcw className="w-4 h-4" /> Reset Form
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-10 space-y-8 sm:space-y-12 max-w-full overflow-x-hidden">
              {/* Summary Dashboard - Refined Bento Style */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative overflow-hidden p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl group transition-all duration-500 hover:border-blue-500/50">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Maximize className="w-12 h-12 text-blue-400" />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">목표 규격 (Target Specs)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-black text-white tracking-tighter">
                      {formData.size.od || '0'} <span className="text-slate-600">×</span> {formData.size.id || '0'} <span className="text-slate-600">×</span> {formData.size.t || '0'}
                    </span>
                    <span className="text-slate-600 font-bold text-[9px] uppercase">mm</span>
                  </div>
                </div>

                <div className="relative overflow-hidden p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl group transition-all duration-500 hover:border-blue-500/50">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calculator className="w-12 h-12 text-blue-400" />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">측정 평균 (Measured Avg)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-black text-blue-400 tracking-tighter">
                      {averages.od} <span className="text-slate-800">·</span> {averages.id} <span className="text-slate-800">·</span> {averages.t}
                    </span>
                    <span className="text-slate-600 font-bold text-[9px] uppercase">mm</span>
                  </div>
                </div>

                <div className="relative overflow-hidden p-6 bg-blue-600 rounded-[2rem] border border-blue-500 shadow-2xl group transition-all duration-500 hover:bg-blue-700">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.3em] mb-4">평균 여유치 (Avg Margin)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-mono font-black text-white tracking-tighter">
                      {averages.marginOD} <span className="text-blue-400">·</span> {averages.marginID} <span className="text-blue-400">·</span> {averages.marginT}
                    </span>
                    <span className="text-blue-200 font-bold text-[9px] uppercase ml-1">mm</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Basic Info - Structured Grid */}
              <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-blue-50 p-3 rounded-2xl">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">기본 설정 (Primary Configuration)</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">프로젝트 및 자재 사양</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-blue-500" /> 제조 번호 (Mfg No.)
                      <FormFieldTooltip text="제조 공정 식별 번호 (예: 000000-00000-000)" />
                    </label>
                    <input 
                      type="text" 
                      name="manufacturingNo"
                      value={formData.manufacturingNo} 
                      onChange={handleChange} 
                      className={`w-full px-5 py-4 bg-slate-50 border ${errors.manufacturingNo ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100'} rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-sm font-bold shadow-inner`} 
                      placeholder="000000-00000-000" 
                    />
                    {errors.manufacturingNo && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.manufacturingNo}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-blue-500" /> 일련 번호 (S/N)
                      <FormFieldTooltip text="개별 제품의 고유 일련 번호 (3자리 숫자)" />
                    </label>
                    <input 
                      type="number" 
                      name="sn" 
                      value={formData.sn} 
                      onChange={handleChange} 
                      onBlur={handleSNBlur} 
                      className={`w-full px-5 py-4 bg-slate-50 border ${errors.sn ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-100'} rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-sm font-bold shadow-inner`} 
                      placeholder="001" 
                    />
                    {errors.sn && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.sn}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <TableIcon className="w-3.5 h-3.5 text-blue-500" /> 재질 (Material)
                      <FormFieldTooltip text="제품 제작에 사용된 원자재 종류" />
                    </label>
                    <input 
                      type="text" 
                      name="material" 
                      value={formData.material} 
                      onChange={handleChange} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner" 
                      placeholder="SUS304" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <RefreshCcw className="w-3.5 h-3.5 text-blue-500" /> 열처리 (Heat Treatment)
                      <FormFieldTooltip text="제품에 적용된 열처리 공정 방식" />
                    </label>
                    <div className="relative">
                      <select 
                        name="heatTreatmentType" 
                        value={formData.heatTreatmentType} 
                        onChange={handleChange} 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-bold shadow-inner appearance-none"
                      >
                        <option value="">유형 선택</option>
                        <option value="QT">QT</option>
                        <option value="N">N</option>
                        <option value="S/A">S/A</option>
                        <option value="기타">기타 (Other)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Plus className="w-4 h-4 rotate-45" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Target Dimensions & Margins */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                      <Maximize className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">목표 사양 (Target Specifications)</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">필수 치수 및 여유치 설정</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <DimensionInput 
                        label="목표 치수 (수주치수)" 
                        tooltip="고객 주문서상의 최종 완제품 규격"
                        data={formData.size} 
                        onChange={(f, v) => handleCategoryChange('size', f, v)} 
                        isTarget 
                        max={12000} 
                        errors={{
                          od: errors['size.od'],
                          id: errors['size.id'],
                          t: errors['size.t']
                        }}
                      />
                      {(formData.size.od || formData.size.id || formData.size.t) && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-6 py-4 bg-slate-900 rounded-2xl flex justify-between items-center shadow-2xl border border-slate-800">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">규격 형식 (Formatted Spec)</span>
                          <span className="text-lg font-mono font-black text-blue-400">
                            {formData.size.od || '0'} <span className="text-slate-700">×</span> {formData.size.id || '0'} <span className="text-slate-700">×</span> {formData.size.t || '0'} <span className="text-[10px] text-slate-600 ml-1">mm</span>
                          </span>
                        </motion.div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <DimensionInput 
                        label="표준 여유치 (Standard Margin)" 
                        tooltip="공정 표준으로 정해진 가공 여유치"
                        data={formData.margin} 
                        onChange={(f, v) => handleCategoryChange('margin', f, v)} 
                        errors={{
                          od: errors['margin.od'],
                          id: errors['margin.id'],
                          t: errors['margin.t']
                        }}
                      />
                      <DimensionInput 
                        label="실작업 여유치 (Applied Work Margin)" 
                        tooltip="실제 작업에 적용할 보정된 여유치"
                        data={formData.appliedMargin} 
                        onChange={(f, v) => handleCategoryChange('appliedMargin', f, v)} 
                        errors={{
                          od: errors['appliedMargin.od'],
                          id: errors['appliedMargin.id'],
                          t: errors['appliedMargin.t']
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-50 p-3 rounded-2xl">
                      <Calculator className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">계산된 목표치 (Computed Targets)</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">자동 계산 결과</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-500" /> 열팽창 계수 (Expansion Coefficient)
                          <FormFieldTooltip text="온도 변화에 따른 소재의 팽창 비율" />
                        </label>
                        <div className="flex gap-4">
                          <input 
                            type="number" 
                            name="thermalExpansionCoefficient" 
                            step="any" 
                            value={formData.thermalExpansionCoefficient} 
                            onChange={handleChange} 
                            className={`flex-1 px-5 py-4 bg-white border ${errors.thermalExpansionCoefficient ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200'} rounded-2xl font-mono text-sm font-bold outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm`} 
                          />
                          <button type="button" onClick={applyThermalExpansion} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                            적용 (Apply)
                          </button>
                        </div>
                        {errors.thermalExpansionCoefficient && (
                          <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.thermalExpansionCoefficient}
                          </motion.p>
                        )}
                      </div>
                      <div className="space-y-4 pt-6 border-t border-slate-200">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                          적용된 계수 (Active Coefficient)
                        </label>
                        <div className="w-full px-6 py-4 bg-blue-600 rounded-2xl font-mono text-lg font-black text-white flex justify-between items-center shadow-2xl shadow-blue-500/30">
                          <span>{formData.appliedThermalExpansionCoefficient}</span>
                          {formData.thermalExpansionCoefficient !== formData.appliedThermalExpansionCoefficient && (
                            <span className="text-[9px] bg-red-500 text-white px-3 py-1.5 rounded-full animate-pulse tracking-widest uppercase">대기중 (Pending)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <DimensionInput 
                        label="목표 냉간 치수 (Target Cold)" 
                        tooltip="열팽창이 고려되지 않은 상온 상태의 목표 규격"
                        data={formData.coldDimension} 
                        onChange={(f, v) => handleCategoryChange('coldDimension', f, v)} 
                        highlight 
                      />
                      <DimensionInput 
                        label="목표 열간 치수 (Target Hot)" 
                        tooltip="열팽창 계수가 적용된 가공 시점의 목표 규격"
                        data={formData.hotDimension} 
                        onChange={(f, v) => handleCategoryChange('hotDimension', f, v)} 
                        highlight 
                        isHot 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Measurement Log - Refined Table */}
              <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                      <TableIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">측정 기록 (Measurement Log)</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">실시간 데이터 수집</p>
                    </div>
                  </div>
                  <button type="button" onClick={addMeasurementRow} disabled={formData.measurements.length >= 8} className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 shadow-2xl shadow-blue-500/30 active:scale-95">
                    <Plus className="w-4 h-4" /> 회차 추가 (Add Round)
                  </button>
                </div>

                <div className="overflow-x-auto rounded-[2rem] border border-slate-200 shadow-2xl">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-900 border-b border-slate-800">
                      <tr>
                        <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center w-32">회차 (Round)</th>
                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">측정 OD (mm)</th>
                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">측정 ID (mm)</th>
                        <th className="py-6 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">측정 T (mm)</th>
                        <th className="py-6 px-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center w-24">작업 (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {formData.measurements.map((m) => (
                        <MeasurementRow 
                          key={m.round} 
                          record={m} 
                          onUpdate={handleMeasurementUpdate} 
                          onRemove={removeMeasurementRow} 
                          canRemove={formData.measurements.length > 2} 
                          targetSize={formData.size}
                          errors={{
                            measuredOD: errors[`measurements.${m.round}.measuredOD`],
                            measuredID: errors[`measurements.${m.round}.measuredID`],
                            measuredT: errors[`measurements.${m.round}.measuredT`]
                          }}
                        />
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white border-t border-slate-800">
                      <tr>
                        <td className="py-8 px-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">종합 평균 (Aggregate Avg)</td>
                        <td className="py-8 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-black text-blue-400 text-2xl">{averages.od}</span>
                            <span className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">평균 OD</span>
                            <div className={`text-[10px] font-black mt-2 ${parseFloat(averages.marginOD) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                              평균 여유치: {parseFloat(averages.marginOD) >= 0 ? `+${averages.marginOD}` : averages.marginOD}
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-black text-blue-400 text-2xl">{averages.id}</span>
                            <span className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">평균 ID</span>
                            <div className={`text-[10px] font-black mt-2 ${parseFloat(averages.marginID) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                              평균 여유치: {parseFloat(averages.marginID) >= 0 ? `+${averages.marginID}` : averages.marginID}
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-black text-blue-400 text-2xl">{averages.t}</span>
                            <span className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">평균 T</span>
                            <div className={`text-[10px] font-black mt-2 ${parseFloat(averages.marginT) >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                              평균 여유치: {parseFloat(averages.marginT) >= 0 ? `+${averages.marginT}` : averages.marginT}
                            </div>
                          </div>
                        </td>
                        <td className="bg-slate-800/50"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Section 4: Worker & Submit - Refined Footer */}
              <div className="bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full lg:w-auto">
                  <div className="space-y-3 min-w-[280px]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" /> 작업자 (Operator)
                      <FormFieldTooltip text="해당 공정을 수행하는 작업자 성명" />
                    </label>
                    <input 
                      type="text" 
                      name="worker" 
                      value={formData.worker} 
                      onChange={handleChange} 
                      className={`w-full px-6 py-4 bg-slate-800 border ${errors.worker ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-700'} rounded-2xl focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-white shadow-inner placeholder:text-slate-600`} 
                      placeholder="작업자 성명을 입력하세요" 
                    />
                    {errors.worker && (
                      <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.worker}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" /> 작업 일정 (Schedule)
                      <FormFieldTooltip text="작업 일자 및 근무 교대 시간대" />
                    </label>
                    <div className="flex gap-3">
                      <input 
                        type="date" 
                        name="workDate" 
                        value={formData.workDate} 
                        onChange={handleChange} 
                        className="flex-1 px-6 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-white shadow-inner" 
                      />
                      <select 
                        name="shift" 
                        value={formData.shift} 
                        onChange={handleChange} 
                        className="w-32 px-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-white shadow-inner appearance-none"
                      >
                        <option value="Day">주간 (Day)</option>
                        <option value="Night">야간 (Night)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaved} 
                  className={`w-full lg:w-80 py-8 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-[0.98] ${
                    isSaved 
                      ? 'bg-green-500 text-white shadow-green-500/40 cursor-default' 
                      : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/40 hover:-translate-y-1'
                  }`}
                >
                  {isSaved ? (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                      <CheckCircle2 className="w-7 h-7" /> 기록 저장됨 (Saved)
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Save className="w-7 h-7" /> 기록 저장 (Commit)
                    </div>
                  )}
                </button>
              </div>
            </form>

            <AnimatePresence>
              {Object.keys(errors).length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="bg-red-50 px-10 py-6 border-t border-red-100 flex items-center gap-5 text-red-600 text-xs font-black uppercase tracking-widest"
                >
                  <AlertCircle className="w-6 h-6 shrink-0" /> 
                  <span>Validation Error: Please check required fields ({Object.values(errors).join(', ')})</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
