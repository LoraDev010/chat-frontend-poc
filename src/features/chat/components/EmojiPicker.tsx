import { useState, useEffect, useRef } from 'react';
import { Smile } from 'lucide-react';
import { EMOJI_CATEGORIES } from '../types/chat.types';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [show, setShow] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    if (show) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  return (
    <div className="emoji-wrapper" ref={pickerRef}>
      <button
        type="button"
        className="emoji-toggle-btn"
        onClick={() => setShow((v) => !v)}
        title="Emojis"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Smile size={20} />
      </button>
      {show && (
        <div className="emoji-picker">
          <div className="emoji-categories">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                type="button"
                className={`emoji-cat-btn${activeCategory === i ? ' active' : ''}`}
                onClick={() => setActiveCategory(i)}
              >{cat.label}</button>
            ))}
          </div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="emoji-item"
                onClick={() => onSelect(emoji)}
              >{emoji}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
