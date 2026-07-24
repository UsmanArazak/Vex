import React, { useState, useRef } from 'react';
import { exportData, importData, clearAllData } from '../utils/storage';
import CategoriesListModal from '../components/CategoriesListModal';

const Settings = () => {
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Export Data
  const handleExport = () => {
    const data = exportData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vex_wallet_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clear Data
  const handleClearData = () => {
    if (window.confirm("WARNING! Are you absolutely sure you want to delete ALL your transactions, goals, and custom categories? This action CANNOT be undone.")) {
      if (window.confirm("Final confirmation: Are you sure?")) {
        clearAllData();
        alert('All data has been cleared. The app will now reload.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="p-6 pt-12 pb-24 space-y-8">
      <h1 className="text-3xl font-bold text-brand-charcoal mb-8">Settings</h1>

      {/* Categories */}
      <section>
        <h2 className="font-bold text-xl mb-4">Categories</h2>
        <div className="card border border-gray-100 shadow-sm p-5">
          <p className="text-sm text-gray-500 mb-4">Add, edit or delete your spending and income categories.</p>
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Manage Categories
          </button>
        </div>
      </section>

      {/* Data Backup */}
      <section>
        <h2 className="font-bold text-xl mb-4">Data Backup</h2>
        <div className="card space-y-3 shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-2">Your data is stored locally. Export regularly to avoid losing it.</p>

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

      <CategoriesListModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
