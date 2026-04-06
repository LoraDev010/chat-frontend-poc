import { useState, type FormEvent } from 'react';

interface AliasScreenProps {
  onJoin: (alias: string) => void;
}

export function AliasScreen({ onJoin }: AliasScreenProps) {
  const [alias, setAlias] = useState('');

  const join = (e: FormEvent) => {
    e.preventDefault();
    const a = alias.trim();
    if (!a) return;
    onJoin(a);
  };

  return (
    <div className="page center">
      <form onSubmit={join} className="card">
        <h2>Entra con un alias</h2>
        <input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Tu alias" maxLength={32} />
        <button type="submit">Entrar al chat</button>
      </form>
    </div>
  );
}
