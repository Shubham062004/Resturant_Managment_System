import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../../app/store';
import { useClearCart, useCart } from '../../cart/store/cartQueries';
import { useCustomerBranches } from '../store/catalogQueries';
import { selectBranch } from '../store/customerSlice';

export const BranchSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingBranch, setPendingBranch] = useState<any>(null);

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { selectedBranch } = useAppSelector((state) => state.customer);
  const { data: cart } = useCart();
  const { data: branchesRes, isLoading } = useCustomerBranches();
  const { mutate: clearCart } = useClearCart();

  const branches = branchesRes?.data || [];
  const cartItemCount = cart?.items?.length || 0;

  // Auto-select the first branch if none is selected
  useEffect(() => {
    if (!selectedBranch && branches.length > 0) {
      dispatch(selectBranch(branches[0]));
    }
  }, [branches, selectedBranch, dispatch]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBranchClick = (branch: any) => {
    setIsOpen(false);
    if (selectedBranch && branch.id === selectedBranch.id) return;

    if (cartItemCount > 0) {
      // Cart contains items from another branch
      setPendingBranch(branch);
      setShowConfirmModal(true);
    } else {
      // Cart is empty, change branch directly
      dispatch(selectBranch(branch));
    }
  };

  const handleConfirmChange = () => {
    if (pendingBranch) {
      clearCart();
      dispatch(selectBranch(pendingBranch));
    }
    setShowConfirmModal(false);
    setPendingBranch(null);
  };

  const handleCancelChange = () => {
    setShowConfirmModal(false);
    setPendingBranch(null);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || branches.length === 0}
        className="flex items-center gap-2 bg-[#1A1825]/90 border border-white/10 hover:border-primary/50 text-white font-medium px-4 py-2 rounded-xl transition-all duration-300 shadow-md group focus:outline-none"
      >
        <MapPin size={16} className="text-primary group-hover:scale-110 transition-transform duration-300" />
        <span className="text-sm font-semibold max-w-[120px] sm:max-w-[180px] truncate">
          {selectedBranch ? selectedBranch.name : 'Select Outlet'}
        </span>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0D0B14] border border-white/10 shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
          >
            <div className="p-3 bg-white/[0.02] border-b border-white/5">
              <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Select Outlet (Delhi NCR)</p>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-hide py-1">
              {branches.map((b: any) => {
                const isSelected = selectedBranch && b.id === selectedBranch.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleBranchClick(b)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 ${
                      isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-neutral-300 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{b.name}</span>
                      <span className="text-[11px] text-neutral-500 truncate mt-0.5 max-w-[200px]">{b.address}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Clear Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelChange}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#0F0D16] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <MapPin className="text-amber-400 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Change Delivery Location?</h3>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                Changing your branch to <span className="text-white font-semibold">{pendingBranch?.name}</span> will clear your current cart items from <span className="text-white font-semibold">{selectedBranch?.name}</span>. Do you want to continue?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelChange}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-neutral-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmChange}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-md shadow-primary/20"
                >
                  Clear Cart & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BranchSelector;
