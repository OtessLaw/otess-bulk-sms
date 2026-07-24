import React from 'react';
import { Tag } from 'lucide-react';

const VariableTags = ({ onInsertTag }) => {
  const tags = [
    { label: '{{name}}', description: 'Agent/Contact Name' },
    { label: '{{phone}}', description: 'Phone Number' },
    { label: '{{email}}', description: 'Email Address' },
    { label: '{{group}}', description: 'Group Name' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 my-2">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <Tag className="w-3.5 h-3.5" /> Insert Variable:
      </span>
      {tags.map((tag) => (
        <button
          key={tag.label}
          type="button"
          onClick={() => onInsertTag(tag.label)}
          title={`Insert ${tag.description}`}
          className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900 transition"
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
};

export default VariableTags;
