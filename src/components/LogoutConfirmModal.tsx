import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
        <div className="flex items-center space-x-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Logout</h3>
            <p className="text-xs text-slate-500">OHB IRB System Authentication Session</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 font-medium">
          Are you sure you want to log out?
        </p>

        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
          Logging out will end your current active session, revoke authorization tokens, and return you to the sign-in screen.
        </p>

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
