
import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Download, Trash2, ExternalLink } from 'lucide-react';

interface HistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({ items, onSelect, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Clock className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">No shoot history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent History</h3>
        <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">{items.length} images</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <img 
              src={item.url} 
              alt="History item" 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all">
               <span className="text-[8px] font-black text-white uppercase tracking-tighter truncate max-w-[60%]">
                 {item.metadata.vibe} • {item.metadata.sceneMode === 'still-life' ? 'Product Only' : item.metadata.sceneMode === 'ghost' ? 'Ghost Mannequin' : 'Model'}
               </span>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-rose-500 transition-colors"
               >
                 <Trash2 className="w-3 h-3" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
