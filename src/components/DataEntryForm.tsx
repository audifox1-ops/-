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
  Thermometer, 
  Layers,
  Settings,
  Search,
  Info,
  Calculator
} from 'lucide-react';
import { RingMillData, RingMillDataInput } from '../types/RingMillData';

interface DataEntryFormProps {
  onSave: (data: RingMillDataInput) => void;
  allRecords: RingMillData[];
}

// Local state for split inputs
interface DimensionSet {
  od: string;
  id: string;
  t: string;
}

interface FormState extends Omit<RingMillDataInput, 'size' | 'margin' | 'appliedMargin' | 'hotDimension' | 'coldDimension' | 'heatTreatmentType'> {
  size: DimensionSet;
  margin: DimensionSet;
  appliedMargin: DimensionSet;
  hotDimension: DimensionSet;
  coldDimension: DimensionSet;
  heatTreatmentType: string;
}

const initialDimension: DimensionSet = { od: '', id: '', t: '' };

const initialFormState: FormState = {
  manufacturingNo: '',
  sn: '',
  size: { ...initialDimension },
  margin: { ...initialDimension },
  appliedMargin: { ...initialDimension },
  hotDimension: { ...initialDimension },
  coldDimension: { ...initialDimension },
  material: '',
  heatTreatmentType: '',
  resultDimension: 0,
  workDate: new Date().toISOString().split('T')[0],
  worker: '',
  thermalExpansionCoefficient: 0.000012,
};

/**
 * DimensionInputGroup Component (Defined outside to prevent Focus Loss)
 */
interface DimensionInputGroupProps {
  label: string;
  category: 'size' | 'margin' | 'appliedMargin' | 'hotDimension' | 'coldDimension';
  data: DimensionSet;
  highlight?: boolean;
  onChange: (category: 'size' | 'margin' | 'appliedMargin' | 'hotDimension' | 'coldDimension', field: keyof DimensionSet, value: string) => void;
}

