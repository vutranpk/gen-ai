import React, { useState, useEffect } from 'react';
import { Button } from './Button';

// Augment window interface for the custom aistudio property
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [hasKey, setHasKey] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkKey = async () => {
    if (window.aistudio) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
      if (selected) {
        onKeySelected();
      }
    }
    setChecking(false);
  };

  useEffect(() => {
    checkKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success if no error thrown, per guidelines
        setHasKey(true);
        onKeySelected();
      } catch (error) {
        console.error("Key selection failed", error);
        // Reset if failed
        setHasKey(false);
      }
    }
  };

  if (checking) return null; // Or a loader

  if (hasKey) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="mb-6 flex justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 11l-2.678 2.678a2 4.636 4.636 0 01-1.745 1.12l-1.99.664a1 1 0 01-1.33-1.33l.664-1.99a4.636 4.636 0 011.12-1.745L8.257 8.257A6 6 0 0114 8h5z" />
            </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">API Key Required</h2>
        <p className="text-slate-500 mb-6 text-[16px]">
          To use AI image generation features, you need to connect an API Key from your Google Cloud project.
        </p>
        
        <Button onClick={handleSelectKey} className="w-full justify-center py-3 text-lg">
          Select API Key
        </Button>
        
        <p className="mt-4 text-[13px] text-slate-500">
           Need help? <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">View billing documentation</a>
        </p>
      </div>
    </div>
  );
};