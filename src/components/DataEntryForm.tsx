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
  canRemove 
}: { 
  record: MeasurementRecord; 
  onUpdate: (id: number, field: keyof MeasurementRecord, value: string) => void;
  onRemove: (round: number) => void;
  canRemove: boolean;
}) => {
  return (
    <tr className="group hover:bg-slate-50 transition-all duration-300">
      <td className="py-6 px-8 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-black text-xs border border-slate-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300">
          {record.round}
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="relative group/input">
          <input 
            type="number" 
            step="any"
            value={record.measuredOD} 
            onChange={(e) => onUpdate(record.round, 'measuredOD', e.target.value)} 
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-mono text-sm font-black text-slate-700 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            placeholder="0.00"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-focus-within/input:text-blue-400">OD</div>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="relative group/input">
          <input 
            type="number" 
            step="any"
            value={record.measuredID} 
            onChange={(e) => onUpdate(record.round, 'measuredID', e.target.value)} 
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-mono text-sm font-black text-slate-700 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            placeholder="0.00"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-focus-within/input:text-blue-400">ID</div>
        </div>
      </td>
      <td className="py-6 px-4">
        <div className="relative group/input">
          <input 
            type="number" 
            step="any"
            value={record.measuredT} 
            onChange={(e) => onUpdate(record.round, 'measuredT', e.target.value)} 
            className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-mono text-sm font-black text-slate-700 outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            placeholder="0.00"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase tracking-widest pointer-events-none group-focus-within/input:text-blue-400">T</div>
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
 * DimensionInput Component
 */
const DimensionInput = React.memo(({ 
  label, 
  data, 
  onChange, 
  highlight = false,
  isHot = false,
  isTarget = false,
  max
}: { 
  label: string; 
  data: DimensionSet; 
  onChange: (field: keyof DimensionSet, value: string) => void;
  highlight?: boolean;
  isHot?: boolean;
  isTarget?: boolean;
  max?: number;
}) => (
  <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${highlight ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${isHot ? 'bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]' : highlight ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-300'}`} />
        <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-blue-400' : 'text-slate-400'}`}>
          {label}
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
          className={`w-full px-2 py-4 rounded-xl text-center font-mono text-sm font-black outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10'}`}
          placeholder="0.00"
        />
        <span className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-[7px] font-black px-1.5 py-0.5 rounded-full ${highlight ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>OD</span>
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
          className={`w-full px-2 py-4 rounded-xl text-center font-mono text-sm font-black outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10'}`}
          placeholder="0.00"
        />
        <span className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-[7px] font-black px-1.5 py-0.5 rounded-full ${highlight ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>ID</span>
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
          className={`w-full px-2 py-4 rounded-xl text-center font-mono text-sm font-black outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10' : 'bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10'}`}
          placeholder="0.00"
        />
        <span className={`absolute left-1/2 -translate-x-1/2 -bottom-2.5 text-[7px] font-black px-1.5 py-0.5 rounded-full ${highlight ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>T</span>
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

  const timelineData = records.slice(-10).map(r => ({
    date: r.workDate,
    od: parseFloat(r.measurements[r.measurements.length - 1]?.measuredOD || '0'),
    id: parseFloat(r.measurements[r.measurements.length - 1]?.measuredID || '0'),
    t: parseFloat(r.measurements[r.measurements.length - 1]?.measuredT || '0'),
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-500" /> 재질별 분포
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={materialData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {materialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" /> 최근 측정 추세 (최종 OD)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="od" stroke="#3b82f6" strokeWidth={3} name="OD" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="id" stroke="#10b981" strokeWidth={3} name="ID" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="t" stroke="#f59e0b" strokeWidth={3} name="T" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-orange-500" /> 작업자별 생산량
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={records.reduce((acc: any[], curr) => {
              const worker = acc.find(a => a.name === curr.worker);
              if (worker) worker.count++;
              else acc.push({ name: curr.worker, count: 1 });
              return acc;
            }, [])}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="생산량" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
    if (!searchMfgNo) {
      setSearchResults([]);
      return;
    }
    const filtered = allRecords.filter(record => {
      const mfgMatch = record.manufacturingNo.includes(searchMfgNo);
      if (searchSN) {
        const paddedSN = searchSN.padStart(3, '0');
        return mfgMatch && record.sn === paddedSN;
      }
      return mfgMatch;
    });
    setSearchResults(filtered);
  }, [searchMfgNo, searchSN, allRecords]);

  const handleCategoryChange = useCallback((category: keyof FormState, field: keyof DimensionSet, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...(prev[category] as DimensionSet), [field]: value }
    }));
  }, []);

  const handleMeasurementUpdate = useCallback((round: number, field: keyof MeasurementRecord, value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.map(m => m.round === round ? { ...m, [field]: value } : m)
    }));
  }, []);

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
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.manufacturingNo) newErrors.manufacturingNo = '제조번호 확인';
    if (!formData.sn) newErrors.sn = 'S/N 확인';
    if (!formData.worker) newErrors.worker = '작업자 확인';
    if (!formData.size.od || !formData.size.id || !formData.size.t) newErrors.size = '수주치수 확인';
    
    const sOD = parseFloat(formData.size.od);
    const sID = parseFloat(formData.size.id);
    const sT = parseFloat(formData.size.t);
    if (sOD > 12000 || sID > 12000 || sT > 12000) newErrors.size = '수주치수 최대 12000mm';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

    const overallAvg = (avgOD + avgID + avgT) / 3;
    const sizeAvg = (sOD + sID + sT) / 3;
    const overallMargin = overallAvg - sizeAvg;

    return {
      od: avgOD.toFixed(2),
      id: avgID.toFixed(2),
      t: avgT.toFixed(2),
      rod: (avgOD - sOD).toFixed(2),
      rid: (avgID - sID).toFixed(2),
      rt: (avgT - sT).toFixed(2),
      overallAvg: overallAvg.toFixed(2),
      overallMargin: overallMargin.toFixed(2)
    };
  };

  const averages = getAverages();

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Tab Navigation - Refined Technical Style */}
      <div className="flex items-center justify-center pt-4">
        <div className="flex p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-inner">
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
            <div className="bg-slate-900 px-10 py-8 border-b border-slate-800 flex items-center justify-between">
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
        ) : activeTab === 'history' ? (
          <motion.section
            key="history"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white border border-slate-200 shadow-2xl rounded-[2rem] overflow-hidden"
          >
            <div className="bg-slate-900 px-10 py-8 border-b border-slate-800 flex items-center justify-between">
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
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[1.5rem] border border-slate-200 mb-10 shadow-inner">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Manufacturing Number</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" value={searchMfgNo} onChange={(e) => setSearchMfgNo(e.target.value)} placeholder="000000-00000-000" className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-mono text-sm font-bold shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Serial Number</label>
                  <div className="flex gap-3">
                    <input type="text" value={searchSN} onChange={(e) => setSearchSN(e.target.value)} placeholder="001" className="flex-1 px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-mono text-sm font-bold text-center shadow-sm" />
                    <button onClick={handleSearch} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
                      Find
                    </button>
                  </div>
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
                              <div className="overflow-hidden border border-slate-200 rounded-xl">
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

            <form onSubmit={handleSubmit} className="p-10 space-y-12">
              {/* Summary Dashboard - Refined Bento Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div className="relative overflow-hidden p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl group transition-all duration-500 hover:border-blue-500/50">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-12 h-12 text-blue-400" />
                  </div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">전체 평균 (Overall Avg)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-black text-blue-400 tracking-tighter">
                      {averages.overallAvg}
                    </span>
                    <span className="text-slate-600 font-bold text-[9px] uppercase ml-1">mm</span>
                  </div>
                </div>

                <div className="relative overflow-hidden p-6 bg-blue-600 rounded-[2rem] border border-blue-500 shadow-2xl group transition-all duration-500 hover:bg-blue-700">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-[9px] font-black text-blue-200 uppercase tracking-[0.3em] mb-4">평균 여유치 (Avg Margin)</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-black text-white tracking-tighter">
                      {averages.overallMargin}
                    </span>
                    <span className="text-blue-200 font-bold text-[9px] uppercase ml-1">mm</span>
                  </div>
                </div>
              </div>

              {/* Section 1: Basic Info - Structured Grid */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-blue-500" /> 제조 번호 (Mfg No.)
                    </label>
                    <input 
                      type="text" 
                      value={formData.manufacturingNo} 
                      onChange={handleMfgNoChange} 
                      className={`w-full px-5 py-4 bg-slate-50 border ${errors.manufacturingNo ? 'border-red-500' : 'border-slate-100'} rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-sm font-bold shadow-inner`} 
                      placeholder="000000-00000-000" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-blue-500" /> 일련 번호 (S/N)
                    </label>
                    <input 
                      type="number" 
                      name="sn" 
                      value={formData.sn} 
                      onChange={handleChange} 
                      onBlur={handleSNBlur} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-sm font-bold shadow-inner" 
                      placeholder="001" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <TableIcon className="w-3.5 h-3.5 text-blue-500" /> 재질 (Material)
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
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-10">
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
                      <DimensionInput label="목표 치수 (수주치수)" data={formData.size} onChange={(f, v) => handleCategoryChange('size', f, v)} isTarget max={12000} />
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
                      <DimensionInput label="표준 여유치 (Standard Margin)" data={formData.margin} onChange={(f, v) => handleCategoryChange('margin', f, v)} />
                      <DimensionInput label="실작업 여유치 (Applied Work Margin)" data={formData.appliedMargin} onChange={(f, v) => handleCategoryChange('appliedMargin', f, v)} />
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
                        </label>
                        <div className="flex gap-4">
                          <input type="number" name="thermalExpansionCoefficient" step="any" value={formData.thermalExpansionCoefficient} onChange={handleChange} className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl font-mono text-sm font-bold outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all shadow-sm" />
                          <button type="button" onClick={applyThermalExpansion} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                            적용 (Apply)
                          </button>
                        </div>
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
                      <DimensionInput label="목표 냉간 치수 (Target Cold)" data={formData.coldDimension} onChange={(f, v) => handleCategoryChange('coldDimension', f, v)} highlight />
                      <DimensionInput label="목표 열간 치수 (Target Hot)" data={formData.hotDimension} onChange={(f, v) => handleCategoryChange('hotDimension', f, v)} highlight isHot />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Measurement Log - Refined Table */}
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-10">
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

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-2xl">
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
                        <MeasurementRow key={m.round} record={m} onUpdate={handleMeasurementUpdate} onRemove={removeMeasurementRow} canRemove={formData.measurements.length > 2} />
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-900 text-white border-t border-slate-800">
                      <tr>
                        <td className="py-8 px-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">종합 평균 (Aggregate Avg)</td>
                        <td className="py-8 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-black text-blue-400 text-2xl">{averages.od}</span>
                            <span className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">평균 OD</span>
                          </div>
                        </td>
                        <td className="py-8 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-black text-blue-400 text-2xl">{averages.id}</span>
                            <span className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">평균 ID</span>
                          </div>
                        </td>
                        <td className="py-8 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-mono font-black text-blue-400 text-2xl">{averages.t}</span>
                            <span className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">평균 T</span>
                          </div>
                        </td>
                        <td className="bg-slate-800/50"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Section 4: Worker & Submit - Refined Footer */}
              <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full lg:w-auto">
                  <div className="space-y-3 min-w-[280px]">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500" /> 작업자 정보 (Operator Identity)
                    </label>
                    <input 
                      type="text" 
                      name="worker" 
                      value={formData.worker} 
                      onChange={handleChange} 
                      className={`w-full px-6 py-4 bg-slate-800 border ${errors.worker ? 'border-red-500' : 'border-slate-700'} rounded-2xl focus:ring-8 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold text-white shadow-inner placeholder:text-slate-600`} 
                      placeholder="작업자 성명을 입력하세요" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" /> 일정 및 교대 (Schedule & Shift)
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
