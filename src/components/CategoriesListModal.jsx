import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCategories, deleteCategory } from '../utils/storage';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import CategoryModal from './CategoryModal';

const CategoriesListModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const confirm = useConfirm();
  const toast = useToast();

  // Refresh categories every time this modal opens
  useEffect(() => {
    if (isOpen) {
      refreshCategories();
    }
  }, [isOpen]);

  const refreshCategories = async () => {
    setCategories(await getCategories());
  };

  const handleEdit = (cat) => {
    setActiveCategory(cat);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Delete category?',
      message: "Transactions using this category won't be deleted, but they might show as 'Other'.",
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await deleteCategory(id);
    toast.success('Category deleted');
    refreshCategories();
  };

  const handleAddNew = () => {
    setActiveCategory(null);
    setIsEditModalOpen(true);
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[140] flex items-end sm:items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm animate-toast-in" onClick={onClose}>
        <div
          className="bg-white dark:bg-brand-darkCard rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md shadow-2xl h-[80vh] sm:h-auto sm:max-h-[80vh] flex flex-col animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-xl font-bold">Manage Categories</h2>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-brand-darkBorder rounded-full text-gray-500 dark:text-gray-400 hover:text-brand-charcoal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <button 
            onClick={handleAddNew}
            className="w-full bg-brand-gold text-brand-charcoal dark:text-white font-bold py-3 rounded-xl mb-4 shrink-0 shadow-sm"
          >
            + Add New Category
          </button>

          <div className="flex-1 overflow-y-auto hide-scrollbar pb-10">
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
                    <p className="font-bold text-sm text-brand-charcoal dark:text-white">{cat.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{cat.type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(cat)} className="text-sm text-gray-500 dark:text-gray-300 hover:text-brand-charcoal dark:hover:text-white p-2 rounded-lg bg-gray-50 dark:bg-brand-darkBorder hover:bg-gray-100 dark:hover:bg-opacity-70">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="text-sm text-red-400 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50">
                    Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialData={activeCategory}
        onSaved={refreshCategories}
      />
    </>,
    document.body
  );
};

export default CategoriesListModal;
