import { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, ChevronLeft, Copy, Gift, Plus, RotateCw, Smartphone, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, jsonBody } from './services/api.js';
import { LanguageSwitcher, useLanguage } from './LanguageContext.jsx';

const money = (amount) => `${Number(amount ?? 0).toFixed(2)} ETB`;
const wheelColors = ['#e6bd56', '#236866', '#e98653', '#819b5a', '#bf6794', '#4d7caa', '#b78349', '#466a57', '#ba6454', '#647a9e', '#d1a83e', '#397b78'];
const displayOnlyPrizes = [
  { label: '50 ETB', amount: 50 },
  { label: '100 ETB', amount: 100 },
  { label: '1,000 ETB', amount: 1000 },
  { label: '10,000 ETB', amount: 10000 },
  { label: 'iPhone', icon: Smartphone },
  { label: 'Android', icon: Bot },
];

function formatAmountDisplay(amount) {
  const numeric = Number(amount ?? 0);
  return `${numeric.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ETB`;
}

function GiftCodeModal({ onClose, onAwarded }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function redeem(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const result = await api('/promotions/gifts/redeem', {
        method: 'POST',
        ...jsonBody({ code }),
      });
      setSuccess(`Gift claimed: ${money(result.amount)} added to your wallet.`);
      setCode('');
      onAwarded().catch(() => setError('Gift claimed successfully, but your wallet balance could not refresh. Reload the page to see it.'));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className='promotion-modal-backdrop' role='presentation' onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className='promotion-modal' role='dialog' aria-modal='true' aria-labelledby='gift-code-title'>
        <button className='promotion-modal-close' type='button' onClick={onClose} aria-label='Close gift code dialog'><X size={18} /></button>
        <p className='eyebrow'>A GIFT FOR YOU</p>
        <h2 id='gift-code-title'>Redeem a gift code</h2>
        <p>Enter a code shared by Online Trade to claim its wallet reward. Each code can be used once per account, while supplies last.</p>
        <form className='promotion-form' onSubmit={redeem}>
          <label className='field'>
            <span>Gift code</span>
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} autoComplete='off' maxLength={32} placeholder='Enter your code' required />
          </label>
          {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
          {success && <p className='promotion-feedback is-success' role='status'>{success}</p>}
          <button className='primary-button' type='submit' disabled={busy || !code.trim()}>{busy ? 'Checking code…' : 'Redeem gift'}<Gift size={16} /></button>
        </form>
      </section>
    </div>
  );
}

function GiftCodeButton({ onAwarded }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className='overview-gift-button' type='button' onClick={() => setOpen(true)} aria-label='Redeem a gift code' title='Redeem a gift code'>
        <Gift size={22} />
      </button>
      {open && <GiftCodeModal onClose={() => setOpen(false)} onAwarded={onAwarded} />}
    </>
  );
}

