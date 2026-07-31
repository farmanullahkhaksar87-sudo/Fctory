import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import ProductionForm from './ProductionForm.jsx'
import ThreadInventory from './ThreadInventory.jsx'

function MainApp() {
  const [activeTab, setActiveTab] = useState('production');

  return (
    <div>
      {/* نیویگیشن ٹیبز */}
      <div className="bg-slate-900 p-2 flex justify-center gap-2" dir="rtl">
        <button
          onClick={() => setActiveTab('production')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'production' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. پروڈکشن فارم
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'inventory' 
              ? 'bg-indigo-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. تھریڈ انوینٹری
        </button>
      </div>

      {/* فعال پیج */}
      {activeTab === 'production' ? <ProductionForm /> : <ThreadInventory />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
)
