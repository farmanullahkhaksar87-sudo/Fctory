import React, { useState } from 'react';

export default function ProductionForm() {
  // فارم کی بنیادی اسٹیٹ (Data State)
  const [formData, setFormData] = useState({
    batchNumber: 'BATCH-2026-081',
    workerName: '',
    gloveType: 'cotton_knitted',
    size: 'L',
    pairsProduced: '',
    pairsDefective: 0,
    machineId: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // انپٹ چینج ہینڈلر
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // فارم سبمٹ ہینڈلر
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    // یہاں API (Backend) پر ڈیٹا بھیجا جائے گا
    setTimeout(() => {
      console.log('Production Data Submitted:', formData);
      setIsSubmitting(false);
      setSuccessMessage('روزانہ کی پروڈکشن کا اندراج کامیا بی سے ہو گیا ہے!');
      
      // فارم کو ری سیٹ کریں
      setFormData({
        batchNumber: 'BATCH-2026-082',
        workerName: '',
        gloveType: 'cotton_knitted',
        size: 'L',
        pairsProduced: '',
        pairsDefective: 0,
        machineId: '',
        notes: '',
      });
    }, 1000);
  };

  // خالص بچت (Grade A) کا حساب
  const netGradeAPairs = Math.max(
    0,
    (parseInt(formData.pairsProduced) || 0) - (parseInt(formData.pairsDefective) || 0)
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* فارم ہیڈر */}
        <div className="bg-indigo-700 p-6 text-white text-right">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">روزانہ کی پروڈکشن کا اندراج</h2>
            <span className="bg-indigo-800 text-indigo-200 text-xs px-3 py-1 rounded-full font-mono">
              کلاؤڈ سنک فعال ہے
            </span>
          </div>
          <p className="text-indigo-200 text-sm mt-1">
            دستانوں کی تیاری اور ڈیفیکٹس کی تفصیلا ت درج کریں
          </p>
        </div>

        {/* کامیاب سبمیشن کا الرٹ */}
        {successMessage && (
          <div className="m-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between">
            <span className="font-semibold">{successMessage}</span>
            <button 
              onClick={() => setSuccessMessage('')}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* اہم فارم */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* بیچ نمبر */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                بیچ نمبر (Batch Number)
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-left"
                dir="ltr"
              />
            </div>

            {/* کاریگر کا نام / کوڈ */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                کاریگر / آپریٹر کا نام
              </label>
              <select
                name="workerName"
                value={formData.workerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">کاریگر منتخب کریں...</option>
                <option value="EMP-101">محمد علی (EMP-101)</option>
                <option value="EMP-102">عثمان خان (EMP-102)</option>
                <option value="EMP-103">بلال احمد (EMP-103)</option>
              </select>
            </div>

            {/* دستانے کی قسم */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                دستانے کی قسم (Glove Category)
              </label>
              <select
                name="gloveType"
                value={formData.gloveType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="cotton_knitted">کاٹن نٹڈ (Cotton Knitted)</option>
                <option value="coated_dipped">لیٹیکس کوٹڈ (Dipped Latex)</option>
                <option value="cut_resistant">کٹ ریسسٹنٹ (Cut Resistant)</option>
                <option value="leather_driver">لیڈر ڈرائیور (Leather Driver)</option>
              </select>
            </div>

            {/* سائز (Size) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                سائز (Size)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['S', 'M', 'L', 'XL'].map((sizeOption) => (
                  <button
                    key={sizeOption}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: sizeOption })}
                    className={`py-3 rounded-xl border font-bold text-center transition-all ${
                      formData.size === sizeOption
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            </div>

            {/* کل تیار کردہ جوڑے */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                کل تیار کردہ جوڑے (Total Pairs)
              </label>
              <input
                type="number"
                name="pairsProduced"
                value={formData.pairsProduced}
                onChange={handleChange}
                placeholder="مثلاً 120"
                min="1"
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-lg font-bold"
              />
            </div>

            {/* خراب یا ڈیفیکٹو جوڑے */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                خراب / ڈیفیکٹو جوڑے (Defects)
              </label>
              <input
                type="number"
                name="pairsDefective"
                value={formData.pairsDefective}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-lg font-bold text-rose-600"
              />
            </div>

            {/* مشین نمبر */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                مشین کا انتخاب (Machine No.)
              </label>
              <select
                name="machineId"
                value={formData.machineId}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">مشین منتخب کریں...</option>
                <option value="M-01">مشین #01 (7-Gauge Knitting)</option>
                <option value="M-02">مشین #02 (7-Gauge Knitting)</option>
                <option value="M-10">مشین #10 (Automatic Stitching)</option>
                <option value="M-12">مشین #12 (Dipping Line)</option>
              </select>
            </div>

          </div>

          {/* لائیو ویلیو سمیلیٹر / سمری (Grade A Calculation) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">کوالٹی مال (Grade A Pairs)</span>
              <span className="text-2xl font-black text-emerald-600">
                {netGradeAPairs} <span className="text-sm font-normal text-slate-600">جوڑے</span>
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 block">ڈیفیکٹ کی شرح</span>
              <span className="text-sm font-bold text-rose-500">
                {formData.pairsProduced > 0
                  ? ((formData.pairsDefective / formData.pairsProduced) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>

          {/* اینٹری بٹن */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? 'اینٹری محفوظ ہو رہی ہے...' : 'پروڈکشن محفوظ کریں'}
          </button>

        </form>

      </div>
    </div>
  );
}

