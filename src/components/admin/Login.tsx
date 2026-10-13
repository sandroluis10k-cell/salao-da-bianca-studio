import { useEffect, useState, type FormEvent } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { salonConfig } from '../../salonConfig';
import { admin } from '../../agendaApi';
import { Button, Card, Field, Input } from './ui';

/** Tela de entrada: cria a senha no primeiro acesso ou pede a senha */
export const Login = ({ onReady }: { onReady: (pin: string) => void }) => {
  const [mode, setMode] = useState<'loading' | 'setup' | 'login'>('loading');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    admin
      .status()
      .then((s) => setMode(s === 'pronto' ? 'login' : 'setup'))
      .catch(() => setErr('Sem conexão com a agenda. Verifique a internet.'));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (mode === 'setup') {
        if (pin.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        if (pin !== pin2) throw new Error('As senhas não são iguais.');
        const r = await admin.setup(pin);
        if (r !== 'ok') throw new Error('A senha já foi criada. Entre com ela.');
        onReady(pin);
      } else {
        const r = await admin.login(pin);
        if (r === 'ok') onReady(pin);
        else if (r === 'bloqueado') throw new Error('Muitas tentativas erradas. Espere 15 minutos.');
        else throw new Error('Senha incorreta.');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-brand-black px-4 py-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-brand-pink/15 blur-[120px]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <img src={salonConfig.logoPath} alt="" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10 shadow-[0_12px_40px_-12px_rgba(232,138,162,0.6)]" />
          <h1 className="mt-5 font-display text-[28px] leading-tight text-white">Painel da Bianca</h1>
          <p className="mt-1.5 text-sm text-white/55">
            {mode === 'setup' ? 'Primeiro acesso: crie a sua senha.' : 'Entre para ver sua agenda e seu faturamento.'}
          </p>
        </div>
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label={mode === 'setup' ? 'Nova senha' : 'Senha'}>
              <Input
                type="password"
                placeholder={mode === 'setup' ? 'Mínimo de 6 caracteres' : '••••••'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                autoFocus
              />
            </Field>
            {mode === 'setup' && (
              <Field label="Repita a senha">
                <Input type="password" value={pin2} onChange={(e) => setPin2(e.target.value)} autoComplete="new-password" />
              </Field>
            )}
            {err && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{err}</p>}
            <Button variant="primary" className="w-full" loading={busy} disabled={mode === 'loading'}>
              {!busy && <Lock className="h-4 w-4" />} {mode === 'setup' ? 'Criar senha e entrar' : 'Entrar'}
            </Button>
          </form>
        </Card>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-white/35">
          <ShieldCheck className="h-3.5 w-3.5" /> Acesso restrito à Bianca
        </p>
      </div>
    </div>
  );
};