export function CustomerPromotions({ onAwarded = async () => {}, display = 'full' }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [wheel, setWheel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(display !== 'tile');
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [clock, setClock] = useState(Date.now());
  const selectedSpin = wheel?.availableSpins?.[0] ?? null;
  const displayedSpinType = selectedSpin?.spinType ?? result?.spinType ?? wheel?.spinHistory?.[0]?.spinType ?? 'SIGNUP';
  const prizes = displayedSpinType ? wheel?.pools?.[displayedSpinType] ?? [] : [];
  const winnerFeed = wheel?.winnerFeed ?? [];
  const dailyAvailable = wheel?.dailySpinsAvailable ?? 0;
  const dailyCap = wheel?.dailySpinCap ?? 4;
  const dailyRemainingMs = Math.max(0, new Date(wheel?.nextDailySpinAt ?? clock).getTime() - clock);
  const dailyCountdown = [
    Math.floor(dailyRemainingMs / 3600000),
    Math.floor((dailyRemainingMs % 3600000) / 60000),
    Math.floor((dailyRemainingMs % 60000) / 1000),
  ].map((part) => String(part).padStart(2, '0')).join(':');
  const visualSegments = useMemo(() => {
    const segments = prizes.map((prize) => ({ label: formatAmountDisplay(prize.amount), amount: Number(prize.amount) }));
    for (const prize of displayOnlyPrizes) {
      if (prize.amount === null || !segments.some((segment) => segment.amount === prize.amount)) segments.push(prize);
    }
    return segments;
  }, [prizes]);

  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!wheel || loading || dailyAvailable >= dailyCap || dailyRemainingMs > 0) return;
    api('/promotions/wheel')
      .then(setWheel)
      .catch((cause) => setError(cause.message || 'Unable to refresh your daily spin.'));
  }, [wheel, loading, dailyAvailable, dailyCap, dailyRemainingMs]);

  useEffect(() => {
    let active = true;
    api('/promotions/wheel')
      .then((data) => {
        if (!active) return;
        setWheel(data);
      })
      .catch((cause) => {
        if (active) setError(cause.status >= 500
          ? 'The wheel is unavailable. Check the API database connection and apply the latest database migrations.'
          : cause.message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const wheelStyle = useMemo(() => {
    if (!visualSegments.length) return {};
    const slices = visualSegments.map((_prize, index) => (
      `${wheelColors[index % wheelColors.length]} ${index / visualSegments.length * 100}% ${(index + 1) / visualSegments.length * 100}%`
    ));
    return { background: `conic-gradient(${slices.join(', ')})` };
  }, [visualSegments]);

  async function spin(eligibilityId, spinType, source) {
    setSpinning(true);
    setError('');
    setResult(null);
    try {
      const prize = await api('/promotions/wheel/spin', { method: 'POST', ...jsonBody({ eligibilityId }) });
      const { prizes, ...spinResult } = prize;
      const landedAmount = Number(prizes[prize.prizeIndex]?.amount);
      const visualIndex = visualSegments.findIndex((segment) => segment.amount === landedAmount);
      const midpoint = (visualIndex + 0.5) / visualSegments.length * 360;
      const targetRotation = rotation + 1800 + (360 - midpoint);
      setRotation(targetRotation);
      setWheel((current) => current ? {
        ...current,
        pools: { ...current.pools, [spinType]: prizes },
        availableSpins: current.availableSpins.filter((spinOption) => spinOption.id !== eligibilityId),
        dailySpinsAvailable: source === 'DAILY' ? Math.max(0, current.dailySpinsAvailable - 1) : current.dailySpinsAvailable,
      } : current);
      window.setTimeout(() => {
        setResult(spinResult);
        setWheel((current) => current ? {
          ...current,
          spinHistory: [spinResult, ...current.spinHistory],
          winnerFeed: [{ id: spinResult.id, phone: spinResult.phone, amount: spinResult.amount }, ...current.winnerFeed].slice(0, 12),
        } : current);
        setSpinning(false);
        onAwarded().catch(() => setError('Prize credited successfully, but your wallet balance could not refresh. Reload the page to see it.'));
      }, 1800);
    } catch (cause) {
      setError(cause.status >= 500
        ? 'The spin could not be completed. Check the API database connection and apply the latest database migrations.'
        : cause.message);
      if (cause.code === 'WHEEL_ALREADY_SPUN') api('/promotions/wheel').then(setWheel).catch((refreshError) => setError(refreshError.message));
      setSpinning(false);
    }
  }

  return (
    <>
      {display === 'tile' ? (
        <button className='nexgrid-action-card luck-wheel-action-card' type='button' onClick={() => navigate('/spin')} aria-label='Spin and win'>
          <span className='nexgrid-action-icon-circle icon-circle-wheel'><RotateCw size={24} /></span>
          <span className='nexgrid-action-name'>{t('Spin & Win')}</span>
        </button>
      ) : null}
      {(display !== 'tile' || wheelOpen) && (
      <div className={display === 'tile' ? 'promotion-modal-backdrop' : 'luck-wheel-page-shell'} role='presentation' onMouseDown={(event) => {
        if (display === 'tile' && event.target === event.currentTarget && !spinning) setWheelOpen(false);
      }}>
      <section className={`luck-wheel-card ${display === 'tile' ? 'luck-wheel-modal' : 'luck-wheel-page'}`} id='luck-wheel' role={display === 'tile' ? 'dialog' : undefined} aria-modal={display === 'tile' ? 'true' : undefined} aria-label='Prize wheel'>
        {display === 'tile' && <button className='promotion-modal-close' type='button' onClick={() => setWheelOpen(false)} disabled={spinning} aria-label='Close luck wheel'><X size={18} /></button>}
        {display !== 'tile' && <><LanguageSwitcher className='luck-wheel-language-switcher' /><button className='luck-wheel-page-close' type='button' onClick={() => navigate('/dashboard')} aria-label={t('Close spin page')}><X size={18} /><span>{t('Close')}</span></button></>}
        <div className='luck-wheel-copy'>
          <div className='luck-wheel-available-count' role='status' aria-live='polite'>
            <span>{t('Available spins')}</span>
            <strong>{wheel?.availableSpins?.length ?? 0}</strong>
          </div>
          <div className='luck-wheel-daily-status'>
            <span>{t('Daily spins')} <strong>{dailyAvailable}/{dailyCap}</strong></span>
            <small>{dailyAvailable >= dailyCap ? t('Spin bank full') : dailyRemainingMs > 0 ? `${t('Next spin in')} ${dailyCountdown}` : t('Daily spin ready')}</small>
          </div>
          {wheel?.availableSpins?.length > 0 && (
            <div className='luck-wheel-available-list' aria-label='Available spin types'>
              {['SIGNUP', 'DAILY', 'REFERRAL', 'ADMIN'].map((source) => {
                const count = wheel.availableSpins.filter((spinOption) => spinOption.source === source).length;
                if (!count) return null;
                const labels = { SIGNUP: 'Signup', DAILY: 'Daily', REFERRAL: 'Referral', ADMIN: 'Admin bonus' };
                return <span key={source}>{t(labels[source])} <strong>×{count}</strong></span>;
              })}
            </div>
          )}
          {result ? (
            <p className='luck-wheel-result' role='status'><CheckCircle2 size={18} /><span>{result.phone} <strong>{formatAmountDisplay(result.amount)}</strong></span></p>
          ) : null}
          {result && wheel?.availableSpins?.length > 0 && (
            <button className='secondary-button luck-wheel-next-spin' type='button' onClick={() => setResult(null)}>{t('Use next spin')}</button>
          )}
          {loading && <p className='luck-wheel-no-spins'>{t('Loading your wheel…')}</p>}
          {!loading && !selectedSpin && <p className='luck-wheel-no-spins'>{t('No spins available right now. Check back when your daily spin refreshes.')}</p>}
          {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
          {winnerFeed.length > 0 && (
            <div className='luck-wheel-winners' aria-label='Recent spin winners'>
              <span className='luck-wheel-winners-title'>{t('Recent winners')}</span>
              <div className='luck-wheel-winners-window'>
                <div className='luck-wheel-winners-track'>
                  {[...winnerFeed, ...winnerFeed].map((winner, index) => (
                    <div key={`${winner.id}-${index}`} className='luck-wheel-winner-row'>
                      <span>{winner.phone}</span>
                      <strong>{formatAmountDisplay(winner.amount)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!selectedSpin && wheel?.spinHistory?.some((spinResult) => Number(spinResult.amount) > 0) && !result && (
            <p className='luck-wheel-last-result'>Previous win: {money(wheel.spinHistory.find((spinResult) => Number(spinResult.amount) > 0).amount)}</p>
          )}
          {wheel?.spinHistory?.length > 0 && (
            <div className='luck-wheel-my-history'>
              <span className='luck-wheel-winners-title'>{t('Your spin history')}</span>
              {wheel.spinHistory.slice(0, 4).map((spinResult) => (
                <div key={spinResult.id} className='luck-wheel-my-history-row'>
                  <span>{t(spinResult.source === 'DAILY' ? 'Daily spin' : spinResult.source === 'ADMIN' ? 'Admin spin' : spinResult.source === 'REFERRAL' ? 'Referral spin' : 'Signup spin')}</span>
                  <strong>{formatAmountDisplay(spinResult.amount)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='luck-wheel-visual' role='group' aria-label={t('Prize wheel')}>
          <div className={`luck-wheel-pointer ${spinning ? 'is-spinning' : ''}`} />
          <div className='luck-wheel-disc' style={{ ...wheelStyle, transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 1.8s cubic-bezier(.15,.72,.12,1)' : 'none' }}>
            {visualSegments.map((prize, index) => {
              const midpoint = ((index + 0.5) / visualSegments.length) * 360;
              const radians = midpoint * Math.PI / 180;
              return (
                <span
                  key={`${prize.label}-${index}`}
                  className='luck-wheel-segment-label'
                  style={{
                    left: `${50 + Math.sin(radians) * 31}%`,
                    top: `${50 - Math.cos(radians) * 31}%`,
                  }}
                >
                  {prize.icon ? <><prize.icon size={18} aria-hidden='true' /><span>{prize.label}</span></> : prize.label}
                </span>
              );
            })}
          </div>
          <button
            className='luck-wheel-hub luck-wheel-center-button'
            type='button'
            onClick={() => selectedSpin && spin(selectedSpin.id, selectedSpin.spinType, selectedSpin.source)}
            disabled={loading || spinning || !selectedSpin || !prizes.length}
            aria-label={spinning ? t('Spin in progress') : selectedSpin ? `${t('Spin now.')} ${wheel.availableSpins.length} ${t('available')}` : t('No spins available')}
          >
            {spinning ? <RotateCw size={19} className='is-spinning' /> : <Sparkles size={20} />}
            <span>{spinning ? t('SPINNING') : t('SPIN')}</span>
          </button>
        </div>
      </section>
      </div>
      )}
      <GiftCodeButton onAwarded={onAwarded} />
    </>
  );
}

function GiftCodesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      setItems(await api('/admin/promotions/gifts'));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function createGift(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const gift = await api('/admin/promotions/gifts', {
        method: 'POST',
        ...jsonBody({
          label: values.label,
          code: values.code || undefined,
          amount: Number(values.amount),
          maxRedemptions: Number(values.maxRedemptions),
        }),
      });
      setNotice(`Gift code ${gift.code} created. Share the code with your customers.`);
      form.reset();
      form.elements.amount.value = '8';
      form.elements.maxRedemptions.value = '50';
      await refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setNotice(`Gift code ${code} copied.`);
      setError('');
    } catch {
      setError('Could not copy the gift code. Check clipboard permissions.');
    }
  }

  async function setGiftStatus(gift, status) {
    setBusyId(gift.id);
    setError('');
    setNotice('');
    try {
      await api(`/admin/promotions/gifts/${gift.id}`, { method: 'PATCH', ...jsonBody({ status }) });
      setNotice(`Gift code ${gift.code} ${status === 'ACTIVE' ? 'enabled' : 'disabled'}.`);
      await refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className='surface promotion-admin-panel'>
      <div className='surface-heading'>
        <div><p className='eyebrow'>SHAREABLE REWARDS</p><h3>Gift codes</h3></div>
      </div>
      <p className='promotion-admin-description'>Create a code for a fixed ETB amount and a first-come claim limit. Each customer can redeem a code once. Example: 8 ETB for 50 claims is a 400 ETB campaign.</p>
      <form className='promotion-admin-form' onSubmit={createGift}>
        <label className='field'><span>Campaign label</span><input name='label' minLength='2' maxLength='80' placeholder='Community gift' required /></label>
        <label className='field'><span>Code (optional)</span><input name='code' minLength='4' maxLength='32' pattern='[A-Za-z0-9-]+' placeholder='Generated automatically' /></label>
        <label className='field'><span>Amount per claim (ETB)</span><input name='amount' type='number' min='2' max='15' step='0.01' defaultValue='8' required /></label>
        <label className='field'><span>Maximum claims</span><input name='maxRedemptions' type='number' min='1' max='1000000' step='1' defaultValue='50' required /></label>
        <button className='primary-button' type='submit' disabled={saving}>{saving ? 'Creating…' : 'Create gift code'}<Plus size={16} /></button>
      </form>
      {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
      {notice && <p className='promotion-feedback is-success' role='status'>{notice}</p>}
      <div className='table-wrap'>
        <table>
          <thead><tr><th>Code</th><th>Amount</th><th>Claims</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {items.map((gift) => (
              <tr key={gift.id}>
                <td><strong>{gift.label}</strong><small>{gift.code}</small><button className='secondary-button promotion-copy-button' type='button' onClick={() => copyCode(gift.code)}><Copy size={13} /> Copy code</button></td>
                <td>{money(gift.amount)}</td>
                <td>{gift.redeemedCount} / {gift.maxRedemptions}</td>
                <td><span className={`history-status ${gift.status.toLowerCase()}`}>{gift.status}</span></td>
                <td><button className='secondary-button' type='button' disabled={busyId === gift.id} onClick={() => setGiftStatus(gift, gift.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED')}>{busyId === gift.id ? 'Saving…' : gift.status === 'DISABLED' ? 'Enable' : 'Disable'}</button></td>
              </tr>
            ))}
            {!loading && !items.length && <tr><td colSpan='5'><p className='empty-state'>No gift codes yet. Create one above to start a campaign.</p></td></tr>}
            {loading && <tr><td colSpan='5'><p className='empty-state'>Loading gift codes…</p></td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function MultiplierGamePage({ onAwarded = async () => {} }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [stake, setStake] = useState('10');
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState(null);

  async function loadGame() {
    setLoading(true);
    setError('');
    try {
      const data = await api('/promotions/game');
      setGame(data);
      setStake((current) => data.stakePresets.includes(Number(current)) ? current : String(data.stakePresets[0]));
    } catch (cause) {
      setError(cause.message || 'Unable to load the multiplier game.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadGame(); }, []);

  const balance = Number(game?.balance ?? 0);
  const maxStake = Number(game?.maxStake ?? 0);
  const stakePresets = game?.stakePresets ?? [];
  const parsedStake = Number(stake);
  const totalWeight = (game?.odds ?? []).reduce((sum, entry) => sum + Number(entry.weight), 0);
  const expectedReturnPercent = totalWeight
    ? (game.odds.reduce((sum, entry) => sum + Number(entry.multiplier) * Number(entry.weight), 0) / totalWeight * 100)
    : 0;
  const canPlay = Number.isFinite(parsedStake) && parsedStake > 0 && parsedStake <= balance && parsedStake <= maxStake;

  async function play(event) {
    event.preventDefault();
    if (!canPlay) {
      setError(`Enter a stake greater than zero and no more than your balance or the ${money(maxStake)} maximum.`);
      return;
    }
    setPlaying(true);
    setError('');
    setNotice('');
    setResult(null);
    try {
      const round = await api('/promotions/game/play', {
        method: 'POST',
        ...jsonBody({ amount: parsedStake }),
      });
      setResult(round);
      setGame((current) => current ? {
        ...current,
        balance: round.balance,
        history: [round, ...current.history].slice(0, 20),
      } : current);
      onAwarded().catch(() => setNotice('Round completed, but the wallet summary could not refresh.'));
    } catch (cause) {
      setError(cause.message || 'Unable to play this round.');
      if (cause.code === 'INSUFFICIENT_BALANCE') loadGame();
    } finally {
      setPlaying(false);
    }
  }

  return (
    <section className='multiplier-game-page'>
      <header className='multiplier-game-header'>
        <button className='multiplier-game-back' type='button' onClick={() => navigate('/dashboard')} aria-label={t('Back to home')}><ChevronLeft size={19} /></button>
        <div><p className='eyebrow'>{t('ONLINE TRADE GAME')}</p><h2>{t('Multiplier')}</h2></div>
        <div className='multiplier-game-header-tools'><LanguageSwitcher /><div className='multiplier-game-balance'><small>{t('AVAILABLE')}</small><strong>{money(balance)}</strong></div></div>
      </header>

      <section className='multiplier-game-card'>
        <div className='multiplier-game-card-heading'>
          <div><p className='eyebrow'>{t('CHOOSE YOUR STAKE')}</p><h3>{t('Pick an amount')}</h3></div>
          <span>{t('Balance')} {money(balance)}</span>
        </div>
        <form className='multiplier-game-form' onSubmit={play}>
          <div className='multiplier-game-presets' aria-label={t('Quick stake amounts')}>
            {stakePresets.map((amount) => (
              <button
                key={amount}
                type='button'
                className={Number(stake) === amount ? 'active' : ''}
                disabled={amount > balance}
                onClick={() => { setStake(String(amount)); setError(''); }}
              >
                {amount} ETB
              </button>
            ))}
          </div>
          <label className='field'>
            <span>{t('Enter stake (ETB)')}</span>
            <input
              type='number'
              inputMode='decimal'
              min='0.01'
              max={Math.min(balance, maxStake)}
              step='0.01'
              value={stake}
              onChange={(event) => { setStake(event.target.value); setError(''); }}
              required
            />
            <small>{t('Maximum stake:')} {money(maxStake)}</small>
          </label>
          <button className='multiplier-game-max-button' type='button' onClick={() => { setStake(Math.min(balance, maxStake).toFixed(2)); setError(''); }} disabled={balance <= 0 || maxStake <= 0}>
            {t('Use available balance')}
          </button>
          <button className='primary-button multiplier-game-play-button' type='submit' disabled={loading || playing || !canPlay}>
            {playing ? t('Playing…') : loading ? t('Loading game…') : `${t('Play with')} ${Number.isFinite(parsedStake) ? money(parsedStake) : '0.00 ETB'}`}
          </button>
        </form>
        <p className='multiplier-game-disclosure'>{t('Outcomes are drawn randomly on the server using the published odds below. Payout includes your stake; 0× loses the stake. Current theoretical gross return:')} {expectedReturnPercent.toFixed(2)}% {t('over many rounds.')}</p>
        {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
        {notice && <p className='promotion-feedback is-success' role='status'>{notice}</p>}
        {result && (
          <div className={`multiplier-game-result ${Number(result.multiplier) === 0 ? 'lost' : 'won'}`} role='status'>
            <span>{Number(result.multiplier) === 0 ? t('Round complete') : t('You got')}</span>
            <strong>{Number(result.multiplier)}×</strong>
            <p>{t('Stake')} {money(result.stake)} · {t('Payout')} {money(result.payout)}</p>
          </div>
        )}
      </section>

      <section className='multiplier-game-card'>
        <div className='multiplier-game-card-heading'>
          <div><p className='eyebrow'>{t('PUBLISHED ODDS')}</p><h3>{t('Multiplier chances')}</h3></div>
        </div>
        <div className='multiplier-game-odds'>
          {(game?.odds ?? []).map((entry) => (
            <div key={entry.multiplier}>
              <strong>{Number(entry.multiplier)}×</strong>
              <span>{Number(entry.probability).toLocaleString(undefined, { maximumFractionDigits: 4 })}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className='multiplier-game-card'>
        <div className='multiplier-game-card-heading'>
          <div><p className='eyebrow'>{t('RECENT ROUNDS')}</p><h3>{t('Game history')}</h3></div>
        </div>
        {game?.history?.length ? (
          <div className='multiplier-game-history'>
            {game.history.map((round) => (
              <div key={round.id}>
                <time dateTime={round.createdAt}>{new Date(round.createdAt).toLocaleString()}</time>
                <strong>{Number(round.multiplier)}×</strong>
                <span>{money(round.stake)} {t('stake')}</span>
                <b>{money(round.payout)} {t('payout')}</b>
              </div>
            ))}
          </div>
        ) : <p className='multiplier-game-disclosure'>{t('Your completed rounds will appear here.')}</p>}
      </section>
    </section>
  );
}

function GameSettingsPanel() {
  const [odds, setOdds] = useState([]);
  const [stakePresets, setStakePresets] = useState('10, 20, 50, 100');
  const [maxStake, setMaxStake] = useState('5000000000000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/admin/promotions/game')
      .then((data) => {
        setOdds(data.odds);
        setStakePresets(data.config.stakePresets.join(', '));
        setMaxStake(String(data.config.maxStake));
      })
      .catch((cause) => setError(cause.message || 'Unable to load game odds.'))
      .finally(() => setLoading(false));
  }, []);

  function updateWeight(multiplier, weight) {
    setOdds((current) => current.map((entry) => entry.multiplier === multiplier ? { ...entry, weight, probability: undefined } : entry));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const data = await api('/admin/promotions/game', {
        method: 'PUT',
        ...jsonBody({ odds: odds.map(({ multiplier, weight }) => ({ multiplier, weight: Number(weight) })) }),
      });
      setOdds(data.odds);
      setNotice('Game odds saved. Customers see the published probabilities.');
    } catch (cause) {
      setError(cause.message || 'Unable to save game odds.');
    } finally {
      setSaving(false);
    }
  }

  async function saveStakeConfig(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const config = await api('/admin/promotions/game/config', {
        method: 'PUT',
        ...jsonBody({
          stakePresets: stakePresets.split(',').map((amount) => Number(amount.trim())),
          maxStake: Number(maxStake),
        }),
      });
      setStakePresets(config.stakePresets.join(', '));
      setMaxStake(String(config.maxStake));
      setNotice('Game stake amounts saved.');
    } catch (cause) {
      setError(cause.message || 'Unable to save game stake settings.');
    } finally {
      setSaving(false);
    }
  }

  const totalWeight = odds.reduce((sum, entry) => sum + Number(entry.weight || 0), 0);
  const expectedReturnPercent = totalWeight
    ? odds.reduce((sum, entry) => sum + Number(entry.multiplier) * Number(entry.weight || 0), 0) / totalWeight * 100
    : 0;
  return (
    <section className='surface promotion-admin-panel'>
      <div className='surface-heading'><div><p className='eyebrow'>MULTIPLIER GAME</p><h3>Published game odds</h3></div></div>
      <p className='promotion-admin-description'>Configure the draw weights for each multiplier. Customers can view the resulting probability of every outcome before playing. Outcomes are drawn randomly on the server. Current theoretical gross return: {expectedReturnPercent.toFixed(2)}% over many rounds.</p>
      <form className='game-odds-form' onSubmit={save}>
        {odds.map((entry) => (
          <label className='field game-odds-row' key={entry.multiplier}>
            <span>{Number(entry.multiplier)}× multiplier</span>
            <input type='number' min='1' max='100000' step='1' value={entry.weight} onChange={(event) => updateWeight(entry.multiplier, event.target.value)} required />
            <small>{totalWeight ? `${(Number(entry.weight) / totalWeight * 100).toFixed(4)}% chance` : 'Weight not set'}</small>
          </label>
        ))}
        {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
        {notice && <p className='promotion-feedback is-success' role='status'>{notice}</p>}
        <button className='primary-button' type='submit' disabled={loading || saving || odds.length !== 7}>{loading ? 'Loading…' : saving ? 'Saving…' : 'Save game odds'}<Sparkles size={16} /></button>
      </form>
      <h4 className='promotion-admin-subheading'>Stake limits and quick amounts</h4>
      <form className='game-odds-form' onSubmit={saveStakeConfig}>
        <label className='field'>
          <span>Quick stake presets (ETB)</span>
          <input value={stakePresets} onChange={(event) => setStakePresets(event.target.value)} placeholder='10, 20, 50, 100' required />
          <small>Enter 1–8 unique amounts separated by commas.</small>
        </label>
        <label className='field'>
          <span>Maximum stake (ETB)</span>
          <input type='number' min='0.01' max='5000000000000' step='0.01' value={maxStake} onChange={(event) => setMaxStake(event.target.value)} required />
          <small>Applies to every customer game round.</small>
        </label>
        <button className='primary-button' type='submit' disabled={loading || saving}>{saving ? 'Saving…' : 'Save stake settings'}<Sparkles size={16} /></button>
      </form>
    </section>
  );
}

function DailySpinSettingsPanel() {
  const [dailySpinCap, setDailySpinCap] = useState('4');
  const [intervalHours, setIntervalHours] = useState('24');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/admin/promotions/wheel/config')
      .then((config) => {
        setDailySpinCap(String(config.dailySpinCap));
        setIntervalHours(String(config.intervalHours));
      })
      .catch((cause) => setError(cause.message || 'Unable to load daily spin settings.'))
      .finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const config = await api('/admin/promotions/wheel/config', {
        method: 'PUT',
        ...jsonBody({ dailySpinCap: Number(dailySpinCap), intervalHours: Number(intervalHours) }),
      });
      setDailySpinCap(String(config.dailySpinCap));
      setIntervalHours(String(config.intervalHours));
      setNotice('Daily spin allowance and refresh interval saved.');
    } catch (cause) {
      setError(cause.message || 'Unable to save daily spin settings.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className='surface promotion-admin-panel'>
      <div className='surface-heading'><div><p className='eyebrow'>LUCK WHEEL</p><h3>Daily spin schedule</h3></div></div>
      <p className='promotion-admin-description'>Set the maximum banked daily spins and how often a new daily spin becomes available.</p>
      <form className='game-odds-form' onSubmit={save}>
        <label className='field'>
          <span>Daily spin cap</span>
          <input type='number' min='1' max='100' step='1' value={dailySpinCap} onChange={(event) => setDailySpinCap(event.target.value)} required />
          <small>Whole number from 1 to 100.</small>
        </label>
        <label className='field'>
          <span>Refresh interval (hours)</span>
          <input type='number' min='1' max='720' step='1' value={intervalHours} onChange={(event) => setIntervalHours(event.target.value)} required />
          <small>Whole number from 1 to 720 hours.</small>
        </label>
        {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
        {notice && <p className='promotion-feedback is-success' role='status'>{notice}</p>}
        <button className='primary-button' type='submit' disabled={loading || saving}>{loading ? 'Loading…' : saving ? 'Saving…' : 'Save daily spin settings'}<Sparkles size={16} /></button>
      </form>
    </section>
  );
}

function AdminSpinGrantPanel() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function grantSpins(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await api('/admin/promotions/wheel/spins', {
        method: 'POST',
        ...jsonBody({
          phoneNumber: String(values.phoneNumber).trim(),
          count: Number(values.count),
          spinType: values.spinType,
        }),
      });
      setNotice(`${result.count} ${result.spinType === 'REFERRAL' ? 'referral-pool' : 'signup-pool'} spin${result.count === 1 ? '' : 's'} added for ${result.customerName} (${result.phoneNumber}).`);
      form.reset();
      form.elements.count.value = '1';
      form.elements.spinType.value = 'SIGNUP';
    } catch (cause) {
      setError(cause.message || 'Unable to add spins to this customer.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className='surface promotion-admin-panel'>
      <div className='surface-heading'>
        <div><p className='eyebrow'>CUSTOMER REWARDS</p><h3>Add extra spins</h3></div>
      </div>
      <p className='promotion-admin-description'>Grant additional spins to a customer. These admin-granted spins do not use their four-spin daily allowance.</p>
      <form className='admin-spin-grant-form' onSubmit={grantSpins}>
        <label className='field'>
          <span>Customer phone number</span>
          <input name='phoneNumber' type='tel' inputMode='tel' placeholder='912345678' minLength={9} maxLength={24} required />
          <small>Enter the customer’s Ethiopian phone number.</small>
        </label>
        <label className='field'>
          <span>Number of spins</span>
          <input name='count' type='number' min='1' max='100' defaultValue='1' required />
        </label>
        <label className='field'>
          <span>Prize pool</span>
          <select name='spinType' defaultValue='SIGNUP' required>
            <option value='SIGNUP'>Signup prizes (5–20 ETB)</option>
            <option value='REFERRAL'>Referral prizes (20–100 ETB)</option>
          </select>
        </label>
        {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
        {notice && <p className='promotion-feedback is-success' role='status'>{notice}</p>}
        <button className='primary-button' type='submit' disabled={saving}>{saving ? 'Adding spins…' : 'Add spins'}<Plus size={16} /></button>
      </form>
    </section>
  );
}

function WheelSettingsPanel() {
  const [pools, setPools] = useState({ signupPrizes: [], referralPrizes: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api('/admin/promotions/wheel')
      .then(setPools)
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  function updatePrize(spinType, index, field, value) {
    const key = spinType === 'SIGNUP' ? 'signupPrizes' : 'referralPrizes';
    setPools((current) => ({
      ...current,
      [key]: current[key].map((prize, position) => position === index ? { ...prize, [field]: value } : prize),
    }));
  }

  function addPrize(spinType) {
    const key = spinType === 'SIGNUP' ? 'signupPrizes' : 'referralPrizes';
    const newPrize = { label: spinType === 'SIGNUP' ? '5 ETB' : '20 ETB', amount: spinType === 'SIGNUP' ? 5 : 20, weight: 1, kind: 'CASH' };
    setPools((current) => current[key].length >= 12 ? current : { ...current, [key]: [...current[key], newPrize] });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const data = await api('/admin/promotions/wheel', {
        method: 'PUT',
        ...jsonBody({
          signupPrizes: pools.signupPrizes.map((prize) => ({
            ...prize,
            kind: 'CASH',
            amount: Number(prize.amount),
            weight: Number(prize.weight),
          })),
          referralPrizes: pools.referralPrizes.map((prize) => ({
            ...prize,
            kind: 'CASH',
            amount: Number(prize.amount),
            weight: Number(prize.weight),
          })),
        }),
      });
      setPools(data);
      setNotice('Signup and referral wheel prizes and odds saved.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  function renderPrizePool(spinType, title, description, items) {
    const minimum = spinType === 'SIGNUP' ? 5 : 20;
    const maximum = spinType === 'SIGNUP' ? 20 : 100;
    return (
      <section className='wheel-prize-pool'>
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        {items.map((prize, index) => (
          <div className='wheel-prize-row' key={`${spinType}-${index}-${prize.label}`}>
            <label className='field'><span>Cash amount (ETB, {minimum}–{maximum})</span>{spinType === 'SIGNUP'
              ? <select value={prize.amount ?? ''} onChange={(event) => updatePrize(spinType, index, 'amount', Number(event.target.value))} required><option value='5'>5 ETB</option><option value='10'>10 ETB</option><option value='20'>20 ETB</option></select>
              : <input type='number' min={minimum} max={maximum} step='0.01' value={prize.amount ?? ''} onChange={(event) => updatePrize(spinType, index, 'amount', event.target.value)} required />}</label>
            <label className='field'><span>Weight</span><input type='number' min='1' max='10000' step='1' value={prize.weight} onChange={(event) => updatePrize(spinType, index, 'weight', event.target.value)} required /></label>
            <button className='secondary-button wheel-remove-button' type='button' onClick={() => setPools((current) => ({ ...current, [spinType === 'SIGNUP' ? 'signupPrizes' : 'referralPrizes']: items.filter((_, position) => position !== index) }))} disabled={items.length <= 1} aria-label={`Remove ${prize.label}`}>Remove</button>
          </div>
        ))}
        <div className='wheel-prize-add-actions'>
          <button className='secondary-button' type='button' onClick={() => addPrize(spinType)} disabled={loading || items.length >= 12}><Plus size={15} /> Add cash prize</button>
        </div>
      </section>
    );
  }

  return (
    <section className='surface promotion-admin-panel'>
      <div className='surface-heading'>
        <div><p className='eyebrow'>LUCK WHEEL</p><h3>Wheel prizes and odds</h3></div>
      </div>
      <form className='wheel-settings-form' onSubmit={save}>
        {renderPrizePool('SIGNUP', 'New account spin', 'Granted after registration. Choose 5, 10, or 20 ETB cash prizes and set each prize weight.', pools.signupPrizes)}
        {renderPrizePool('REFERRAL', 'Referral spin', 'Granted only to the inviter after their invited customer makes a first product investment. Configure real cash prizes from 20–100 ETB.', pools.referralPrizes)}
        {error && <p className='promotion-feedback is-error' role='alert'>{error}</p>}
        {notice && <p className='promotion-feedback is-success' role='status'>{notice}</p>}
        <button className='primary-button' type='submit' disabled={loading || saving || pools.signupPrizes.length < 1 || pools.referralPrizes.length < 1}>{loading ? 'Loading…' : saving ? 'Saving…' : 'Save wheel settings'}<Sparkles size={16} /></button>
      </form>
    </section>
  );
}

export function AdminPromotionsPage() {
  return (
    <div className='promotion-admin-layout'>
      <GiftCodesPanel />
      <AdminSpinGrantPanel />
      <GameSettingsPanel />
      <WheelSettingsPanel />
      <DailySpinSettingsPanel />
    </div>
  );
}
