import React, { useState } from 'react';
import { FileCode, Plus, CheckCircle2, Smartphone, Send, Sparkles, Trash2 } from 'lucide-react';
import { WhatsAppTemplate } from '../types';

interface TemplatesModuleProps {
  templates: WhatsAppTemplate[];
  onCreateTemplate: (tpl: Partial<WhatsAppTemplate>) => void;
  onDeleteTemplate?: (id: string) => void;
}

export const TemplatesModule: React.FC<TemplatesModuleProps> = ({
  templates,
  onCreateTemplate,
  onDeleteTemplate,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'UTILITY' | 'MARKETING' | 'AUTHENTICATION'>('UTILITY');
  const [headerText, setHeaderText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [button1, setButton1] = useState('');
  const [button2, setButton2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !bodyText) return;

    const buttons = [];
    if (button1) buttons.push({ type: 'QUICK_REPLY' as const, text: button1 });
    if (button2) buttons.push({ type: 'QUICK_REPLY' as const, text: button2 });

    onCreateTemplate({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      category,
      language: 'en_US',
      headerType: headerText ? 'TEXT' : undefined,
      headerText,
      bodyText,
      footerText,
      buttons,
    });

    setShowCreateModal(false);
    setName('');
    setHeaderText('');
    setBodyText('');
    setFooterText('');
    setButton1('');
    setButton2('');
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-teal-400" />
            Meta WhatsApp Template Builder
          </h1>
          <p className="text-xs text-slate-400">
            Create Meta-approved WhatsApp Business message templates with variables, buttons, and instant validation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-500 shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Build New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300 text-xs font-mono">{tpl.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    {tpl.status}
                  </span>
                  {onDeleteTemplate && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete WhatsApp template '${tpl.name}'?`)) {
                          onDeleteTemplate(tpl.id);
                        }
                      }}
                      title="Delete Template"
                      className="p-1 rounded bg-rose-950/40 text-rose-400 hover:bg-rose-900/60 border border-rose-800/40 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Phone Preview Mock */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 font-sans">
                {tpl.headerText && (
                  <p className="font-bold text-slate-100">{tpl.headerText}</p>
                )}
                <p className="text-slate-300 leading-relaxed">{tpl.bodyText}</p>
                {tpl.footerText && (
                  <p className="text-[10px] text-slate-500">{tpl.footerText}</p>
                )}

                {tpl.buttons && tpl.buttons.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    {tpl.buttons.map((btn, idx) => (
                      <div
                        key={idx}
                        className="w-full text-center py-1.5 rounded bg-slate-900 text-teal-300 text-[11px] font-semibold border border-slate-800"
                      >
                        {btn.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              <span>Category: {tpl.category}</span>
              <span>Language: {tpl.language}</span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Build Interactive WhatsApp Template
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. order_shipment_update"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Header Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Order Shipment #{{1}}"
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Body Text (with &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; variables)</label>
                <textarea
                  rows={3}
                  placeholder="Hi {{1}}, your order #{{2}} is out for delivery..."
                  required
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Footer Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ansury Notifications"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Button 1 (e.g. Open Inbox)"
                  value={button1}
                  onChange={(e) => setButton1(e.target.value)}
                  className="bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700"
                />
                <input
                  type="text"
                  placeholder="Button 2 (e.g. Contact Rep)"
                  value={button2}
                  onChange={(e) => setButton2(e.target.value)}
                  className="bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs"
              >
                Save & Auto-Approve Template
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
