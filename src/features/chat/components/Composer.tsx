import { useState, useRef, type FormEvent } from 'react';
import { EmojiPicker } from './EmojiPicker';

interface ComposerProps {
  onSend: (text: string) => void;
  onTyping: () => void;
}

export function Composer({ onSend, onTyping }: ComposerProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping();
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    const start = input ? input.selectionStart ?? text.length : text.length;
    const end = input ? input.selectionEnd ?? text.length : text.length;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    setTimeout(() => {
      if (input) {
        input.focus();
        const pos = start + emoji.length;
        input.setSelectionRange(pos, pos);
      }
    }, 0);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  return (
    <form onSubmit={send} className="composer">
      <EmojiPicker onSelect={insertEmoji} />
      <input
        ref={inputRef}
        value={text}
        onChange={handleTextChange}
        maxLength={1000}
        placeholder="Escribe un mensaje…"
        autoComplete="off"
      />
      <button type="submit">Enviar</button>
    </form>
  );
}
