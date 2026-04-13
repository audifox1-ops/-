/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Thermometer
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

interface FormState extends Omit<RingMillDataInput, 'size' | 'margin' | 'appliedMargin' | 'hotDimension' | 'measurements'> {
  size: DimensionSet;
  margin: DimensionSet;
  appliedMargin: DimensionSet;
  hotDimension: DimensionSet;
  measurements: MeasurementRecord[];
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
});

const initialFormState: FormState = {
  manufacturingNo: '',
  sn: '',
  size: { ...initialDimension },
  margin: { ...initialDimension },
  appliedMargin: { ...initialDimension },
  hotDimension: { ...initialDimension },
  material: '',
  heatTreatmentType: '',
  measurements: [createInitialMeasurement(1), createInitialMeasurement(2)],
  workDate: new Date().toISOString().split('T')[0],
  worker: '',
  thermalExpansionCoefficient: 0.000012,
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
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
      <td className="py-3 px-4 text-center font-bold text-slate-500 text-sm bg-slate-50/50">
        {record.round}차
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          step="any"
          value={record.measuredOD}
          onChange={(e) => onUpdate(record.round, 'measuredOD', e.target.value)}
          placeholder="OD"
          className="w-full px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          step="any"
          value={record.measuredID}
          onChange={(e) => onUpdate(record.round, 'measuredID', e.target.value)}
          placeholder="ID"
          className="w-full px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
        />
      </td>
      <td className="py-3 px-2">
        <input
          type="number"
          step="any"
          value={record.measuredT}
          onChange={(e) => onUpdate(record.round, 'measuredT', e.target.value)}
          placeholder="T"
          className="w-full px-2 py-1.5 border border-slate-200 rounded text-center text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono font-bold">
          <span className={parseFloat(record.remainingOD) > 0 ? 'text-blue-600' : 'text-slate-400'}>{record.remainingOD}</span>
          <span className="text-slate-300">/</span>
          <span className={parseFloat(record.remainingID) > 0 ? 'text-blue-600' : 'text-slate-400'}>{record.remainingID}</span>
          <span className="text-slate-300">/</span>
          <span className={parseFloat(record.remainingT) > 0 ? 'text-blue-600' : 'text-slate-400'}>{record.remainingT}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(record.round)}
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
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
  isHot = false
}: { 
  label: string; 
  data: DimensionSet; 
  onChange: (field: keyof DimensionSet, value: string) => void;
  highlight?: boolean;
  isHot?: boolean;
}) => (
  <div className={`p-4 rounded-xl border transition-all ${highlight ? 'bg-slate-900 border-slate-800 shadow-inner' : 'bg-slate-50 border-slate-200'}`}>
    <label className={`text-[10px] font-black uppercase tracking-widest mb-3 block ${highlight ? 'text-blue-400' : 'text-slate-500'}`}>
      {label}
    </label>
    <div className="flex items-center gap-3">
      <div className="flex-1 space-y-1">
        <input 
          type="number" 
          step="any"
          value={data.od} 
          onChange={(e) => onChange('od', e.target.value)} 
          className={`w-full px-2 py-2 rounded-lg text-center font-mono text-sm outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
          placeholder="OD"
        />
      </div>
      <span className="text-slate-400 text-xs font-bold">x</span>
      <div className="flex-1 space-y-1">
        <input 
          type="number" 
          step="any"
          value={data.id} 
          onChange={(e) => onChange('id', e.target.value)} 
          className={`w-full px-2 py-2 rounded-lg text-center font-mono text-sm outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
          placeholder="ID"
        />
      </div>
      <span className="text-slate-400 text-xs font-bold">x</span>
      <div className="flex-1 space-y-1">
        <input 
          type="number" 
          step="any"
          value={data.t} 
          onChange={(e) => onChange('t', e.target.value)} 
          className={`w-full px-2 py-2 rounded-lg text-center font-mono text-sm outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`}
          placeholder="T"
        />
      </div>
      <span className={`text-[10px] font-bold ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>mm</span>
    </div>
  </div>
));

DimensionInput.displayName = 'DimensionInput';

export default function DataEntryForm({ onSave, allRecords }: DataEntryFormProps) {
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

    const coeff = formData.thermalExpansionCoefficient || 0;

    setFormData(prev => {
      // 1. Target Hot Dimension Calculation
      // Target Cold = Size + Margin
      const targetColdOD = sOD + mOD;
      const targetColdID = sID + mID;
      const targetColdT = sT + mT;

      // Target Hot = Target Cold * (1 + Coeff)
      const targetHotOD = targetColdOD * (1 + coeff);
      const targetHotID = targetColdID * (1 + coeff);
      const targetHotT = targetColdT * (1 + coeff);

      const newHotDimension = {
        od: targetHotOD > 0 ? targetHotOD.toFixed(2) : prev.hotDimension.od,
        id: targetHotID > 0 ? targetHotID.toFixed(2) : prev.hotDimension.id,
        t: targetHotT > 0 ? targetHotT.toFixed(2) : prev.hotDimension.t,
      };

      // 2. Remaining Margin Calculation for Measurements
      const updatedMeasurements = prev.measurements.map(m => {
        const measuredOD = parseFloat(m.measuredOD) || 0;
        const measuredID = parseFloat(m.measuredID) || 0;
        const measuredT = parseFloat(m.measuredT) || 0;

        return {
          ...m,
          remainingOD: measuredOD > 0 ? (measuredOD - sOD).toFixed(2) : '0.00',
          remainingID: measuredID > 0 ? (measuredID - sID).toFixed(2) : '0.00',
          remainingT: measuredT > 0 ? (measuredT - sT).toFixed(2) : '0.00',
        };
      });

      // Prevent unnecessary updates
      const hasHotChanged = JSON.stringify(newHotDimension) !== JSON.stringify(prev.hotDimension);
      const hasMeasurementsChanged = JSON.stringify(updatedMeasurements) !== JSON.stringify(prev.measurements);

      if (!hasHotChanged && !hasMeasurementsChanged) return prev;

      return {
        ...prev,
        hotDimension: newHotDimension,
        measurements: updatedMeasurements
      };
    });
  }, [formData.size, formData.margin, formData.thermalExpansionCoefficient, formData.measurements]);

  const handleMfgNoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    let masked = '';
    if (value.length <= 6) masked = value;
    else if (value.length <= 11) masked = `${value.slice(0, 6)}-${value.slice(6)}`;
    else masked = `${value.slice(0, 6)}-${value.slice(6, 11)}-${value.slice(11, 14)}`;
    setFormData(prev => ({ ...prev, manufacturingNo: masked }));
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
    if (!formData.manufacturingNo || formData.manufacturingNo.length < 16) newErrors.manufacturingNo = '제조번호 확인';
    if (!formData.sn) newErrors.sn = 'S/N 확인';
    if (!formData.worker) newErrors.worker = '작업자 확인';
    if (!formData.size.od || !formData.size.id || !formData.size.t) newErrors.size = '수주치수 확인';
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
        hotDimension: formatDim(formData.hotDimension),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Search Section */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">기록 조회</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">제조번호</label>
              <input type="text" value={searchMfgNo} onChange={(e) => setSearchMfgNo(e.target.value)} placeholder="000000-00000-000" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono" />
            </div>
            <div className="w-24 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">S/N</label>
              <input type="text" value={searchSN} onChange={(e) => setSearchSN(e.target.value)} placeholder="001" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono" />
            </div>
            <button onClick={handleSearch} className="bg-slate-800 text-white px-6 py-2 rounded font-bold hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm">
              <Search className="w-4 h-4" /> 조회
            </button>
          </div>
          <AnimatePresence>
            {searchResults !== null && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 border-t border-slate-100 pt-6">
                {searchResults.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-center text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> 일치하는 기록이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" /> 조회 결과 ({searchResults.length}건)
                      </h4>
                      <button onClick={() => setSearchResults(null)} className="text-xs text-slate-400 hover:text-slate-600">닫기</button>
                    </div>
                    <div className="overflow-x-auto border border-slate-200 rounded-lg">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">S/N</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">규격</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">작업자</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">최종 측정</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {searchResults.map((record) => (
                            <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                              <td className="px-4 py-2 text-sm font-mono font-bold text-slate-700">{record.sn}</td>
                              <td className="px-4 py-2 text-xs text-slate-600">{record.size}</td>
                              <td className="px-4 py-2 text-xs text-slate-600">{record.worker}</td>
                              <td className="px-4 py-2 text-sm font-mono font-bold text-blue-600">{record.measurements[record.measurements.length - 1]?.measuredOD || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Main Entry Form */}
      <div className="w-full bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-sans font-black text-xl tracking-tight">냉간치수 측정 기록 시스템</h2>
              <p className="text-slate-400 text-xs font-medium mt-0.5">Ring Mill Forging Measurement System v3.0</p>
            </div>
          </div>
          <button onClick={() => setFormData(initialFormState)} className="text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-bold bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <RefreshCcw className="w-4 h-4" /> 초기화
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-4 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full" /> 기본 정보
              </h3>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Hash className="w-3.5 h-3.5" /> 제조번호</label>
              <input type="text" value={formData.manufacturingNo} onChange={handleMfgNoChange} className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.manufacturingNo ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm font-bold`} placeholder="000000-00000-000" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">S/N</label>
              <input type="number" name="sn" value={formData.sn} onChange={handleChange} onBlur={handleSNBlur} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm font-bold" placeholder="001" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">재질</label>
              <input type="text" name="material" value={formData.material} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" placeholder="SUS304" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">열처리 종류</label>
              <select name="heatTreatmentType" value={formData.heatTreatmentType} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold">
                <option value="">선택</option>
                <option value="QT">QT</option>
                <option value="N">N</option>
                <option value="S/A">S/A</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          {/* Section 2: Target Dimensions & Margins */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                <Maximize className="w-4 h-4" /> 수주치수 및 여유치
              </h3>
              <div className="space-y-4">
                <DimensionInput label="수주치수 (Target SIZE)" data={formData.size} onChange={(f, v) => handleCategoryChange('size', f, v)} />
                <DimensionInput label="여유치 (Margin)" data={formData.margin} onChange={(f, v) => handleCategoryChange('margin', f, v)} />
                <DimensionInput label="실작업 여유치 (Applied Margin)" data={formData.appliedMargin} onChange={(f, v) => handleCategoryChange('appliedMargin', f, v)} />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2">
                <Calculator className="w-4 h-4" /> 자동 계산 목표치
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Calculator className="w-3.5 h-3.5" /> 열팽창계수
                  </label>
                  <input type="number" name="thermalExpansionCoefficient" step="any" value={formData.thermalExpansionCoefficient} onChange={handleChange} className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <DimensionInput label="목표 열간치수 (Target Hot Dimension)" data={formData.hotDimension} onChange={(f, v) => handleCategoryChange('hotDimension', f, v)} highlight isHot />
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold">계산 가이드</span>
                  </div>
                  <p className="text-[10px] text-blue-600 leading-relaxed">
                    목표 열간치수는 [(수주치수 + 여유치) * (1 + 열팽창계수)] 로 자동 계산됩니다. 현장 상황에 따라 직접 수정이 가능합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Measurement Log */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                <TableIcon className="w-4 h-4" /> 냉간치수 측정 기록부
              </h3>
              <button type="button" onClick={addMeasurementRow} disabled={formData.measurements.length >= 8} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-all disabled:opacity-50">
                <Plus className="w-4 h-4" /> 측정 기록 추가
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">회차</th>
                    <th className="py-4 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">측정 OD (mm)</th>
                    <th className="py-4 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">측정 ID (mm)</th>
                    <th className="py-4 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">측정 T (mm)</th>
                    <th className="py-4 px-4 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center bg-blue-50/30">남은 여유치 (OD/ID/T)</th>
                    <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.measurements.map((m) => (
                    <MeasurementRow key={m.round} record={m} onUpdate={handleMeasurementUpdate} onRemove={removeMeasurementRow} canRemove={formData.measurements.length > 2} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Worker & Submit */}
          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-end justify-between gap-8">
            <div className="flex flex-wrap gap-6 w-full md:w-auto">
              <div className="space-y-1.5 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><User className="w-3.5 h-3.5" /> 작업자</label>
                <input type="text" name="worker" value={formData.worker} onChange={handleChange} className={`w-full px-4 py-3 bg-slate-50 border ${errors.worker ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold`} placeholder="성명 입력" />
              </div>
              <div className="space-y-1.5 min-w-[200px]">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> 작업일자</label>
                <input type="date" name="workDate" value={formData.workDate} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold" />
              </div>
            </div>
            <button type="submit" disabled={isSaved} className={`w-full md:w-64 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl ${isSaved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-600/30'}`}>
              {isSaved ? <><CheckCircle2 className="w-7 h-7" /> 저장 완료</> : <><Save className="w-7 h-7" /> 최종 데이터 저장</>}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-50 px-8 py-5 border-t border-red-100 flex items-center gap-4 text-red-600 text-sm font-black">
              <AlertCircle className="w-6 h-6" /> 
              <span>필수 입력 항목을 확인해 주세요. ({Object.values(errors).join(', ')})</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
