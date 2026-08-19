import React, { useState } from 'react';
import { Layers, Copy, Check, Sparkles, MessageSquare, Code } from 'lucide-react';
import { EnterpriseBrandConfig } from '../types';

interface ChatWidgetCustomizerProps {
  brand: EnterpriseBrandConfig;
}

export const ChatWidgetCustomizer: React.FC<ChatWidgetCustomizerProps> = ({ brand }) => {
  const [primaryColor, setPrimaryColor] = useState(brand.primaryColor || '#0f766e');
  const [greeting, setGreeting] = useState('Welcome to Ansury Enterprise Support! How can we help?');
  const [copied, setCopied] = useState(false);

  const snippetCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['AnsuryObject']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','ansury','https://${brand.customDomain}/widget.js'));
  ansury('init', {
    brandName: '${brand.brandName}',
    primaryColor: '${primaryColor}',
    greeting: '${greeting}'
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-950 text-slate-100 p-6 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-400" />
          Embeddable Live Chat Widget Customizer
        </h1>
        <p className="text-xs text-slate-400">
          Customize the appearance, greeting, and theme of the Ansury live chat widget for your website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h3 className="font-bold text-slate-100 text-sm">Widget Customization</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Widget Brand Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-slate-200">{primaryColor}</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Welcome Greeting Message</label>
              <textarea
                rows={3}
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                <Code className="w-4 h-4 text-teal-400" />
                HTML Embed Code Snippet
              </span>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold flex items-center gap-1 hover:bg-teal-500"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Snippet!' : 'Copy Snippet'}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[10px] overflow-x-auto border border-slate-800">
              {snippetCode}
            </pre>
          </div>
        </div>

        {/* Live Interactive Preview Mock */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl flex flex-col items-center justify-center relative min-h-[350px]">
          <span className="absolute top-4 left-4 text-xs font-semibold text-slate-400">
            Live Widget Visual Preview
          </span>

          <div className="w-72 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
            <div
              style={{ backgroundColor: primaryColor }}
              className="p-4 text-white space-y-1"
            >
              <h4 className="font-bold text-sm">{brand.brandName || 'Ansury Support'}</h4>
              <p className="text-[10px] opacity-90">Online • Typically replies instantly</p>
            </div>
            <div className="p-4 space-y-3 min-h-[140px] text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs leading-relaxed max-w-[85%]">
                {greeting}
              </div>
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900 flex items-center justify-between text-xs text-slate-500">
              <span>Type a message...</span>
              <span className="p-2 rounded-full text-white" style={{ backgroundColor: primaryColor }}>
                <MessageSquare className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
