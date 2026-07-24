import React from 'react';
import { Smartphone, CheckCircle } from 'lucide-react';

const LivePreview = ({
  rawMessage = '',
  sampleName = 'Lawrence',
  samplePhone = '233240000000',
  sampleEmail = 'lawrence@otessdata.com',
  sampleGroup = 'Agents',
  senderId = 'OTESS DATA'
}) => {
  // Replace variables live as the user types
  const renderedMessage = rawMessage
    ? rawMessage
        .replace(/\{\{name\}\}/gi, sampleName)
        .replace(/\{\{phone\}\}/gi, samplePhone)
        .replace(/\{\{email\}\}/gi, sampleEmail)
        .replace(/\{\{group\}\}/gi, sampleGroup)
    : 'Hello ' + sampleName + '\n\nWe are pleased to inform you that our MTN service is now fully stable.\n\nThank you for your patience.\n\nOTESS DATA';

  // Calculate character length and SMS page count
  const charCount = renderedMessage.length;
  const isUnicode = /[^\x00-\x7F]/.test(renderedMessage);
  const charsPerSegment = isUnicode ? 70 : 160;
  const segments = Math.ceil(charCount / charsPerSegment) || 1;

  return (
    <div className="glass-card p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-xl max-w-sm mx-auto">
      {/* Phone Header Mockup */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-300">Live SMS Preview</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
          {senderId}
        </span>
      </div>

      {/* Message Chat Bubble */}
      <div className="bg-slate-800/90 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-100 leading-relaxed font-sans shadow-inner whitespace-pre-wrap border border-slate-700">
        {renderedMessage}
        <div className="mt-2 text-[10px] text-slate-400 text-right flex items-center justify-end gap-1">
          <span>Now</span>
          <CheckCircle className="w-3 h-3 text-brand-400 inline" />
        </div>
      </div>

      {/* SMS Metadata Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
        <span>Chars: <strong className="text-white">{charCount}</strong></span>
        <span>Segments: <strong className="text-brand-400">{segments} SMS</strong> ({charsPerSegment} char/SMS)</span>
      </div>
    </div>
  );
};

export default LivePreview;
