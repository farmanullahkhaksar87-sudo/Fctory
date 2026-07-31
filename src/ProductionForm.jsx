import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('production');

  // پروڈکشن فارم (درجنوں کے حساب سے)
  const [formData, setFormData] = useState({
    batchNumber: 'BATCH-2026-081',
    workerName: '',
    gloveType: 'cotton_knitted',
    size: 'L',
    dozensProduced: '',
    dozensDefective: 0,
    machineId: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  // دھاگا انوینٹری (بوروں اور وزن کے حساب سے)
  const [threads] = useState([
    { id: 1, name: '20/2 کاٹن تھریڈ (White)', bags: 10, weightPerBagKg: 45, minLimitBags: 3 },
    { id: 2, name: 'کیولر کٹ ریسسٹنٹ (Kevlar)', bags: 2, weightPerBagKg: 40, minLimitBags: 2 },
    { id: 3, name: 'نائلون تھریڈ (High Tenacity)', bags: 6, weightPerBagKg: 50, minLimitBags: 2 },
  ]);

  // AI تخمینہ (درجنوں سے بوروں کا حساب)
  const [dozensToEstimate, setDozensToEstimate] = useState(100);
  const [gramsPerDozen, setGramsPerDozen] = useState(540); // 45g per pair * 12 = 540g per dozen
  const [bagWeightKg, setBagWeightKg] = useState(45);

  const totalRequiredKg = ((dozensToEstimate * gramsPerDozen) / 1000).toFixed(1);
  const totalBagsNeeded = (totalRequiredKg / bagWeightKg).toFixed(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('روزانہ کی پروڈکشن کا اندراج کامیا بی سے ہو گیا ہے!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const netGradeADozens = Math.max(
    0,
    (parseFloat(formData.dozensProduced) || 0) - (parseFloat(formData.dozensDefective) || 0)
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* نیویگیشن ٹیبز */}
      <div className="bg-slate-900 text-white p-3 shadow-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('production')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'production'
                ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 1. پروڈکشن (درجن)
          </button>
          
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧵 2. دھاگا اسٹاک (بہرے)
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* ================= tab 1: پروڈکشن فارم ================= */}
        {activeTab === 'production' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-indigo-700 p-6 text-white text-right">
              <h2 className="text-2xl font-bold">روزانہ کی پروڈکشن کا اندراج</h2>
              <p className="text-indigo-200 text-sm mt-1">دستانوں کی تیاری درجنوں کے حساب سے درج کریں</p>
            </div>

            {successMessage && (
              <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">بیچ نمبر (Batch Number)</label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">کاریگر / آپریٹر</label>
                  <select
                    name="workerName"
                    value={formData.workerName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="">کاریگر منتخب کریں...</option>
                    <option value="EMP-101">محمد علی (EMP-101)</option>
                    <option value="EMP-102">عثمان خان (EMP-102)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">دستانے کی قسم</label>
                  <select
                    name="gloveType"
                    value={formData.gloveType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="cotton_knitted">کاٹن نٹڈ (Cotton Knitted)</option>
                    <option value="coated_dipped">لیٹیکس کوٹڈ (Dipped Latex)</option>
                    <option value="cut_resistant">کٹ ریسسٹنٹ (Cut Resistant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">سائز (Size)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['S', 'M', 'L', 'XL'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, size: s })}
                        className={`py-3 rounded-xl border font-bold ${
                          formData.size === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">کل تیار شدہ مال (درجن)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="dozensProduced"
                    value={formData.dozensProduced}
                    onChange={handleChange}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">خراب / ڈیفیکٹ (درجن)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="dozensDefective"
                    value={formData.dozensDefective}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-rose-600 text-lg"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-500 block">کوالٹی مال (Grade A)</span>
                  <span className="text-2xl font-black text-emerald-600">{netGradeADozens} درجن</span>
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-500 block">ڈیفیکٹ %</span>
                  <span className="text-sm font-bold text-rose-500">
                    {formData.dozensProduced > 0
                      ? ((formData.dozensDefective / formData.dozensProduced) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg"
              >
                پروڈکشن محفوظ کریں
              </button>
            </form>
          </div>
        )}

        {/* ================= tab 2: دھاگا انوینٹری ================= */}
        {activeTab === 'inventory' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">دھاگہ اور خام مال انوینٹری</h2>
                <p className="text-slate-400 text-sm mt-1">گودام میں موجود بوریوں اور وزن کا حساب</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold">
                لائیو اسٹاک
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {threads.map((item) => {
                const totalKg = item.bags * item.weightPerBagKg;
                const isLowStock = item.bags <= item.minLimitBags;
                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border bg-white shadow-sm ${
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
                        <span className="text-xs text-slate-500 block">کل بورے (Bags)</span>
                        <span className="text-xl font-black text-slate-800">{item.bags} بورے</span>
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

            {/* AI تخمینہ کیلکولیٹر */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-800 border-b pb-2">دھاگے کی بوریوں کا تخمینہ (Estimator)</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ٹارگٹ (درجن)</label>
                  <input
                    type="number"
                    value={dozensToEstimate}
                    onChange={(e) => setDozensToEstimate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">فی درجن دھاگا (گرام)</label>
                  <input
                    type="number"
                    value={gramsPerDozen}
                    onChange={(e) => setGramsPerDozen(e.target.value)}
                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">بوری کا وزن (kg)</label>
                  <input
                    type="number"
                    value={bagWeightKg}
                    onChange={(e) => setBagWeightKg(e.target.value)}
                    className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-center flex flex-col justify-center">
                  <span className="text-xs text-indigo-600 font-semibold">درکار دھاگا</span>
                  <span className="text-lg font-black text-indigo-700">{totalRequiredKg} kg</span>
                  <span className="text-xs font-bold text-indigo-500">({totalBagsNeeded} بورے)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
