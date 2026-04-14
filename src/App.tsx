/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Factory, 
  Database, 
  History, 
  TrendingUp, 
  Search,
  Download,
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  CloudOff
} from 'lucide-react';
import { 
  signInAnonymously,
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  getDocFromServer,
  doc
} from 'firebase/firestore';
import { auth, db } from './firebase';
import DataEntryForm from './components/DataEntryForm';
import { RingMillData, RingMillDataInput } from './types/RingMillData';

export default function App() {
  const [records, setRecords] = useState<RingMillData[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Automatically sign in anonymously if no user
        signInAnonymously(auth).catch(err => console.error("Anonymous Auth Error:", err));
      }
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'records'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newRecords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RingMillData[];
      setRecords(newRecords);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const handleSave = async (data: RingMillDataInput) => {
    try {
      await addDoc(collection(db, 'records'), {
        ...data,
        uid: user?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Save Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Factory className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">RingMill Pro</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-1">Dimension Tracker v1.0</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1">데이터 입력</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">이력 조회</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">통계 분석</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">실시간 동기화 중</span>
            </div>
            <button 
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {!isAuthReady ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">현장 데이터 기록</h2>
                <p className="text-slate-500 mt-1">작업 현장에서 측정된 치수 정보를 정확하게 입력해 주세요.</p>
              </div>
              <DataEntryForm onSave={handleSave} allRecords={records} />
            </section>

            {/* Quick Stats / Info */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-full">
                  <Database className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">전체 기록</p>
                  <p className="text-xl font-bold text-slate-900">{records.length} 건</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-full">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">평균 열간치수</p>
                  <p className="text-xl font-bold text-slate-900">
                    {records.length > 0 
                      ? (records.reduce((acc, r) => {
                          const hot = parseFloat(r.hotDimension.split(' ')[0]) || 0;
                          return acc + hot;
                        }, 0) / records.length).toFixed(2) 
                      : '0.00'} mm
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 flex items-center gap-4">
                <div className="bg-green-50 p-3 rounded-full">
                  <History className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">최근 작업자</p>
                  <p className="text-xl font-bold text-slate-900 truncate max-w-[120px]">
                    {records[0]?.worker || '-'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400">© 2024 RingMill Pro Dimension Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