const DimensionInputGroup = React.memo(({ 
  label, 
  category, 
  data, 
  highlight = false,
  onChange
}: DimensionInputGroupProps) => (
  <div className={`space-y-2 p-3 rounded-lg transition-all ${highlight ? 'bg-slate-900 text-white shadow-inner' : 'bg-slate-50'}`}>
    <label className={`text-sm font-bold flex items-center gap-2 ${highlight ? 'text-blue-400' : 'text-slate-700'}`}>
      {highlight ? <Calculator className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input 
        type="number" 
        step="any"
        value={data.od || ''} 
        onChange={(e) => onChange(category, 'od', e.target.value)} 
        placeholder="OD" 
        className={`w-full px-2 py-1.5 rounded text-center text-sm outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} 
      />
      <span className="text-slate-400 text-xs font-bold">x</span>
      <input 
        type="number" 
        step="any"
        value={data.id || ''} 
        onChange={(e) => onChange(category, 'id', e.target.value)} 
        placeholder="ID" 
        className={`w-full px-2 py-1.5 rounded text-center text-sm outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} 
      />
      <span className="text-slate-400 text-xs font-bold">x</span>
      <input 
        type="number" 
        step="any"
        value={data.t || ''} 
        onChange={(e) => onChange(category, 't', e.target.value)} 
        placeholder="T" 
        className={`w-full px-2 py-1.5 rounded text-center text-sm outline-none border transition-all ${highlight ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} 
      />
      <span className={`text-[10px] font-bold ml-1 ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>mm</span>
    </div>
  </div>
));

DimensionInputGroup.displayName = 'DimensionInputGroup';

export default function DataEntryForm({ onSave, allRecords }: DataEntryFormProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  // Search state
  const [searchMfgNo, setSearchMfgNo] = useState('');
  const [searchSN, setSearchSN] = useState('');
  const [searchResults, setSearchResults] = useState<RingMillData[] | null>(null);

  // Auto-calculation logic
  useEffect(() => {
    const sOD = parseFloat(formData.size.od) || 0;
    const sID = parseFloat(formData.size.id) || 0;
    const sT = parseFloat(formData.size.t) || 0;

    const mOD = parseFloat(formData.margin.od) || 0;
    const mID = parseFloat(formData.margin.id) || 0;
    const mT = parseFloat(formData.margin.t) || 0;

    const coeff = formData.thermalExpansionCoefficient || 0;

    // 1. Cold = Size + Margin
    const cOD = sOD + mOD;
    const cID = sID + mID;
    const cT = sT + mT;

    // 2. Hot = Cold * (1 + Coeff)
    const hOD = cOD * (1 + coeff);
    const hID = cID * (1 + coeff);
    const hT = cT * (1 + coeff);

    // Only update if values actually changed to prevent unnecessary re-renders
    setFormData(prev => {
      const newCold = {
        od: cOD > 0 ? cOD.toFixed(2) : prev.coldDimension.od,
        id: cID > 0 ? cID.toFixed(2) : prev.coldDimension.id,
        t: cT > 0 ? cT.toFixed(2) : prev.coldDimension.t,
      };
      const newHot = {
        od: hOD > 0 ? hOD.toFixed(2) : prev.hotDimension.od,
        id: hID > 0 ? hID.toFixed(2) : prev.hotDimension.id,
        t: hT > 0 ? hT.toFixed(2) : prev.hotDimension.t,
      };

      if (
        JSON.stringify(newCold) === JSON.stringify(prev.coldDimension) &&
        JSON.stringify(newHot) === JSON.stringify(prev.hotDimension)
      ) {
        return prev;
      }

      return {
        ...prev,
        coldDimension: newCold,
        hotDimension: newHot
      };
    });
  }, [formData.size, formData.margin, formData.thermalExpansionCoefficient]);

  // Manufacturing No Masking: 000000-00000-000
  const handleMfgNoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    
    let masked = '';
    if (value.length <= 6) {
      masked = value;
    } else if (value.length <= 11) {
      masked = `${value.slice(0, 6)}-${value.slice(6)}`;
    } else {
      masked = `${value.slice(0, 6)}-${value.slice(6, 11)}-${value.slice(11, 14)}`;
    }
    
    setFormData(prev => ({ ...prev, manufacturingNo: masked }));
  }, []);

  // S/N Padding: 001-999
  const handleSNBlur = useCallback(() => {
    setFormData(prev => {
      if (prev.sn) {
        const num = parseInt(prev.sn, 10);
        if (!isNaN(num)) {
          const padded = num.toString().padStart(3, '0');
          if (padded !== prev.sn) {
            return { ...prev, sn: padded };
          }
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

  const validate = () => {
    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.manufacturingNo || formData.manufacturingNo.length < 16) {
      newErrors.manufacturingNo = '제조번호 형식이 올바르지 않습니다.';
    }
    if (!formData.sn) newErrors.sn = 'S/N을 입력하세요.';
    if (!formData.worker) newErrors.worker = '작업자명을 입력하세요.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDimension = (dim: DimensionSet) => `${dim.od} x ${dim.id} x ${dim.t} mm`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData: RingMillDataInput = {
        ...formData,
        heatTreatmentType: formData.heatTreatmentType as any,
        size: formatDimension(formData.size),
        margin: formatDimension(formData.margin),
        appliedMargin: formatDimension(formData.appliedMargin),
        hotDimension: formatDimension(formData.hotDimension),
        coldDimension: formatDimension(formData.coldDimension),
      };

      onSave(submissionData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleDimensionChange = useCallback((
    category: 'size' | 'margin' | 'appliedMargin' | 'hotDimension' | 'coldDimension',
    field: keyof DimensionSet,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormState);
    setErrors({});
  }, []);

  return (
    <div className="space-y-8">
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
              <input
                type="text"
                value={searchMfgNo}
                onChange={(e) => setSearchMfgNo(e.target.value)}
                placeholder="000000-00000-000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
              />
            </div>
            <div className="w-24 space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">S/N</label>
              <input
                type="text"
                value={searchSN}
                onChange={(e) => setSearchSN(e.target.value)}
                placeholder="001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-slate-800 text-white px-6 py-2 rounded font-bold hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Search className="w-4 h-4" />
              조회
            </button>
          </div>
          
          <AnimatePresence>
            {searchResults !== null && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }} 
                className="mt-6 border-t border-slate-100 pt-6"
              >
                {searchResults.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-lg text-slate-500 text-center text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    일치하는 기록이 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        조회 결과 ({searchResults.length}건)
                      </h4>
                      <button 
                        onClick={() => setSearchResults(null)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        닫기
                      </button>
                    </div>

                    {searchSN && searchResults.length === 1 ? (
                      // Single Record Full Details
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">제조번호 / S/N</p>
                          <p className="text-sm font-mono font-bold text-slate-700">{searchResults[0].manufacturingNo} / {searchResults[0].sn}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">규격 (SIZE)</p>
                          <p className="text-sm font-bold text-slate-700">{searchResults[0].size}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">열처리 / 재질</p>
                          <p className="text-sm font-bold text-slate-700">{searchResults[0].heatTreatmentType} / {searchResults[0].material}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">작업자 / 일자</p>
                          <p className="text-sm font-bold text-slate-700">{searchResults[0].worker} ({searchResults[0].workDate})</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">냉간치수</p>
                          <p className="text-sm font-mono font-bold text-blue-600">{searchResults[0].coldDimension}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">열간치수</p>
                          <p className="text-sm font-mono font-bold text-orange-600">{searchResults[0].hotDimension}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">여유치</p>
                          <p className="text-sm font-bold text-slate-600">{searchResults[0].margin}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">실적용여유치</p>
                          <p className="text-sm font-bold text-slate-600">{searchResults[0].appliedMargin}</p>
                        </div>
                      </div>
                    ) : (
                      // List of Matching SNs
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">S/N</th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">규격</th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">재질</th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">냉간치수</th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">작업자</th>
                              <th className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase">일자</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {searchResults.map((record) => (
                              <tr key={record.id} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-4 py-2 text-sm font-mono font-bold text-slate-700">{record.sn}</td>
                                <td className="px-4 py-2 text-xs text-slate-600">{record.size}</td>
                                <td className="px-4 py-2 text-xs text-slate-600">{record.material}</td>
                                <td className="px-4 py-2 text-sm font-mono font-bold text-blue-600">{record.coldDimension}</td>
                                <td className="px-4 py-2 text-xs text-slate-600">{record.worker}</td>
                                <td className="px-4 py-2 text-xs text-slate-500">{record.workDate}</td>
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
      </section>

      {/* Entry Form Section */}
      <div className="w-full bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden">
        <div className="bg-slate-900 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-white font-sans font-bold text-lg tracking-tight">냉간치수 정보 기록 시스템</h2>
          </div>
          <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
            <RefreshCcw className="w-4 h-4" /> 초기화
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
          {/* Left Column: Basic & Dimension Inputs */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> 기본 정보
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5" /> 제조번호 (Manufacturing No)
                  </label>
                  <input
                    type="text"
                    name="manufacturingNo"
                    value={formData.manufacturingNo}
                    onChange={handleMfgNoChange}
                    className={`w-full px-3 py-2.5 bg-slate-50 border ${errors.manufacturingNo ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm`}
                    placeholder="000000-00000-000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">S/N</label>
                  <input
                    type="number"
                    name="sn"
                    step="any"
                    value={formData.sn || ''}
                    onChange={handleChange}
                    onBlur={handleSNBlur}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm"
                    placeholder="001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> 재질
                  </label>
                  <input type="text" name="material" value={formData.material} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm" placeholder="SUS304" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">열처리 종류</label>
                  <select name="heatTreatmentType" value={formData.heatTreatmentType} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm">
                    <option value="">선택하세요</option>
                    <option value="QT">QT</option>
                    <option value="N">N</option>
                    <option value="S/A">S/A</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> 규격 및 여유치
              </h3>
              <DimensionInputGroup label="SIZE (규격)" category="size" data={formData.size} onChange={handleDimensionChange} />
              <DimensionInputGroup label="여유치 (Margin)" category="margin" data={formData.margin} onChange={handleDimensionChange} />
              <DimensionInputGroup label="실적용 여유치" category="appliedMargin" data={formData.appliedMargin} onChange={handleDimensionChange} />
            </div>
          </div>

          {/* Right Column: Calculation Results */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" /> 자동 계산 결과
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5" /> 열팽창계수
                </label>
                <input
                  type="number"
                  name="thermalExpansionCoefficient"
                  step="any"
                  value={formData.thermalExpansionCoefficient || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-sm font-bold"
                />
              </div>

              <DimensionInputGroup label="냉간치수 (Cold Dimension)" category="coldDimension" data={formData.coldDimension} highlight onChange={handleDimensionChange} />
              <DimensionInputGroup label="열간치수 (Hot Dimension)" category="hotDimension" data={formData.hotDimension} highlight onChange={handleDimensionChange} />

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase">결과 치수 (mm)</label>
                <input
                  type="number"
                  name="resultDimension"
                  step="any"
                  value={formData.resultDimension || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono text-lg font-bold"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> 작업자
                  </label>
                  <input type="text" name="worker" value={formData.worker} onChange={handleChange} className={`w-full px-3 py-2.5 bg-slate-50 border ${errors.worker ? 'border-red-500' : 'border-slate-200'} rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm`} placeholder="성명" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> 작업일자
                  </label>
                  <input type="date" name="workDate" value={formData.workDate} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaved}
                className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                  isSaved 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] hover:shadow-blue-500/25'
                }`}
              >
                {isSaved ? (
                  <><CheckCircle2 className="w-6 h-6" /> 저장 완료</>
                ) : (
                  <><Save className="w-6 h-6" /> 데이터 저장하기</>
                )}
              </button>
            </div>
          </div>
        </form>

        <AnimatePresence>
          {Object.keys(errors).length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-red-50 px-8 py-4 border-t border-red-100 flex items-center gap-3 text-red-600 text-sm font-bold">
              <AlertCircle className="w-5 h-5" /> <span>필수 입력 항목을 확인해 주세요.</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
