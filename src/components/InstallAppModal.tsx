import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Download,
  Share,
  PlusSquare,
  QrCode,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Disc3,
  CheckCircle2,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'qr'>(isIOS ? 'ios' : 'android');

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#14141a] border border-[#1db954]/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1db954] to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-black">
              <Smartphone className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                Install SoundVibe on Phone
                <span className="text-[10px] font-bold bg-[#1db954]/20 text-[#1db954] px-2 py-0.5 rounded-full border border-[#1db954]/30">
                  PWA APP
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Install as a native full-screen app with offline caching and background audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Tap Native Install Button (if browser triggered beforeinstallprompt) */}
        {isInstallable && !isInstalled && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-[#1db954]/40 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Direct Installation Ready</div>
              <div className="text-[11px] text-zinc-400">One tap to add directly to your app launcher</div>
            </div>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1db954] hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Install App Now
            </button>
          </div>
        )}

        {/* Tab Selectors */}
        <div className="flex border-b border-white/5 bg-zinc-950/50 px-6 pt-3">
          <button
            onClick={() => setActiveTab('android')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'android'
                ? 'border-[#1db954] text-[#1db954]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Android (Chrome / Samsung)
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'ios'
                ? 'border-[#1db954] text-[#1db954]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            iPhone / iPad (iOS Safari)
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'border-[#1db954] text-[#1db954]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Scan QR Code
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300 font-medium leading-relaxed">
                To install SoundVibe on any Android phone (Chrome, Samsung Internet, Edge):
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs text-zinc-200">
                    Open this app in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your phone.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs text-zinc-200">
                    Tap the <strong>three vertical dots (⋮)</strong> menu in the top-right corner of Chrome.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs text-zinc-200">
                    Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400">
                The SoundVibe app icon will appear on your home screen and run in clean full-screen standalone mode without browser bars!
              </p>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300 font-medium leading-relaxed">
                To install SoundVibe on iPhone or iPad (iOS Safari):
              </div>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div className="text-xs text-zinc-200">
                    Open this URL in <strong>Safari</strong> on your iPhone.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div className="text-xs text-zinc-200 flex items-center gap-1.5 flex-wrap">
                    Tap the <strong>Share</strong> button
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-blue-400 font-mono text-[11px] inline-flex items-center gap-1">
                      <Share className="w-3 h-3" /> (Square with arrow)
                    </span>
                    in the bottom toolbar.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div className="text-xs text-zinc-200 flex items-center gap-1.5 flex-wrap">
                    Scroll down and tap <strong>"Add to Home Screen"</strong>
                    <PlusSquare className="w-3.5 h-3.5 text-zinc-400 inline" />.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/70 border border-white/5">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div className="text-xs text-zinc-200">
                    Tap <strong>Add</strong> in the top-right corner.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center p-4 text-center space-y-3">
              <div className="p-4 rounded-2xl bg-white shadow-xl">
                {/* SVG QR Code Simulation with Center Icon */}
                <div className="w-44 h-44 bg-white flex flex-col items-center justify-center relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      appUrl
                    )}`}
                    alt="Scan QR code on phone"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-300 font-medium">
                Point your phone's camera at this QR code to open SoundVibe instantly on mobile!
              </p>
            </div>
          )}

          {/* Copy App URL bar */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 flex items-center gap-3">
            <div className="text-xs text-zinc-400 truncate flex-1 font-mono">{appUrl}</div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1db954] hover:bg-emerald-400 text-black font-extrabold text-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
