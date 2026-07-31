import React, { useState } from 'react';

export default function ThreadInventory() {
  // تھریڈ انوینٹری کا سیمپل ڈیٹا
  const [threads, setThreads] = useState([
    { id: 1, name: '20/2 کاٹن تھریڈ (White)', cones: 120, weightPerCone: 1.2, minLimit: 50 },
    { id: 2, name: 'کیولر کٹ ریسسٹنٹ (Kevlar)', cones: 15, weightPerCone: 1.0, minLimit: 30 },
    { id: 3, name: 'نائلون تھریڈ (High Tenacity)', cones: 85, weightPerCone: 0.8, minLimit: 25 },
  ]);

  // کیلکولیٹر اسٹیٹ
  const [pairsToEstimate, setPairsToEstimate] = useState(1000);
  const [gramsPerPair, setGramsPerPair] = useState(45);

  const totalRequiredKg = ((pairsToEstimate * gramsPerPair) / 1000).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ہیڈر */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">دھاگہ اور خام مال انوینٹری</h2>
            <p className="text-slate-400 text-sm mt-1">موجودہ اسٹاک اور الرٹس</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
            لائیو اسٹاک
          </span>
        </div>

        {/* تھریڈ اسٹاک کارڈز */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {threads.map((item) => {
            const totalKg = (item.cones * item.weightPerCone).toFixed(1);
            const isLowStock = item.cones <= item.minLimit;

            return (
              <div 
                key={item.id} 
                className={`p-5 rounded-2xl border bg-white shadow-sm transition-all ${
                  isLowStock ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                  {isLowStock && (
                    <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
                      کم اسٹاک!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">کل کون (Cones)</span>
                    <span className="text-xl font-black text-slate-800">{item.cones}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">کل وزن (کلوگرام)</span>
                    <span className="text-xl font-black text-indigo-600">{totalKg} kg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI دھاگا تخمینہ کیلکولیٹر */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800">دھاگے کی ضرورت کا تخمینہ (AI Estimator)</h3>
            <p className="text-xs text-slate-500">پروڈکشن سے پہلے درکار دھاگے کا کلوگرام میں حساب لگائیں</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">دستانوں کے جوڑے (Pairs)</label>
              <input 
                type="number" 
                value={pairsToEstimate} 
                onChange={(e) => setPairsToEstimate(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">فی جوڑ دھاگہ (گرام میں)</label>
              <input 
                type="number" 
                value={gramsPerPair} 
                onChange={(e) => setGramsPerPair(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex flex-col justify-center text-center">
              <span className="text-xs text-indigo-600 font-semibold">کل درکار دھاگا</span>
              <span className="text-2xl font-black text-indigo-700">{totalRequiredKg} kg</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
