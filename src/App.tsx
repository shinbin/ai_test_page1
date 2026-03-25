/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Trophy, 
  Upload, 
  Trash2, 
  Play, 
  Settings, 
  History, 
  LayoutGrid,
  ClipboardList,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { cn, shuffle } from './lib/utils';

type Tab = 'input' | 'draw' | 'group';

interface Winner {
  name: string;
  timestamp: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [names, setNames] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPool, setCurrentPool] = useState<string[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [groupSize, setGroupSize] = useState(3);
  const [groups, setGroups] = useState<string[][]>([]);
  const [drawingName, setDrawingName] = useState<string | null>(null);

  // Sync currentPool with names when names change or allowRepeat changes
  useEffect(() => {
    if (!allowRepeat) {
      const winnerNames = winners.map(w => w.name);
      setCurrentPool(names.filter(n => !winnerNames.includes(n)));
    } else {
      setCurrentPool(names);
    }
  }, [names, winners, allowRepeat]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const parsedNames = (results.data as any[])
          .flat()
          .map((n: any) => String(n).trim())
          .filter(n => n.length > 0) as string[];
        
        const newNames = Array.from(new Set([...names, ...parsedNames]));
        setNames(newNames);
        setInputText(newNames.join('\n'));
      },
      header: false,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    const parsedNames = text
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setNames(Array.from(new Set(parsedNames)));
  };

  const clearNames = () => {
    setNames([]);
    setInputText('');
    setWinners([]);
    setGroups([]);
  };

  const loadMockData = () => {
    const mockNames = [
      '陳小明', '林美華', '張大衛', '李雅婷', '王志強',
      '黃淑芬', '劉家豪', '趙婉君', '周杰倫', '蔡依林',
      '郭台銘', '張忠謀', '林志玲', '金城武', '梁朝偉',
      '周潤發', '劉德華', '張學友', '黎明', '郭富城'
    ];
    setNames(mockNames);
    setInputText(mockNames.join('\n'));
  };

  const startDraw = () => {
    if (currentPool.length === 0) return;
    setIsDrawing(true);
    
    let count = 0;
    const duration = 2000;
    const interval = 50;
    const totalSteps = duration / interval;

    const timer = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * currentPool.length);
      setDrawingName(currentPool[randomIndex]);
      count++;

      if (count >= totalSteps) {
        clearInterval(timer);
        const finalWinner = currentPool[Math.floor(Math.random() * currentPool.length)];
        setDrawingName(finalWinner);
        setWinners(prev => [{ name: finalWinner, timestamp: Date.now() }, ...prev]);
        setIsDrawing(false);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, interval);
  };

  const handleGroup = () => {
    if (names.length === 0) return;
    const shuffled = shuffle(names) as string[];
    const newGroups: string[][] = [];
    for (let i = 0; i < shuffled.length; i += groupSize) {
      newGroups.push(shuffled.slice(i, i + groupSize));
    }
    setGroups(newGroups);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-semibold text-lg tracking-tight">HR Draw & Group</h1>
          </div>
          
          <nav className="flex gap-1 bg-[#F5F5F5] p-1 rounded-xl">
            {(['input', 'draw', 'group'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab 
                    ? "bg-white text-[#1A1A1A] shadow-sm" 
                    : "text-[#9E9E9E] hover:text-[#1A1A1A]"
                )}
              >
                {tab === 'input' && '名單輸入'}
                {tab === 'draw' && '獎品抽籤'}
                {tab === 'group' && '自動分組'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* Tab: Input */}
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold uppercase tracking-wider text-[#9E9E9E] flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      名單來源 (每行一個姓名)
                    </label>
                    <span className="text-xs font-mono bg-[#E5E5E5] px-2 py-0.5 rounded text-[#4A4A4A]">
                      總計: {names.length} 人
                    </span>
                  </div>
                  <textarea
                    value={inputText}
                    onChange={handleTextChange}
                    placeholder="請輸入姓名，或上傳 CSV 檔案..."
                    className="w-full h-96 p-6 bg-white border border-[#E5E5E5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 resize-none font-mono text-sm leading-relaxed transition-all"
                  />
                </div>

                  <div className="space-y-6">
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        快速體驗
                      </h3>
                      <p className="text-sm text-[#9E9E9E]">點擊下方按鈕載入模擬名單，快速測試抽籤與分組功能。</p>
                      <button
                        onClick={loadMockData}
                        className="w-full py-2.5 px-4 bg-[#F5F5F5] text-[#1A1A1A] rounded-xl flex items-center justify-center gap-2 hover:bg-[#E5E5E5] transition-colors text-sm font-medium border border-[#E5E5E5]"
                      >
                        <Play className="w-3.5 h-3.5" />
                        載入模擬名單
                      </button>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      快速匯入
                    </h3>
                    <p className="text-sm text-[#9E9E9E]">支援 .csv 格式，系統會自動提取所有欄位的文字。</p>
                    <label className="block">
                      <span className="sr-only">Choose file</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-[#9E9E9E]
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[#F5F5F5] file:text-[#1A1A1A]
                          hover:file:bg-[#E5E5E5] cursor-pointer"
                      />
                    </label>
                  </div>

                  <button
                    onClick={clearNames}
                    className="w-full py-3 px-4 border border-[#FF4444]/20 text-[#FF4444] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#FF4444]/5 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    清空所有名單
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Draw */}
          {activeTab === 'draw' && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  {/* Drawing Area */}
                  <div className="bg-white border border-[#E5E5E5] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                    <div className="absolute top-6 left-6 flex items-center gap-2 text-[#9E9E9E]">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-widest">Lucky Draw</span>
                    </div>

                    <div className="text-center space-y-8">
                      <div className="h-32 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {drawingName ? (
                            <motion.div
                              key={drawingName}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={cn(
                                "text-6xl md:text-8xl font-bold tracking-tighter",
                                isDrawing ? "text-[#9E9E9E]" : "text-[#1A1A1A]"
                              )}
                            >
                              {drawingName}
                            </motion.div>
                          ) : (
                            <div className="text-[#E5E5E5] text-xl italic">準備就緒</div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={startDraw}
                        disabled={isDrawing || currentPool.length === 0}
                        className="group relative px-12 py-5 bg-[#1A1A1A] text-white rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-[#1A1A1A]/20"
                      >
                        <span className="flex items-center gap-3">
                          {isDrawing ? '正在抽取...' : '開始抽籤'}
                          <Play className="w-6 h-6 fill-current" />
                        </span>
                      </button>
                    </div>

                    <div className="absolute bottom-6 text-sm text-[#9E9E9E]">
                      剩餘名單: <span className="font-mono text-[#1A1A1A]">{currentPool.length}</span> / {names.length}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Settings */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      抽籤設定
                    </h3>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => setAllowRepeat(!allowRepeat)}
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative",
                          allowRepeat ? "bg-[#1A1A1A]" : "bg-[#E5E5E5]"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                          allowRepeat ? "translate-x-4" : "translate-x-0"
                        )} />
                      </div>
                      <span className="text-sm text-[#4A4A4A] group-hover:text-[#1A1A1A]">允許重複中獎</span>
                    </label>
                  </div>

                  {/* History */}
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        <History className="w-4 h-4" />
                        中獎紀錄
                      </h3>
                      <button 
                        onClick={() => setWinners([])}
                        className="text-xs text-[#9E9E9E] hover:text-[#FF4444]"
                      >
                        清空
                      </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {winners.length === 0 ? (
                        <p className="text-sm text-[#9E9E9E] italic">尚無紀錄</p>
                      ) : (
                        winners.map((winner, idx) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={winner.timestamp}
                            className="flex items-center justify-between p-3 bg-[#F5F5F5] rounded-xl"
                          >
                            <span className="font-medium text-sm">{winner.name}</span>
                            <span className="text-[10px] text-[#9E9E9E]">
                              {new Date(winner.timestamp).toLocaleTimeString()}
                            </span>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Group */}
          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">自動分組</h2>
                    <p className="text-sm text-[#9E9E9E]">根據設定的人數自動隨機分配名單。</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-[#F5F5F5] p-1 rounded-xl border border-[#E5E5E5]">
                      <span className="text-xs font-semibold px-3 text-[#9E9E9E]">每組人數</span>
                      <input
                        type="number"
                        min="2"
                        max={names.length}
                        value={groupSize}
                        onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                        className="w-16 bg-white border border-[#E5E5E5] rounded-lg px-2 py-1 text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5"
                      />
                    </div>
                    <button
                      onClick={handleGroup}
                      disabled={names.length === 0}
                      className="px-8 py-3 bg-[#1A1A1A] text-white rounded-xl font-semibold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      開始分組
                    </button>
                  </div>
                </div>

                {groups.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group, idx) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx}
                        className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="bg-[#F5F5F5] px-4 py-2 border-b border-[#E5E5E5] flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-widest text-[#9E9E9E]">Group {idx + 1}</span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#E5E5E5] text-[#4A4A4A]">
                            {group.length} 人
                          </span>
                        </div>
                        <div className="p-4 space-y-2">
                          {group.map((member, mIdx) => (
                            <div key={mIdx} className="flex items-center gap-3 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/20" />
                              {member}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 border-2 border-dashed border-[#E5E5E5] rounded-3xl flex flex-col items-center justify-center text-[#9E9E9E] space-y-2">
                    <LayoutGrid className="w-8 h-8 opacity-20" />
                    <p className="text-sm">設定人數後點擊「開始分組」</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Empty State Warning */}
      {names.length === 0 && activeTab !== 'input' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5 text-[#FFCC00]" />
          <span className="text-sm font-medium">請先在「名單輸入」分頁建立名單</span>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E5E5;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D1D1;
        }
      `}</style>
    </div>
  );
}
