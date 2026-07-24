import React from 'react';

const ProgressBar = ({ progress = 0, label = '', success = 0, failed = 0, total = 0 }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300">
        <span>{label || 'Sending Batch SMS...'}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {total > 0 && (
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Success: {success}</span>
          <span className="text-rose-600 dark:text-rose-400 font-medium">✕ Failed: {failed}</span>
          <span>Total: {total}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
