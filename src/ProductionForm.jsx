import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState('inventory');
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

  // 2. گودام کا ابتدائی خام مال (Total Received Raw Material Stock)
  const [initialThreads] = useState([
    { id: 't1', name: 'وولن تھریڈ / دھاگا', initialBags: 10, weightPerBagKg: 45, minLimitBags: 3 },
    { id: 't2', name: 'اکریلک تھریڈ', initialBags: 5, weightPerBagKg: 40, minLimitBags: 2 },
    { id: 't3', name: 'اسپینڈیکس / الیکٹرا', initialBags: 4, weightPerBagKg: 25, minLimitBags: 1 },
  ]);

  // آن لائن فائر بیس ڈیٹابیس سے جاری شدہ دھاگے کا ریکارڈ
  const [issuedThreads, setIssuedThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firebase سے لائیو (Realtime Data Sync)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issuedThreads"), (snapshot) => {
      const threadsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIssuedThreads(threadsList);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const [issueForm, setIssueForm] = useState({
    date: todayDate,
    threadName: 'وولن تھریڈ / دھاگا',
    bags: '',
    weightKg: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [issueSuccess, setIssueSuccess] = useState('');

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

  const handleIssueChange = (e) => {
    setIssueForm({ ...issueForm, [e.target.name]: e.target.value });
  };

  // کلاؤڈ میں محفوظ کرنے کی لاجک
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.bags || !issueForm.weightKg) return;

    try {
      if (editingId !== null) {
        const docRef = doc(db, "issuedThreads", editingId);
        await updateDoc(docRef, {
          date: issueForm.date,
          threadName: issueForm.threadName,
          bags: parseFloat(issueForm.bags),
          weightKg: parseFloat(issueForm.weightKg),
        });
        setIssueSuccess('آن لائن ریکارڈ تبدیل کر دیا گیا!');
        setEditingId(null);
      } else {
        await addDoc(collection(db, "issuedThreads"), {
          date: issueForm.date,
          threadName: issueForm.threadName,
          bags: parseFloat(issueForm.bags),
          weightKg: parseFloat(issueForm.weightKg),
          createdAt: Date.now()
        });
        setIssueSuccess('نیا جاری کردہ دھاگا کلاؤڈ میں سیو ہو گیا اور اسٹاک سے مائنس ہو گیا!');
      }

      setIssueForm({ date: todayDate, threadName: 'وولن تھریڈ / دھاگا', bags: '', weightKg: '' });
      setTimeout(() => setIssueSuccess(''), 3000);
    } catch (error) {
      console.error("Error saving data: ", error);
      alert("ڈیٹا سیو کرتے ہوئے کوئی مسئلہ آیا ہے۔");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setIssueForm({
      date: item.date,
      threadName: item.threadName,
      bags: item.bags,
      weightKg: item.weightKg,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('کیا آپ واقعی اس جاری کردہ ریکارڈ کو ختم کرنا چاہتے ہیں؟ (اس سے اسٹاک واپس بڑھ جائے گا)')) {
      try {
        await deleteDoc(doc(db, "issuedThreads", id));
        if (editingId === id) {
          setEditingId(null);
          setIssueForm({ date: todayDate, threadName: 'وولن تھریڈ / دھاگا', bags: '', weightKg: '' });
        }
      } catch (error) {
        console.error("Error deleting doc: ", error);
      }
    }
  };

  const netGradeADozens = Math.max(
    0,
    (parseFloat(formData.dozensProduced) || 0) - (parseFloat(formData.dozensDefective) || 0)
  );

  const totalWarehouseDozens = finishedStock.reduce((acc, curr) => acc + curr.totalDozens, 0);

  const handlePrint = () => {
    window.print();
  };

  // ----------------------------------------------------
  // مائنس کرنے کا خودکار حساب (Automated Deductions Logic)
  // ----------------------------------------------------
  const calculateRemainingStock = (threadName) => {
    const issuedForThisThread = issuedThreads.filter(t => t.threadName === threadName);
    const totalIssuedBags = issuedForThisThread.reduce((sum, item) => sum + (parseFloat(item.bags) || 0), 0);
    const totalIssuedWeight = issuedForThisThread.reduce((sum, item) => sum + (parseFloat(item.weightKg) || 0), 0);

    return { totalIssuedBags, totalIssuedWeight };
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      
      {/* Navigation Header */}
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
              🧵 2. دھاگا اسٹاک (خام مال)
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

        {/* ================= tab 2: دھاگا انوینٹری (خودکار مائنس لاجک کے ساتھ) ================= */}
        {activeTab === 'inventory' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">گودام میں خام مال اور بقایا اسٹاک</h2>
                <p className="text-slate-400 text-sm mt-1">جاری کردہ دھاگے کے بعد خودکار مائنس شدہ بقایا ریکارڈ ({todayDate})</p>
              </div>
              <button
                onClick={handlePrint}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl border border-emerald-400 print:hidden"
              >
                🖨️ پرنٹ
              </button>
            </div>

            {/* خودکار مائنس والے بقایا خام مال کے کارڈز */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {initialThreads.map((item) => {
                const totalInitialKg = item.initialBags * item.weightPerBagKg;
                const { totalIssuedBags, totalIssuedWeight } = calculateRemainingStock(item.name);
                
                // بقایا حساب (Minus)
                const remainingBags = Math.max(0, item.initialBags - totalIssuedBags);
                const remainingKg = Math.max(0, totalInitialKg - totalIssuedWeight);
                const isLowStock = remainingBags <= item.minLimitBags;

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border bg-white shadow-sm transition-all ${
                      isLowStock ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                      {isLowStock && (
                        <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                          کم اسٹاک!
                        </span>
                      )}
                    </div>

                    {/* آمد اور جاری کا موازنہ */}
                    <div className="text-[11px] text-slate-500 space-y-1 mb-3 bg-slate-50 p-2.5 rounded-xl border">
                      <div className="flex justify-between">
                        <span>کل موصول (آمد):</span>
                        <span className="font-bold text-slate-700">{item.initialBags} بورے ({totalInitialKg} kg)</span>
                      </div>
                      <div className="flex justify-between text-rose-600">
                        <span>جاری کردہ (مائنس):</span>
                        <span className="font-bold">-{totalIssuedBags} بورے (-{totalIssuedWeight} kg)</span>
                      </div>
                    </div>

                    {/* بقایا اسٹاک (Remaining Stock) */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500 block">بقایا بورے</span>
                        <span className="text-2xl font-black text-emerald-600">{remainingBags} بورے</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">بقایا وزن</span>
                        <span className="text-2xl font-black text-indigo-600">{remainingKg} kg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* فیکٹری میں جاری کرنے کا فارم */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingId ? '✏️ جاری کردہ دھاگے کا ریکارڈ تبدیل کریں' : 'فیکٹری کے لیے دھاگا جاری کریں (Issue Thread)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">یہاں جتنے بورے اور وزن جاری کریں گے، اوپر خام مال سے مائنس ہو جائے گا</p>
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
                    {initialThreads.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">جاری کردہ بورے (Bags)</label>
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">جاری کردہ وزن (kg)</label>
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
                    {editingId ? '💾 تبدیل شدہ ریکارڈ محفوظ کریں' : '📤 دھاگا جاری کریں (Minus from Stock)'}
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

              {/* جاری شدہ دھاگے کی ہسٹری (Cloud Record) */}
              <div className="mt-4 overflow-x-auto">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-slate-700 text-sm">جاری شدہ دھاگے کا آن لائن لاگ (Issued Log)</h4>
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> لائیو فائر بیس سنک
                  </span>
                </div>

                {loading ? (
                  <div className="text-center p-6 text-slate-500 text-xs">ڈیٹا لوڈ ہو رہا ہے...</div>
                ) : (
                  <table className="w-full text-right border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b">
                        <th className="p-2.5">تاریخ</th>
                        <th className="p-2.5">دھاگے کا نام</th>
                        <th className="p-2.5">جاری کردہ بورے</th>
                        <th className="p-2.5">جاری کردہ وزن (kg)</th>
                        <th className="p-2.5 print:hidden">ایکشن</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issuedThreads.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center p-4 text-slate-400">ابھی تک فیکٹری کو کوئی دھاگا جاری نہیں کیا گیا۔</td>
                        </tr>
                      ) : (
                        issuedThreads.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-slate-50/50">
                            <td className="p-2.5 text-slate-600">{item.date}</td>
                            <td className="p-2.5 font-bold text-slate-800">{item.threadName}</td>
                            <td className="p-2.5 font-black text-rose-600">-{item.bags} بورے</td>
                            <td className="p-2.5 font-black text-rose-600">-{item.weightKg} kg</td>
                            <td className="p-2.5 flex items-center gap-2 print:hidden">
                              <button
                                onClick={() => handleEdit(item)}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold border border-amber-300"
                              >
                                ✏️ ایڈیٹ
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold border border-rose-300"
                              >
                                🗑️ ڈیلیٹ
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= tab 3: تیار شدہ مال ================= */}
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

        {/* ================= tab 4: کاریگر اور اجرت ================= */}
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
