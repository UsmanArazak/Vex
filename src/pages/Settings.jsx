import React, { useState, useRef } from 'react';
import { getCategories, exportData, importData, clearAllData } from '../utils/storage';
import CategoryModal from '../components/CategoryModal';

const Settings = () => {
  const [categories, setCategories] = useState(getCategories());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  
  const fileInputRef = useRef(null);

  const refreshCategories = () => {
    setCategories(getCategories());
  };

  const openEditCategory = (cat) => {
    setActiveCategory(cat);
    setIsCategoryModalOpen(true);
  };

  // Export Data
  const handleExport = () => {
    const data = exportData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vex_wallet_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Import Data
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        importData(jsonData);
        alert('Data imported successfully! The app will now reload.');
        window.location.reload();
      } catch (err) {
        alert('Failed to import data. Make sure the file is a valid backup JSON.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear Data
  const handleClearData = () => {
    if (window.confirm("WARNING! Are you absolutely sure you want to delete ALL your transactions, goals, and custom categories? This action CANNOT be undone.")) {
      if (window.confirm("Final confirmation: Type OK to proceed or Cancel to abort.")) {
        clearAllData();
        alert('All data has been cleared. The app will now reload.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-6 pt-12 pb-24 space-y-8">
      <h1 className="text-3xl font-bold text-brand-charcoal mb-8">Settings</h1>

      {/* Categories Management */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Categories</h2>
          <button 
            onClick={() => { setActiveCategory(null); setIsCategoryModalOpen(true); }}
            className="text-brand-charcoal bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-200"
          >
            + Add New
          </button>
        </div>
        
        <div className="card p-0 overflow-hidden border border-gray-100 shadow-sm">
          <div className="max-h-64 overflow-y-auto hide-scrollbar">
            {categories.map((cat, idx) => (
              <div 
                key={cat.id} 
                className={`flex justify-between items-center p-4 ${idx !== categories.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shadow-sm" style={{ backgroundColor: cat.color }}>
                    {cat.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-brand-charcoal">{cat.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{cat.type}</p>
                  </div>
                </div>
                <button onClick={() => openEditCategory(cat)} className="text-sm text-brand-gold font-bold p-2 hover:bg-gray-50 rounded-lg">
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section>
        <h2 className="font-bold text-xl mb-4">Data Backup</h2>
        <div className="card space-y-4 shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-4">Your data is stored locally on your device. Export it regularly to avoid losing it if you clear your browser data.</p>
          
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Backup (JSON)
          </button>
          
          <div className="relative">
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef}
              onChange={handleImport} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 text-brand-charcoal font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import Backup (JSON)
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="font-bold text-xl mb-4 text-red-500">Danger Zone</h2>
        <div className="card shadow-sm border border-red-100 p-5 bg-red-50/30">
          <button 
            onClick={handleClearData}
            className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-200 transition-colors"
          >
            Clear All App Data
          </button>
        </div>
      </section>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialData={activeCategory}
        onSaved={refreshCategories}
      />
    </div>
  );
};

export default Settings;
