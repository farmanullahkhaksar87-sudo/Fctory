import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('production');

  // آج کی تاریخ فارمیٹ (YYYY-MM-DD) میں
  const todayDate = new Date().toISOString().split('T')[0];

  // 1. پروڈکشن فارم اسٹیٹ
  const [formData, setFormData] = useState({
    productionDate: todayDate,
    workerName: 'EMP-101',
    gloveType: 'wool_half',
    size: 'L',
    dozensProduced: '',
    dozensDefective: 0,
  });

  const [successMessage, setSuccessMessage] = useState('');

  // 2. دھاگا انوینٹری
  const [threads] = useState([
    { id: 1, name: 'وولن تھریڈ / دھاگا', bags: 10, weightPerBagKg: 45, minLimitBags: 3 },
    { id: 2, name: 'اکریلک تھریڈ', bags: 5, weightPerBagKg: 40, minLimitBags: 2 },
    { id: 3, name: 'اسپینڈیکس / الیکٹرا', bags: 4, weightPerBagKg: 25, minLimitBags: 1 },
  ]);

  // فیکٹری کو جاری کردہ دھاگے کا ریکارڈ (Thread Issue Log State)
  const [issuedThreads, setIssuedThreads] = useState([
    { id: 1, date: todayDate, threadName: 'وولن تھریڈ / دھاگا', bags: 2, weightKg: 90 },
    { id: 2, date: todayDate, threadName: 'اکریلک تھریڈ', bags: 1, weightKg: 40 },
  ]);

  const [issueForm, setIssueForm] = useState({
    date: todayDate,
    threadName: 'وولن تھریڈ / دھاگا',
    bags: '',
    weightKg: '',
  });

  const [editingId, setEditingId] = useState(null); // ایڈیٹ کے لیے ID ٹریکنگ
  const [issueSuccess, setIssueSuccess] = useState('');

  // AI تخمینہ
  const [dozensToEstimate, setDozensToEstimate] = useState(100);
  const [gramsPerDozen, setGramsPerDozen] = useState(540);
  const [bagWeightKg, setBagWeightKg] = useState(45);

  const totalRequiredKg = ((dozensToEstimate * gramsPerDozen) / 1000).toFixed(1);
  const totalBagsNeeded = (totalRequiredKg / bagWeightKg).toFixed(1);

  // 3. تیار شدہ مال (Finished Goods Stock)
  const [finishedStock] = useState([
    { id: 1, item: 'وول ہاف (Grade A)', size: 'L', cartons: 25, dozensPerCarton: 20, totalDozens: 500 },
    { id: 2, item: 'وول فل (Grade A)', size: 'M', cartons: 18, dozensPerCarton: 20, totalDozens: 360 },
    { id: 3, item: 'یونیفارم گلوز (Grade A)', size: 'L', cartons: 10, dozensPerCarton: 15, totalDozens: 150 },
  ]);

  // 4. کاریگر اور اجرت (Payroll)
  const [workers] = useState([
    { id: 'EMP-101', name: 'محمد علی', ratePerDozen: 80, dozensMadeToday: 25, advance: 500 },
    { id: 'EMP-102', name: 'عثمان خان', ratePerDozen: 85, dozensMadeToday: 30, advance: 0 },
    { id: 'EMP-103', name: 'طارق محمود', ratePerDozen: 80, dozensMadeToday: 20, advance: 200 },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('روزانہ کی پروڈکشن کا اندراج کامیابی سے ہو گیا ہے!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // دھاگا ایشو فارم ہینڈلرز (اضافہ اور ایڈیٹ)
  const handleIssueChange = (e) => {
    setIssueForm({ ...issueForm, [e.target.name]: e.target.value });
  };

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    if (!issueForm.bags || !issueForm.weightKg) return;

    if (editingId !== null) {
      // ایڈیٹ شدہ ریکارڈ اپڈیٹ کریں
      setIssuedThreads(
        issuedThreads.map((item) =>
          item.id === editingId
            ? {
                ...item,
                date: issueForm.date,
                threadName: issueForm.threadName,
                bags: parseFloat(issueForm.bags),
                weightKg: parseFloat(issueForm.weightKg),
              }
            : item
        )
      );
      setIssueSuccess('ریکارڈ میں کامیابی سے تبدیلی کر دی گئی ہے!');
      setEditingId(null);
    } else {
      // نیا ریکارڈ شامل کریں
      const newEntry = {
        id: Date.now(),
        date: issueForm.date,
        threadName: issueForm.threadName,
        bags: parseFloat(issueForm.bags),
        weightKg: parseFloat(issueForm.weightKg),
      };
      setIssuedThreads([newEntry, ...issuedThreads]);
      setIssueSuccess('فیکٹری کے لیے دھاگے کا ریکارڈ کامیابی سے محفوظ ہو گیا!');
    }

    setIssueForm({ date: todayDate, threadName: 'وولن تھریڈ / دھاگا', bags: '', weightKg: '' });
    setTimeout(() => setIssueSuccess(''), 3000);
  };

  // ریکارڈ ایڈیٹ کرنے کا عمل
  const handleEdit = (item) => {
    setEditingId(item.id);
    setIssueForm({
      date: item.date,
      threadName: item.threadName,
      bags: item.bags,
      weightKg: item.weightKg,
    });
  };

  // ریکارڈ ڈیلیٹ کرنے کا عمل
  const handleDelete = (id) => {
    if (window.confirm('کیا آپ واقعی اس ریکارڈ کو ختم کرنا چاہتے ہیں؟')) {
      setIssuedThreads(issuedThreads.filter((item) => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setIssueForm({ date: todayDate, threadName: 'وولن تھریڈ / دھاگا', bags: '', weightKg: '' });
      }
    }
  };

  const netGradeADozens = Math.max(
    0,
    (parseFloat(formData.dozensProduced) || 0) - (parseFloat(formData.dozensDefective) || 0)
  );

  const totalWarehouseDozens = finishedStock.reduce((acc, curr) => acc + curr.totalDozens, 0);

  // پرنٹ کا طریقہ
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* نیویگیشن ٹیبز (Navigation Header) - پرنٹ کے دوران غائب ہو جائے گا */}
      <div className="bg-slate-900 text-white p-3 shadow-md border-b border-slate-800 sticky top-0 z-50 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('production')}
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'production'
                  ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📋 1. پروڈکشن
            </button>
            
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🧵 2. دھاگا اسٹاک
            </button>

            <button
              onClick={() => setActiveTab('finished')}
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'finished'
                  ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📦 3. تیار شدہ مال
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-3 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                activeTab === 'payroll'
                  ? 'bg-indigo-600 text-white shadow-lg border border-indigo-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              💰 4. کاریگر و اجرت
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm rounded-xl shadow border border-emerald-400 flex items-center gap-1"
          >
            🖨️ پرنٹ رپورٹ
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* ================= tab 1: پروڈکشن فارم ================= */}
        {activeTab === 'production' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="bg-indigo-700 p-6 text-white text-right flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">روزانہ کی پروڈکشن کا اندراج</h2>
                <p className="text-indigo-200 text-sm mt-1">دستانوں کی تیاری درجنوں کے حساب سے درج کریں</p>
              </div>
              <button
                onClick={handlePrint}
                className="hidden print:hidden md:flex px-3 py-1.5 bg-indigo-800 hover:bg-indigo-900 text-white font-bold text-xs rounded-lg border border-indigo-500 items-center gap-1"
              >
                🖨️ پرنٹ
              </button>
            </div>

            {successMessage && (
              <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold print:hidden">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">تاریخ (Date)</label>
                  <input
                    type="date"
                    name="productionDate"
                    value={formData.productionDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
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
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.id})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">دستانے کی قسم</label>
                  <select
                    name="gloveType"
                    value={formData.gloveType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                  >
                    <option value="wool_half">وول ہاف (Wool Half)</option>
                    <option value="wool_full">وول فل (Wool Full)</option>
                    <option value="uniform">یونیفارم (Uniform)</option>
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
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg print:hidden"
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
                <h2 className="text-2xl font-bold">دھاگہ اور خام مال انوینٹری Report</h2>
                <p className="text-slate-400 text-sm mt-1">گودام میں موجود بوریوں اور وزن کا حساب ({todayDate})</p>
              </div>
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-400 print:hidden"
              >
                🖨️ پرنٹ
              </button>
            </div>

            {/* گودام کا موجودہ اسٹاک کارڈز */}
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
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold print:hidden">
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

            {/* دھاگا جاری کرنے کا فارم */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingId ? '✏️ جاری کردہ دھاگے کے ریکارڈ میں ترمیم کریں' : 'فیکٹری میں جاری کردہ دھاگے کا اندراج (Issue to Factory)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">فیکٹری کے لیے بھیجے جانے والے بوروں اور وزن کا ریکارڈ محفوظ کریں</p>
                </div>
              </div>

              {issueSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-sm print:hidden">
                  {issueSuccess}
                </div>
              )}

              <form onSubmit={handleIssueSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">تاریخ</label>
                  <input
                    type="date"
                    name="date"
                    value={issueForm.date}
                    onChange={handleIssueChange}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">دھاگے کی قسم</label>
                  <select
                    name="threadName"
                    value={issueForm.threadName}
                    onChange={handleIssueChange}
                    className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800"
                  >
                    {threads.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">بورے (Bags)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="bags"
                    value={issueForm.bags}
                    onChange={handleIssueChange}
                    placeholder="مثلاً: 2"
                    className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">وزن (کلوگرام)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="weightKg"
                    value={issueForm.weightKg}
                    onChange={handleIssueChange}
                    placeholder="مثلاً: 90"
                    className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="md:col-span-4 mt-2 flex gap-2">
                  <button
                    type="submit"
                    className={`flex-1 py-3 text-white font-bold text-xs rounded-xl shadow print:hidden ${
                      editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {editingId ? '💾 ترمیم شدہ ریکارڈ محفوظ کریں' : '+ جاری کردہ دھاگا محفوظ کریں'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setIssueForm({ date: todayDate, threadName: 'وولن تھریڈ / دھاگا', bags: '', weightKg: '' });
                      }}
                      className="px-4 py-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 print:hidden"
                    >
                      منسوخ کریں
                    </button>
                  )}
                </div>
              </form>

              {/* جاری شدہ دھاگے کا ریکارڈ (Table Log) */}
              <div className="mt-4 overflow-x-auto">
                <h4 className="font-bold text-slate-700 text-sm mb-2">حالیہ جاری شدہ ریکارڈ (Issue History)</h4>
                <table className="w-full text-right border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b">
                      <th className="p-2.5">تاریخ</th>
                      <th className="p-2.5">دھاگے کا نام</th>
                      <th className="p-2.5">بورے</th>
                      <th className="p-2.5">وزن (kg)</th>
                      <th className="p-2.5 print:hidden">ایکشن (کنٹرولز)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedThreads.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-4 text-slate-400">کوئی ریکارڈ موجود نہیں۔</td>
                      </tr>
                    ) : (
                      issuedThreads.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-slate-50/50">
                          <td className="p-2.5 text-slate-600">{item.date}</td>
                          <td className="p-2.5 font-bold text-slate-800">{item.threadName}</td>
                          <td className="p-2.5 font-black text-indigo-600">{item.bags} بورے</td>
                          <td className="p-2.5 font-black text-slate-800">{item.weightKg} kg</td>
                          <td className="p-2.5 flex items-center gap-2 print:hidden">
                            <button
                              onClick={() => handleEdit(item)}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold border border-amber-300 transition-all"
                            >
                              ✏️ ایڈیٹ
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold border border-rose-300 transition-all"
                            >
                              🗑️ ڈیلیٹ
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI تخمینہ باکس */}
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

        {/* ================= tab 3: تیار شدہ مال (گودام) ================= */}
        {activeTab === 'finished' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">تیار شدہ مال کا گودام Report</h2>
                <p className="text-slate-400 text-sm mt-1">پیکنگ، کارٹن اور درجنوں کا مکمل اسٹاک ({todayDate})</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-left bg-indigo-600/30 border border-indigo-500/40 px-4 py-2 rounded-xl">
                  <span className="text-xs text-indigo-200 block">کل گودام اسٹاک</span>
                  <span className="text-xl font-black text-white">{totalWarehouseDozens} درجن</span>
                </div>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-400 print:hidden"
                >
                  🖨️ پرنٹ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {finishedStock.map((stock) => (
                <div key={stock.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">{stock.item}</h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 font-semibold text-xs rounded-md">
                        سائز: {stock.size}
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-lg font-bold print:hidden">
                      موجود ہے
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">کارٹن/بورے</span>
                      <span className="text-lg font-bold text-slate-800">{stock.cartons}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-500 block">فی کارٹن</span>
                      <span className="text-lg font-bold text-slate-800">{stock.dozensPerCarton} درجن</span>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                      <span className="text-[10px] text-indigo-600 block">کل درجن</span>
                      <span className="text-lg font-black text-indigo-700">{stock.totalDozens}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= tab 4: کاریگر اور اجرت (Payroll) ================= */}
        {activeTab === 'payroll' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">کاریگروں کی روزانہ کی اجرت Report</h2>
                <p className="text-slate-400 text-sm mt-1">فی درجن ریٹ اور نیٹ ادائیگی کا حساب ({todayDate})</p>
              </div>
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-400 print:hidden"
              >
                🖨️ پرنٹ
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workers.map((worker) => {
                const totalGrossWage = worker.dozensMadeToday * worker.ratePerDozen;
                const netPayable = totalGrossWage - worker.advance;

                return (
                  <div key={worker.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{worker.name}</h3>
                        <span className="text-xs text-slate-400 font-mono">{worker.id}</span>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
                        {worker.ratePerDozen} روپے/درجن
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span>آج کی پروڈکشن:</span>
                        <span className="font-bold text-slate-800">{worker.dozensMadeToday} درجن</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>کل اجرت (Gross):</span>
                        <span className="font-bold text-slate-800">{totalGrossWage} روپے</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>ایڈوانس کٹوتی:</span>
                        <span className="font-bold">-{worker.advance} روپے</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-800">قابلِ ادائیگی (Net Pay):</span>
                      <span className="text-xl font-black text-emerald-700">{netPayable} روپے</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
