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

  // ================= 1. پروڈکشن فارم اسٹیٹ =================
  const [formData, setFormData] = useState({
    productionDate: todayDate,
    workerName: 'EMP-101',
    gloveType: 'wool_half',
    size: 'L',
    dozensProduced: '',
    dozensDefective: 0,
  });
  const [successMessage, setSuccessMessage] = useState('');

  // ================= 2. خام مال (دھاگا انوینٹری - Firebase Realtime) =================
  const [initialThreads, setInitialThreads] = useState([]);
  const [rawForm, setRawForm] = useState({ name: '', initialBags: '', weightPerBagKg: '', minLimitBags: '' });
  const [editingRawId, setEditingRawId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rawMaterials"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInitialThreads(list);
    });
    return () => unsub();
  }, []);

  const handleRawSubmit = async (e) => {
    e.preventDefault();
    if (!rawForm.name || !rawForm.initialBags || !rawForm.weightPerBagKg) return;

    try {
      if (editingRawId) {
        await updateDoc(doc(db, "rawMaterials", editingRawId), {
          name: rawForm.name,
          initialBags: parseFloat(rawForm.initialBags),
          weightPerBagKg: parseFloat(rawForm.weightPerBagKg),
          minLimitBags: parseFloat(rawForm.minLimitBags || 0)
        });
        setEditingRawId(null);
      } else {
        await addDoc(collection(db, "rawMaterials"), {
          name: rawForm.name,
          initialBags: parseFloat(rawForm.initialBags),
          weightPerBagKg: parseFloat(rawForm.weightPerBagKg),
          minLimitBags: parseFloat(rawForm.minLimitBags || 0)
        });
      }
      setRawForm({ name: '', initialBags: '', weightPerBagKg: '', minLimitBags: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditRaw = (item) => {
    setEditingRawId(item.id);
    setRawForm({
      name: item.name,
      initialBags: item.initialBags,
      weightPerBagKg: item.weightPerBagKg,
      minLimitBags: item.minLimitBags || ''
    });
  };

  const handleDeleteRaw = async (id) => {
    if (window.confirm("کیا آپ واقعی اس خام مال کو ختم کرنا چاہتے ہیں؟")) {
      await deleteDoc(doc(db, "rawMaterials", id));
      if (editingRawId === id) {
        setEditingRawId(null);
        setRawForm({ name: '', initialBags: '', weightPerBagKg: '', minLimitBags: '' });
      }
    }
  };

  // ================= جاری کردہ دھاگا (Issued Threads - Firebase Realtime) =================
  const [issuedThreads, setIssuedThreads] = useState([]);
  const [issuedLoading, setIssuedLoading] = useState(true);
  const [issueForm, setIssueForm] = useState({ date: todayDate, threadName: '', bags: '', weightKg: '' });
  const [editingIssueId, setEditingIssueId] = useState(null);
  const [issueSuccess, setIssueSuccess] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issuedThreads"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssuedThreads(list);
      setIssuedLoading(false);
    });
    return () => unsub();
  }, []);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.threadName || !issueForm.bags || !issueForm.weightKg) return;

    try {
      if (editingIssueId) {
        await updateDoc(doc(db, "issuedThreads", editingIssueId), {
          date: issueForm.date,
          threadName: issueForm.threadName,
          bags: parseFloat(issueForm.bags),
          weightKg: parseFloat(issueForm.weightKg),
        });
        setIssueSuccess('ریکارڈ تبدیل ہو گیا!');
        setEditingIssueId(null);
      } else {
        await addDoc(collection(db, "issuedThreads"), {
          date: issueForm.date,
          threadName: issueForm.threadName,
          bags: parseFloat(issueForm.bags),
          weightKg: parseFloat(issueForm.weightKg),
          createdAt: Date.now()
        });
        setIssueSuccess('نیا دھاگا جاری ہو گیا!');
      }
      setIssueForm({ date: todayDate, threadName: initialThreads[0]?.name || '', bags: '', weightKg: '' });
      setTimeout(() => setIssueSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditIssue = (item) => {
    setEditingIssueId(item.id);
    setIssueForm({
      date: item.date,
      threadName: item.threadName,
      bags: item.bags,
      weightKg: item.weightKg
    });
  };

  const handleDeleteIssue = async (id) => {
    if (window.confirm('کیا آپ واقعی اس جاری کردہ دھاگے کو ختم کرنا چاہتے ہیں؟')) {
      await deleteDoc(doc(db, "issuedThreads", id));
      if (editingIssueId === id) {
        setEditingIssueId(null);
        setIssueForm({ date: todayDate, threadName: initialThreads[0]?.name || '', bags: '', weightKg: '' });
      }
    }
  };

  // ================= 3. تیار شدہ مال (Finished Stock - Firebase Realtime) =================
  const [finishedStock, setFinishedStock] = useState([]);
  const [finishedForm, setFinishedForm] = useState({ item: '', size: 'L', cartons: '', dozensPerCarton: '' });
  const [editingFinishedId, setEditingFinishedId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "finishedStock"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFinishedStock(list);
    });
    return () => unsub();
  }, []);

  const handleFinishedSubmit = async (e) => {
    e.preventDefault();
    if (!finishedForm.item || !finishedForm.cartons || !finishedForm.dozensPerCarton) return;

    const cartons = parseFloat(finishedForm.cartons) || 0;
    const dozensPerCarton = parseFloat(finishedForm.dozensPerCarton) || 0;
    const totalDozens = cartons * dozensPerCarton;

    try {
      if (editingFinishedId) {
        await updateDoc(doc(db, "finishedStock", editingFinishedId), {
          item: finishedForm.item,
          size: finishedForm.size,
          cartons,
          dozensPerCarton,
          totalDozens
        });
        setEditingFinishedId(null);
      } else {
        await addDoc(collection(db, "finishedStock"), {
          item: finishedForm.item,
          size: finishedForm.size,
          cartons,
          dozensPerCarton,
          totalDozens
        });
      }
      setFinishedForm({ item: '', size: 'L', cartons: '', dozensPerCarton: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditFinished = (stock) => {
    setEditingFinishedId(stock.id);
    setFinishedForm({
      item: stock.item,
      size: stock.size,
      cartons: stock.cartons,
      dozensPerCarton: stock.dozensPerCarton
    });
  };

  const handleDeleteFinished = async (id) => {
    if (window.confirm("کیا آپ واقعی اس تیار شدہ مال کے ریکارڈ کو ختم کرنا چاہتے ہیں؟")) {
      await deleteDoc(doc(db, "finishedStock", id));
      if (editingFinishedId === id) {
        setEditingFinishedId(null);
        setFinishedForm({ item: '', size: 'L', cartons: '', dozensPerCarton: '' });
      }
    }
  };

  // ================= 4. کاریگر اور اجرت (Workers / Payroll - Firebase Realtime) =================
  const [workers, setWorkers] = useState([]);
  const [workerForm, setWorkerForm] = useState({ empId: '', name: '', ratePerDozen: '', dozensMadeToday: '', advance: '' });
  const [editingWorkerId, setEditingWorkerId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "workers"), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkers(list);
    });
    return () => unsub();
  }, []);

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    if (!workerForm.name || !workerForm.ratePerDozen) return;

    try {
      if (editingWorkerId) {
        await updateDoc(doc(db, "workers", editingWorkerId), {
          empId: workerForm.empId || 'EMP',
          name: workerForm.name,
          ratePerDozen: parseFloat(workerForm.ratePerDozen) || 0,
          dozensMadeToday: parseFloat(workerForm.dozensMadeToday) || 0,
          advance: parseFloat(workerForm.advance) || 0
        });
        setEditingWorkerId(null);
      } else {
        await addDoc(collection(db, "workers"), {
          empId: workerForm.empId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
          name: workerForm.name,
          ratePerDozen: parseFloat(workerForm.ratePerDozen) || 0,
          dozensMadeToday: parseFloat(workerForm.dozensMadeToday) || 0,
          advance: parseFloat(workerForm.advance) || 0
        });
      }
      setWorkerForm({ empId: '', name: '', ratePerDozen: '', dozensMadeToday: '', advance: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditWorker = (worker) => {
    setEditingWorkerId(worker.id);
    setWorkerForm({
      empId: worker.empId,
      name: worker.name,
      ratePerDozen: worker.ratePerDozen,
      dozensMadeToday: worker.dozensMadeToday,
      advance: worker.advance
    });
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm("کیا آپ اس کاریگر کو لسٹ سے ڈیلیٹ کرنا چاہتے ہیں؟")) {
      await deleteDoc(doc(db, "workers", id));
      if (editingWorkerId === id) {
        setEditingWorkerId(null);
        setWorkerForm({ empId: '', name: '', ratePerDozen: '', dozensMadeToday: '', advance: '' });
      }
    }
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

  const netGradeADozens = Math.max(
    0,
    (parseFloat(formData.dozensProduced) || 0) - (parseFloat(formData.dozensDefective) || 0)
  );

  const totalWarehouseDozens = finishedStock.reduce((acc, curr) => acc + (curr.totalDozens || 0), 0);

  const handlePrint = () => {
    window.print();
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

        {/* ================= TAB 1: پروڈکشن فارم ================= */}
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

            <form onSubmit={(e) => { e.preventDefault(); setSuccessMessage('پروڈکشن محفوظ ہو گئی!'); setTimeout(() => setSuccessMessage(''), 3000); }} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">تاریخ (Date)</label>
                  <input
                    type="date"
                    name="productionDate"
                    value={formData.productionDate}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">کاریگر / آپریٹر</label>
                  <select
                    name="workerName"
                    value={formData.workerName}
                    onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl"
                  >
                    {workers.length === 0 ? (
                      <option value="">کوئی کاریگر دستیاب نہیں (کاریگر ٹیب سے شامل کریں)</option>
                    ) : (
                      workers.map((w) => (
                        <option key={w.id} value={w.empId}>{w.name} ({w.empId})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">دستانے کی قسم</label>
                  <select
                    name="gloveType"
                    value={formData.gloveType}
                    onChange={(e) => setFormData({ ...formData, gloveType: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, dozensProduced: e.target.value })}
                    placeholder="0"
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
                    onChange={(e) => setFormData({ ...formData, dozensDefective: e.target.value })}
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

        {/* ================= TAB 2: دھاگا انوینٹری (خام مال) ================= */}
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

            {/* نیا خام مال شامل یا ایڈیٹ کرنے کا فارم */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-base border-b pb-2">
                {editingRawId ? '✏️ خام مال تبدیل کریں' : '➕ نیا خام مال گودام میں شامل کریں'}
              </h3>
              <form onSubmit={handleRawSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">دھاگے/خام مال کا نام</label>
                  <input
                    type="text"
                    value={rawForm.name}
                    onChange={(e) => setRawForm({ ...rawForm, name: e.target.value })}
                    placeholder="مثلاً: وولن تھریڈ"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">آمد بورے (Bags)</label>
                  <input
                    type="number"
                    value={rawForm.initialBags}
                    onChange={(e) => setRawForm({ ...rawForm, initialBags: e.target.value })}
                    placeholder="10"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">وزن فی بورا (kg)</label>
                  <input
                    type="number"
                    value={rawForm.weightPerBagKg}
                    onChange={(e) => setRawForm({ ...rawForm, weightPerBagKg: e.target.value })}
                    placeholder="45"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow ${
                      editingRawId ? 'bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {editingRawId ? 'تخلیق اپڈیٹ کریں' : 'شامل کریں'}
                  </button>
                  {editingRawId && (
                    <button
                      type="button"
                      onClick={() => { setEditingRawId(null); setRawForm({ name: '', initialBags: '', weightPerBagKg: '', minLimitBags: '' }); }}
                      className="px-3 py-2.5 bg-slate-200 text-slate-700 text-xs rounded-xl font-bold"
                    >
                      منسوخ
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* خودکار مائنس والے بقایا خام مال کے کارڈز */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {initialThreads.length === 0 ? (
                <div className="md:col-span-3 text-center p-8 bg-white rounded-2xl border text-slate-400">
                  ابھی تک کوئی خام مال شامل نہیں کیا گیا اوپر والے فارم سے نیا مال شامل کریں۔
                </div>
              ) : (
                initialThreads.map((item) => {
                  const totalInitialKg = item.initialBags * item.weightPerBagKg;
                  const { totalIssuedBags, totalIssuedWeight } = calculateRemainingStock(item.name);
                  
                  const remainingBags = Math.max(0, item.initialBags - totalIssuedBags);
                  const remainingKg = Math.max(0, totalInitialKg - totalIssuedWeight);
                  const isLowStock = remainingBags <= (item.minLimitBags || 2);

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border bg-white shadow-sm transition-all ${
                        isLowStock ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                        <div className="flex gap-1 print:hidden">
                          <button
                            onClick={() => handleEditRaw(item)}
                            className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold border border-amber-300"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteRaw(item.id)}
                            className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold border border-rose-300"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

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
                })
              )}
            </div>

            {/* فیکٹری میں جاری کرنے کا فارم */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {editingIssueId ? '✏️ جاری کردہ دھاگے کا ریکارڈ تبدیل کریں' : 'فیکٹری کے لیے دھاگا جاری کریں (Issue Thread)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">یہاں جتنے بورے جاری کریں گے اوپر سے خودبخود مائنس ہو جائے گا</p>
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
                    value={issueForm.date}
                    onChange={(e) => setIssueForm({ ...issueForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">دھاگے کی قسم</label>
                  <select
                    value={issueForm.threadName}
                    onChange={(e) => setIssueForm({ ...issueForm, threadName: e.target.value })}
                    className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="">انتخاب کریں</option>
                    {initialThreads.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">جاری کردہ بورے</label>
                  <input
                    type="number"
                    step="0.5"
                    value={issueForm.bags}
                    onChange={(e) => setIssueForm({ ...issueForm, bags: e.target.value })}
                    placeholder="مثلاً: 2"
                    className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">جاری کردہ وزن (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={issueForm.weightKg}
                    onChange={(e) => setIssueForm({ ...issueForm, weightKg: e.target.value })}
                    placeholder="مثلاً: 90"
                    className="w-full p-2.5 bg-white border rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="md:col-span-4 mt-2 flex gap-2">
                  <button
                    type="submit"
                    className={`flex-1 py-3 text-white font-bold text-xs rounded-xl shadow print:hidden ${
                      editingIssueId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {editingIssueId ? '💾 تبدیل شدہ ریکارڈ محفوظ کریں' : '📤 دھاگا جاری کریں (Minus from Stock)'}
                  </button>
                  {editingIssueId && (
                    <button
                      type="button"
                      onClick={() => { setEditingIssueId(null); setIssueForm({ date: todayDate, threadName: '', bags: '', weightKg: '' }); }}
                      className="px-4 py-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl print:hidden"
                    >
                      منسوخ
                    </button>
                  )}
                </div>
              </form>

              {/* جاری شدہ لاگ */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b">
                      <th className="p-2.5">تاریخ</th>
                      <th className="p-2.5">دھاگے کا نام</th>
                      <th className="p-2.5">جاری بورے</th>
                      <th className="p-2.5">جاری وزن</th>
                      <th className="p-2.5 print:hidden">ایکشن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedLoading ? (
                      <tr><td colSpan="5" className="text-center p-4">لوڈ ہو رہا ہے...</td></tr>
                    ) : issuedThreads.length === 0 ? (
                      <tr><td colSpan="5" className="text-center p-4 text-slate-400">کوئی ریکارڈ موجود نہیں</td></tr>
                    ) : (
                      issuedThreads.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-slate-50/50">
                          <td className="p-2.5 text-slate-600">{item.date}</td>
                          <td className="p-2.5 font-bold text-slate-800">{item.threadName}</td>
                          <td className="p-2.5 font-black text-rose-600">-{item.bags} بورے</td>
                          <td className="p-2.5 font-black text-rose-600">-{item.weightKg} kg</td>
                          <td className="p-2.5 flex items-center gap-2 print:hidden">
                            <button onClick={() => handleEditIssue(item)} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold">✏️ ایڈیٹ</button>
                            <button onClick={() => handleDeleteIssue(item.id)} className="px-2 py-1 bg-rose-100 text-rose-800 rounded text-xs font-bold">🗑️ ڈیلیٹ</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: تیار شدہ مال ================= */}
        {activeTab === 'finished' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">تیار شدہ مال کا گودام Report</h2>
                <p className="text-slate-400 text-sm mt-1">پیکنگ، کارٹن اور درجنوں کا مکمل اسٹاک ({todayDate})</p>
              </div>
              <div className="text-left bg-indigo-600/30 border border-indigo-500/40 px-4 py-2 rounded-xl">
                <span className="text-xs text-indigo-200 block">کل گودام اسٹاک</span>
                <span className="text-xl font-black text-white">{totalWarehouseDozens} درجن</span>
              </div>
            </div>

            {/* نیا تیار شدہ مال فارم */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-base border-b pb-2">
                {editingFinishedId ? '✏️ تیار شدہ مال ایڈیٹ کریں' : '📦 نیا تیار شدہ مال گودام میں شامل کریں'}
              </h3>
              <form onSubmit={handleFinishedSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">آئٹم کا نام</label>
                  <input
                    type="text"
                    value={finishedForm.item}
                    onChange={(e) => setFinishedForm({ ...finishedForm, item: e.target.value })}
                    placeholder="مثلاً: وول ہاف"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">سائز</label>
                  <select
                    value={finishedForm.size}
                    onChange={(e) => setFinishedForm({ ...finishedForm, size: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">کارٹن / بورے</label>
                  <input
                    type="number"
                    value={finishedForm.cartons}
                    onChange={(e) => setFinishedForm({ ...finishedForm, cartons: e.target.value })}
                    placeholder="10"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">فی کارٹن (درجن)</label>
                  <input
                    type="number"
                    value={finishedForm.dozensPerCarton}
                    onChange={(e) => setFinishedForm({ ...finishedForm, dozensPerCarton: e.target.value })}
                    placeholder="20"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow ${
                      editingFinishedId ? 'bg-amber-600' : 'bg-indigo-600'
                    }`}
                  >
                    {editingFinishedId ? 'اپڈیٹ کریں' : 'شامل کریں'}
                  </button>
                  {editingFinishedId && (
                    <button
                      type="button"
                      onClick={() => { setEditingFinishedId(null); setFinishedForm({ item: '', size: 'L', cartons: '', dozensPerCarton: '' }); }}
                      className="px-3 py-2.5 bg-slate-200 text-slate-700 text-xs rounded-xl font-bold"
                    >
                      منسوخ
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* گودام اسٹاک لسٹ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {finishedStock.length === 0 ? (
                <div className="md:col-span-3 text-center p-8 bg-white rounded-2xl border text-slate-400">
                  کوئی بھی تیار شدہ مال موجود نہیں ہے اوپر والے فارم سے نیا آئٹم درج کریں۔
                </div>
              ) : (
                finishedStock.map((stock) => (
                  <div key={stock.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{stock.item}</h3>
                        <span className="inline-block mt-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 font-semibold text-xs rounded-md">
                          سائز: {stock.size}
                        </span>
                      </div>
                      <div className="flex gap-1 print:hidden">
                        <button onClick={() => handleEditFinished(stock)} className="p-1 bg-amber-100 text-amber-800 rounded text-xs font-bold border border-amber-300">✏️</button>
                        <button onClick={() => handleDeleteFinished(stock.id)} className="p-1 bg-rose-100 text-rose-800 rounded text-xs font-bold border border-rose-300">🗑️</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">کارٹن/بورے</span>
                        <span className="text-lg font-bold text-slate-800">{stock.cartons}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">فی کارٹن</span>
                        <span className="text-lg font-bold text-slate-800">{stock.dozensPerCarton}</span>
                      </div>
                      <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100">
                        <span className="text-[10px] text-indigo-600 block">کل درجن</span>
                        <span className="text-lg font-black text-indigo-700">{stock.totalDozens}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: کاریگر اور اجرت ================= */}
        {activeTab === 'payroll' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">کاریگروں کی روزانہ کی اجرت Report</h2>
                <p className="text-slate-400 text-sm mt-1">فی درجن ریٹ اور نیٹ ادائیگی کا حساب ({todayDate})</p>
              </div>
            </div>

            {/* کاریگر شامل کرنے کا فارم */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-base border-b pb-2">
                {editingWorkerId ? '✏️ کاریگر کا ریکارڈ تبدیل کریں' : '👤 نیا کاریگر شامل کریں'}
              </h3>
              <form onSubmit={handleWorkerSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">کاریگر کوڈ</label>
                  <input
                    type="text"
                    value={workerForm.empId}
                    onChange={(e) => setWorkerForm({ ...workerForm, empId: e.target.value })}
                    placeholder="EMP-101"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">نام</label>
                  <input
                    type="text"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                    placeholder="نام درج کریں"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ریٹ (فی درجن)</label>
                  <input
                    type="number"
                    value={workerForm.ratePerDozen}
                    onChange={(e) => setWorkerForm({ ...workerForm, ratePerDozen: e.target.value })}
                    placeholder="80"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">آج کی پروڈکشن</label>
                  <input
                    type="number"
                    value={workerForm.dozensMadeToday}
                    onChange={(e) => setWorkerForm({ ...workerForm, dozensMadeToday: e.target.value })}
                    placeholder="25"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ایڈوانس کٹوتی</label>
                  <input
                    type="number"
                    value={workerForm.advance}
                    onChange={(e) => setWorkerForm({ ...workerForm, advance: e.target.value })}
                    placeholder="0"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow ${
                      editingWorkerId ? 'bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {editingWorkerId ? 'اپڈیٹ کریں' : 'شامل کریں'}
                  </button>
                  {editingWorkerId && (
                    <button
                      type="button"
                      onClick={() => { setEditingWorkerId(null); setWorkerForm({ empId: '', name: '', ratePerDozen: '', dozensMadeToday: '', advance: '' }); }}
                      className="px-3 py-2.5 bg-slate-200 text-slate-700 text-xs rounded-xl font-bold"
                    >
                      منسوخ
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* کاریگروں کی فہرست */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workers.length === 0 ? (
                <div className="md:col-span-3 text-center p-8 bg-white rounded-2xl border text-slate-400">
                  کوئی کاریگر موجود نہیں ہے اوپر دیے گئے فارم سے نیا کاریگر درج کریں۔
                </div>
              ) : (
                workers.map((worker) => {
                  const totalGrossWage = (worker.dozensMadeToday || 0) * (worker.ratePerDozen || 0);
                  const netPayable = totalGrossWage - (worker.advance || 0);

                  return (
                    <div key={worker.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{worker.name}</h3>
                          <span className="text-xs text-slate-400 font-mono">{worker.empId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-bold border border-indigo-100">
                            {worker.ratePerDozen} روپے/درجن
                          </span>
                          <button onClick={() => handleEditWorker(worker)} className="p-1 bg-amber-100 text-amber-800 rounded text-xs font-bold border border-amber-300 print:hidden">✏️</button>
                          <button onClick={() => handleDeleteWorker(worker.id)} className="p-1 bg-rose-100 text-rose-800 rounded text-xs font-bold border border-rose-300 print:hidden">🗑️</button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                          <span>آج کی پروڈکشن:</span>
                          <span className="font-bold text-slate-800">{worker.dozensMadeToday || 0} درجن</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>کل اجرت (Gross):</span>
                          <span className="font-bold text-slate-800">{totalGrossWage} روپے</span>
                        </div>
                        <div className="flex justify-between text-rose-600">
                          <span>ایڈوانس کٹوتی:</span>
                          <span className="font-bold">-{worker.advance || 0} روپے</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-800">قابلِ ادائیگی (Net Pay):</span>
                        <span className="text-xl font-black text-emerald-700">{netPayable} روپے</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
