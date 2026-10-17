import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
<<<<<<< HEAD
import { ArrowDownToLine, ArrowUpFromLine, Bell, CheckCircle2, CircleAlert, Copy, FileText, Gift, LayoutDashboard, LogOut, Menu, MessageCircle, Package, ShieldCheck, UserCircle, Users, Wallet, X, ZoomIn, ZoomOut } from 'lucide-react';
=======
import { ArrowDownToLine, ArrowUpFromLine, Bell, CheckCircle2, ChevronLeft, ChevronRight, CircleAlert, CircleDollarSign, Copy, FileText, Gift, Headphones, LayoutDashboard, LogOut, Menu, MessageCircle, Package, Paperclip, RotateCcw, Send, ShieldCheck, Smartphone, UserCircle, Users, Wallet, X, ZoomIn, ZoomOut } from 'lucide-react';
>>>>>>> d1aaf18 (Update OnlineTrade project)
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api, assetUrl, jsonBody } from './services/api.js';
import PublicWebsite from './PublicWebsite.jsx';
import { AdminPromotionsPage, CustomerPromotions, MultiplierGamePage } from './Promotions.jsx';
import PromotionGallery from './PromotionGallery.jsx';
import welcomePromotionImage from './welcome-promotion.svg';
import { getProductImage } from './productImages.js';
import { LanguageProvider, LanguageSwitcher, useLanguage } from './LanguageContext.jsx';

const navItems = [
  { to: '/my', label: 'MY', icon: UserCircle },
<<<<<<< HEAD
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/tasks', label: 'Daily Tasks', icon: FileText },
  { to: '/purchases', label: 'My Products', icon: Package },
=======
  { to: '/game', label: 'Game', icon: CircleDollarSign },
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/tasks', label: 'Daily Tasks', icon: FileText },
  { to: '/purchases', label: 'My Investments', icon: Package },
>>>>>>> d1aaf18 (Update OnlineTrade project)
  { to: '/recharge', label: 'Recharge', icon: ArrowDownToLine },
  { to: '/recharge/history', label: 'Recharge History', icon: FileText },
  { to: '/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { to: '/referrals', label: 'Referrals', icon: Users },
  { to: '/rewards', label: 'Rewards', icon: Gift },
  { to: '/transactions', label: 'Transactions', icon: Wallet },
  { to: '/profile', label: 'Personal Information', icon: UserCircle },
  { to: '/support', label: 'Support', icon: ShieldCheck },
];

const myNavPaths = ['/profile', '/transactions', '/recharge/history', '/rewards', '/referrals', '/tasks'];
const myPageNavItem = navItems.find(({ to }) => to === '/my');
const MyPageIcon = myPageNavItem.icon;
const workspaceNavItems = navItems.filter(({ to }) => !myNavPaths.includes(to) && to !== '/my');

const money = (amount) => `${Number(amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;
const rateFraction = (rate) => {
  const value = Number(rate ?? 0);
  return value > 1 ? value / 100 : value;
};

function SuccessToast({ message, onDismiss }) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => dismissRef.current(), 5000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message) return null;
  return (
    <div className='success-toast' role='status' aria-live='polite'>
      <CheckCircle2 size={22} aria-hidden='true' />
      <span>{message}</span>
      <button type='button' onClick={onDismiss} aria-label='Dismiss success message'><X size={18} /></button>
    </div>
  );
}

function ErrorToast({ message, onDismiss }) {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return undefined;
    }
    setVisible(true);
    const timer = window.setTimeout(() => {
      setVisible(false);
      dismissRef.current?.();
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;
  return (
    <div className='error-toast' role='alert' aria-live='assertive'>
      <CircleAlert size={22} aria-hidden='true' />
      <span>{message}</span>
      {onDismiss && <button type='button' onClick={onDismiss} aria-label='Dismiss error message'><X size={18} /></button>}
    </div>
  );
}

async function uploadAdminImage(file) {
  const form = new FormData();
  form.append('image', file);
  return api('/admin/uploads/image', { method: 'POST', body: form });
}

function BankLogo({ name, className = '' }) {
  const normalized = String(name || '').toLowerCase();
  let src = '/icons/cbe.svg';
  let alt = 'Bank logo';
  if (/telebirr/i.test(normalized)) {
    src = '/icons/telebirr.svg';
    alt = 'Telebirr Wallet';
  } else if (/awash/i.test(normalized)) {
    src = '/icons/awash.svg';
    alt = 'Awash Bank';
  } else if (/abyssinia|boa/i.test(normalized)) {
    src = '/icons/abyssinia.svg';
    alt = 'Bank of Abyssinia';
  } else if (/cbe|commercial/i.test(normalized)) {
    src = '/icons/cbe.svg';
    alt = 'Commercial Bank of Ethiopia';
  }
  return (
    <div className={`bank-logo-badge ${className}`}>
      <img src={src} alt={alt} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LanguageProvider>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [support, setSupport] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [customerSuccessAlert, setCustomerSuccessAlert] = useState('');
  const [error, setError] = useState('');
  const [auth, setAuth] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    withdrawalPassword: '',
    confirmWithdrawalPassword: '',
    referralCode: '',
    acceptedTerms: false,
  });
  const [products, setProducts] = useState([]);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [referralInfo, setReferralInfo] = useState(null);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState('');
  const [methods, setMethods] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [recharges, setRecharges] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [settings, setSettings] = useState({ minimumRechargeAmount: 300, maximumRechargeAmount: 1000000, withdrawalFee: 10 });
  const idempotencyKeys = useRef(new Map());
  const customerAlertTimer = useRef(null);

  function showCustomerSuccess(message) {
    if (customerAlertTimer.current) window.clearTimeout(customerAlertTimer.current);
    setCustomerSuccessAlert(message);
    customerAlertTimer.current = window.setTimeout(() => {
      setCustomerSuccessAlert('');
      customerAlertTimer.current = null;
    }, 5000);
  }

  function dismissCustomerSuccess() {
    if (customerAlertTimer.current) window.clearTimeout(customerAlertTimer.current);
    customerAlertTimer.current = null;
    setCustomerSuccessAlert('');
  }

  useEffect(() => () => {
    if (customerAlertTimer.current) window.clearTimeout(customerAlertTimer.current);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/register') return;
    const referralCode = new URLSearchParams(location.search).get('ref')?.trim().toUpperCase();
    if (referralCode) {
      setAuth((current) => ({ ...current, referralCode }));
    }
  }, [location.pathname, location.search]);

  async function loadDashboard() {
    const data = await api('/dashboard');
    setDashboard(data);
  }

  function idempotencyKeyFor(operation) {
    if (!idempotencyKeys.current.has(operation)) {
      idempotencyKeys.current.set(operation, crypto.randomUUID());
    }
    return idempotencyKeys.current.get(operation);
  }

  function resolveIdempotencyKey(operation, err) {
    if (!err || (err.status && err.status < 500)) {
      idempotencyKeys.current.delete(operation);
    }
  }

  function validateAuthInput(mode, payload) {
    const phonePattern = /^[97][0-9]{8}$/;
    if (!payload.phoneNumber || !phonePattern.test(payload.phoneNumber)) {
      throw new Error('Enter a valid 9-digit Ethiopian phone number starting with 9 or 7 (e.g. 912345678).');
    }
    if (payload.password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (mode === 'register') {
      if (!payload.fullName || payload.fullName.trim().length < 2) {
        throw new Error('Please enter your full name.');
      }
      if (payload.password !== payload.confirmPassword) {
        throw new Error('Login passwords do not match.');
      }
      if (!payload.acceptedTerms) {
        throw new Error('Please accept the account terms.');
      }
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const mode = location.pathname === '/register' ? 'register' : 'login';
      const payload = mode === 'login'
        ? { phoneNumber: auth.phoneNumber, password: auth.password }
        : { ...auth, referralCode: auth.referralCode || undefined };
      validateAuthInput(mode, payload);
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      await api(path, { method: 'POST', ...jsonBody(payload) });
      const me = await api('/auth/me');
      if (me.role === 'ADMIN') {
        try {
          await api('/auth/logout', { method: 'POST' });
        } catch {}
        setUser(null);
        throw new Error('Administrators must sign in through the Admin Portal at /admin/login.');
      }
      if (me.role !== 'CUSTOMER') {
        try {
          await api('/auth/logout', { method: 'POST' });
        } catch {}
        setUser(null);
        throw new Error('Access denied. A customer account is required for this portal.');
      }
      setUser(me);
      if (me.role === 'CUSTOMER') {
        showCustomerSuccess(mode === 'register' ? 'Your account was created successfully.' : 'You signed in successfully.');
      }
      navigate('/welcome', { replace: true });
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setError('');
    const wasAdmin = user?.role === 'ADMIN';
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch (cause) {
      setError(cause.message);
      return;
    }
    setUser(null);
    setDashboard(null);
    setProducts([]);
    setMembers([]);
    setTeam(null);
    setReferralInfo(null);
    setReferralsLoading(false);
    setReferralsError('');
    setMethods([]);
    setAccounts([]);
    setRecharges([]);
    setWithdrawals([]);
    setNotice('');
    dismissCustomerSuccess();
    setError('');
    navigate(wasAdmin ? '/admin/login' : '/login', { replace: true });
  }

  async function submitAdminAuth(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const normalizedPhone = auth.phoneNumber.trim().replace(/^(\+251|251|0)/, '');
      const payload = {
        phoneNumber: normalizedPhone,
        password: auth.password,
      };
      validateAuthInput('login', payload);
      await api('/auth/login', { method: 'POST', ...jsonBody(payload) });
      const me = await api('/auth/me');
      if (me.role !== 'ADMIN') {
        try {
          await api('/auth/logout', { method: 'POST' });
        } catch {}
        setUser(null);
        throw new Error('Access denied. Administrator privileges are required. Please use customer login at /login.');
      }
      setUser(me);
      navigate('/admin', { replace: true });
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function purchase(productId) {
    const product = products.find((item) => item.id === productId);
    const availableBalance = Number(dashboard?.wallet?.availableBalance);
    if (product && Number.isFinite(availableBalance) && availableBalance < Number(product.price)) {
      setError('');
<<<<<<< HEAD
      setNotice('You do not have enough balance to buy this product. Recharge your wallet to continue.');
=======
      setNotice('You do not have enough balance to invest in this product. Recharge your wallet to continue.');
>>>>>>> d1aaf18 (Update OnlineTrade project)
      navigate('/recharge');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api(`/products/${productId}/purchase`, {
        method: 'POST',
        idempotencyKey: idempotencyKeyFor(`product.purchase.${productId}`),
        ...jsonBody({}),
      });
      resolveIdempotencyKey(`product.purchase.${productId}`);
      await loadDashboard();
      setProducts(await api('/products'));
      showCustomerSuccess('Investment activated successfully.');
    } catch (cause) {
      resolveIdempotencyKey(`product.purchase.${productId}`, cause);
      if (cause.code === 'INSUFFICIENT_BALANCE') {
<<<<<<< HEAD
        setNotice('You do not have enough balance to buy this product. Recharge your wallet to continue.');
=======
        setNotice('You do not have enough balance to invest in this product. Recharge your wallet to continue.');
>>>>>>> d1aaf18 (Update OnlineTrade project)
        navigate('/recharge');
      } else {
        setError(cause.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitRecharge(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError('');
    try {
      const form = new FormData(formElement);
      await api('/recharges', {
        method: 'POST',
        body: form,
        idempotencyKey: idempotencyKeyFor('recharge.submit'),
      });
      resolveIdempotencyKey('recharge.submit');
      formElement.reset();
      setRecharges(await api('/recharges'));
      showCustomerSuccess('Recharge submitted successfully and is pending review.');
      navigate('/recharge/history');
    } catch (cause) {
      resolveIdempotencyKey('recharge.submit', cause);
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitWithdrawal(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setError('');
    try {
      const form = new FormData(formElement);
      await api('/withdrawals', {
        method: 'POST',
        idempotencyKey: idempotencyKeyFor('withdrawal.submit'),
        ...jsonBody(Object.fromEntries(form)),
      });
      resolveIdempotencyKey('withdrawal.submit');
      formElement.reset();
      setWithdrawals(await api('/withdrawals'));
      await loadDashboard();
      setNotice('Withdrawal request submitted.');
      navigate('/withdraw');
    } catch (cause) {
      resolveIdempotencyKey('withdrawal.submit', cause);
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    api('/auth/me').then(setUser).catch(() => setUser(null)).finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (user) return;
    api('/config/public').then(setSupport).catch((cause) => setError(cause.message));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'CUSTOMER') {
      loadDashboard().catch((cause) => setError(cause.message));
      api('/support').then(setSupport).catch(() => setSupport(null));
    } else if (user.role === 'ADMIN') {
      api('/admin/settings').then(setSettings).catch((cause) => setError(cause.message));
    }
  }, [user]);

  useEffect(() => {
    if (!user || (!location.pathname.startsWith('/products') && location.pathname !== '/dashboard' && location.pathname !== '/')) return;
    let active = true;
    const loadProducts = () => {
      if (document.visibilityState === 'hidden') return;
      api('/products', { cache: 'no-store' })
        .then((items) => { if (active) setProducts(items); })
        .catch((cause) => { if (active) setError(cause.message); });
    };
    loadProducts();
    const refreshInterval = window.setInterval(loadProducts, 30000);
    window.addEventListener('focus', loadProducts);
    document.addEventListener('visibilitychange', loadProducts);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', loadProducts);
      document.removeEventListener('visibilitychange', loadProducts);
    };
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user || location.pathname !== '/referrals') return;
    let active = true;
    setReferralsLoading(true);
    setReferralsError('');
    Promise.allSettled([
      api('/referrals'),
      api('/referrals/team/summary'),
      api('/referrals/team/members?limit=50'),
    ]).then(([referralResult, summaryResult, membersResult]) => {
      if (!active) return;
      const failures = [];
      if (referralResult.status === 'fulfilled') {
        setReferralInfo(referralResult.value);
      } else {
        failures.push(`Referral details: ${referralResult.reason?.message ?? 'Request failed.'}`);
      }
      if (summaryResult.status === 'fulfilled') {
        setTeam(summaryResult.value);
      } else {
        failures.push(`Referral summary: ${summaryResult.reason?.message ?? 'Request failed.'}`);
      }
      if (membersResult.status === 'fulfilled') {
        setMembers(membersResult.value.members ?? []);
      } else {
        failures.push(`Referral history: ${membersResult.reason?.message ?? 'Request failed.'}`);
      }
      setReferralsError(failures.join(' '));
    }).finally(() => {
      if (active) setReferralsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user || location.pathname !== '/recharge') return;
    Promise.all([
      api('/payment-methods'),
      api('/recharges'),
    ]).then(([paymentMethods, history]) => {
      setMethods(paymentMethods);
      setRecharges(history);
    }).catch((cause) => setError(cause.message));
  }, [user, location.pathname]);

  useEffect(() => {
    if (!user || !['/withdraw', '/profile', '/withdrawal-account'].includes(location.pathname)) return;
    Promise.all([
      api('/withdrawal-accounts'),
      api('/withdrawals'),
      api('/payment-methods'),
      api('/withdrawals/config'),
    ]).then(([savedAccounts, history, paymentMethods, withdrawalConfig]) => {
      setAccounts(savedAccounts);
      setWithdrawals(history);
      setMethods(paymentMethods);
      setSettings((current) => ({ ...current, withdrawalFee: withdrawalConfig.withdrawalFee }));
    }).catch((cause) => setError(cause.message));
  }, [user, location.pathname]);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role === 'ADMIN') {
      if (!location.pathname.startsWith('/admin')) {
        navigate('/admin', { replace: true });
      }
      return;
    }
    if (user?.role === 'CUSTOMER') {
      if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/admin/login') {
        navigate('/welcome', { replace: true });
        return;
      }
    }
    const publicPaths = ['/', '/about', '/products', '/support', '/download', '/forgot-password', '/terms', '/privacy'];
    const isPublicPath = publicPaths.includes(location.pathname) || location.pathname.startsWith('/products/');
    if (location.pathname.startsWith('/admin')) return;
    if (!user && !isPublicPath && location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/admin/login') {
      navigate('/login', { replace: true });
    }
  }, [authLoading, user, location.pathname, navigate]);

  if (authLoading) {
    return (
      <div className='auth-loading-splash'>
        <div className='auth-loading-inner'>
          <span className='brand-mark'>OT</span>
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path='/' element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/welcome'} replace /> : <PublicWebsite user={null} onPurchase={purchase} busy={busy} />} />
<<<<<<< HEAD
      <Route path='/login' element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/welcome'} replace /> : <AuthScreen auth={auth} setAuth={setAuth} mode='login' onSubmit={submitAuth} onSwitchMode={() => navigate(`/register${location.search}`)} busy={busy} error={error} onDismissError={() => setError('')} appDownloadUrl={support?.appDownloadUrl} />} />
      <Route path='/register' element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/welcome'} replace /> : <AuthScreen auth={auth} setAuth={setAuth} mode='register' onSubmit={submitAuth} onSwitchMode={() => navigate('/login')} busy={busy} error={error} onDismissError={() => setError('')} appDownloadUrl={support?.appDownloadUrl} />} />
=======
      <Route path='/login' element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/welcome'} replace /> : <AuthScreen auth={auth} setAuth={setAuth} mode='login' onSubmit={submitAuth} onSwitchMode={() => navigate(`/register${location.search}`)} busy={busy} error={error} onDismissError={() => setError('')} support={support} />} />
      <Route path='/register' element={user ? <Navigate to={user.role === 'ADMIN' ? '/admin' : '/welcome'} replace /> : <AuthScreen auth={auth} setAuth={setAuth} mode='register' onSubmit={submitAuth} onSwitchMode={() => navigate('/login')} busy={busy} error={error} onDismissError={() => setError('')} support={support} />} />
>>>>>>> d1aaf18 (Update OnlineTrade project)
      <Route path='/admin/login' element={user ? (user.role === 'ADMIN' ? <Navigate to='/admin' replace /> : <Navigate to='/dashboard' replace />) : <AdminLoginScreen auth={auth} setAuth={setAuth} onSubmit={submitAdminAuth} busy={busy} error={error} onDismissError={() => setError('')} />} />
      <Route path='/admin' element={!user ? <Navigate to='/admin/login' replace /> : user.role === 'ADMIN' ? <ProtectedAdminApp user={user} onSignOut={signOut} busy={busy} notice={notice} error={error} setError={setError} setNotice={setNotice} /> : <AdminAccessDenied />} />
      <Route path='/admin/*' element={!user ? <Navigate to='/admin/login' replace /> : user.role === 'ADMIN' ? <ProtectedAdminApp user={user} onSignOut={signOut} busy={busy} notice={notice} error={error} setError={setError} setNotice={setNotice} /> : <AdminAccessDenied />} />
      <Route path='/*' element={
        !user ? <PublicWebsite user={null} onPurchase={purchase} busy={busy} /> :
        user.role === 'ADMIN' ? <Navigate to='/admin' replace /> :
        <ProtectedCustomerApp user={user} dashboard={dashboard} support={support} products={products} team={team} members={members} referralInfo={referralInfo} referralsLoading={referralsLoading} referralsError={referralsError} setReferralsError={setReferralsError} methods={methods} accounts={accounts} recharges={recharges} withdrawals={withdrawals} settings={settings} busy={busy} notice={notice} customerSuccessAlert={customerSuccessAlert} onDismissCustomerAlert={dismissCustomerSuccess} error={error} setError={setError} setNotice={setNotice} onCopyReferral={() => {
        const code = dashboard?.referralCode ?? '';
        const referralLink = code ? `${window.location.origin}/register?ref=${encodeURIComponent(code)}` : '';
        navigator.clipboard?.writeText(referralLink).catch(() => undefined);
        setNotice(referralLink ? 'Referral link copied.' : 'No referral link available.');
      }} onPurchase={purchase} onSubmitRecharge={submitRecharge} onSubmitWithdrawal={submitWithdrawal} onCustomerSuccess={showCustomerSuccess} onRefreshDashboard={loadDashboard} onSaveAccount={async (event) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        setBusy(true);
        setError('');
        try {
          const data = Object.fromEntries(new FormData(formElement));
          const selectedMethod = methods.find((method) => method.id === data.paymentMethodId);
          const accountNumber = String(data.accountNumber ?? '').trim();
          const providerName = selectedMethod?.name ?? 'Other';
          const rules = {
            'Awash Bank': /^[0-9]{14,15}$/,
            'CBE': /^[0-9]{13}$/,
            'Telebirr': /^[0-9]{10}$/,
            'Abyssinia Bank': /^[0-9]{6,9}$/,
          };
          if (selectedMethod && !rules[providerName]?.test(accountNumber)) {
            throw new Error(`Account number format is invalid for ${providerName}.`);
          }
          if (data.newWithdrawalPassword) {
            if (data.newWithdrawalPassword !== data.confirmNewWithdrawalPassword) throw new Error('Withdrawal passwords do not match.');
            await api('/profile/withdrawal-password', {
              method: 'PATCH',
              ...jsonBody({ newWithdrawalPassword: data.newWithdrawalPassword, confirmNewWithdrawalPassword: data.confirmNewWithdrawalPassword }),
            });
          }
          const { newWithdrawalPassword, confirmNewWithdrawalPassword, ...accountData } = data;
          await api('/withdrawal-accounts', {
            method: 'POST',
            ...jsonBody({
              ...accountData,
              paymentMethodId: data.paymentMethodId || null,
            }),
          });
          setAccounts(await api('/withdrawal-accounts'));
          formElement.reset();
          setNotice('Withdrawal account saved.');
        } catch (cause) {
          setError(cause.message);
        } finally {
          setBusy(false);
        }
      }} onSignOut={signOut} />
      } />
    </Routes>
  );
}

function ProtectedAdminApp({ user, onSignOut, busy, notice, error, setError, setNotice }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState({ items: [] });
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [support, setSupport] = useState({});

  async function saveSupport(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const normalized = {
      ...payload,
      supportEnabled: payload.supportEnabled === 'on',
      customerSupportEnabled: payload.customerSupportEnabled === 'on',
      whatsappEnabled: payload.whatsappEnabled === 'on',
      officialGroupEnabled: payload.officialGroupEnabled === 'on',
    };
    try {
      await api('/admin/support', { method: 'PUT', ...jsonBody(normalized) });
      const refreshed = await api('/admin/support');
      setSupport(refreshed);
    } catch (cause) {
      setError(cause.message);
    }
  }

  async function saveAboutPage(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(formData.entries());
      await api('/admin/support/about', { method: 'PUT', ...jsonBody(payload) });
      setSupport(await api('/admin/support'));
      setNotice('Public About page saved successfully.');
    } catch (cause) {
      setError(cause.message);
    }
  }

  async function saveWelcomePage(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const formData = new FormData(event.currentTarget);
      const payload = Object.fromEntries(formData.entries());
      payload.welcomeExamplePrice = Number(payload.welcomeExamplePrice);
      payload.welcomeExampleDailyEarnings = Number(payload.welcomeExampleDailyEarnings);
      await api('/admin/support/welcome', { method: 'PUT', ...jsonBody(payload) });
      setSupport(await api('/admin/support'));
      setNotice('Welcome page updated successfully.');
    } catch (cause) {
      setError(cause.message);
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/admin/login', { replace: true });
      return;
    }
    const load = async () => {
      try {
        const [dashboard, customerList, productList, paymentList, supportData] = await Promise.all([
          api('/admin/dashboard'),
          api('/admin/customers?limit=25&page=1'),
          api('/admin/products'),
          api('/admin/payment-methods'),
          api('/admin/support'),
        ]);
        setStats(dashboard);
        setCustomers(customerList);
        setProducts(productList);
        setPaymentMethods(paymentList);
        setSupport(supportData);
      } catch (cause) {
        setError(cause.message);
      }
    };
    load();
  }, [user, navigate, setError]);

  useEffect(() => {
    setNavOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentPath = location.pathname || '/admin';
  const isDashboard = currentPath === '/admin' || currentPath === '/admin/dashboard';
  const adminNavItems = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/customers', label: 'Customers' },
    { to: '/admin/admins', label: 'Admin Management' },
    { to: '/admin/profile', label: 'My Profile' },
    { to: '/admin/recharges', label: 'Recharges' },
    { to: '/admin/withdrawals', label: 'Withdrawals' },
    { to: '/admin/rewards', label: 'Rewards' },
    { to: '/admin/referrals', label: 'Referrals' },
    { to: '/admin/audit-logs', label: 'Audit Logs' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/payment-methods', label: 'Payment Methods' },
    { to: '/admin/banners', label: 'Promotion Banners' },
    { to: '/admin/promotions', label: 'Gifts & Wheel' },
    { to: '/admin/support', label: 'Support' },
    { to: '/admin/support/chat', label: 'Chat Inbox' },
    { to: '/admin/about', label: 'About Page' },
    { to: '/admin/welcome', label: 'Welcome Page' },
    { to: '/admin/settings/links', label: 'Public Links' },
    { to: '/admin/password', label: 'Change Password' },
  ];
  const currentTitle = (adminNavItems.find(({ to }) => to === currentPath)?.label) ?? (isDashboard ? 'Dashboard' : 'Management dashboard');
  const renderAdminPage = () => {
    if (isDashboard) {
      return <AdminDashboardPage stats={stats} />;
    }
    if (currentPath === '/admin/customers') {
      return <AdminCustomersPage customers={customers} paymentMethods={paymentMethods} onError={setError} />;
    }
    if (currentPath === '/admin/admins') {
      return <AdminManagementPage user={user} onError={setError} onNotice={setNotice} />;
    }
    if (currentPath === '/admin/profile') {
      return <AdminProfilePage user={user} onError={setError} onNotice={setNotice} />;
    }
    if (currentPath === '/admin/password') {
      return <AdminPasswordPage onError={setError} onNotice={setNotice} />;
    }
    if (currentPath === '/admin/products') {
      return <AdminProductsPage products={products} onUploadImage={uploadAdminImage} />;
    }
    if (currentPath === '/admin/recharges') {
      return <AdminRechargesPage />;
    }
    if (currentPath === '/admin/withdrawals') {
      return <AdminWithdrawalsPage />;
    }
    if (currentPath === '/admin/rewards') {
      return <AdminRewardsPage onError={setError} onNotice={setNotice} />;
    }
    if (currentPath === '/admin/referrals') {
      return <AdminReferralsPage onError={setError} />;
    }
    if (currentPath === '/admin/audit-logs') {
      return <AdminAuditLogsPage />;
    }
    if (currentPath === '/admin/payment-methods') {
      return <AdminPaymentMethodsPage methods={paymentMethods} />;
    }
    if (currentPath === '/admin/banners') {
      return <AdminPromotionBannersPage support={support} onRefresh={() => api('/admin/support').then(setSupport)} />;
    }
    if (currentPath === '/admin/support') {
      return <AdminSupportPage support={support} onSave={saveSupport} />;
    }
    if (currentPath === '/admin/support/chat') {
      return <AdminSupportInboxPage />;
    }
    if (currentPath === '/admin/about') {
      return <AdminAboutPage support={support} onSave={saveAboutPage} />;
    }
    if (currentPath === '/admin/welcome') {
      return <AdminWelcomePage support={support} onSave={saveWelcomePage} onUploadImage={uploadAdminImage} onError={setError} />;
    }
    if (currentPath === '/admin/promotions') {
      return <AdminPromotionsPage />;
    }
    if (currentPath === '/admin/settings/links') {
      return <AdminPublicLinksPage />;
    }
    return <Navigate to='/admin' replace />;
  };

  return (
    <div className='workspace admin-workspace'>
      <aside className='sidebar'>
        <div className='sidebar-heading'>
          <NavLink to='/admin' className='brand' end>
<<<<<<< HEAD
            <span className='brand-mark'>A</span>
            <span>MKM Admin<span className='brand-caption'>ADMIN PANEL</span></span>
=======
            <span className='brand-mark'>OT</span>
            <span>Online Trade Admin<span className='brand-caption'>ADMIN PANEL</span></span>
>>>>>>> d1aaf18 (Update OnlineTrade project)
          </NavLink>
          <button className='workspace-menu-toggle' type='button' aria-expanded={navOpen} aria-controls='admin-navigation' aria-label={navOpen ? 'Close admin navigation' : 'Open admin navigation'} onClick={() => setNavOpen((open) => !open)}>
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <p className='nav-label'>ADMIN</p>
        <nav id='admin-navigation' className={navOpen ? 'is-open' : ''} aria-label='Admin navigation'>
          {adminNavItems.map(({ to, label }) => (
<<<<<<< HEAD
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive || (to === '/admin' && isDashboard) ? 'active' : ''}`} end={to === '/admin'}>
=======
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive || (to === '/admin' && isDashboard) ? 'active' : ''}`} end>
>>>>>>> d1aaf18 (Update OnlineTrade project)
              {label}
            </NavLink>
          ))}
        </nav>
        <div className='sidebar-bottom'>
          <span className='avatar'>{user?.fullName?.slice(0, 1).toUpperCase()}</span>
          <div className='user-chip'><strong>{user?.fullName}</strong><small>ADMIN</small></div>
          <button className='sign-out-button' type='button' onClick={onSignOut}><LogOut size={16} /> Log out</button>
        </div>
      </aside>
      <main className='main-area'>
        <header className='topbar'>
          <div>
            <p className='eyebrow'>ADMIN AREA</p>
            <h1>{currentTitle}</h1>
          </div>
        </header>
        <div className='content'>
          {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
          {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}
          {renderAdminPage()}
        </div>
      </main>
      <nav className='customer-mobile-footer admin-mobile-footer' aria-label='Mobile admin navigation'>
        {mobileMenuOpen && (
          <div className='customer-mobile-menu'>
            <div className='customer-mobile-menu-heading'>
              <strong>All admin pages</strong>
              <button type='button' className='customer-mobile-menu-close' onClick={() => setMobileMenuOpen(false)} aria-label='Close all pages menu'><X size={18} /></button>
            </div>
            <div className='customer-mobile-menu-grid'>
              {adminNavItems.map(({ to, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `customer-mobile-menu-link ${isActive || (to === '/admin' && isDashboard) ? 'active' : ''}`} end={to === '/admin'}>
<<<<<<< HEAD
                  <span>{label}</span>
=======
                  <span>{t(label)}</span>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                </NavLink>
              ))}
              <button type='button' className='customer-mobile-menu-link admin-mobile-logout' onClick={onSignOut}><LogOut size={18} /><span>Log out</span></button>
            </div>
          </div>
        )}
        <div className='customer-mobile-dock'>
          {adminNavItems.filter(({ to }) => ['/admin', '/admin/customers', '/admin/recharges', '/admin/withdrawals'].includes(to)).map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `customer-mobile-dock-link ${isActive || (to === '/admin' && isDashboard) ? 'active' : ''}`} end={to === '/admin'}>
              <span>{({ Dashboard: 'Home', Customers: 'Users', Recharges: 'Recharge', Withdrawals: 'Payouts' })[label] ?? label}</span>
            </NavLink>
          ))}
          <button type='button' className={`customer-mobile-dock-link ${mobileMenuOpen ? 'active' : ''}`} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            <span>{mobileMenuOpen ? 'Close' : 'More'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function AdminDashboardPage({ stats }) {
  const data = stats ?? {};
  return (
    <>
      <div className='metric-grid'>
        <Metric label='Total customers' value={data.total_customers ?? 0} />
        <Metric label='Customers with investments' value={data.active_customers ?? 0} />
        <Metric label='Pending recharges' value={data.pending_recharges ?? 0} />
        <Metric label='Approved recharge total' value={money(data.approved_recharge_total ?? 0)} />
        <Metric label='Pending withdrawals' value={data.pending_withdrawals ?? 0} />
        <Metric label='Completed withdrawal total' value={money(data.completed_withdrawal_total ?? 0)} />
        <Metric label='Total products' value={data.total_products ?? 0} />
        <Metric label='Active products' value={data.active_products ?? 0} />
      </div>
      <div className='dashboard-quick-actions' aria-label='Admin shortcuts'>
        <Link className='dashboard-quick-action' to='/admin/products'>
          <Package size={19} aria-hidden='true' />
          <span><strong>Products</strong><small>Manage product listings</small></span>
        </Link>
        <Link className='dashboard-quick-action' to='/admin/support/chat'>
          <MessageCircle size={19} aria-hidden='true' />
          <span><strong>Chat Inbox</strong><small>View customer messages</small></span>
        </Link>
        <Link className='dashboard-quick-action' to='/admin/withdrawals'>
          <ArrowUpFromLine size={19} aria-hidden='true' />
          <span><strong>Withdrawals</strong><small>Review payout requests</small></span>
        </Link>
        <Link className='dashboard-quick-action' to='/admin/recharges'>
          <ArrowDownToLine size={19} aria-hidden='true' />
          <span><strong>Recharges</strong><small>Review deposit requests</small></span>
        </Link>
      </div>
    </>
  );
}

function AdminCustomersPage({ customers: initialCustomers, paymentMethods, onError }) {
  const [customers, setCustomers] = useState(initialCustomers?.items ?? []);
  const [pagination, setPagination] = useState(initialCustomers?.pagination ?? { page: 1, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetCustomerId, setResetCustomerId] = useState(null);
  const [editProfileId, setEditProfileId] = useState(null);
  const [editAccountId, setEditAccountId] = useState(null);
  const [pendingCustomerId, setPendingCustomerId] = useState(null);
  const [notice, setNotice] = useState('');
  const [penaltyInputs, setPenaltyInputs] = useState({});
  const penaltyKeys = useRef({});

  // Details modal state
  const [viewCustomerDetails, setViewCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Deactivate modal state
  const [deactivatingCustomer, setDeactivatingCustomer] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateAdminPassword, setDeactivateAdminPassword] = useState('');

  // Details modal state
  const [viewCustomerDetails, setViewCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Deactivate modal state
  const [deactivatingCustomer, setDeactivatingCustomer] = useState(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [deactivateAdminPassword, setDeactivateAdminPassword] = useState('');

  useEffect(() => {
    setCustomers(initialCustomers?.items ?? []);
    setPagination(initialCustomers?.pagination ?? { page: 1, pages: 1, total: 0 });
  }, [initialCustomers]);

  async function loadCustomers(nextPage = 1, nextQuery = query, nextStatus = statusFilter) {
    setLoading(true);
    onError('');
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: '25' });
      if (nextQuery.trim()) params.set('search', nextQuery.trim());
      if (nextStatus) params.set('status', nextStatus);
      const result = await api(`/admin/customers?${params}`);
      setCustomers(result.items ?? []);
      setPagination(result.pagination ?? { page: nextPage, pages: 1, total: 0 });
    } catch (cause) {
      onError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDetails(customerId) {
    setDetailsLoading(true);
    onError('');
    try {
      const details = await api(`/admin/customers/${customerId}`);
      setViewCustomerDetails(details);
    } catch (cause) {
      onError(cause.message);
    } finally {
      setDetailsLoading(false);
    }
  }

<<<<<<< HEAD
=======
  async function applyPenalty(event, customer) {
    event.preventDefault();
    const input = penaltyInputs[customer.id] ?? {};
    const amount = String(input.amount ?? '').trim();
    const comment = String(input.comment ?? '').trim();
    if (!/^(?:0|[1-9]\d{0,17})(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      onError('Enter a valid penalty amount greater than zero.');
      return;
    }
    if (!comment) {
      onError('Enter a reason for the customer penalty.');
      return;
    }
    if (!window.confirm(`Deduct ${money(amount)} from ${customer.fullName}'s available balance?\n\nReason: ${comment}\n\nThe customer will be notified.`)) {
      return;
    }
    setPendingCustomerId(customer.id);
    onError('');
    setNotice('');
    try {
      penaltyKeys.current[customer.id] ??= crypto.randomUUID();
      await api(`/admin/customers/${customer.id}/penalties`, {
        method: 'POST',
        idempotencyKey: penaltyKeys.current[customer.id],
        ...jsonBody({ amount, comment }),
      });
      delete penaltyKeys.current[customer.id];
      setPenaltyInputs((current) => ({ ...current, [customer.id]: { amount: '', comment: '' } }));
      setNotice(`Deducted ${money(amount)} from ${customer.fullName}. They were notified.`);
      await loadCustomers(pagination.page);
    } catch (cause) {
      onError(cause.message);
    } finally {
      setPendingCustomerId(null);
    }
  }

>>>>>>> d1aaf18 (Update OnlineTrade project)
  async function saveCustomerProfile(event, customer) {
    event.preventDefault();
    const form = event.currentTarget;
    setPendingCustomerId(customer.id);
    setNotice('');
    onError('');
    try {
      await api(`/admin/customers/${customer.id}/profile`, {
        method: 'PUT',
        ...jsonBody(Object.fromEntries(new FormData(form))),
      });
      setNotice(`Updated ${customer.fullName}'s profile.`);
      setEditProfileId(null);
      await loadCustomers(pagination.page);
    } catch (cause) {
      onError(cause.message);
    } finally {
      setPendingCustomerId(null);
    }
  }

  async function saveWithdrawalAccount(event, customer, account) {
    event.preventDefault();
    const form = event.currentTarget;
    setPendingCustomerId(customer.id);
    setNotice('');
    onError('');
    try {
      await api(`/admin/customers/${customer.id}/withdrawal-accounts/${account.id}`, {
        method: 'PUT',
        ...jsonBody(Object.fromEntries(new FormData(form))),
      });
      setNotice(`Updated ${account.paymentProvider} payout details for ${customer.fullName}.`);
      setEditAccountId(null);
      await loadCustomers(pagination.page);
    } catch (cause) {
      onError(cause.message);
    } finally {
      setPendingCustomerId(null);
    }
  }

  async function resetPassword(event, customer) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setPendingCustomerId(customer.id);
    setNotice('');
    onError('');
    try {
      await api(`/admin/customers/${customer.id}/password-reset`, {
        method: 'POST',
        ...jsonBody(data),
      });
      setNotice(`Login password reset for ${customer.fullName}. Their active sessions were signed out.`);
      setResetCustomerId(null);
      form.reset();
    } catch (cause) {
      onError(cause.message);
    } finally {
      setPendingCustomerId(null);
    }
  }

  async function handleToggleStatus(customer, targetStatus, reason = '', adminPassword = '') {
    setPendingCustomerId(customer.id);
    setNotice('');
    onError('');
    try {
      const payload = { status: targetStatus };
      if (reason.trim()) payload.reason = reason.trim();
      if (adminPassword.trim()) payload.adminPassword = adminPassword.trim();
      const res = await api(`/admin/customers/${customer.id}/status`, {
        method: 'PATCH',
        ...jsonBody(payload),
      });
      setNotice(
        targetStatus === 'ACTIVE'
          ? `Customer ${customer.fullName} has been reactivated successfully.`
          : `Customer ${customer.fullName} has been deactivated. ${res.sessionsRevoked ?? 0} active session(s) were revoked. Financial history remains preserved.`
      );
      setDeactivatingCustomer(null);
      setDeactivateReason('');
      setDeactivateAdminPassword('');
      await loadCustomers(pagination.page);
    } catch (cause) {
      onError(cause.message);
    } finally {
      setPendingCustomerId(null);
    }
  }

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>CUSTOMERS</p>
          <h3>Customer list & account management</h3>
        </div>
      </div>
      <form
        className='customer-search-row'
        onSubmit={(event) => {
          event.preventDefault();
          setQuery(search);
          loadCustomers(1, search, statusFilter);
        }}
      >
        <label className='field'>
          <span>Search customers</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Name, phone, or referral code'
          />
        </label>
        <label className='field' style={{ maxWidth: '180px' }}>
          <span>Status filter</span>
          <select
            value={statusFilter}
            onChange={(event) => {
              const val = event.target.value;
              setStatusFilter(val);
              loadCustomers(1, search, val);
            }}
          >
            <option value=''>All Statuses</option>
            <option value='ACTIVE'>Active</option>
            <option value='SUSPENDED'>Suspended</option>
            <option value='DEACTIVATED'>Deactivated</option>
          </select>
        </label>
        <button className='primary-button' type='submit' disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
        <button
          className='secondary-button'
          type='button'
          disabled={loading}
          onClick={() => {
            setSearch('');
            setQuery('');
            setStatusFilter('');
            loadCustomers(1, '', '');
          }}
        >
          Clear
        </button>
      </form>
      {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}

      {/* Customer Details Modal */}
      {viewCustomerDetails && (
        <div className='surface form-surface' style={{ margin: '16px 0', border: '2px solid var(--line)' }}>
          <div className='surface-heading'>
            <div>
              <p className='eyebrow'>CUSTOMER DETAILS</p>
              <h3>{viewCustomerDetails.fullName} ({viewCustomerDetails.phoneNumber})</h3>
            </div>
            <button className='secondary-button' type='button' onClick={() => setViewCustomerDetails(null)}>✕ Close</button>
          </div>
          <div className='metric-grid' style={{ marginTop: '12px' }}>
            <div className='metric'><span>Status</span><StatusBadge status={viewCustomerDetails.status} /></div>
            <div className='metric'><span>Available Wallet</span><strong className='green'>{money(viewCustomerDetails.wallet?.availableBalance ?? 0)}</strong></div>
            <div className='metric'><span>Locked Wallet</span><strong>{money(viewCustomerDetails.wallet?.lockedBalance ?? 0)}</strong></div>
            <div className='metric'><span>Approved Deposits</span><strong className='green'>{money(viewCustomerDetails.recharges?.approvedTotal ?? 0)} ({viewCustomerDetails.recharges?.count ?? 0})</strong></div>
            <div className='metric'><span>Completed Payouts</span><strong>{money(viewCustomerDetails.withdrawals?.completedTotal ?? 0)} ({viewCustomerDetails.withdrawals?.count ?? 0})</strong></div>
<<<<<<< HEAD
            <div className='metric'><span>Active Packages</span><strong className='green'>{viewCustomerDetails.purchases?.activeCount ?? 0}</strong></div>
=======
            <div className='metric'><span>Active Investments</span><strong className='green'>{viewCustomerDetails.purchases?.activeCount ?? 0}</strong></div>
>>>>>>> d1aaf18 (Update OnlineTrade project)
          </div>
          {viewCustomerDetails.recentTransactions?.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <p className='eyebrow'>RECENT TRANSACTIONS</p>
              <div className='table-wrap'>
                <table>
                  <thead>
                    <tr><th>Type</th><th>Amount</th><th>Direction</th><th>Status</th><th>Description</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {viewCustomerDetails.recentTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{tx.type}</td>
                        <td>{money(tx.amount)}</td>
                        <td><span style={{ color: tx.direction === 'CREDIT' ? '#16a34a' : '#dc2626' }}>{tx.direction}</span></td>
                        <td><StatusBadge status={tx.status} /></td>
                        <td>{tx.description}</td>
                        <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deactivation Confirmation Modal */}
      {deactivatingCustomer && (
        <div className='surface form-surface' style={{ margin: '16px 0', border: '2px solid #ef4444', background: '#fef2f2' }}>
          <div className='surface-heading'>
            <div>
              <p className='eyebrow' style={{ color: '#b91c1c' }}>PROTECTED ACTION: DEACTIVATE CUSTOMER</p>
              <h3>Deactivate {deactivatingCustomer.fullName}?</h3>
            </div>
            <button className='secondary-button' type='button' onClick={() => setDeactivatingCustomer(null)}>Cancel</button>
          </div>
          <p style={{ fontSize: '13px', color: '#7f1d1d', margin: '8px 0' }}>
            Deactivating this customer will immediately revoke all their active login sessions. They will be prohibited from signing in or accessing account services.
<<<<<<< HEAD
            <strong> All financial records, wallets, purchase history, ledger entries, and audit logs remain strictly preserved.</strong>
=======
            <strong> All financial records, wallets, investment history, ledger entries, and audit logs remain strictly preserved.</strong>
>>>>>>> d1aaf18 (Update OnlineTrade project)
          </p>
          <div className='form-stack' style={{ maxWidth: '420px', marginTop: '12px' }}>
            <label className='field'>
              <span>Reason for deactivation (optional)</span>
              <input
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                placeholder='e.g. Terms violation or suspicious activity'
                maxLength={500}
              />
            </label>
            <label className='field'>
              <span>Confirm admin password (optional)</span>
              <input
                type='password'
                value={deactivateAdminPassword}
                onChange={(e) => setDeactivateAdminPassword(e.target.value)}
                placeholder='Your admin password'
                autoComplete='current-password'
              />
            </label>
            <div className='button-row compact'>
              <button
                className='primary-button'
                type='button'
                style={{ background: '#dc2626', borderColor: '#b91c1c' }}
                disabled={pendingCustomerId === deactivatingCustomer.id}
                onClick={() => handleToggleStatus(deactivatingCustomer, 'DEACTIVATED', deactivateReason, deactivateAdminPassword)}
              >
                {pendingCustomerId === deactivatingCustomer.id ? 'Deactivating…' : 'Confirm Deactivate'}
              </button>
              <button className='secondary-button' type='button' onClick={() => setDeactivatingCustomer(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {customers.length ? (
        <div className='table-wrap admin-compact-table admin-customers-table'>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Wallet Balance</th>
                <th>Referral</th>
                <th>Withdrawal accounts</th>
<<<<<<< HEAD
=======
                <th>Penalty</th>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                <th>Registered</th>
                <th>Customer actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    {editProfileId === customer.id ? (
                      <form className='form-stack' onSubmit={(event) => saveCustomerProfile(event, customer)}>
                        <label className='field'><span>Full name</span><input name='fullName' defaultValue={customer.fullName} minLength='2' maxLength='120' required /></label>
                        <label className='field'><span>Phone (9 digits)</span><input name='phoneNumber' defaultValue={customer.phoneNumber} pattern='[97][0-9]{8}' maxLength='9' required /></label>
                        <label className='field'><span>Confirm admin password</span><input name='adminPassword' type='password' autoComplete='current-password' required /></label>
                        <div className='button-row compact'>
                          <button className='primary-button' type='submit' disabled={pendingCustomerId === customer.id}>{pendingCustomerId === customer.id ? 'Saving…' : 'Save profile'}</button>
                          <button className='secondary-button' type='button' onClick={() => setEditProfileId(null)}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <strong>{customer.fullName}</strong>
                        <button className='secondary-button' type='button' style={{ marginLeft: '6px', padding: '2px 8px', fontSize: '11px' }} onClick={() => setEditProfileId(customer.id)}>Edit</button>
                      </>
                    )}
                  </td>
                  <td>{customer.phoneNumber}</td>
                  <td><StatusBadge status={customer.status} /></td>
                  <td>
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '12px', display: 'block' }}>
                      Avail: {money(customer.availableBalance ?? 0)}
                    </span>
                    <small style={{ color: '#6b7280', fontSize: '11px', display: 'block' }}>
                      Locked: {money(customer.lockedBalance ?? 0)}
                    </small>
                  </td>
                  <td>{customer.referralCode}</td>
                  <td>{customer.withdrawalAccounts?.length ? customer.withdrawalAccounts.map((account) => (
                    <section className='nested-surface form-stack' key={account.id} style={{ marginBottom: '4px' }}>
                      <strong>{account.paymentProvider}</strong>
                      {editAccountId === account.id ? (
                        <form className='form-stack' onSubmit={(event) => saveWithdrawalAccount(event, customer, account)}>
                          <label className='field'><span>Payment provider</span>
                            <select name='paymentMethodId' defaultValue={account.paymentMethodId} required>
                              {paymentMethods.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                            </select>
                          </label>
                          <label className='field'><span>Account holder name</span><input name='accountHolderName' defaultValue={account.accountHolderName} minLength='2' maxLength='120' required /></label>
                          <label className='field'><span>Full account / phone number</span><input name='accountNumber' defaultValue={account.accountNumber} minLength='3' maxLength='120' required /></label>
                          <label className='field'><span>Linked phone number (optional)</span><input name='phoneNumber' defaultValue={account.phoneNumber ?? ''} maxLength='40' /></label>
                          <label className='field'><span>Confirm admin password</span><input name='adminPassword' type='password' autoComplete='current-password' required /></label>
                          <div className='button-row compact'>
                            <button className='primary-button' type='submit' disabled={pendingCustomerId === customer.id}>{pendingCustomerId === customer.id ? 'Saving…' : 'Save account'}</button>
                            <button className='secondary-button' type='button' onClick={() => setEditAccountId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <small>{account.accountHolderName} · {account.accountNumber || account.phoneNumber || '—'}</small>
                          <button className='secondary-button' type='button' style={{ padding: '2px 8px', fontSize: '11px' }} onClick={() => setEditAccountId(account.id)}>Edit payout</button>
                        </>
                      )}
                    </section>
                  )) : '—'}</td>
<<<<<<< HEAD
=======
                  <td>
                    {customer.role === 'CUSTOMER' ? (
                      <form className='customer-penalty-form' onSubmit={(event) => applyPenalty(event, customer)}>
                        <label>
                          <span>Amount (ETB)</span>
                          <input
                            type='number'
                            min='0.01'
                            step='0.01'
                            value={penaltyInputs[customer.id]?.amount ?? ''}
                            onChange={(event) => setPenaltyInputs((current) => ({
                              ...current,
                              [customer.id]: { ...current[customer.id], amount: event.target.value },
                            }))}
                            required
                          />
                        </label>
                        <label>
                          <span>Reason</span>
                          <textarea
                            value={penaltyInputs[customer.id]?.comment ?? ''}
                            onChange={(event) => setPenaltyInputs((current) => ({
                              ...current,
                              [customer.id]: { ...current[customer.id], comment: event.target.value },
                            }))}
                            maxLength={1000}
                            rows={2}
                            required
                          />
                        </label>
                        <button className='secondary-button' type='submit' disabled={pendingCustomerId === customer.id}>
                          {pendingCustomerId === customer.id ? 'Applying…' : 'Deduct & notify'}
                        </button>
                      </form>
                    ) : '—'}
                  </td>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                  <td>{new Date(customer.registeredAt).toLocaleDateString()}</td>
                  <td>
                    <div className='form-stack' style={{ gap: '6px' }}>
                      <button
                        className='secondary-button'
                        type='button'
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        disabled={detailsLoading}
                        onClick={() => loadDetails(customer.id)}
                      >
                        View details
                      </button>
<<<<<<< HEAD
=======
                      {customer.role === 'CUSTOMER' && (
                        <Link
                          className='secondary-button admin-customer-chat-link'
                          to={`/admin/support/chat?customerId=${encodeURIComponent(customer.id)}&customerName=${encodeURIComponent(customer.fullName)}`}
                        >
                          <MessageCircle size={14} aria-hidden='true' /> Chat
                        </Link>
                      )}
>>>>>>> d1aaf18 (Update OnlineTrade project)

                      {customer.role === 'CUSTOMER' && (
                        resetCustomerId === customer.id ? (
                          <form className='form-stack' onSubmit={(event) => resetPassword(event, customer)}>
                            <label className='field'><span>Admin password</span><input name='adminPassword' type='password' autoComplete='current-password' required /></label>
                            <label className='field'><span>New password</span><input name='newPassword' type='password' minLength='6' maxLength='128' autoComplete='new-password' required /></label>
                            <label className='field'><span>Confirm password</span><input name='confirmNewPassword' type='password' minLength='6' maxLength='128' autoComplete='new-password' required /></label>
                            <div className='button-row compact'>
                              <button className='primary-button' type='submit' disabled={pendingCustomerId === customer.id}>{pendingCustomerId === customer.id ? 'Resetting…' : 'Reset'}</button>
                              <button className='secondary-button' type='button' onClick={() => setResetCustomerId(null)}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <button className='secondary-button' type='button' style={{ padding: '3px 8px', fontSize: '11px' }} onClick={() => { setNotice(''); setResetCustomerId(customer.id); }}>
                            Reset password
                          </button>
                        )
                      )}

                      {customer.role === 'CUSTOMER' && (
                        customer.status === 'ACTIVE' ? (
                          <button
                            className='secondary-button'
                            type='button'
                            style={{ padding: '3px 8px', fontSize: '11px', color: '#dc2626', borderColor: '#fca5a5' }}
                            disabled={pendingCustomerId === customer.id}
                            onClick={() => {
                              setNotice('');
                              setDeactivatingCustomer(customer);
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className='secondary-button'
                            type='button'
                            style={{ padding: '3px 8px', fontSize: '11px', color: '#16a34a', borderColor: '#86efac' }}
                            disabled={pendingCustomerId === customer.id}
                            onClick={() => handleToggleStatus(customer, 'ACTIVE')}
                          >
                            {pendingCustomerId === customer.id ? 'Reactivating…' : 'Reactivate'}
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : loading ? <Empty>Loading customers…</Empty> : <Empty>No customers found.</Empty>}
      <div className='button-row customer-pagination'>
        <span className='quiet-label'>PAGE {pagination.page ?? 1} OF {pagination.pages ?? 1} · {pagination.total ?? customers.length} CUSTOMERS</span>
        <button className='secondary-button' type='button' disabled={loading || (pagination.page ?? 1) <= 1} onClick={() => loadCustomers((pagination.page ?? 1) - 1)}>Previous</button>
        <button className='secondary-button' type='button' disabled={loading || (pagination.page ?? 1) >= (pagination.pages ?? 1)} onClick={() => loadCustomers((pagination.page ?? 1) + 1)}>Next</button>
      </div>
    </section>
  );
}

function AdminProfilePage({ user, onError, onNotice }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function loadProfile() {
    setLoading(true);
    onError('');
    try {
      const data = await api('/admin/profile');
      setProfile(data);
    } catch (cause) {
      onError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setProfileBusy(true);
    onError('');
    onNotice('');
    try {
      const updated = await api('/admin/profile', {
        method: 'PATCH',
        ...jsonBody(data),
      });
      setProfile(updated);
      onNotice('Your administrator profile was updated successfully.');
    } catch (cause) {
      onError(cause.message);
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setPasswordBusy(true);
    onError('');
    onNotice('');
    try {
      await api('/admin/profile/password', {
        method: 'PATCH',
        ...jsonBody(data),
      });
      form.reset();
      onNotice('Your admin password was changed. All other active sessions were signed out.');
    } catch (cause) {
      onError(cause.message);
    } finally {
      setPasswordBusy(false);
    }
  }

  if (loading) {
    return <section className='surface form-surface'><Empty>Loading administrator profile…</Empty></section>;
  }

  const p = profile ?? user ?? {};

  return (
    <div className='form-stack' style={{ gap: '20px' }}>
      {/* Account Overview Card */}
      <section className='surface form-surface'>
        <div className='surface-heading'>
          <div>
            <p className='eyebrow'>ADMIN PROFILE</p>
            <h3>Account overview</h3>
          </div>
          <StatusBadge status={p.status ?? 'ACTIVE'} />
        </div>
        <div className='metric-grid' style={{ marginTop: '14px' }}>
          <div className='metric'>
            <span>Administrator</span>
            <strong>{p.fullName}</strong>
            <small>NAME</small>
          </div>
          <div className='metric'>
            <span>Phone number</span>
            <strong>{p.phoneNumber}</strong>
            <small>ETHIOPIAN PHONE</small>
          </div>
          <div className='metric'>
            <span>Access level</span>
            <strong className={p.isSuperAdmin ? 'green' : ''}>
              {p.isSuperAdmin ? 'SUPER ADMIN' : 'ADMINISTRATOR'}
            </strong>
            <small>ROLE</small>
          </div>
          <div className='metric'>
            <span>Member since</span>
            <strong>{p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : '—'}</strong>
            <small>REGISTERED</small>
          </div>
        </div>

        {/* Assigned Privileges */}
        <div style={{ marginTop: '16px' }}>
          <p className='eyebrow'>ASSIGNED PRIVILEGES</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {p.isSuperAdmin || p.privileges?.includes('*') ? (
              <span className='status-badge status-approved' style={{ padding: '6px 12px', fontSize: '12px' }}>
                ★ Full Unrestricted Privileges (Super Admin)
              </span>
            ) : p.privileges?.length ? (
              p.privileges.map((priv) => (
                <span key={priv} className='status-badge' style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px' }}>
                  {priv}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '13px', opacity: 0.6 }}>No specific module privileges assigned.</span>
            )}
          </div>
        </div>
      </section>

      {/* Edit Profile Information Form */}
      <section className='surface form-surface'>
        <div className='surface-heading'>
          <div>
            <p className='eyebrow'>PERSONAL INFORMATION</p>
            <h3>Edit profile details</h3>
          </div>
        </div>
        <form className='form-stack' onSubmit={saveProfile} style={{ maxWidth: '480px', marginTop: '12px' }}>
          <label className='field'>
            <span>Full name</span>
            <input name='fullName' defaultValue={p.fullName ?? ''} minLength='2' maxLength='120' required />
          </label>
          <label className='field'>
            <span>Phone number (9 digits, starts with 9 or 7)</span>
            <input name='phoneNumber' defaultValue={p.phoneNumber ?? ''} pattern='[97][0-9]{8}' maxLength='9' required />
          </label>
          <button className='primary-button' type='submit' disabled={profileBusy}>
            {profileBusy ? 'Saving profile…' : 'Save profile changes'} <span>↗</span>
          </button>
        </form>
      </section>

      {/* Security & Password Change */}
      <section className='surface form-surface'>
        <div className='surface-heading'>
          <div>
            <p className='eyebrow'>SECURITY</p>
            <h3>Change administrator password</h3>
          </div>
        </div>
        <p className='form-subtitle'>
          Confirm your current password to set a new one. Changing your password immediately revokes all other active administrator sessions.
        </p>
        <form className='form-stack' onSubmit={changePassword} style={{ maxWidth: '480px', marginTop: '12px' }}>
          <label className='field'>
            <span>Current password</span>
            <input name='currentPassword' type='password' autoComplete='current-password' required />
          </label>
          <label className='field'>
            <span>New password (min 6 characters)</span>
            <input name='newPassword' type='password' minLength='6' maxLength='128' autoComplete='new-password' required />
          </label>
          <label className='field'>
            <span>Confirm new password</span>
            <input name='confirmNewPassword' type='password' minLength='6' maxLength='128' autoComplete='new-password' required />
          </label>
          <button className='primary-button' type='submit' disabled={passwordBusy}>
            {passwordBusy ? 'Updating password…' : 'Change password'} <span>↗</span>
          </button>
        </form>
      </section>
    </div>
  );
}

const ALL_PRIVILEGES_LIST = [
  { key: 'CUSTOMER_VIEW', label: 'View customers' },
  { key: 'CUSTOMER_MANAGE', label: 'Manage & deactivate customers' },
  { key: 'PRODUCT_VIEW', label: 'View products' },
  { key: 'PRODUCT_MANAGE', label: 'Create & edit products' },
  { key: 'RECHARGE_VIEW', label: 'View deposits & recharges' },
  { key: 'RECHARGE_APPROVE', label: 'Approve & reject recharges' },
  { key: 'WITHDRAWAL_VIEW', label: 'View withdrawal requests' },
  { key: 'WITHDRAWAL_APPROVE', label: 'Approve & process payouts' },
  { key: 'TRANSACTION_VIEW', label: 'View ledger & transactions' },
  { key: 'TASK_VIEW', label: 'View daily task progress' },
  { key: 'TASK_MANAGE', label: 'Manage daily tasks & rewards' },
  { key: 'REFERRAL_VIEW', label: 'View referral network' },
  { key: 'SETTINGS_VIEW', label: 'View platform settings' },
  { key: 'SETTINGS_MANAGE', label: 'Modify platform settings' },
  { key: 'ADMIN_VIEW', label: 'View administrator accounts' },
  { key: 'ADMIN_CREATE', label: 'Create new administrators' },
  { key: 'ADMIN_MANAGE', label: 'Manage administrator privileges' },
];

function AdminManagementPage({ user, onError, onNotice }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [busyAdminId, setBusyAdminId] = useState(null);
  const [addBusy, setAddBusy] = useState(false);

  // Form states for adding admin
  const [addIsSuperAdmin, setAddIsSuperAdmin] = useState(false);
  const [addPrivileges, setAddPrivileges] = useState([]);

  // Form states for editing privileges
  const [editIsSuperAdmin, setEditIsSuperAdmin] = useState(false);
  const [editPrivileges, setEditPrivileges] = useState([]);

  async function loadAdmins() {
    setLoading(true);
    onError('');
    try {
      const data = await api('/admin/admins');
      setAdmins(data);
    } catch (cause) {
      onError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  function toggleAddPrivilege(key) {
    setAddPrivileges((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  function toggleEditPrivilege(key) {
    setEditPrivileges((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  async function submitAddAdmin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.isSuperAdmin = addIsSuperAdmin;
    data.privileges = addIsSuperAdmin ? ['*'] : addPrivileges;

    setAddBusy(true);
    onError('');
    onNotice('');
    try {
      const created = await api('/admin/admins', {
        method: 'POST',
        ...jsonBody(data),
      });
      onNotice(`Administrator ${created.fullName} created successfully.`);
      setAddModalOpen(false);
      setAddIsSuperAdmin(false);
      setAddPrivileges([]);
      form.reset();
      await loadAdmins();
    } catch (cause) {
      onError(cause.message);
    } finally {
      setAddBusy(false);
    }
  }

  async function submitEditPrivileges(event) {
    event.preventDefault();
    if (!editingAdmin) return;
    setBusyAdminId(editingAdmin.id);
    onError('');
    onNotice('');
    try {
      const payload = {
        isSuperAdmin: editIsSuperAdmin,
        privileges: editIsSuperAdmin ? ['*'] : editPrivileges,
      };
      const updated = await api(`/admin/admins/${editingAdmin.id}`, {
        method: 'PATCH',
        ...jsonBody(payload),
      });
      onNotice(`Privileges for ${updated.fullName} updated successfully.`);
      setEditingAdmin(null);
      await loadAdmins();
    } catch (cause) {
      onError(cause.message);
    } finally {
      setBusyAdminId(null);
    }
  }

  async function toggleAdminStatus(admin, newStatus) {
    setBusyAdminId(admin.id);
    onError('');
    onNotice('');
    try {
      const updated = await api(`/admin/admins/${admin.id}`, {
        method: 'PATCH',
        ...jsonBody({ status: newStatus }),
      });
      onNotice(
        newStatus === 'ACTIVE'
          ? `Administrator ${admin.fullName} reactivated.`
          : `Administrator ${admin.fullName} deactivated. All their active sessions were revoked.`
      );
      await loadAdmins();
    } catch (cause) {
      onError(cause.message);
    } finally {
      setBusyAdminId(null);
    }
  }

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>ADMINISTRATION</p>
          <h3>Administrator accounts & RBAC privilege management</h3>
        </div>
        <button
          className='primary-button'
          type='button'
          onClick={() => {
            setAddModalOpen(true);
            setAddIsSuperAdmin(false);
            setAddPrivileges([]);
          }}
        >
          + Add New Admin
        </button>
      </div>

      {/* Add New Admin Modal / Drawer */}
      {addModalOpen && (
        <div className='surface form-surface' style={{ margin: '16px 0', border: '2px solid var(--line)' }}>
          <div className='surface-heading'>
            <div>
              <p className='eyebrow'>CREATE ADMINISTRATOR</p>
              <h3>New administrator details</h3>
            </div>
            <button className='secondary-button' type='button' onClick={() => setAddModalOpen(false)}>✕ Cancel</button>
          </div>
          <form className='form-stack' onSubmit={submitAddAdmin} style={{ marginTop: '14px' }}>
            <div className='profile-form-grid'>
              <label className='field'>
                <span>Full name</span>
                <input name='fullName' placeholder='e.g. Abebe Kebede' minLength='2' maxLength='120' required />
              </label>
              <label className='field'>
                <span>Ethiopian phone (9 digits, 9... or 7...)</span>
                <input name='phoneNumber' placeholder='911223344' pattern='[97][0-9]{8}' maxLength='9' required />
              </label>
              <label className='field'>
                <span>Password</span>
                <input name='password' type='password' minLength='6' maxLength='128' autoComplete='new-password' required />
              </label>
              <label className='field'>
                <span>Confirm password</span>
                <input name='confirmPassword' type='password' minLength='6' maxLength='128' autoComplete='new-password' required />
              </label>
            </div>

            {/* Super admin toggle */}
            <div style={{ marginTop: '8px' }}>
              <label className='field checkbox-field' style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type='checkbox'
                  checked={addIsSuperAdmin}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setAddIsSuperAdmin(checked);
                    if (checked) {
                      setAddPrivileges(ALL_PRIVILEGES_LIST.map((p) => p.key));
                    }
                  }}
                />
                <strong>Super Administrator (Full unrestricted access across all modules)</strong>
              </label>
            </div>

            {/* Privilege Selection */}
            {!addIsSuperAdmin && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p className='eyebrow' style={{ margin: 0 }}>ASSIGN SPECIFIC MODULE PRIVILEGES</p>
                  <div className='button-row compact'>
                    <button
                      type='button'
                      className='secondary-button'
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => setAddPrivileges(ALL_PRIVILEGES_LIST.map((p) => p.key))}
                    >
                      Select all
                    </button>
                    <button
                      type='button'
                      className='secondary-button'
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => setAddPrivileges([])}
                    >
                      Deselect all
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                  {ALL_PRIVILEGES_LIST.map((p) => (
                    <label
                      key={p.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: addPrivileges.includes(p.key) ? '#e0f2fe' : '#f9fafb',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <input
                        type='checkbox'
                        checked={addPrivileges.includes(p.key)}
                        onChange={() => toggleAddPrivilege(p.key)}
                      />
                      <span><strong>{p.key}</strong><br /><small style={{ opacity: 0.7 }}>{p.label}</small></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className='button-row' style={{ marginTop: '16px' }}>
              <button className='primary-button' type='submit' disabled={addBusy}>
                {addBusy ? 'Creating administrator…' : 'Create Administrator'} <span>↗</span>
              </button>
              <button className='secondary-button' type='button' onClick={() => setAddModalOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Admin Privileges Modal */}
      {editingAdmin && (
        <div className='surface form-surface' style={{ margin: '16px 0', border: '2px solid #0284c7' }}>
          <div className='surface-heading'>
            <div>
              <p className='eyebrow'>MANAGE PRIVILEGES</p>
              <h3>Edit access for {editingAdmin.fullName} ({editingAdmin.phoneNumber})</h3>
            </div>
            <button className='secondary-button' type='button' onClick={() => setEditingAdmin(null)}>✕ Cancel</button>
          </div>
          <form className='form-stack' onSubmit={submitEditPrivileges} style={{ marginTop: '14px' }}>
            <label className='field checkbox-field' style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type='checkbox'
                checked={editIsSuperAdmin}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setEditIsSuperAdmin(checked);
                  if (checked) {
                    setEditPrivileges(ALL_PRIVILEGES_LIST.map((p) => p.key));
                  }
                }}
              />
              <strong>Super Administrator (Full unrestricted access)</strong>
            </label>

            {!editIsSuperAdmin && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <p className='eyebrow' style={{ margin: 0 }}>ASSIGN SPECIFIC MODULE PRIVILEGES</p>
                  <div className='button-row compact'>
                    <button
                      type='button'
                      className='secondary-button'
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => setEditPrivileges(ALL_PRIVILEGES_LIST.map((p) => p.key))}
                    >
                      Select all
                    </button>
                    <button
                      type='button'
                      className='secondary-button'
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                      onClick={() => setEditPrivileges([])}
                    >
                      Deselect all
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                  {ALL_PRIVILEGES_LIST.map((p) => (
                    <label
                      key={p.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: editPrivileges.includes(p.key) ? '#e0f2fe' : '#f9fafb',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      <input
                        type='checkbox'
                        checked={editPrivileges.includes(p.key)}
                        onChange={() => toggleEditPrivilege(p.key)}
                      />
                      <span><strong>{p.key}</strong><br /><small style={{ opacity: 0.7 }}>{p.label}</small></span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className='button-row' style={{ marginTop: '16px' }}>
              <button className='primary-button' type='submit' disabled={busyAdminId === editingAdmin.id}>
                {busyAdminId === editingAdmin.id ? 'Saving…' : 'Save Privileges'} <span>↗</span>
              </button>
              <button className='secondary-button' type='button' onClick={() => setEditingAdmin(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Empty>Loading administrators…</Empty>
      ) : admins.length ? (
        <div className='table-wrap'>
          <table>
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Phone</th>
                <th>Role / Access</th>
                <th>Privileges</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const isSelf = admin.id === user?.id;
                const privs = Array.isArray(admin.privileges) ? admin.privileges : [];
                return (
                  <tr key={admin.id}>
                    <td>
                      <strong>{admin.fullName}</strong>
                      {isSelf && <small style={{ marginLeft: '6px', color: '#0369a1', fontWeight: 600 }}>(You)</small>}
                    </td>
                    <td>{admin.phoneNumber}</td>
                    <td>
                      {admin.isSuperAdmin ? (
                        <span className='status-badge status-approved'>SUPER ADMIN</span>
                      ) : (
                        <span className='status-badge'>ADMIN</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '280px' }}>
                        {admin.isSuperAdmin || privs.includes('*') ? (
                          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>All Privileges (*)</span>
                        ) : privs.length ? (
                          privs.slice(0, 4).map((pr) => (
                            <span key={pr} style={{ fontSize: '10px', background: '#f3f4f6', padding: '2px 5px', borderRadius: '3px' }}>
                              {pr}
                            </span>
                          )).concat(privs.length > 4 ? [<span key='more' style={{ fontSize: '10px', opacity: 0.6 }}>+{privs.length - 4} more</span>] : [])
                        ) : (
                          <span style={{ fontSize: '11px', opacity: 0.5 }}>None</span>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={admin.status} /></td>
                    <td>{new Date(admin.registeredAt).toLocaleDateString()}</td>
                    <td>
                      <div className='button-row compact'>
                        <button
                          className='secondary-button'
                          type='button'
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => {
                            setEditingAdmin(admin);
                            setEditIsSuperAdmin(Boolean(admin.isSuperAdmin));
                            setEditPrivileges(
                              admin.isSuperAdmin ? ALL_PRIVILEGES_LIST.map((p) => p.key) : privs
                            );
                          }}
                        >
                          Privileges
                        </button>

                        {admin.status === 'ACTIVE' ? (
                          <button
                            className='secondary-button'
                            type='button'
                            style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              color: isSelf ? '#9ca3af' : '#dc2626',
                              borderColor: isSelf ? '#e5e7eb' : '#fca5a5',
                            }}
                            disabled={isSelf || busyAdminId === admin.id}
                            title={isSelf ? 'You cannot deactivate your own account' : 'Deactivate admin'}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to deactivate administrator ${admin.fullName}? All active sessions will be revoked.`)) {
                                toggleAdminStatus(admin, 'DEACTIVATED');
                              }
                            }}
                          >
                            {busyAdminId === admin.id ? '…' : 'Deactivate'}
                          </button>
                        ) : (
                          <button
                            className='secondary-button'
                            type='button'
                            style={{ padding: '3px 8px', fontSize: '11px', color: '#16a34a', borderColor: '#86efac' }}
                            disabled={busyAdminId === admin.id}
                            onClick={() => toggleAdminStatus(admin, 'ACTIVE')}
                          >
                            {busyAdminId === admin.id ? '…' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No administrators found.</Empty>
      )}
    </section>
  );
}

function AdminPasswordPage({ onError, onNotice }) {
  const [busy, setBusy] = useState(false);

  async function changePassword(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    onError('');
    onNotice('');
    try {
      await api('/profile/password', { method: 'PATCH', ...jsonBody(data) });
      form.reset();
      onNotice('Your admin password was changed. Other active sessions were signed out.');
    } catch (cause) {
      onError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className='surface form-surface form-stack'>
      <div className='surface-heading'>
        <div><p className='eyebrow'>ACCOUNT SECURITY</p><h3>Change admin password</h3></div>
      </div>
      <p className='form-subtitle'>Confirm your current password to set a new one. Your existing password cannot be viewed.</p>
      <form className='form-stack' onSubmit={changePassword}>
        <label className='field'><span>Current password</span><input name='currentPassword' type='password' autoComplete='current-password' required /></label>
        <label className='field'><span>New password</span><input name='newPassword' type='password' minLength='6' maxLength='128' autoComplete='new-password' required /></label>
        <label className='field'><span>Confirm new password</span><input name='confirmNewPassword' type='password' minLength='6' maxLength='128' autoComplete='new-password' required /></label>
        <button className='primary-button' type='submit' disabled={busy}>{busy ? 'Changing password…' : 'Change password'}<span>↗</span></button>
      </form>
    </section>
  );
}

function AdminProductsPage({ products, onUploadImage }) {
  const [items, setItems] = useState(products ?? []);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '300.00',
    dailyRate: '5',
    durationDays: 30,
    description: '',
    status: 'AVAILABLE',
    imageUrl: '',
    availableFrom: '',
    availableUntil: '',
    displayOrder: 1,
  });

  useEffect(() => {
    setItems(products ?? []);
  }, [products]);

  const refreshProducts = async () => {
    const refreshed = await api('/admin/products');
    setItems(refreshed);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name ?? '',
      price: String(product.price ?? '300.00'),
      dailyRate: String(rateFraction(product.dailyRate ?? 0.05) * 100),
      durationDays: Number(product.durationDays ?? 30),
      description: product.description ?? '',
      status: product.status ?? 'AVAILABLE',
      imageUrl: getProductImage(product),
      availableFrom: product.availableFrom ? new Date(product.availableFrom).toISOString().slice(0, 16) : '',
      availableUntil: product.availableUntil ? new Date(product.availableUntil).toISOString().slice(0, 16) : '',
      displayOrder: Number(product.displayOrder ?? 1),
    });
    setError('');
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const clearExpiredSchedule = form.status === 'COMING_SOON'
        && form.availableFrom
        && new Date(form.availableFrom) <= new Date();
      const payload = {
        ...form,
        price: String(form.price),
        dailyRate: String(Number(form.dailyRate) / 100),
        durationDays: Number(form.durationDays),
        displayOrder: Number(form.displayOrder),
        imageUrl: form.imageUrl || null,
        availableFrom: form.availableFrom && !clearExpiredSchedule ? new Date(form.availableFrom).toISOString() : null,
        availableUntil: form.availableUntil && !clearExpiredSchedule ? new Date(form.availableUntil).toISOString() : null,
      };

      const handleImageUpload = async (file) => {
        if (!file) return;
        setError('');
        setImageUploading(true);
        try {
          const uploaded = await onUploadImage(file);
          setForm((current) => ({ ...current, imageUrl: uploaded.imageUrl }));
          setNotice('Product image uploaded. Save the product to apply it.');
        } catch (cause) {
          setError(cause.message || 'Unable to upload product image.');
        } finally {
          setImageUploading(false);
        }
      };

      if (editingId) {
        await api(`/admin/products/${editingId}`, { method: 'PUT', ...jsonBody(payload) });
        setNotice('Product updated successfully.');
      } else {
        await api('/admin/products', { method: 'POST', ...jsonBody(payload) });
        setNotice('Product created successfully.');
      }
      setEditingId(null);
      setForm({
        name: '',
        price: '300.00',
        dailyRate: '5',
        durationDays: 30,
        description: '',
        status: 'AVAILABLE',
        imageUrl: '',
        availableFrom: '',
        availableUntil: '',
        displayOrder: items.length + 1,
      });
      await refreshProducts();
    } catch (cause) {
      setError(cause.message || 'Unable to save product.');
    }
  };

  const handleToggleStatus = async (product, newStatus) => {
    try {
      await api(`/admin/products/${product.id}`, {
        method: 'PUT',
        ...jsonBody({
          name: product.name,
          price: String(product.price),
          dailyRate: String(product.dailyRate),
          durationDays: Number(product.durationDays),
          status: newStatus,
          ...(newStatus === 'COMING_SOON' ? { availableFrom: null, availableUntil: null } : {}),
        }),
      });
      await refreshProducts();
      setNotice(`Product status changed to ${newStatus}.`);
    } catch (cause) {
      setError(cause.message);
    }
  };

  return (
    <section className='surface form-surface form-stack'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>PRODUCT MANAGEMENT</p>
          <h3>Add & Configure Products</h3>
        </div>
      </div>

      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}

      <form onSubmit={handleSubmit} className='surface nested-surface form-stack'>
        <div className='profile-form-grid'>
          <label className='field'>
            <span>Product Name *</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder='e.g. Product 8,000' required />
          </label>
          <label className='field'>
            <span>Status</span>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value='AVAILABLE'>AVAILABLE</option>
              <option value='COMING_SOON'>COMING SOON</option>
              <option value='DISABLED'>DISABLED</option>
              <option value='DRAFT'>DRAFT</option>
            </select>
          </label>
        </div>

        <div className='profile-form-grid'>
          <label className='field'>
            <span>Price (ETB) *</span>
            <input type='number' step='0.01' value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </label>
          <label className='field'>
            <span>Daily Rate (%) *</span>
            <input type='number' min='0' step='0.01' value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} required />
            <small>Daily Income: {money(Number(form.price || 0) * Number(form.dailyRate || 0) / 100)} / day</small>
          </label>
        </div>

        <div className='profile-form-grid'>
          <label className='field'>
            <span>Duration (Days) *</span>
            <input type='number' min='1' value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} required />
          </label>
          <label className='field'>
            <span>Display Order</span>
            <input type='number' min='0' value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
          </label>
        </div>

        <div className='profile-form-grid'>
          <label className='field'>
            <span>Scheduled Available From (Optional)</span>
            <input type='datetime-local' value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
            <small>A future date delays an AVAILABLE product. COMING SOON products stay unavailable until you change their status.</small>
          </label>
          <label className='field'>
            <span>Scheduled Available Until (Optional)</span>
            <input type='datetime-local' value={form.availableUntil} onChange={(e) => setForm({ ...form, availableUntil: e.target.value })} />
          </label>
        </div>

        <label className='field'>
          <span>Product Image URL</span>
          <input type='url' value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder='https://example.com/product-image.webp' />
          <span className='image-upload-control'>
            <input type='file' accept='image/jpeg,image/png,image/webp' disabled={imageUploading} onChange={(event) => { handleImageUpload(event.target.files?.[0]); event.target.value = ''; }} />
            <small>{imageUploading ? 'Uploading image…' : 'Or choose a JPG, PNG, or WEBP image (up to 5 MB). Save the product to apply changes.'}</small>
          </span>
          <img className='admin-product-image-preview' src={getProductImage({ imageUrl: form.imageUrl, displayOrder: form.displayOrder })} alt='Product image preview' />
        </label>

        <label className='field'>
          <span>Description</span>
          <textarea rows='2' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder='Product benefits and details' />
        </label>

        <div className='button-row'>
          <button className='primary-button' type='submit' disabled={imageUploading}>
            {editingId ? 'Update Product' : 'Add New Product'} <span>↗</span>
          </button>
          {editingId && (
            <button className='secondary-button' type='button' onClick={() => { setEditingId(null); setForm({ name: '', price: '300.00', dailyRate: '5', durationDays: 30, description: '', status: 'AVAILABLE', imageUrl: '', availableFrom: '', availableUntil: '', displayOrder: items.length + 1 }); }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className='surface-heading' style={{ marginTop: '20px' }}>
        <div>
          <p className='eyebrow'>CATALOG</p>
          <h3>Existing Packages ({items.length})</h3>
        </div>
      </div>

      {items.length ? (
        <div className='table-wrap'>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Daily Income</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Schedule</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => {
                const normalizedRate = rateFraction(product.dailyRate);
                const dailyInc = Number(product.price) * normalizedRate;
                return (
                  <tr key={product.id}>
                    <td><img className='admin-product-image-thumb' src={getProductImage(product)} alt={`${product.name} product`} /></td>
                    <td><strong>{product.name}</strong></td>
                    <td>{money(product.price)}</td>
                    <td><strong className='highlight-green'>{money(dailyInc)} / day ({Math.round(normalizedRate * 100)}%)</strong></td>
                    <td>{product.durationDays} days</td>
                    <td>
                      <span className={`product-status ${String(product.status).toLowerCase()}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      {product.availableFrom ? (
                        <small>From: {new Date(product.availableFrom).toLocaleString()}</small>
                      ) : 'Immediate'}
                    </td>
                    <td>
                      <div className='button-row compact'>
                        <button type='button' className='secondary-button' onClick={() => handleEdit(product)}>
                          Edit
                        </button>
                        {product.status === 'AVAILABLE' ? (
                          <button type='button' className='secondary-button' onClick={() => handleToggleStatus(product, 'COMING_SOON')}>
                            Set Coming Soon
                          </button>
                        ) : (
                          <button type='button' className='secondary-button' onClick={() => handleToggleStatus(product, 'AVAILABLE')}>
                            Set Available
                          </button>
                        )}
                        <button type='button' className='secondary-button' onClick={() => handleToggleStatus(product, product.status === 'DISABLED' ? 'AVAILABLE' : 'DISABLED')}>
                          {product.status === 'DISABLED' ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty>No products found.</Empty>}
    </section>
  );
}

function AdminPaymentMethodsPage({ methods }) {
  const [items, setItems] = useState(methods ?? []);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'BANK',
    accountNumber: '',
    accountName: '',
    phoneNumber: '',
    instructions: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    setItems(methods ?? []);
  }, [methods]);

  const refreshMethods = async () => {
    const refreshed = await api('/admin/payment-methods');
    setItems(refreshed);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      accountNumber: form.accountNumber || null,
      accountName: form.accountName || null,
      phoneNumber: form.phoneNumber || null,
      instructions: form.instructions || '',
      isActive: Boolean(form.isActive),
      displayOrder: Number(form.displayOrder || 0),
    };
    if (editingId) {
      await api(`/admin/payment-methods/${editingId}`, { method: 'PUT', ...jsonBody(payload) });
    } else {
      await api('/admin/payment-methods', { method: 'POST', ...jsonBody(payload) });
    }
    setForm({ name: '', type: 'BANK', accountNumber: '', accountName: '', phoneNumber: '', instructions: '', isActive: true, displayOrder: 0 });
    setEditingId(null);
    await refreshMethods();
  };

  const editMethod = (method) => {
    setEditingId(method.id);
    setForm({
      name: method.name ?? '',
      type: method.type ?? 'BANK',
      accountNumber: method.accountNumber ?? '',
      accountName: method.accountName ?? '',
      phoneNumber: method.phoneNumber ?? '',
      instructions: method.instructions ?? '',
      isActive: Boolean(method.isActive),
      displayOrder: method.displayOrder ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', type: 'BANK', accountNumber: '', accountName: '', phoneNumber: '', instructions: '', isActive: true, displayOrder: 0 });
  };

  const toggleState = async (method, isActive) => {
    await api(`/admin/payment-methods/${method.id}`, { method: 'PUT', ...jsonBody({ ...method, isActive }) });
    await refreshMethods();
  };

  return (
    <section className='surface form-surface form-stack'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>PAYMENT GATEWAYS</p>
          <h3>Bank and Wallet Configuration</h3>
        </div>
      </div>

      <p className='form-subtitle'>
        Configure bank account numbers, beneficiary names, and wallet details. Changes saved here immediately update the payment information displayed to customers making deposits.
      </p>

      <form onSubmit={submit} className='surface nested-surface form-stack admin-payment-config-form'>
        <div className='surface-heading compact-heading'>
          <div>
            <p className='eyebrow'>{editingId ? 'EDITING ACCOUNT' : 'ADD NEW METHOD'}</p>
            <h4>{editingId ? `Edit Account: ${form.name}` : 'Create Payment Method'}</h4>
          </div>
          {editingId && (
            <button type='button' className='secondary-button' onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </div>

        <div className='profile-form-grid'>
          <label className='field'>
            <span>Method / Bank Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder='e.g. Commercial Bank of Ethiopia, Awash Bank'
              required
            />
          </label>
          <label className='field'>
            <span>Type</span>
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value='BANK'>BANK TRANSFER</option>
              <option value='MOBILE'>MOBILE MONEY / WALLET</option>
            </select>
          </label>
        </div>

        <div className='profile-form-grid'>
          <label className='field'>
            <span>Account Number (Configurable for Customer Deposits)</span>
            <input
              value={form.accountNumber}
              onChange={(event) => setForm({ ...form, accountNumber: event.target.value })}
              placeholder='e.g. 1000419637649'
            />
            <small>This is the account number shown to customers with 1-click copy.</small>
          </label>
          <label className='field'>
            <span>Account Holder / Beneficiary Name</span>
            <input
              value={form.accountName}
              onChange={(event) => setForm({ ...form, accountName: event.target.value })}
              placeholder='e.g. Online Trade Ltd / Tesema'
            />
            <small>Beneficiary name shown on customer deposit screen.</small>
          </label>
        </div>

        <div className='profile-form-grid'>
          <label className='field'>
            <span>Phone Number (for Telebirr / Mobile Money)</span>
            <input
              value={form.phoneNumber}
              onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              placeholder='e.g. 0929688828'
            />
          </label>
          <label className='field'>
            <span>Display Order (1 = Top)</span>
            <input
              type='number'
              min='0'
              value={form.displayOrder}
              onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })}
            />
          </label>
        </div>

        <label className='field'>
          <span>Deposit Instructions / Notes for Member</span>
          <textarea
            rows='2'
            value={form.instructions}
            onChange={(event) => setForm({ ...form, instructions: event.target.value })}
            placeholder='Optional instructions shown to customers when selecting this payment method'
          />
        </label>

        <label className='field checkbox-field'>
          <input
            type='checkbox'
            checked={form.isActive}
            onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
          />
          <span>Active (Available for customer recharge)</span>
        </label>

        <div className='button-row'>
          <button className='primary-button' type='submit'>
            {editingId ? 'Save Account Changes' : 'Add Payment Method'}
            <span>✓</span>
          </button>
          {editingId && (
            <button type='button' className='secondary-button' onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {items.length ? (
        <div className='table-wrap'>
          <table className='admin-payment-methods-table'>
            <thead>
              <tr>
                <th>Bank / Method</th>
                <th>Account Number</th>
                <th>Account Holder</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((method) => (
                <tr key={method.id} className={editingId === method.id ? 'row-editing' : ''}>
                  <td>
                    <div className='admin-bank-cell'>
                      <BankLogo name={method.name} className='admin-bank-logo-badge' />
                      <div>
                        <strong>{method.name}</strong>
                        <small className='quiet-label' style={{ display: 'block' }}>{method.type}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className='account-num-tag'>{method.accountNumber || method.phoneNumber || '—'}</code>
                  </td>
                  <td>{method.accountName || '—'}</td>
                  <td>{method.displayOrder ?? 0}</td>
                  <td>
                    <span className={`status-pill ${method.isActive ? 'active' : 'inactive'}`}>
                      {method.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <div className='button-row compact'>
                      <button type='button' className='secondary-button' onClick={() => editMethod(method)}>
                        Edit
                      </button>
                      <button
                        type='button'
                        className='secondary-button'
                        onClick={() => toggleState(method, !method.isActive)}
                      >
                        {method.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No payment methods found.</Empty>
      )}
    </section>
  );
}

function AdminRechargesPage() {
  const [items, setItems] = useState([]);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofZoom, setProofZoom] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0, limit: 10 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState({});
  const [pendingId, setPendingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      const result = await api(`/admin/recharges?${params}`);
      setItems(result.items);
      setPagination(result.pagination);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [page, limit, status, search]);

  useEffect(() => {
    if (!proofPreview) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProofPreview(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [proofPreview]);

  const openProof = (item) => {
    setProofZoom(1);
    setProofPreview({
      url: `/api/admin/recharges/${item.id}/proof?inline=1`,
      name: `${item.fullName || item.userId} payment proof`,
    });
  };

  const review = async (id, action, noteOverride = '') => {
    const note = (noteOverride || notes[id] || '').trim();
    if (action === 'reject' && !note) {
      setError('Enter a reason before rejecting this recharge.');
      return;
    }
    if (pendingId) return;
    setPendingId(id);
    try {
      await api(`/admin/recharges/${id}/${action}`, { method: 'POST', ...jsonBody({ note }) });
      setNotes((current) => ({ ...current, [id]: '' }));
      await refresh();
    } catch (cause) {
      if (cause.code === 'INVALID_STATUS') {
        await refresh();
      }
      setError(cause.message);
    } finally {
      setPendingId('');
    }
  };

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>RECHARGES</p>
          <h3>Manual review queue</h3>
        </div>
      </div>
      <AdminTableFilters
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        status={status}
        onStatus={(value) => { setStatus(value); setPage(1); }}
        statuses={['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED']}
        limit={limit}
        onLimit={(value) => { setLimit(value); setPage(1); }}
        placeholder='Search customer, phone, sender or reference'
      />
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      {loading ? <p className='empty-state' role='status'>Loading recharge requests…</p> : items.length ? (
        <div className='table-wrap admin-compact-table admin-recharges-table'>
          <table>
            <thead>
              <tr><th>User</th><th>Phone Number</th><th>Amount</th><th>Method</th><th>Sender</th><th>Reference</th><th>Status</th><th>Proof</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.fullName || item.userId}</td>
                  <td>{item.phoneNumber || '—'}</td>
                  <td>{money(item.amount)}</td>
                  <td>{item.paymentMethod}</td>
                  <td>{item.senderName}</td>
                  <td>{item.transactionReference}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    {item.hasProof ? (
                      item.proofIsImage ? (
                        <button className='admin-recharge-proof-button' type='button' onClick={() => openProof(item)} aria-label={`Zoom payment proof for ${item.fullName || item.userId}`}>
                          <img className='admin-recharge-proof-preview' src={`/api/admin/recharges/${item.id}/proof?inline=1`} alt='Payment proof thumbnail' loading='lazy' />
                          <span>Zoom image</span>
                        </button>
                      ) : (
                        <a href={`/api/admin/recharges/${item.id}/proof`} target='_blank' rel='noreferrer'>Open PDF proof</a>
                      )
                    ) : 'No proof'}
                  </td>
                  <td>
                    {['PENDING', 'UNDER_REVIEW', 'APPROVED'].includes(item.status) ? (
                      <div className='form-stack'>
                        <label className='admin-recharge-note'>
                          <span>
                            {item.status === 'APPROVED' ? 'Reversal reason' : 'Admin comment'}
                            <small>{item.status === 'APPROVED' ? ' (required; removes credited amount)' : ' (required to reject)'}</small>
                          </span>
                          <textarea
                            aria-label={`Admin comment and rejection reason for ${item.fullName || item.userId}`}
                            value={notes[item.id] ?? ''}
                            onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                            placeholder={item.status === 'APPROVED' ? 'Explain why this approved recharge should be reversed' : 'Write a comment or rejection reason'}
                            maxLength={1000}
                            rows={2}
                          />
                        </label>
                        <div className='button-row compact'>
                          {item.status !== 'APPROVED' && (
                            <>
                              <button type='button' className='secondary-button' disabled={pendingId !== ''} onClick={() => review(item.id, 'review')}>Under review</button>
                              <button type='button' className='primary-button' disabled={pendingId !== ''} onClick={() => review(item.id, 'approve')}>Approve</button>
                            </>
                          )}
                          <button type='button' className='secondary-button' disabled={pendingId !== ''} onClick={() => review(item.id, 'reject')}>
                            {pendingId === item.id ? 'Rejecting…' : item.status === 'APPROVED' ? 'Reject & reverse' : 'Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span>{item.adminNote || 'Already resolved'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>No recharge requests found.</Empty>}
      <AdminTablePagination pagination={pagination} page={page} setPage={setPage} loading={loading || pendingId !== ''} />
      {proofPreview && (
        <div className='proof-viewer-backdrop' role='presentation' onClick={(event) => {
          if (event.target === event.currentTarget) setProofPreview(null);
        }}>
          <section className='proof-viewer' role='dialog' aria-modal='true' aria-label={proofPreview.name}>
            <div className='proof-viewer-toolbar'>
              <strong>{proofPreview.name}</strong>
              <div className='proof-viewer-actions'>
                <button type='button' className='secondary-button' onClick={() => setProofZoom((zoom) => Math.max(0.5, Number((zoom - 0.25).toFixed(2))))} aria-label='Zoom out'><ZoomOut size={17} /></button>
                <span>{Math.round(proofZoom * 100)}%</span>
                <button type='button' className='secondary-button' onClick={() => setProofZoom((zoom) => Math.min(3, Number((zoom + 0.25).toFixed(2))))} aria-label='Zoom in'><ZoomIn size={17} /></button>
                <button type='button' className='secondary-button' onClick={() => setProofZoom(1)}>Reset</button>
                <button type='button' className='secondary-button' onClick={() => setProofPreview(null)} aria-label='Close proof viewer'><X size={17} /></button>
              </div>
            </div>
            <div className='proof-viewer-image-wrap'>
              <img src={proofPreview.url} alt={proofPreview.name} style={{ transform: `scale(${proofZoom})` }} />
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function AdminWithdrawalsPage() {
  const [items, setItems] = useState([]);
  const [withdrawalFee, setWithdrawalFee] = useState('10');
  const [savingFee, setSavingFee] = useState(false);
  const [notes, setNotes] = useState({});
  const [pendingId, setPendingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 0, total: 0, limit: 10 });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (status) params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      const result = await api(`/admin/withdrawals?${params}`);
      setItems(result.items);
      setPagination(result.pagination);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setError('');
    refresh().catch((cause) => setError(cause.message));
  }, [page, limit, status, search]);

  useEffect(() => {
    api('/admin/settings')
      .then((settings) => setWithdrawalFee(String(settings.withdrawalFee ?? 10)))
      .catch((cause) => setError(cause.message));
  }, []);

  async function saveWithdrawalFee(event) {
    event.preventDefault();
    const percentage = Number(withdrawalFee);
    if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
      setError('Withdrawal fee must be between 0% and 100%.');
      return;
    }
    setSavingFee(true);
    setError('');
    setNotice('');
    try {
      await api('/admin/settings', { method: 'PUT', ...jsonBody({ withdrawalFee: percentage }) });
      setWithdrawalFee(String(percentage));
      setNotice('Withdrawal fee updated successfully.');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSavingFee(false);
    }
  }

  async function review(id, action) {
    const note = notes[id]?.trim() ?? '';
    if (action === 'reject' && !note) {
      setError('Enter a reason before rejecting this withdrawal.');
      return;
    }
    setPendingId(id);
    setError('');
    try {
      await api(`/admin/withdrawals/${id}/${action}`, { method: 'POST', ...jsonBody({ note }) });
      await refresh();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setPendingId(null);
    }
  }

  async function copyPayoutAccount(value) {
    if (!value) {
      setError('No payout account number is available to copy.');
      return;
    }
    try {
      await navigator.clipboard.writeText(String(value));
      setNotice('Payout account number copied.');
      setError('');
    } catch {
      setError('Could not copy the payout account number. Check clipboard permissions.');
    }
  }

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>WITHDRAWALS</p>
          <h3>Withdrawal processing queue</h3>
        </div>
      </div>
      <form className='withdrawal-fee-settings' onSubmit={saveWithdrawalFee}>
        <label className='field'>
          <span>Customer withdrawal fee (%)</span>
          <input type='number' min='0' max='100' step='0.01' value={withdrawalFee} onChange={(event) => setWithdrawalFee(event.target.value)} required />
          <small>Deducted as a percentage of the requested withdrawal. Initial fee: 10%.</small>
        </label>
        <button className='primary-button' type='submit' disabled={savingFee}>{savingFee ? 'Saving…' : 'Save fee'}<span>↗</span></button>
      </form>
      <AdminTableFilters
        search={search}
        onSearch={(value) => { setSearch(value); setPage(1); }}
        status={status}
        onStatus={(value) => { setStatus(value); setPage(1); }}
        statuses={['PENDING', 'PROCESSING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED']}
        limit={limit}
        onLimit={(value) => { setLimit(value); setPage(1); }}
        placeholder='Search customer, phone or payout account'
      />
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}
      {loading ? <p className='empty-state' role='status'>Loading withdrawal requests…</p> : items.length ? (
        <div className='table-wrap admin-compact-table admin-withdrawals-table'>
          <table>
            <thead>
              <tr><th>Customer</th><th>Amount</th><th>Fee / Net</th><th>Full payout details</th><th>Status</th><th>Requested</th><th>Admin note</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const actionable = ['PENDING', 'PROCESSING'].includes(item.status);
                const isPending = pendingId === item.id;
                return (
                  <tr key={item.id}>
                    <td>{item.fullName}<small>{item.phoneNumber}</small></td>
                    <td>{money(item.amount)}</td>
                    <td>{money(item.fee)} fee<small>{money(item.netAmount)} net</small></td>
                    <td>
                      {item.paymentMethod}
                      <small><strong className='payout-account-number'>{item.accountNumber || item.accountPhone || '—'}</strong></small>
                      <button type='button' className='secondary-button copy-account-button' onClick={() => copyPayoutAccount(item.accountNumber || item.accountPhone)}>Copy account</button>
                      {item.accountHolderName && <small>{item.accountHolderName}</small>}
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{item.adminNote || '—'}</td>
                    <td>
                      {actionable ? (
                        <div className='form-stack'>
                          <input
                            aria-label={`Admin note for ${item.fullName}`}
                            value={notes[item.id] ?? ''}
                            onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                            placeholder='Optional note; required to reject'
                            maxLength={1000}
                          />
                          <div className='button-row compact'>
                            {item.status === 'PENDING' && <button type='button' className='secondary-button' disabled={isPending} onClick={() => review(item.id, 'process')}>Process</button>}
                            <button type='button' className='primary-button' disabled={isPending} onClick={() => review(item.id, 'complete')}>Complete</button>
                            <button type='button' className='secondary-button' disabled={isPending} onClick={() => review(item.id, 'reject')}>Reject</button>
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : <Empty>No withdrawal requests found.</Empty>}
      <AdminTablePagination pagination={pagination} page={page} setPage={setPage} loading={loading || pendingId !== null} />
    </section>
  );
}

function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [search, setSearch] = useState('');
  const [result, setResult] = useState({ items: [], pagination: { page: 1, pages: 0, total: 0, limit: 10 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (action.trim()) params.set('action', action.trim());
    if (entityType.trim()) params.set('entityType', entityType.trim());
    if (search.trim()) params.set('search', search.trim());
    api(`/admin/audit-logs?${params}`)
      .then(setResult)
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false));
  }, [page, limit, action, entityType, search]);

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>SECURITY & ACCOUNTABILITY</p>
          <h3>Administrative audit log</h3>
        </div>
        <div className='admin-table-filters'>
          <label className='field'><span>Search logs</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder='Search action, entity or admin' /></label>
          <label className='field'><span>Action</span><input value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} placeholder='Filter by action' /></label>
          <label className='field'><span>Entity type</span><input value={entityType} onChange={(event) => { setEntityType(event.target.value); setPage(1); }} placeholder='Filter by entity' /></label>
          <label className='field'><span>Rows per page</span><select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}><option value={5}>5</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label>
        </div>
      </div>
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      {loading ? <p className='empty-state' role='status'>Loading audit events…</p> : result.items.length ? (
        <>
          <div className='table-wrap'>
            <table>
              <thead>
                <tr><th>Date</th><th>Administrator</th><th>Action</th><th>Entity</th><th>Changes</th></tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{item.adminName || 'Unknown admin'}<small>{item.adminId}</small></td>
                    <td>{item.action}</td>
                    <td>{item.entityType}<small>{item.entityId || '—'}</small></td>
                    <td>
                      <details className='audit-changes'>
                        <summary>View changes</summary>
                        <pre>{JSON.stringify({ oldValue: item.oldValue, newValue: item.newValue }, null, 2)}</pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : <Empty>No audit events found.</Empty>}
      <AdminTablePagination pagination={result.pagination} page={page} setPage={setPage} loading={loading} noun='events' />
    </section>
  );
}

function AdminRewardsPage({ onError, onNotice }) {
  const [claims, setClaims] = useState([]);
  const [rules, setRules] = useState([]);
  const [status, setStatus] = useState('');
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rejectingId, setRejectingId] = useState('');
  const [rejectNote, setRejectNote] = useState('');

  const refresh = async () => {
    try {
      const [claimData, ruleData] = await Promise.all([api('/admin/rewards'), api('/admin/rewards/rules')]);
      setClaims(claimData);
      setRules(ruleData);
    } catch (cause) {
      onError(cause.message);
    }
  };
  useEffect(() => { refresh(); }, []);

  const saveRule = async (event) => {
    event.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    data.thresholdAmount = Number(data.thresholdAmount);
    data.rewardAmount = Number(data.rewardAmount);
    try {
      await api(editingRule?.id ? `/admin/rewards/rules/${editingRule.id}` : '/admin/rewards/rules', {
        method: editingRule?.id ? 'PATCH' : 'POST',
        ...jsonBody(data),
      });
      setEditingRule(null);
      onNotice('Reward rule saved successfully.');
      await refresh();
    } catch (cause) {
      onError(cause.message);
    } finally {
      setSaving(false);
    }
  };

  const reviewClaim = async (claimId, action, note) => {
    try {
      await api(`/admin/rewards/${claimId}/${action}`, { method: 'POST', ...jsonBody({ note }) });
      setRejectingId('');
      setRejectNote('');
      onNotice(`Reward claim ${action === 'paid' ? 'marked paid' : `${action}d`} successfully.`);
      await refresh();
    } catch (cause) {
      onError(cause.message);
    }
  };

  const visibleClaims = status ? claims.filter((claim) => claim.status === status) : claims;
  const formValues = editingRule ?? {
    name: '',
    ruleType: 'MILESTONE',
    thresholdAmount: 5000,
    rewardAmount: 500,
    frequency: 'ONCE',
    status: 'ACTIVE',
  };

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div><p className='eyebrow'>REWARDS</p><h3>Claims and reward rules</h3></div>
      </div>
      <div className='surface form-surface form-stack'>
        <h4>{editingRule ? 'Edit reward rule' : 'Add reward rule'}</h4>
        <p className='form-subtitle'>Friends' approved recharges across your A, B, and C referral levels count toward milestone rewards.</p>
        <form key={editingRule?.id ?? 'new-rule'} className='form-stack' onSubmit={saveRule}>
          <div className='profile-form-grid'>
            <label className='field'><span>Rule name</span><input name='name' defaultValue={formValues.name} maxLength='120' required /></label>
            <label className='field'><span>Type</span><select name='ruleType' defaultValue={formValues.ruleType}><option value='MILESTONE'>Milestone</option><option value='DAILY'>Daily</option><option value='WEEKLY'>Weekly</option></select></label>
          </div>
          <div className='profile-form-grid'>
            <label className='field'><span>Friends' recharge target (ETB)</span><input type='number' name='thresholdAmount' min='0' max='1000000000' step='0.01' defaultValue={formValues.thresholdAmount} required /></label>
            <label className='field'><span>Reward amount (ETB)</span><input type='number' name='rewardAmount' min='0' max='1000000000' step='0.01' defaultValue={formValues.rewardAmount} required /></label>
          </div>
          <div className='profile-form-grid'>
            <label className='field'><span>Frequency</span><select name='frequency' defaultValue={formValues.frequency}><option value='ONCE'>Once</option><option value='DAILY'>Daily</option><option value='WEEKLY'>Weekly</option></select></label>
            <label className='field'><span>Status</span><select name='status' defaultValue={formValues.status}><option value='ACTIVE'>Active</option><option value='DISABLED'>Disabled</option></select></label>
          </div>
          <div className='button-row'>
            <button className='primary-button' type='submit' disabled={saving}>{saving ? 'Saving…' : editingRule ? 'Update rule' : 'Add rule'}</button>
            {editingRule && <button className='secondary-button' type='button' onClick={() => setEditingRule(null)}>Cancel</button>}
          </div>
        </form>
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Rule</th><th>Type</th><th>Friends' recharge target</th><th>Reward</th><th>Frequency</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{rules.map((rule) => (
              <tr key={rule.id}>
                <td>{rule.name}</td><td>{rule.ruleType}</td><td>{money(rule.thresholdAmount)}</td><td>{money(rule.rewardAmount)}</td><td>{rule.frequency}</td><td><StatusBadge status={rule.status} /></td>
                <td><button type='button' className='secondary-button' onClick={() => setEditingRule(rule)}>Edit</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className='surface-heading'>
        <div><p className='eyebrow'>MANUAL REVIEW</p><h3>Reward claims</h3></div>
        <label className='field'><span>Filter status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value=''>All statuses</option>{['PENDING', 'APPROVED', 'REJECTED', 'PAID'].map((value) => <option key={value}>{value}</option>)}</select></label>
      </div>
      {visibleClaims.length ? (
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Customer</th><th>Phone</th><th>Reward</th><th>Friends' recharge target</th><th>Amount</th><th>Status</th><th>Requested</th><th>Review</th></tr></thead>
            <tbody>{visibleClaims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.fullName}</td><td>{claim.phoneNumber}</td><td>{claim.name}</td><td>{money(claim.thresholdAmount)}</td><td>{money(claim.amount)}</td>
                <td><StatusBadge status={claim.status} />{claim.adminNote && <small>{claim.adminNote}</small>}</td>
                <td>{claim.requestedAt ? new Date(claim.requestedAt).toLocaleString() : new Date(claim.createdAt).toLocaleString()}</td>
                <td>
                  {claim.status === 'PENDING' && (rejectingId === claim.id ? (
                    <div className='form-stack'>
                      <input aria-label='Rejection reason' value={rejectNote} onChange={(event) => setRejectNote(event.target.value)} maxLength='500' placeholder='Reason for rejection' />
                      <div className='button-row compact'>
                        <button type='button' className='primary-button' disabled={!rejectNote.trim()} onClick={() => reviewClaim(claim.id, 'reject', rejectNote)}>Confirm rejection</button>
                        <button type='button' className='secondary-button' onClick={() => setRejectingId('')}>Cancel</button>
                      </div>
                    </div>
                  ) : <div className='button-row compact'>
                    <button type='button' className='primary-button' onClick={() => reviewClaim(claim.id, 'approve')}>Approve</button>
                    <button type='button' className='secondary-button' onClick={() => { setRejectingId(claim.id); setRejectNote(''); }}>Reject</button>
                  </div>)}
                  {claim.status === 'APPROVED' && <button type='button' className='primary-button' onClick={() => reviewClaim(claim.id, 'paid')}>Mark paid</button>}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <Empty>No reward claims found.</Empty>}
    </section>
  );
}

function AdminReferralsPage({ onError }) {
  const [result, setResult] = useState({ items: [], pagination: { page: 1, pages: 0, total: 0 } });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState('');
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      try {
        const data = await api(`/admin/referrals?${params}`);
        if (active) setResult(data);
      } catch (cause) {
        if (active) onError(cause.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [search, status, from, to, page, onError]);

  const toggleNetwork = async (userId) => {
    if (expandedId === userId) {
      setExpandedId('');
      return;
    }
    setExpandedId(userId);
    if (members[userId]) return;
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    try {
      const data = await api(`/admin/referrals/${userId}/members?${params}`);
      setMembers((current) => ({ ...current, [userId]: data }));
    } catch (cause) {
      onError(cause.message);
    }
  };

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'><div><p className='eyebrow'>REFERRAL NETWORK</p><h3>Admin referrals</h3></div></div>
      <div className='admin-table-filters'>
        <label className='field'><span>Search referrer</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder='Name, phone, or referral code' /></label>
        <label className='field'><span>Account status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value=''>All statuses</option><option value='ACTIVE'>Active</option><option value='SUSPENDED'>Suspended</option></select></label>
        <label className='field'><span>From</span><input type='date' value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} /></label>
        <label className='field'><span>To</span><input type='date' value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} /></label>
      </div>
      {result.items?.length ? <div className='table-wrap'>
        <table>
          <thead><tr><th>Referrer</th><th>Referral code</th><th>Status</th><th>Network users</th><th>Active</th><th>Levels A / B / C</th><th>Qualifying recharge</th><th>Commission A / B / C</th><th>Total commission</th><th>Network</th></tr></thead>
          <tbody>{result.items.map((item) => <Fragment key={item.id}>
            <tr>
              <td>{item.fullName}<small>{item.phoneNumber}</small></td><td>{item.referralCode}</td><td><StatusBadge status={item.status} /></td>
              <td>{item.totalReferrals}</td><td>{item.activeReferrals}</td>
              <td>{item.levelAReferrals} / {item.levelBReferrals} / {item.levelCReferrals}</td>
              <td>{money(item.qualifyingRechargeTotal)}</td>
              <td>{money(item.levelACommission)} / {money(item.levelBCommission)} / {money(item.levelCCommission)}</td>
              <td>{money(item.commissionTotal)}</td><td><button type='button' className='secondary-button' onClick={() => toggleNetwork(item.id)}>{expandedId === item.id ? 'Hide' : 'View'} network</button></td>
            </tr>
            {expandedId === item.id && <tr><td colSpan='10'>{members[item.id] ? members[item.id].length ? <div className='table-wrap'>
              <table><thead><tr><th>Level</th><th>Member</th><th>Sponsor</th><th>Status</th><th>Qualifying recharge</th><th>Approved transactions</th><th>Commission earned</th></tr></thead>
                <tbody>{members[item.id].map((member) => <tr key={member.id}>
                  <td>{member.level}</td><td>{member.fullName}<small>{member.phoneNumber}</small></td><td>{member.sponsorName}</td><td><StatusBadge status={member.status} /></td>
                  <td>{money(member.qualifyingRechargeTotal)}</td>
                  <td>{member.qualifyingRechargeCount ? <details><summary>{member.qualifyingRechargeCount} transaction(s)</summary><div className='form-stack'>{member.qualifyingRecharges.map((recharge) => <small key={recharge.id}>{money(recharge.amount)} · {recharge.transactionReference} · {new Date(recharge.creditedAt).toLocaleDateString()}</small>)}</div></details> : '—'}</td>
                  <td>{money(member.commissionTotal)}</td>
                </tr>)}</tbody>
              </table>
            </div> : <Empty>No network members match this date range.</Empty> : <p role='status'>Loading network…</p>}</td></tr>}
          </Fragment>)}</tbody>
        </table>
      </div> : loading ? <p className='empty-state' role='status'>Loading referral networks…</p> : <Empty>No referral networks found.</Empty>}
      <AdminTablePagination pagination={result.pagination} page={page} setPage={setPage} loading={loading} noun='referrers' />
    </section>
  );
}

function AdminTableFilters({ search, onSearch, status, onStatus, statuses, limit, onLimit, placeholder }) {
  return (
    <div className='admin-table-filters'>
      <label className='field'><span>Search</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder={placeholder} /></label>
      <label className='field'><span>Status</span><select value={status} onChange={(event) => onStatus(event.target.value)}><option value=''>All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}</select></label>
      <label className='field'><span>Rows per page</span><select value={limit} onChange={(event) => onLimit(Number(event.target.value))}><option value={5}>5</option><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label>
    </div>
  );
}

function AdminTablePagination({ pagination, page, setPage, loading, noun = 'requests' }) {
  return (
    <div className='surface-heading admin-table-pagination'>
      <span>{pagination.total ?? 0} {noun} · Page {page} of {Math.max(pagination.pages ?? 0, 1)}</span>
      <div className='button-row compact'>
        <button type='button' className='secondary-button' disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</button>
        <button type='button' className='secondary-button' disabled={page >= (pagination.pages ?? 0) || loading} onClick={() => setPage((current) => current + 1)}>Next</button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const { t } = useLanguage();
  const normalized = String(status ?? '').toLowerCase().replaceAll('_', '-');
  return <span className={`status-badge status-${normalized}`}>{t(String(status ?? 'UNKNOWN').replaceAll('_', ' '))}</span>;
}

function AdminSupportPage({ support, onSave }) {
  return (
    <section className='surface form-surface form-stack'>
      <p className='eyebrow'>SUPPORT</p>
      <h3>Support configuration</h3>
      <form className='form-stack' onSubmit={onSave}>
        <label className='field checkbox-field'><input type='checkbox' name='supportEnabled' defaultChecked={Boolean(support.supportEnabled)} /><span>Enable support page</span></label>
        <div className='profile-form-grid'>
          <label className='field'><span>Support name</span><input name='supportName' defaultValue={support.supportName ?? ''} /></label>
          <label className='field'><span>Support phone</span><input name='supportPhone' defaultValue={support.supportPhone ?? ''} /></label>
        </div>
        <label className='field'><span>Support message</span><textarea name='supportMessage' rows='3' defaultValue={support.supportMessage ?? ''} /></label>
        <label className='field'><span>Customer support URL</span><input name='customerSupportUrl' defaultValue={support.customerSupportUrl ?? ''} /></label>
        <div className='profile-form-grid'>
          <label className='field'><span>Customer support label</span><input name='customerSupportLabel' defaultValue={support.customerSupportLabel ?? 'Customer Support'} /></label>
          <label className='field checkbox-field'><input type='checkbox' name='customerSupportEnabled' defaultChecked={Boolean(support.customerSupportEnabled)} /><span>Enable customer support link</span></label>
        </div>
        <div className='profile-form-grid'>
          <label className='field'><span>WhatsApp number</span><input name='whatsappNumber' defaultValue={support.whatsappNumber ?? ''} /></label>
          <label className='field'><span>WhatsApp URL</span><input name='whatsappUrl' defaultValue={support.whatsappUrl ?? ''} /></label>
        </div>
        <div className='profile-form-grid'>
          <label className='field'><span>WhatsApp message</span><input name='whatsappMessage' defaultValue={support.whatsappMessage ?? ''} /></label>
          <label className='field checkbox-field'><input type='checkbox' name='whatsappEnabled' defaultChecked={Boolean(support.whatsappEnabled)} /><span>Enable WhatsApp button</span></label>
        </div>
        <div className='profile-form-grid'>
          <label className='field'><span>Official group URL</span><input name='officialGroupUrl' defaultValue={support.officialGroupUrl ?? ''} /></label>
          <label className='field'><span>Official group label</span><input name='officialGroupLabel' defaultValue={support.officialGroupLabel ?? 'Official Group'} /></label>
        </div>
        <label className='field checkbox-field'><input type='checkbox' name='officialGroupEnabled' defaultChecked={Boolean(support.officialGroupEnabled)} /><span>Enable official group link</span></label>
        <label className='field'><span>App download URL</span><input name='appDownloadUrl' defaultValue={support.appDownloadUrl ?? ''} placeholder='https://example.com/app' /></label>
        <button className='primary-button' type='submit'>Save support settings<span>↗</span></button>
      </form>
    </section>
  );
}

function AdminAboutPage({ support, onSave }) {
  return (
    <section className='surface form-surface form-stack'>
      <p className='eyebrow'>PUBLIC WEBSITE</p>
      <h3>Configure About page</h3>
      <p className='form-subtitle'>Changes are shown immediately on the public About page.</p>
      <form className='form-stack' onSubmit={onSave}>
        <label className='field'><span>Page heading</span><input name='aboutTitle' defaultValue={support.aboutTitle ?? ''} maxLength='160' required /></label>
        <label className='field'><span>Introduction</span><textarea name='aboutIntro' rows='4' defaultValue={support.aboutIntro ?? ''} maxLength='2000' required /></label>
        <div className='profile-form-grid'>
          <label className='field'><span>First section heading</span><input name='aboutFirstHeading' defaultValue={support.aboutFirstHeading ?? ''} maxLength='120' required /></label>
          <label className='field'><span>Second section heading</span><input name='aboutSecondHeading' defaultValue={support.aboutSecondHeading ?? ''} maxLength='120' required /></label>
        </div>
        <div className='profile-form-grid'>
          <label className='field'><span>First section content</span><textarea name='aboutFirstContent' rows='5' defaultValue={support.aboutFirstContent ?? ''} maxLength='2000' required /></label>
          <label className='field'><span>Second section content</span><textarea name='aboutSecondContent' rows='5' defaultValue={support.aboutSecondContent ?? ''} maxLength='2000' required /></label>
        </div>
        <button className='primary-button' type='submit'>Save About page<span>↗</span></button>
      </form>
    </section>
  );
}

function AdminWelcomePage({ support, onSave, onUploadImage, onError }) {
  const [imageUrl, setImageUrl] = useState(support.welcomeImageUrl ?? '');
  const [imageUploading, setImageUploading] = useState(false);
  const handleImageUpload = async (file) => {
    if (!file) return;
    setImageUploading(true);
    onError('');
    try {
      const uploaded = await onUploadImage(file);
      setImageUrl(uploaded.imageUrl);
    } catch (cause) {
      onError(cause.message || 'Unable to upload welcome illustration.');
    } finally {
      setImageUploading(false);
    }
  };
  return (
    <section className='surface form-surface form-stack'>
      <p className='eyebrow'>MEMBER EXPERIENCE</p>
      <h3>Configure post-login welcome page</h3>
      <p className='form-subtitle'>These changes appear after customer login and registration. The welcome bonus value remains connected to the existing registration bonus setting.</p>
      <form className='form-stack' onSubmit={onSave}>
        <div className='profile-form-grid'>
          <label className='field'><span>Eyebrow</span><input name='welcomeEyebrow' defaultValue={support.welcomeEyebrow ?? ''} maxLength='120' required /></label>
          <label className='field'><span>Page title</span><input name='welcomeTitle' defaultValue={support.welcomeTitle ?? ''} maxLength='160' required /></label>
        </div>
        <label className='field'><span>Introduction</span><textarea name='welcomeIntro' rows='3' defaultValue={support.welcomeIntro ?? ''} maxLength='1000' required /></label>
        <div className='profile-form-grid'>
          <label className='field'><span>Welcome bonus label</span><input name='welcomeBonusLabel' defaultValue={support.welcomeBonusLabel ?? ''} maxLength='80' required /></label>
          <label className='field'><span>Home button label</span><input name='welcomeHomeButtonLabel' defaultValue={support.welcomeHomeButtonLabel ?? ''} maxLength='80' required /></label>
        </div>
        <label className='field'><span>Example section title</span><input name='welcomeExampleTitle' defaultValue={support.welcomeExampleTitle ?? ''} maxLength='120' required /></label>
        <div className='profile-form-grid'>
          <label className='field'><span>Example product price (ETB)</span><input type='number' name='welcomeExamplePrice' min='0' max='100000000' step='0.01' defaultValue={support.welcomeExamplePrice ?? 300} required /></label>
          <label className='field'><span>Example daily earnings (ETB)</span><input type='number' name='welcomeExampleDailyEarnings' min='0' max='100000000' step='0.01' defaultValue={support.welcomeExampleDailyEarnings ?? 15} required /></label>
        </div>
        <label className='field'><span>Example disclaimer</span><textarea name='welcomeDisclaimer' rows='3' defaultValue={support.welcomeDisclaimer ?? ''} maxLength='1000' required /></label>
        <label className='field'><span>Illustration image URL (optional)</span><input type='text' name='welcomeImageUrl' value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} maxLength='500' placeholder='https://example.com/welcome-image.jpg' />
          <span className='image-upload-control'><input type='file' accept='image/jpeg,image/png,image/webp' disabled={imageUploading} onChange={(event) => { handleImageUpload(event.target.files?.[0]); event.target.value = ''; }} /><small>{imageUploading ? 'Uploading image…' : 'Or choose a JPG, PNG, or WEBP image (up to 5 MB). Save the page to apply it.'}</small></span>
          {imageUrl && <img className='admin-product-image-preview' src={assetUrl(imageUrl)} alt={support.welcomeImageAlt || 'Welcome page illustration preview'} />}
        </label>
        <label className='field'><span>Illustration image description</span><input name='welcomeImageAlt' defaultValue={support.welcomeImageAlt ?? ''} maxLength='200' required /></label>
        <button className='primary-button' type='submit' disabled={imageUploading}>{imageUploading ? 'Uploading image…' : 'Save welcome page'}<span>↗</span></button>
      </form>
    </section>
  );
}

function AdminPublicLinksPage() {
  const [links, setLinks] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/settings/links').then((payload) => {
      setLinks(payload?.items ?? []);
    }).catch((cause) => setError(cause.message));
  }, []);

  const updateLink = (index, field, value) => {
    setLinks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  };

  const addLink = () => {
    setLinks((current) => [
      ...current,
      { name: '', url: '', description: '', enabled: true, displayOrder: current.length + 1, target: '_blank' },
    ]);
  };

  const removeLink = (index) => {
    setLinks((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const saveLinks = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');

    try {
      const normalized = links.map((link, index) => {
        const trimmedUrl = String(link.url ?? '').trim();
        const candidate = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
        const url = new URL(candidate);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error(`Invalid URL for ${link.name || `link ${index + 1}`}.`);
        }
        return {
          ...link,
          name: String(link.name ?? '').trim(),
          url: url.toString(),
          description: String(link.description ?? '').trim(),
          enabled: Boolean(link.enabled),
          displayOrder: Number(link.displayOrder ?? index + 1),
          target: link.target === '_self' ? '_self' : '_blank',
        };
      });

      const payload = { publicLinks: normalized.filter((link) => link.name && link.url) };
      const result = await api('/admin/settings/links', { method: 'PUT', ...jsonBody(payload) });
      setLinks(result?.items ?? payload.publicLinks);
      setNotice('Public links saved successfully.');
    } catch (cause) {
      setError(cause.message || 'Unable to save public links.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className='surface form-surface form-stack'>
      <p className='eyebrow'>PUBLIC LINKS</p>
      <h3>Manage public links</h3>
      <p className='form-subtitle'>These links are loaded from the backend and can be changed without code deployment.</p>
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}
      <form className='form-stack' onSubmit={saveLinks}>
        {links.length ? links.map((link, index) => (
          <div key={`${link.name || 'link'}-${index}`} className='surface nested-surface form-stack'>
            <div className='profile-form-grid'>
              <label className='field'><span>Name</span><input value={link.name ?? ''} onChange={(event) => updateLink(index, 'name', event.target.value)} /></label>
              <label className='field'><span>URL</span><input value={link.url ?? ''} onChange={(event) => updateLink(index, 'url', event.target.value)} /></label>
            </div>
            <label className='field'><span>Description</span><textarea rows='2' value={link.description ?? ''} onChange={(event) => updateLink(index, 'description', event.target.value)} /></label>
            <div className='profile-form-grid'>
              <label className='field'><span>Display order</span><input type='number' min='0' value={link.displayOrder ?? index + 1} onChange={(event) => updateLink(index, 'displayOrder', Number(event.target.value))} /></label>
              <label className='field'><span>Target</span>
                <select value={link.target ?? '_blank'} onChange={(event) => updateLink(index, 'target', event.target.value)}>
                  <option value='_blank'>New tab</option>
                  <option value='_self'>Same tab</option>
                </select>
              </label>
            </div>
            <label className='field checkbox-field'><input type='checkbox' checked={Boolean(link.enabled)} onChange={(event) => updateLink(index, 'enabled', event.target.checked)} /><span>Enabled</span></label>
            <button type='button' className='secondary-button' onClick={() => removeLink(index)}>Remove link</button>
          </div>
        )) : <p className='empty-state'>No public links stored yet.</p>}
        <div className='button-row'>
          <button type='button' className='secondary-button' onClick={addLink}>Add link</button>
          <button type='submit' className='primary-button' disabled={busy}>{busy ? 'Saving…' : 'Save links'}<span>↗</span></button>
        </div>
      </form>
    </section>
  );
}

function AdminAccessDenied() {
  return (
    <main className='auth-page'>
      <section className='auth-intro' style={{ background: 'linear-gradient(145deg, #1a2421 0%, #1c1815 100%)' }}>
        <div className='brand auth-brand'>
          <span className='brand-mark' style={{ background: '#b91c1c' }}>!</span>
<<<<<<< HEAD
          <span>MKM Admin<span className='brand-caption'>SECURITY BOUNDARY</span></span>
=======
          <span>Online Trade Admin<span className='brand-caption'>SECURITY BOUNDARY</span></span>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
        <div className='intro-copy'>
          <p className='eyebrow' style={{ color: '#f87171' }}>ACCESS RESTRICTED</p>
          <h1>Access Denied</h1>
          <p>This administrative portal is strictly reserved for authorized platform administrators.</p>
        </div>
<<<<<<< HEAD
        <div className='intro-foot'>RESTRICTED ACCESS <span>•</span> MKM {new Date().getFullYear()}</div>
=======
        <div className='intro-foot'>RESTRICTED ACCESS <span>•</span> Online Trade {new Date().getFullYear()}</div>
>>>>>>> d1aaf18 (Update OnlineTrade project)
      </section>
      <section className='auth-side'>
        <div className='auth-form-wrap'>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <CircleAlert size={15} />
            <span>Restricted Area</span>
          </div>
          <h2>Administrator Access Required</h2>
          <p className='form-subtitle'>Your account does not have administrator privileges. Customer accounts cannot access or view management dashboards.</p>
          <div className='form-stack' style={{ marginTop: '24px' }}>
            <Link to='/dashboard' className='primary-button' style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <span>Return to Customer Dashboard</span>
              <span>↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminLoginScreen({ auth, setAuth, onSubmit, busy, error, onDismissError }) {
<<<<<<< HEAD
  return (
    <main className='auth-page'>
      <section className='auth-intro'>
        <Link className='brand auth-brand' to='/admin/login'>
          <span className='brand-mark'>A</span>
          <span>MKM Admin<span className='brand-caption'>ADMIN PANEL</span></span>
        </Link>
        <div className='intro-copy'>
          <p className='eyebrow'>PRIVATE ACCESS</p>
          <h1>Admin portal</h1>
          <p>Secure administrative controls for customers, payouts, products and support.</p>
        </div>
        <div className='intro-foot'>SECURE ADMINISTRATOR ACCESS <span>•</span> MKM {new Date().getFullYear()}</div>
      </section>
      <section className='auth-side'>
        <div className='auth-form-wrap'>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(23, 61, 49, 0.08)', color: '#173d31', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '14px' }}>
            <ShieldCheck size={14} />
            <span>Authorized Administrators Only</span>
          </div>
          <h2>Administrator login</h2>
          <p className='form-subtitle'>Sign in with your administrator phone number and password.</p>
          {error && <ErrorToast message={error} onDismiss={onDismissError} />}
          {error && (error.includes('/login') || error.toLowerCase().includes('customer')) && (
            <div style={{ margin: '14px 0', padding: '12px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 500 }}>Customer account detected</span>
              <Link to='/login' style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', textDecoration: 'underline' }}>
                Customer Login ↗
              </Link>
            </div>
          )}
          <form onSubmit={onSubmit} className='form-stack'>
            <label className='field'>
              <span>Phone number *</span>
              <div className='phone-input-group'>
                <span className='phone-prefix-pill'>+251</span>
                <input
                  type='tel'
                  inputMode='numeric'
                  placeholder='912345678'
                  value={auth.phoneNumber}
                  onChange={(event) => setAuth({ ...auth, phoneNumber: event.target.value.replace(/\D/g, '').slice(0, 9) })}
                  autoComplete='tel'
                  required
                />
              </div>
              <small>Enter your 9-digit administrator phone number.</small>
            </label>
            <label className='field'>
              <span>Password *</span>
              <input
                type='password'
                value={auth.password}
                onChange={(event) => setAuth({ ...auth, password: event.target.value })}
                placeholder='Enter your password'
                autoComplete='current-password'
                required
              />
            </label>
            <button className='primary-button' disabled={busy}>{busy ? 'Please wait…' : 'Sign in to Admin'}<span>↗</span></button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to='/login' style={{ color: 'var(--color-text-muted, #888)', fontSize: '0.875rem', textDecoration: 'none' }}>
              ← Return to customer login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


function ProtectedCustomerApp({ user, dashboard, support, products, team, members, referralInfo, referralsLoading, referralsError, setReferralsError, methods, accounts, recharges, withdrawals, settings, busy, notice, customerSuccessAlert, onDismissCustomerAlert, error, setError, setNotice, onCopyReferral, onPurchase, onSubmitRecharge, onSubmitWithdrawal, onCustomerSuccess, onSaveAccount, onSignOut, onRefreshDashboard }) {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [currentVipInfo, setCurrentVipInfo] = useState({ loading: true, purchase: null });
  const currentPath = location.pathname || '/dashboard';
  useEffect(() => {
    let active = true;
    const refreshUnreadCount = () => {
      api('/notifications/unread-count')
        .then(({ unreadCount }) => {
          if (active) setUnreadNotificationCount(unreadCount);
        })
        .catch((cause) => {
          if (active) setError(cause.message);
        });
    };
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') refreshUnreadCount();
    };

    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 60000);
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [setError]);

  useEffect(() => {
    setNavOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.pathname, location.hash]);
  const currentTitle = (() => {
    if (currentPath.startsWith('/products/')) return 'Product details';
    if (currentPath === '/welcome') return 'Welcome to MKM';
    if (currentPath === '/my') return 'MY';
    if (currentPath === '/dashboard') return 'Overview';
    if (currentPath === '/products') return 'Products';
    if (currentPath === '/tasks') return 'Daily Tasks';
    if (currentPath === '/purchases') return 'My Products';
    if (currentPath === '/recharge') return 'Recharge';
    if (currentPath === '/recharge/payment') return 'Payment details';
    if (currentPath === '/recharge/history') return 'Recharge history';
    if (currentPath === '/withdrawal-account') return 'Personal Information';
    if (currentPath === '/withdraw') return 'Withdraw';
    if (currentPath === '/withdraw/history') return 'Withdraw';
    if (currentPath === '/referrals') return 'Referrals';
    if (currentPath === '/rewards') return 'Rewards';
    if (currentPath === '/transactions') return 'Transactions';
    if (currentPath === '/notifications') return 'Notifications';
    if (currentPath === '/profile') return 'Personal Information';
    if (currentPath === '/support') return 'Support';
    if (currentPath === '/download') return 'Download App';
    return 'Member portal';
  })();

  const renderPage = () => {
    if (currentPath === '/welcome') {
      return <WelcomePromotionPage registrationBonus={settings?.registrationBonus ?? 70} support={support} />;
    }
    if (currentPath.startsWith('/products/')) {
      const productId = currentPath.split('/').filter(Boolean).at(-1);
      const item = products.find((product) => product.id === productId) ?? null;
      return <ProductDetailPage product={item} onPurchase={onPurchase} busy={busy} />;
    }
    switch (currentPath) {
      case '/dashboard':
      case '/':
        return <Overview data={dashboard} products={products} busy={busy} onPurchase={onPurchase} onCopy={onCopyReferral} support={support} />;
      case '/my':
        return <MyPage support={support} dashboard={dashboard} onCurrentVipChange={setCurrentVipInfo} onSignOut={onSignOut} />;
      case '/products':
        return <Products items={products} busy={busy} onPurchase={onPurchase} />;
      case '/tasks':
        return <TasksPage onRefreshDashboard={onRefreshDashboard} />;
      case '/purchases':
        return <PurchasesPage />;
      case '/recharge':
        return <Recharge methods={methods} history={recharges} busy={busy} onSubmit={onSubmitRecharge} settings={settings} />;
      case '/recharge/payment':
        return <RechargePaymentPage methods={methods} settings={settings} onCustomerSuccess={onCustomerSuccess} />;
      case '/recharge/history':
        return <RechargeHistoryPage />;
      case '/withdrawal-account':
        return <Navigate to='/profile' replace />;
      case '/withdraw':
        return <Withdraw accounts={accounts} history={withdrawals} balance={dashboard?.wallet?.availableBalance} settings={settings} busy={busy} onSubmit={onSubmitWithdrawal} />;
      case '/withdraw/history':
        return <Navigate to='/withdraw' replace />;
      case '/referrals':
        return <Team summary={team} members={members} loading={referralsLoading} error={referralsError} onDismissError={() => setReferralsError('')} code={dashboard?.referralCode ?? referralInfo?.referralCode} referralLink={referralInfo?.referralLink ?? (dashboard?.referralCode ? `${window.location.origin}/register?ref=${dashboard.referralCode}` : '')} rates={referralInfo?.rates ?? { A: 22, B: 2, C: 1 }} onCopyCode={onCopyReferral} onCopyLink={() => {
          const value = referralInfo?.referralLink ?? (dashboard?.referralCode ? `${window.location.origin}/register?ref=${dashboard.referralCode}` : '');
          navigator.clipboard?.writeText(value).catch(() => undefined);
          setNotice('Referral link copied.');
        }} onShare={async () => {
          const value = referralInfo?.referralLink ?? (dashboard?.referralCode ? `${window.location.origin}/register?ref=${dashboard.referralCode}` : '');
          if (navigator.share && value) {
            try {
              await navigator.share({ title: 'MKM Referral', text: 'Join me on MKM and earn together.', url: value });
              return;
            } catch {
              // fall through to copied link fallback
            }
          }
          if (value) {
            await navigator.clipboard?.writeText(value).catch(() => undefined);
          }
          setNotice('Referral link is ready to share.');
        }} />;
      case '/rewards':
        return <RewardsPage onCustomerSuccess={onCustomerSuccess} />;
      case '/transactions':
        return <TransactionsPage />;
      case '/notifications':
        return <NotificationsPage onMarkRead={() => setUnreadNotificationCount((count) => Math.max(0, count - 1))} />;
      case '/profile':
        return <ProfilePage methods={methods} support={support} busy={busy} onSaveAccount={onSaveAccount} />;
      case '/support':
        return <SupportPage />;
      case '/download':
        return <CustomerDownloadPage support={support} />;
      default:
        return <Navigate to='/dashboard' replace />;
    }
  };

  return (
    <div className='workspace customer-workspace'>
      {user?.role === 'CUSTOMER' && customerSuccessAlert && (
        <div className='customer-success-toast' role='status' aria-live='polite'>
          <CheckCircle2 size={22} aria-hidden='true' />
          <span>{customerSuccessAlert}</span>
          <button type='button' onClick={onDismissCustomerAlert} aria-label='Dismiss success message'><X size={18} /></button>
        </div>
      )}
      <aside className='sidebar customer-sidebar'>
        <div className='sidebar-heading'>
          <NavLink to='/dashboard' className='brand' end>
            <span className='brand-mark'>M</span>
            <span>MKM</span>
          </NavLink>
          <button className='workspace-menu-toggle' type='button' aria-expanded={navOpen} aria-controls='customer-navigation' aria-label={navOpen ? 'Close member navigation' : 'Open member navigation'} onClick={() => setNavOpen((open) => !open)}>
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav id='customer-navigation' className={navOpen ? 'is-open' : ''} aria-label='Member navigation'>
          <NavLink to={myPageNavItem.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MyPageIcon size={17} strokeWidth={1.8} />
            {myPageNavItem.label}
          </NavLink>
          <div className='nav-section'>
            <p className='nav-section-label'>WORKSPACE</p>
            {workspaceNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={to === '/dashboard'}>
                <Icon size={17} strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
      <main className='main-area'>
        <header className='topbar'>
          <div>
            {currentPath === '/my' ? (
              <>
                <p className='eyebrow'>Current VIP</p>
                <div className='customer-vip-heading'>
                  <h1>{currentVipInfo.loading ? 'Loading…' : currentVipInfo.purchase?.name ?? 'VIP 0'}</h1>
                  <span>{currentVipInfo.loading ? ' ' : currentVipInfo.purchase ? 'ACTIVE' : 'NO ACTIVE VIP'}</span>
                </div>
              </>
            ) : currentPath === '/dashboard' || currentPath === '/' ? (
              <div className='dashboard-balance-heading'>
                <p className='eyebrow'>Available balance</p>
                <h1>{money(dashboard?.wallet?.availableBalance)}</h1>
                <small>ACCOUNT SUMMARY</small>
              </div>
            ) : (
              <>
                <p className='eyebrow'>MEMBER ACCOUNT</p>
                <h1>{currentTitle}</h1>
              </>
            )}
          </div>
          <div className='topbar-right'>
            <NavLink
              to='/notifications'
              className={({ isActive }) => `notification-icon-link ${isActive ? 'active' : ''}`}
              aria-label='Notifications'
              title='Notifications'
            >
              <Bell size={20} strokeWidth={1.9} aria-hidden='true' />
              {unreadNotificationCount > 0 && (
                <span className='notification-unread-badge' aria-label={`${unreadNotificationCount} unread notifications`}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </NavLink>
            <span className='status-dot' /> Account active
          </div>
        </header>
        <div className='content'>
          {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
          {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}
          {renderPage()}
        </div>
      </main>
      <nav className='customer-mobile-footer' aria-label='Mobile member navigation'>
        {mobileMenuOpen && (
          <div className='customer-mobile-menu'>
            <div className='customer-mobile-menu-heading'>
              <strong>All member pages</strong>
              <button type='button' className='customer-mobile-menu-close' onClick={() => setMobileMenuOpen(false)} aria-label='Close all pages menu'><X size={18} /></button>
            </div>
            <NavLink to={myPageNavItem.to} className={({ isActive }) => `customer-mobile-menu-link my-page-menu-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <MyPageIcon size={18} strokeWidth={1.8} />
              <span>{myPageNavItem.label}</span>
            </NavLink>
            <div className='customer-mobile-menu-section'>
              <p className='customer-mobile-menu-label'>WORKSPACE</p>
              <div className='customer-mobile-menu-grid'>
                {workspaceNavItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => `customer-mobile-menu-link ${isActive ? 'active' : ''}`} end={to === '/dashboard'}>
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className='customer-mobile-dock'>
          {navItems.filter(({ to }) => ['/dashboard', '/purchases', '/rewards', '/referrals'].includes(to)).map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `customer-mobile-dock-link ${isActive ? 'active' : ''}`} end={to === '/dashboard'}>
              <Icon size={19} strokeWidth={1.9} />
              <span>{label === 'Overview' ? 'Home' : label}</span>
            </NavLink>
          ))}
          <NavLink to='/my' className={({ isActive }) => `customer-mobile-dock-link ${isActive ? 'active' : ''}`}>
            <MyPageIcon size={19} strokeWidth={1.9} />
            <span>MY</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

function AuthScreen({ auth, setAuth, mode, onSubmit, onSwitchMode, busy, error, onDismissError, appDownloadUrl }) {
  const registering = mode === 'register';
  const [downloadLink, setDownloadLink] = useState(appDownloadUrl || '');

  useEffect(() => {
    if (appDownloadUrl) {
      setDownloadLink(appDownloadUrl);
      return;
    }
    api('/config/public')
      .then((cfg) => {
        if (cfg?.appDownloadUrl) setDownloadLink(cfg.appDownloadUrl);
      })
      .catch(() => undefined);
  }, [appDownloadUrl]);

=======
>>>>>>> d1aaf18 (Update OnlineTrade project)
  return (
    <main className='auth-page'>
      <section className='auth-intro'>
        <Link className='brand auth-brand' to='/admin/login'>
          <span className='brand-mark'>OT</span>
          <span>Online Trade Admin<span className='brand-caption'>ADMIN PANEL</span></span>
        </Link>
        <div className='intro-copy'>
          <p className='eyebrow'>PRIVATE ACCESS</p>
          <h1>Admin portal</h1>
          <p>Secure administrative controls for customers, payouts, products and support.</p>
        </div>
        <div className='intro-foot'>SECURE ADMINISTRATOR ACCESS <span>•</span> Online Trade {new Date().getFullYear()}</div>
      </section>
      <section className='auth-side'>
        <div className='auth-form-wrap'>
<<<<<<< HEAD
          <p className='eyebrow'>{registering ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}</p>
          <h2>{registering ? 'Join MKM' : 'Sign in'}</h2>
          {error && <ErrorToast message={error} onDismiss={onDismissError} />}
          {!registering && error && (error.includes('/admin/login') || error.toLowerCase().includes('administrator')) && (
            <div style={{ margin: '14px 0', padding: '12px 14px', borderRadius: '8px', background: 'rgba(23, 61, 49, 0.08)', border: '1px solid rgba(23, 61, 49, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#173d31', fontWeight: 500 }}>Administrator account detected</span>
              <Link to='/admin/login' style={{ fontSize: '12px', fontWeight: 700, color: '#173d31', textDecoration: 'underline' }}>
                Admin Portal ↗
=======
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '999px', background: 'rgba(13, 79, 79, 0.08)', color: '#0d4f4f', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '14px' }}>
            <ShieldCheck size={14} />
            <span>Authorized Administrators Only</span>
          </div>
          <h2>Administrator login</h2>
          <p className='form-subtitle'>Sign in with your administrator phone number and password.</p>
          {error && <ErrorToast message={error} onDismiss={onDismissError} />}
          {error && (error.includes('/login') || error.toLowerCase().includes('customer')) && (
            <div style={{ margin: '14px 0', padding: '12px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#991b1b', fontWeight: 500 }}>Customer account detected</span>
              <Link to='/login' style={{ fontSize: '12px', fontWeight: 700, color: '#991b1b', textDecoration: 'underline' }}>
                Customer Login ↗
>>>>>>> d1aaf18 (Update OnlineTrade project)
              </Link>
            </div>
          )}
          <form onSubmit={onSubmit} className='form-stack'>
            <label className='field'>
              <span>Phone number *</span>
              <div className='phone-input-group'>
                <span className='phone-prefix-pill'>+251</span>
                <input
                  type='tel'
                  inputMode='numeric'
                  placeholder='912345678'
                  value={auth.phoneNumber}
                  onChange={(event) => setAuth({ ...auth, phoneNumber: event.target.value.replace(/\D/g, '').slice(0, 9) })}
                  autoComplete='tel'
                  required
                />
              </div>
              <small>Enter your 9-digit administrator phone number.</small>
            </label>
            <label className='field'>
              <span>Password *</span>
              <input
                type='password'
                value={auth.password}
                onChange={(event) => setAuth({ ...auth, password: event.target.value })}
                placeholder='Enter your password'
                autoComplete='current-password'
                required
              />
            </label>
            <button className='primary-button' disabled={busy}>{busy ? 'Please wait…' : 'Sign in to Admin'}<span>↗</span></button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link to='/login' style={{ color: 'var(--color-text-muted, #888)', fontSize: '0.875rem', textDecoration: 'none' }}>
              ← Return to customer login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


function ProtectedCustomerApp({ user, dashboard, support, products, team, members, referralInfo, referralsLoading, referralsError, setReferralsError, methods, accounts, recharges, withdrawals, settings, busy, notice, customerSuccessAlert, onDismissCustomerAlert, error, setError, setNotice, onCopyReferral, onPurchase, onSubmitRecharge, onSubmitWithdrawal, onCustomerSuccess, onSaveAccount, onSignOut, onRefreshDashboard }) {
  const location = useLocation();
  const { t } = useLanguage();
  const [navOpen, setNavOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [currentVipInfo, setCurrentVipInfo] = useState({ loading: true, purchase: null });
  const latestNotificationId = useRef(null);
  const onCustomerSuccessRef = useRef(onCustomerSuccess);
  onCustomerSuccessRef.current = onCustomerSuccess;
  const currentPath = location.pathname || '/dashboard';
  useEffect(() => {
    let active = true;
    const refreshUnreadCount = async () => {
      try {
        const [unread, latest] = await Promise.all([
          api('/notifications/unread-count'),
          api('/notifications?page=1&limit=1'),
        ]);
        if (!active) return;
        setUnreadNotificationCount(unread.unreadCount);
        const latestItem = latest.items[0];
        if (latestNotificationId.current === null) {
          latestNotificationId.current = latestItem?.id ?? '';
        } else if (latestItem?.id && latestItem.id !== latestNotificationId.current) {
          latestNotificationId.current = latestItem.id;
          if (!latestItem.isRead) {
            onCustomerSuccessRef.current(`${latestItem.title}: ${latestItem.message}`);
          }
        }
      } catch (cause) {
        if (active) setError(cause.message);
      }
    };
    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') refreshUnreadCount();
    };

    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 15000);
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnFocus);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnFocus);
    };
  }, [setError]);

  useEffect(() => {
    setNavOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.pathname, location.hash]);
  const currentTitle = (() => {
    if (currentPath.startsWith('/products/')) return t('Product details');
    if (currentPath === '/welcome') return t('Welcome to Online Trade');
    if (currentPath === '/my') return t('MY');
    if (currentPath === '/dashboard') return t('Overview');
    if (currentPath === '/products') return t('Products');
    if (currentPath === '/tasks') return t('Daily Tasks');
    if (currentPath === '/purchases') return t('My Investments');
    if (currentPath === '/recharge') return t('Recharge');
    if (currentPath === '/recharge/bank') return t('Choose payment method');
    if (currentPath === '/recharge/payment') return t('Payment details');
    if (currentPath === '/recharge/history') return t('Recharge history');
    if (currentPath === '/withdrawal-account') return t('Personal Information');
    if (currentPath === '/withdraw') return t('Withdraw');
    if (currentPath === '/withdraw/history') return t('Withdraw');
    if (currentPath === '/referrals') return t('Referrals');
    if (currentPath === '/spin') return '';
    if (currentPath === '/rewards') return t('Rewards');
    if (currentPath === '/game') return t('Multiplier game');
    if (currentPath === '/transactions') return t('Transactions');
    if (currentPath === '/notifications') return t('Notifications');
    if (currentPath === '/profile') return t('Personal Information');
    if (currentPath === '/support') return t('Support');
    if (currentPath === '/support/chat') return t('Online chat');
    if (currentPath === '/download') return t('Download App');
    return t('Member portal');
  })();

  const renderPage = () => {
    if (currentPath === '/welcome') {
      return <WelcomePromotionPage registrationBonus={settings?.registrationBonus ?? 70} support={support} />;
    }
    if (currentPath.startsWith('/products/')) {
      const productId = currentPath.split('/').filter(Boolean).at(-1);
      const item = products.find((product) => product.id === productId) ?? null;
      return <ProductDetailPage product={item} onPurchase={onPurchase} busy={busy} />;
    }
    switch (currentPath) {
      case '/dashboard':
      case '/':
        return <Overview data={dashboard} products={products} busy={busy} onPurchase={onPurchase} onCopy={onCopyReferral} support={support} onRefreshDashboard={onRefreshDashboard} />;
      case '/my':
        return <MyPage support={support} dashboard={dashboard} onCurrentVipChange={setCurrentVipInfo} onSignOut={onSignOut} />;
      case '/products':
        return <Products items={products} busy={busy} onPurchase={onPurchase} />;
      case '/tasks':
        return <TasksPage onRefreshDashboard={onRefreshDashboard} />;
      case '/purchases':
        return <PurchasesPage />;
      case '/recharge':
        return <Recharge methods={methods} history={recharges} busy={busy} onSubmit={onSubmitRecharge} settings={settings} />;
      case '/recharge/bank':
        return <RechargeBankSelectionPage methods={methods} />;
      case '/recharge/payment':
        return <RechargePaymentPage methods={methods} settings={settings} onCustomerSuccess={onCustomerSuccess} />;
      case '/recharge/history':
        return <RechargeHistoryPage />;
      case '/withdrawal-account':
        return <Navigate to='/profile' replace />;
      case '/withdraw':
        return <Withdraw accounts={accounts} history={withdrawals} balance={dashboard?.wallet?.availableBalance} settings={settings} busy={busy} onSubmit={onSubmitWithdrawal} />;
      case '/withdraw/history':
        return <Navigate to='/withdraw' replace />;
      case '/referrals':
        return <Team summary={team} members={members} loading={referralsLoading} error={referralsError} onDismissError={() => setReferralsError('')} code={dashboard?.referralCode ?? referralInfo?.referralCode} referralLink={referralInfo?.referralLink ?? (dashboard?.referralCode ? `${window.location.origin}/register?ref=${dashboard.referralCode}` : '')} rates={referralInfo?.rates ?? { A: 10, B: 3, C: 2 }} onCopyCode={onCopyReferral} onCopyLink={() => {
          const value = referralInfo?.referralLink ?? (dashboard?.referralCode ? `${window.location.origin}/register?ref=${dashboard.referralCode}` : '');
          navigator.clipboard?.writeText(value).catch(() => undefined);
          setNotice('Referral link copied.');
        }} onShare={async () => {
          const value = referralInfo?.referralLink ?? (dashboard?.referralCode ? `${window.location.origin}/register?ref=${dashboard.referralCode}` : '');
          if (navigator.share && value) {
            try {
              await navigator.share({ title: 'Online Trade Referral', text: 'Join me on Online Trade and earn together.', url: value });
              return;
            } catch {
              // fall through to copied link fallback
            }
          }
          if (value) {
            await navigator.clipboard?.writeText(value).catch(() => undefined);
          }
          setNotice('Referral link is ready to share.');
        }} />;
      case '/spin':
        return <CustomerPromotions onAwarded={onRefreshDashboard} display='full' />;
      case '/rewards':
        return <RewardsPage onCustomerSuccess={onCustomerSuccess} />;
      case '/game':
        return <MultiplierGamePage onAwarded={onRefreshDashboard} />;
      case '/transactions':
        return <TransactionsPage />;
      case '/notifications':
        return <NotificationsPage onMarkRead={() => setUnreadNotificationCount((count) => Math.max(0, count - 1))} />;
      case '/profile':
        return <ProfilePage methods={methods} support={support} busy={busy} onSaveAccount={onSaveAccount} />;
      case '/support':
        return <SupportPage />;
      case '/support/chat':
        return <SupportChatPage support={support} />;
      case '/download':
        return <CustomerDownloadPage support={support} />;
      default:
        return <Navigate to='/dashboard' replace />;
    }
  };

  return (
    <div className='workspace customer-workspace'>
      {user?.role === 'CUSTOMER' && customerSuccessAlert && (
        <div className='customer-success-toast' role='status' aria-live='polite'>
          <CheckCircle2 size={22} aria-hidden='true' />
          <span>{customerSuccessAlert}</span>
          <button type='button' onClick={onDismissCustomerAlert} aria-label='Dismiss success message'><X size={18} /></button>
        </div>
      )}
      <aside className='sidebar customer-sidebar'>
        <div className='sidebar-heading'>
          <NavLink to='/dashboard' className='brand' end>
            <span className='brand-mark'>OT</span>
            <span>Online Trade</span>
          </NavLink>
          <button className='workspace-menu-toggle' type='button' aria-expanded={navOpen} aria-controls='customer-navigation' aria-label={navOpen ? 'Close member navigation' : 'Open member navigation'} onClick={() => setNavOpen((open) => !open)}>
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav id='customer-navigation' className={navOpen ? 'is-open' : ''} aria-label='Member navigation'>
          <NavLink to={myPageNavItem.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MyPageIcon size={17} strokeWidth={1.8} />
            {t(myPageNavItem.label)}
          </NavLink>
          <div className='nav-section'>
            <p className='nav-section-label'>{t('WORKSPACE')}</p>
            {workspaceNavItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={to === '/dashboard'}>
                <Icon size={17} strokeWidth={1.8} />
                {t(label)}
              </NavLink>
            ))}
          </div>
        </nav>
      </aside>
      <main className='main-area'>
        <header className={`topbar ${['/transactions', '/spin', '/game'].includes(currentPath) ? 'transactions-hidden-shell' : ''}`}>
          <div>
            {currentPath === '/my' ? (
              <>
                <p className='eyebrow'>{t('Current VIP')}</p>
                <div className='customer-vip-heading'>
                  <h1>{currentVipInfo.loading ? t('Loading…') : currentVipInfo.purchase?.name ?? 'VIP 0'}</h1>
                  <span>{currentVipInfo.loading ? ' ' : currentVipInfo.purchase ? t('ACTIVE') : t('NO ACTIVE VIP')}</span>
                </div>
              </>
            ) : currentPath === '/spin' ? null : currentPath === '/dashboard' || currentPath === '/' ? (
              <div className='dashboard-balance-heading'>
                <p className='eyebrow'>{t('Available balance')}</p>
                <h1>{money(dashboard?.wallet?.availableBalance)}</h1>
                <small>{t('ACCOUNT SUMMARY')}</small>
              </div>
            ) : (
              <>
                <p className='eyebrow'>{t('MEMBER ACCOUNT')}</p>
                <h1>{currentTitle}</h1>
              </>
            )}
          </div>
          <div className='topbar-right'>
            <LanguageSwitcher />
            <NavLink
              to='/notifications'
              className={({ isActive }) => `notification-icon-link ${isActive ? 'active' : ''}`}
              aria-label='Notifications'
              title='Notifications'
            >
              <Bell size={20} strokeWidth={1.9} aria-hidden='true' />
              {unreadNotificationCount > 0 && (
                <span className='notification-unread-badge' aria-label={`${unreadNotificationCount} unread notifications`}>
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </NavLink>
            <span className='status-dot' /> {t('Account active')}
          </div>
        </header>
        <div className={`content ${currentPath === '/transactions' ? 'transactions-page-content' : ''} ${['/spin', '/game'].includes(currentPath) ? 'immersive-page-content' : ''}`}>
          {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
          {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}
          {renderPage()}
        </div>
      </main>
      <nav className={`customer-mobile-footer ${['/transactions', '/spin', '/game'].includes(currentPath) ? 'transactions-hidden-shell' : ''}`} aria-label='Mobile member navigation'>
        {mobileMenuOpen && (
          <div className='customer-mobile-menu'>
            <div className='customer-mobile-menu-heading'>
              <strong>{t('All member pages')}</strong>
              <LanguageSwitcher />
              <button type='button' className='customer-mobile-menu-close' onClick={() => setMobileMenuOpen(false)} aria-label='Close all pages menu'><X size={18} /></button>
            </div>
            <NavLink to={myPageNavItem.to} className={({ isActive }) => `customer-mobile-menu-link my-page-menu-link ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <MyPageIcon size={18} strokeWidth={1.8} />
              <span>{t(myPageNavItem.label)}</span>
            </NavLink>
            <div className='customer-mobile-menu-section'>
              <p className='customer-mobile-menu-label'>{t('WORKSPACE')}</p>
              <div className='customer-mobile-menu-grid'>
                {workspaceNavItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={({ isActive }) => `customer-mobile-menu-link ${isActive ? 'active' : ''}`} end={to === '/dashboard'}>
                    <Icon size={18} strokeWidth={1.8} />
                    <span>{t(label)}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className='customer-mobile-dock'>
          <NavLink to='/dashboard' className={({ isActive }) => `customer-mobile-dock-link ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard size={19} strokeWidth={1.9} />
            <span>{t('Home')}</span>
          </NavLink>
          <NavLink to='/purchases' className={({ isActive }) => `customer-mobile-dock-link ${isActive ? 'active' : ''}`}>
            <Package size={19} strokeWidth={1.9} />
            <span>{t('Assets')}</span>
          </NavLink>
          <NavLink to='/referrals' className={({ isActive }) => `customer-mobile-dock-link ${isActive ? 'active' : ''}`}>
            <Users size={19} strokeWidth={1.9} />
            <span>{t('Team')}</span>
          </NavLink>
          <NavLink to='/my' className={({ isActive }) => `customer-mobile-dock-link ${isActive ? 'active' : ''}`}>
            <MyPageIcon size={19} strokeWidth={1.9} />
            <span>{t('Me')}</span>
          </NavLink>
          <NavLink to='/game' className={({ isActive }) => `customer-mobile-dock-link ${isActive ? 'active' : ''}`}>
            <CircleDollarSign size={19} strokeWidth={1.9} />
            <span>{t('Game')}</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

function AuthScreen({ auth, setAuth, mode, onSubmit, onSwitchMode, busy, error, onDismissError, support }) {
  const registering = mode === 'register';
  const { t } = useLanguage();

  return (
    <main className='auth-page auth-page-centered'>
      <PromotionGallery banners={support?.promotionBanners} presentation='carousel' />
      <LanguageSwitcher className='auth-language-switcher' />
      <section className='auth-side auth-side-centered'>
        <div className='auth-form-wrap auth-form-card'>
          <Link className='brand auth-brand' to='/'>
            <span className='brand-mark'>OT</span>
            <span>Online Trade<span className='brand-caption'>{t('WELCOME TO ONLINE TRADE')}</span></span>
          </Link>
          {registering ? (
            <div className='auth-card-intro'>
              <p className='eyebrow'>{t('START YOUR MEMBER JOURNEY')}</p>
              <h1>{t('Create your account')}</h1>
              <p>{t('Manage your wallet, follow daily rewards, and keep your referral team in view.')}</p>
            </div>
          ) : null}
          {error && <ErrorToast message={error} onDismiss={onDismissError} />}
          {!registering && error && (error.includes('/admin/login') || error.toLowerCase().includes('administrator')) && (
            <div style={{ margin: '14px 0', padding: '12px 14px', borderRadius: '8px', background: 'rgba(13, 79, 79, 0.08)', border: '1px solid rgba(13, 79, 79, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#0d4f4f', fontWeight: 500 }}>{t('Administrator account detected')}</span>
              <Link to='/admin/login' style={{ fontSize: '12px', fontWeight: 700, color: '#0d4f4f', textDecoration: 'underline' }}>
                {t('Admin Portal ↗')}
              </Link>
            </div>
          )}
          <form onSubmit={onSubmit} className='form-stack'>
            {registering && (
              <label className='field'>
                <span>{t('Full Name *')}</span>
                <input
                  type='text'
                  value={auth.fullName}
                  onChange={(event) => setAuth({ ...auth, fullName: event.target.value })}
                  placeholder={t('e.g. Abebe Bikila')}
                  autoComplete='name'
                  required
                />
              </label>
            )}

            <label className='field'>
              <span>{t('Phone number *')}</span>
              <div className='phone-input-group'>
                <span className='phone-prefix-pill'>+251</span>
                <input
                  type='tel'
                  inputMode='numeric'
                  placeholder='912345678'
                  value={auth.phoneNumber}
                  onChange={(event) => setAuth({ ...auth, phoneNumber: event.target.value.replace(/\D/g, '').slice(0, 9) })}
                  autoComplete='tel'
                  required
                />
              </div>
              <small>{t('Enter your 9-digit local number (e.g. 912345678 or 712345678).')}</small>
            </label>

            <label className='field'>
              <span>{t('Login Password *')}</span>
              <input
                type='password'
                value={auth.password}
                onChange={(event) => setAuth({ ...auth, password: event.target.value })}
                placeholder={t('Minimum 6 characters')}
                autoComplete={registering ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </label>

            {!registering && (
              <div className='auth-forgot-row'>
                <Link to='/forgot-password'>{t('Forgot Password?')}</Link>
              </div>
            )}

            {registering && (
              <>
                <label className='field'>
                  <span>{t('Confirm Login Password *')}</span>
                  <input
                    type='password'
                    value={auth.confirmPassword}
                    onChange={(event) => setAuth({ ...auth, confirmPassword: event.target.value })}
                    placeholder={t('Repeat login password')}
                    autoComplete='new-password'
                    minLength={6}
                    required
                  />
                </label>
                <label className='field'>
                  <span>{t('Referral Code (Optional)')}</span>
                  <input
                    type='text'
                    value={auth.referralCode}
                    onChange={(event) => setAuth({ ...auth, referralCode: event.target.value.toUpperCase() })}
                    placeholder={t('e.g. OT-ABC123')}
                  />
                  <small>{t('Leave blank if you were not invited by a sponsor.')}</small>
                </label>
                <label className='terms'>
                  <input
                    type='checkbox'
                    checked={auth.acceptedTerms}
                    onChange={(event) => setAuth({ ...auth, acceptedTerms: event.target.checked })}
                    required
                  />
                  <span>{t('I accept the')}<Link to='/terms' target='_blank'>{t('Terms of Service')}</Link>{t(' and ')}<Link to='/privacy' target='_blank'>{t('Privacy Policy')}</Link>{t('.')}</span>
                </label>
              </>
            )}

            <button className='primary-button large-btn' disabled={busy}>
              {busy ? t('Please wait…') : registering ? t('Create Account (Get 100 ETB Bonus)') : t('Sign In')} <span>↗</span>
            </button>
          </form>
          <p className='auth-switch'>
            {registering ? t('Already a member?') : t("Don't have an account?")}{' '}
            <button type='button' onClick={onSwitchMode}>
              {registering ? t('Sign in') : t('Register now')}
            </button>
          </p>

          <div className='auth-download-box' style={{ marginTop: '20px', padding: '14px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(23, 61, 49, 0.05), rgba(46, 125, 50, 0.08))', border: '1px solid rgba(23, 61, 49, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#173d31', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <ArrowDownToLine size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#173d31' }}>MKM Mobile App</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#556b60' }}>Install APK on your device</p>
              </div>
            </div>
            <a
              href={downloadLink || '/download'}
              target={downloadLink && downloadLink.startsWith('http') ? '_blank' : undefined}
              rel='noreferrer'
              style={{ padding: '8px 14px', borderRadius: '8px', background: '#173d31', color: '#ffffff', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 2px 6px rgba(23, 61, 49, 0.2)' }}
            >
              <ArrowDownToLine size={14} /> Download APK
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function WelcomePromotionPage({ registrationBonus, support }) {
  const navigate = useNavigate();
  const groupUrl = support?.officialGroupUrl || support?.whatsappUrl;

  const handleJoinGroup = () => {
    if (groupUrl) {
      window.open(groupUrl, '_blank', 'noopener,noreferrer');
    }
    navigate('/dashboard');
  };

  const bonusAmount = Number(registrationBonus || 100);
  const minDeposit = Number(support?.welcomeExamplePrice ?? 300);

  return (
    <div className='welcome-modal-overlay' onClick={() => navigate('/dashboard')}>
      <div className='welcome-modal-dialog' onClick={(e) => e.stopPropagation()}>
        <button
          className='welcome-modal-close'
          type='button'
          onClick={() => navigate('/dashboard')}
          aria-label='Close welcome dialog'
        >
          <X size={19} />
        </button>

        <h2 className='welcome-modal-title'>{support?.siteName || 'Online Trade'}</h2>
        <p className='welcome-modal-intro'>
          {support?.welcomeIntro || 'Online Trade is a member platform that connects you to premium earning opportunities with transparent tracking, automated daily rewards, and steady returns.'}
        </p>

        <div className='welcome-modal-pills'>
          <div className='welcome-modal-pill'>
            <span className='pill-label'>Registration Bonus:</span>
            <strong className='pill-value'>ETB{bonusAmount}</strong>
          </div>
          <div className='welcome-modal-pill'>
            <span className='pill-label'>Minimum Deposit:</span>
            <strong className='pill-value'>ETB{minDeposit}</strong>
          </div>
          <div className='welcome-modal-pill'>
            <span className='pill-label'>Minimum Withdrawal:</span>
            <strong className='pill-value'>ETB150</strong>
          </div>
        </div>

        <button
          className='welcome-modal-cta'
          type='button'
          onClick={handleJoinGroup}
        >
          Join Group
        </button>
      </div>
    </div>
  );
}

function PromotionBannerCarousel({ banners = [] }) {
  const defaultBanners = [
    { id: 1, imageUrl: '/banners/banner1.svg', title: 'Invest in Fresh Fruits', link: '/products' },
    { id: 2, imageUrl: '/banners/banner2.svg', title: 'Get Free ETB 100 Bonus', link: '/recharge' },
    { id: 3, imageUrl: '/banners/banner3.svg', title: 'Instant Bank Deposits', link: '/recharge' },
    { id: 4, imageUrl: '/banners/banner4.svg', title: 'Daily Harvest Tasks', link: '/purchases' },
    { id: 5, imageUrl: '/banners/banner5.svg', title: 'Invite Friends & Earn', link: '/referrals' },
  ];
  const items = Array.isArray(banners) && banners.length ? banners : defaultBanners;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => window.clearInterval(interval);
  }, [isPaused, items.length]);

  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % items.length);

  return (
    <div
      className='promotion-carousel-wrapper'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='promotion-carousel-viewport'>
        <div
          className='promotion-carousel-track'
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, idx) => (
            <div className='promotion-carousel-slide' key={item.id ?? idx}>
              <Link to={item.link || '/products'} className='promotion-carousel-card'>
                <img
                  src={item.imageUrl}
                  alt={item.title || `Promotion ${idx + 1}`}
                  className='promotion-carousel-img'
                />
              </Link>
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <button
              type='button'
              className='carousel-arrow carousel-arrow-prev'
              onClick={prevSlide}
              aria-label='Previous promotion'
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type='button'
              className='carousel-arrow carousel-arrow-next'
              onClick={nextSlide}
              aria-label='Next promotion'
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className='carousel-dots-indicator'>
          {items.map((_, idx) => (
            <button
              key={idx}
              type='button'
              className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminPromotionBannersPage({ support, onRefresh }) {
  const [banners, setBanners] = useState(support?.promotionBanners ?? []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (support?.promotionBanners?.length) {
      setBanners(support.promotionBanners);
    } else {
      api('/admin/settings/banners')
        .then((res) => {
          if (res?.items?.length) setBanners(res.items);
        })
        .catch(() => {});
    }
  }, [support]);

  const updateBanner = (index, field, value) => {
    setBanners((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api('/admin/settings/banners', {
        method: 'PUT',
        ...jsonBody({ items: banners }),
      });
      setMessage('All 5 promotional banners updated successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to update banners.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className='surface form-surface form-stack'>
      <div className='section-lead'>
        <div>
          <p className='eyebrow'>MARKETING &amp; PROMOTION</p>
          <h2>Configure Promotion Banners</h2>
          <p className='form-subtitle'>These 5 banners automatically rotate on the member home screen.</p>
        </div>
      </div>

      {message && <div className='notice-banner success-notice'>{message}</div>}
      {error && <div className='error-banner'>{error}</div>}

      <form onSubmit={handleSave} className='form-stack'>
        <div className='admin-banners-grid'>
          {banners.slice(0, 5).map((banner, idx) => (
            <div className='admin-banner-card' key={banner.id || idx}>
              <div className='admin-banner-preview'>
                <img src={banner.imageUrl} alt={banner.title} onError={(e) => { e.target.src = '/banners/banner1.svg'; }} />
                <span className='admin-banner-num'>Banner {idx + 1}</span>
              </div>
              <div className='admin-banner-fields'>
                <label className='field'>
                  <span>Image URL (or SVG path)</span>
                  <input
                    type='text'
                    value={banner.imageUrl || ''}
                    onChange={(e) => updateBanner(idx, 'imageUrl', e.target.value)}
                    required
                  />
                </label>
                <div className='profile-form-grid'>
                  <label className='field'>
                    <span>Title</span>
                    <input
                      type='text'
                      value={banner.title || ''}
                      onChange={(e) => updateBanner(idx, 'title', e.target.value)}
                      required
                    />
                  </label>
                  <label className='field'>
                    <span>Badge Tag</span>
                    <input
                      type='text'
                      value={banner.badge || ''}
                      onChange={(e) => updateBanner(idx, 'badge', e.target.value)}
                    />
                  </label>
                </div>
                <div className='profile-form-grid'>
                  <label className='field'>
                    <span>Subtitle / Description</span>
                    <input
                      type='text'
                      value={banner.subtitle || ''}
                      onChange={(e) => updateBanner(idx, 'subtitle', e.target.value)}
                    />
                  </label>
                  <label className='field'>
                    <span>Link (internal or external)</span>
                    <input
                      type='text'
                      value={banner.link || ''}
                      onChange={(e) => updateBanner(idx, 'link', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className='primary-button' type='submit' disabled={saving} style={{ alignSelf: 'flex-start', minWidth: 200 }}>
          {saving ? 'Saving Banners…' : 'Save All 5 Banners'} <span>↗</span>
        </button>
      </form>
    </section>
  );
}

<<<<<<< HEAD
function Overview({ data, products = [], busy, onPurchase, onCopy, support = {} }) {
  const wallet = data?.wallet;
  const [chatOpen, setChatOpen] = useState(false);
  const homeProducts = [...products];
  const vipFourIndex = homeProducts.findIndex((product) => /^V(?:I)?P\s*4\b/i.test(String(product.name)));
  const vipFiveIndex = homeProducts.findIndex((product) => /^V(?:I)?P\s*5\b/i.test(String(product.name)));
  if (vipFourIndex >= 0 && vipFiveIndex >= 0 && vipFiveIndex !== vipFourIndex + 1) {
    const [vipFive] = homeProducts.splice(vipFiveIndex, 1);
    const updatedVipFourIndex = homeProducts.findIndex((product) => /^V(?:I)?P\s*4\b/i.test(String(product.name)));
    homeProducts.splice(updatedVipFourIndex + 1, 0, vipFive);
  }
  const customerSupportUrl = support.customerSupportEnabled && support.customerSupportUrl
    ? support.customerSupportUrl
    : '/support';
  const officialGroupUrl = support.officialGroupEnabled && support.officialGroupUrl
    ? support.officialGroupUrl
    : '/support';
  const customerSupportExternal = customerSupportUrl.startsWith('http');
  const officialGroupExternal = officialGroupUrl.startsWith('http');

  return (
    <>
      <section className='welcome-row'>
        <div className='overview-account-actions'>
          <Link className='secondary-button' to='/withdraw'>Withdraw</Link>
          <Link className='primary-button' to='/recharge'>Recharge</Link>
        </div>
      </section>
      <div className='overview-chat-widget'>
        {chatOpen && (
          <section className='online-chat-panel' aria-label='Chat and support options'>
            <div className='online-chat-panel-heading'>
              <strong>How can we help?</strong>
              <button type='button' onClick={() => setChatOpen(false)} aria-label='Close chat options'><X size={17} /></button>
            </div>
            {officialGroupExternal ? (
              <a href={officialGroupUrl} target='_blank' rel='noreferrer' onClick={() => setChatOpen(false)}>
                <Users size={18} />
                <span>{support.officialGroupLabel || 'Official Group'}</span>
              </a>
            ) : (
              <Link to={officialGroupUrl} onClick={() => setChatOpen(false)}>
                <Users size={18} />
                <span>{support.officialGroupLabel || 'Official Group'}</span>
              </Link>
            )}
            {customerSupportExternal ? (
              <a href={customerSupportUrl} target='_blank' rel='noreferrer' onClick={() => setChatOpen(false)}>
                <ShieldCheck size={18} />
                <span>{support.customerSupportLabel || 'Customer Support'}</span>
              </a>
            ) : (
              <Link to={customerSupportUrl} onClick={() => setChatOpen(false)}>
                <ShieldCheck size={18} />
                <span>{support.customerSupportLabel || 'Customer Support'}</span>
              </Link>
            )}
          </section>
        )}
        <button
          className='online-chat-icon'
          type='button'
          aria-label={chatOpen ? 'Close chat options' : 'Open chat options'}
          aria-expanded={chatOpen}
          onClick={() => setChatOpen((open) => !open)}
        >
          {chatOpen ? <X size={22} /> : (
            <MessageCircle size={22} />
          )}
        </button>
      </div>
      <section className='referral-banner'>
        <div className='referral-symbol'><Users size={20} /></div>
        <p className='eyebrow'>GROW YOUR TEAM</p>
        <h3>Your referral link</h3>
        <button className='code-button' onClick={onCopy}>{data?.referralCode ? `${window.location.origin}/register?ref=${encodeURIComponent(data.referralCode)}` : 'Loading…'}<Copy size={15} /></button>
      </section>
      <section className='home-products-section' id='home-products'>
        <div className='section-lead'>
          <div>
            <p className='eyebrow'>EXPLORE MKM</p>
            <h2>Available products</h2>
          </div>
          <Link className='secondary-button' to='/products'>View all</Link>
        </div>
        {products.length ? (
          <div className='home-product-grid'>
            {homeProducts.map((product) => {
              const rate = Number(product.dailyRate ?? 0.24);
=======
function Overview({ data, products = [], busy, onPurchase, onCopy, support = {}, onRefreshDashboard }) {
  const { t } = useLanguage();
  const wallet = data?.wallet;
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const homeProducts = [...products];

  useEffect(() => {
    let active = true;
    const refreshUnreadChatCount = async () => {
      try {
        const result = await api('/support/chat/unread-count');
        if (active) setUnreadChatCount(result.unreadCount);
      } catch (cause) {
        if (active) console.error('Unable to refresh unread support messages:', cause);
      }
    };
    refreshUnreadChatCount();
    const interval = window.setInterval(refreshUnreadChatCount, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const totalDepositVal = Math.floor(Number(data?.totalDeposit ?? 0));
  const availableBalVal = Math.floor(Number(wallet?.availableBalance ?? 0));

  return (
    <div className='overview-container'>
      {/* 1. NexGrid-Style Balance Card (Deposit & Withdrawal) */}
      <section className='nexgrid-balance-card'>
        <div className='nexgrid-balance-col'>
          <span className='nexgrid-balance-label'>{t('DEPOSIT')}</span>
          <strong className='nexgrid-balance-val'>ETB{totalDepositVal}</strong>
        </div>
        <div className='nexgrid-balance-divider' />
        <div className='nexgrid-balance-col'>
          <span className='nexgrid-balance-label'>{t('WITHDRAWAL')}</span>
          <strong className='nexgrid-balance-val nexgrid-val-accent'>ETB{availableBalVal > 0 ? availableBalVal : 150}</strong>
        </div>
      </section>

      {/* 2. Promotion Carousel (Replaces the referral link banner) */}
      <section className='nexgrid-carousel-section'>
        <PromotionBannerCarousel banners={support?.promotionBanners} />
      </section>

      {/* Floating Support Chat Widget */}
      <div className='overview-chat-widget'>
        <Link
          className={`online-chat-icon ${unreadChatCount > 0 ? 'has-unread' : ''}`}
          to='/support/chat'
          aria-label={unreadChatCount > 0 ? `${t('Chat with Online Trade support')}, ${unreadChatCount} ${t('unread')}` : t('Chat with Online Trade support')}
          title={t('Chat with Online Trade support')}
        >
          <MessageCircle size={22} />
          {unreadChatCount > 0 && (
            <span className='online-chat-unread-badge' aria-hidden='true'>
              {unreadChatCount > 99 ? '99+' : unreadChatCount}
            </span>
          )}
        </Link>
      </div>

      {/* 3. Quick Actions Grid */}
      <section className='nexgrid-quick-actions-section'>
        <h3 className='nexgrid-section-title'>{t('Quick Actions')}</h3>
        <div className='nexgrid-actions-grid'>
          <Link to='/recharge' className='nexgrid-action-card'>
            <div className='nexgrid-action-icon-circle icon-circle-deposit'>
              <CircleDollarSign size={24} />
            </div>
            <span className='nexgrid-action-name'>{t('Deposit')}</span>
          </Link>
          <Link to='/withdraw' className='nexgrid-action-card'>
            <div className='nexgrid-action-icon-circle icon-circle-withdraw'>
              <RotateCcw size={24} />
            </div>
            <span className='nexgrid-action-name'>{t('Withdraw')}</span>
          </Link>
          <CustomerPromotions onAwarded={onRefreshDashboard} display='tile' />
          <Link to='/support/chat' className='nexgrid-action-card'>
            <div className='nexgrid-action-icon-circle icon-circle-support'>
              <Headphones size={24} />
            </div>
            <span className='nexgrid-action-name'>{t('Support')}</span>
          </Link>
          <Link to='/download' className='nexgrid-action-card'>
            <div className='nexgrid-action-icon-circle icon-circle-app'>
              <Smartphone size={24} />
            </div>
            <span className='nexgrid-action-name'>{t('APP')}</span>
          </Link>
        </div>
      </section>

      {/* 4. Featured Projects Section */}
      <section className='featured-projects-section' id='home-products'>
        <div className='featured-tab-bar'>
          <div className='featured-tab-item active'>
            <h2>{t('Featured Projects')}</h2>
            <div className='featured-tab-indicator' />
          </div>
          <Link to='/products' className='featured-view-more'>{t('View all →')}</Link>
        </div>

        {homeProducts.length ? (
          <div className='home-product-grid'>
            {homeProducts.map((product) => {
              const rate = Number(product.dailyRate ?? 0.05);
>>>>>>> d1aaf18 (Update OnlineTrade project)
              const dailyRate = rate > 1 ? rate / 100 : rate;
              const dailyIncome = Number(product.price ?? 0) * dailyRate;
              const isComingSoon = product.status === 'COMING_SOON' || (product.availableFrom && new Date(product.availableFrom) > new Date());
              return (
                <article className='home-product-card' key={product.id}>
                  <img src={getProductImage(product)} alt={`${product.name} product`} loading='lazy' />
                  <div className='home-product-content'>
                    <div className='home-product-title'>
                      <h3>{product.name}</h3>
                      <span className={`product-status ${isComingSoon ? 'coming-soon' : String(product.status).toLowerCase()}`}>
<<<<<<< HEAD
                        {isComingSoon ? 'COMING SOON' : String(product.status).replaceAll('_', ' ')}
                      </span>
                    </div>
                    <strong className='home-product-price'>{money(product.price)}</strong>
                    <span className='home-product-return'>{money(dailyIncome)} daily return · {product.durationDays} days</span>
                    <div className='home-product-actions'>
                      <Link className='secondary-button' to={`/products/${product.id}`}>Details</Link>
                      <button className='primary-button' type='button' disabled={busy || isComingSoon || product.status !== 'AVAILABLE'} onClick={() => onPurchase(product.id)}>
                        {isComingSoon ? 'Coming soon' : product.status === 'AVAILABLE' ? 'Buy' : 'Unavailable'}
=======
                        {isComingSoon ? t('COMING SOON') : t(String(product.status).replaceAll('_', ' '))}
                      </span>
                    </div>
                    <strong className='home-product-price'>{money(product.price)}</strong>
                    <span className='home-product-return'>{money(dailyIncome)} {t('daily return')} · {product.durationDays} {t('days')}</span>
                    <div className='home-product-actions'>
                      <Link className='secondary-button' to={`/products/${product.id}`}>{t('Details')}</Link>
                      <button className='primary-button' type='button' disabled={busy || isComingSoon || product.status !== 'AVAILABLE'} onClick={() => onPurchase(product.id)}>
                        {isComingSoon ? t('Coming soon') : product.status === 'AVAILABLE' ? t('Invest') : t('Unavailable')}
>>>>>>> d1aaf18 (Update OnlineTrade project)
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
<<<<<<< HEAD
        ) : <Empty>No products are listed yet.</Empty>}
      </section>
    </>
=======
        ) : <Empty>{t('No products are listed yet.')}</Empty>}
      </section>

      {/* 5. Referral Link moved to Footer */}
      <section className='overview-footer-referral'>
        <div className='footer-referral-content'>
          <div className='footer-referral-badge'>
            <Users size={14} /> {t('REFERRAL PROGRAM')}
          </div>
          <h3>{t('Share Online Trade & Earn 3-Level Commissions')}</h3>
          <p>{t('Earn Level A (10%), Level B (3%), and Level C (2%) instant earnings when your team invests in fruit packages.')}</p>
        </div>
        <div className='footer-referral-box'>
          <div className='footer-ref-code-display'>
            <span>{t('Your Code:')}</span>
            <strong>{data?.referralCode || 'OT-CODE'}</strong>
          </div>
          <button className='primary-button footer-ref-copy-btn' type='button' onClick={onCopy}>
            {t('Copy Invite Link')} <Copy size={15} />
          </button>
        </div>
      </section>
    </div>
>>>>>>> d1aaf18 (Update OnlineTrade project)
  );
}

function Metric({ label, value, tone = '', note = 'ACCOUNT SUMMARY' }) {
  return <section className='metric'><span>{label}</span><strong className={tone}>{value}</strong><small>{note}</small></section>;
}

function Products({ items, busy, onPurchase }) {
  const { t } = useLanguage();
  return (
    <>
      <div className='section-lead'>
        <div>
          <p className='eyebrow'>{t('AVAILABLE CATALOG')}</p>
          <h2>{t('Explore products')}</h2>
        </div>
        <span className='quiet-label'>{items.length} {t('LISTED')}</span>
      </div>
      {items.length ? (
        <div className='product-grid'>
          {items.map((product) => {
            const price = Number(product.price ?? 0);
            const rate = Number(product.dailyRate ?? 0.05);
            const normalizedRate = rate > 1 ? rate / 100 : rate;
            const dailyIncome = price * normalizedRate;
            const isComingSoon = product.status === 'COMING_SOON' || (product.availableFrom && new Date(product.availableFrom) > new Date());
            return (
              <article className='product' key={product.id}>
                <img className='customer-product-image' src={getProductImage(product)} alt={`${product.name} product`} loading='lazy' />
                <div className='product-top'>
                  <span className={`product-status ${isComingSoon ? 'coming-soon' : product.status.toLowerCase()}`}>
                    {isComingSoon ? t('COMING SOON') : t(product.status.replaceAll('_', ' '))}
                  </span>
                  <Package size={18} />
                </div>
                <h3>{product.name}</h3>
                <p>{product.description || t('Daily income product package with guaranteed daily accrual.')}</p>
                <div className='product-details'>
                  <div><small>{t('PRICE')}</small><strong>{money(product.price)}</strong></div>
                  <div><small>{t('DAILY RETURN')} ({Math.round(normalizedRate * 100)}%)</small><strong className='highlight-green'>{money(dailyIncome)} / {t('day')}</strong></div>
                  <div><small>{t('DURATION')}</small><strong>{product.durationDays} {t('days')}</strong></div>
                  <div><small>{t('TOTAL REVENUE')}</small><strong>{money(dailyIncome * product.durationDays)}</strong></div>
                </div>
                {isComingSoon && product.availableFrom && (
                  <div className='scheduled-badge'>
                    {t('Available:')} {new Date(product.availableFrom).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div className='button-row'>
                  <Link className='secondary-button' to={`/products/${product.id}`}>{t('View details')}</Link>
                  <button className='primary-button' disabled={busy || isComingSoon || product.status !== 'AVAILABLE'} onClick={() => onPurchase(product.id)}>
                    {isComingSoon ? t('Coming soon') : (product.status === 'AVAILABLE' ? t('Invest') : t('Not available'))}
                    <span>↗</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : <Empty>{t('No products are listed yet.')}</Empty>}
    </>
  );
}

function ProductDetailPage({ product, onPurchase, busy }) {
  const { t } = useLanguage();
  if (!product) return <Empty>{t('Product details are not available yet.')}</Empty>;

  const price = Number(product.price ?? 0);
  const rate = Number(product.dailyRate ?? 0.05);
  const normalizedRate = rate > 1 ? rate / 100 : rate;
  const dailyIncome = price * normalizedRate;
  const isComingSoon = product.status === 'COMING_SOON' || (product.availableFrom && new Date(product.availableFrom) > new Date());

  return (
    <section className='surface form-surface'>
      <img className='customer-product-detail-image' src={getProductImage(product)} alt={`${product.name} product`} />
      <div className='section-lead'>
        <div>
          <p className='eyebrow'>{t('PRODUCT DETAILS')}</p>
          <h2>{product.name}</h2>
        </div>
        <span className={`product-status ${isComingSoon ? 'coming-soon' : product.status.toLowerCase()}`}>
          {isComingSoon ? t('COMING SOON') : t(product.status.replaceAll('_', ' '))}
        </span>
      </div>
      <div className='product-details large'>
        <div><small>{t('PACKAGE PRICE')}</small><strong>{money(product.price)}</strong></div>
        <div><small>{t('DAILY RETURN')} ({Math.round(normalizedRate * 100)}%)</small><strong className='highlight-green'>{money(dailyIncome)} / {t('day')}</strong></div>
        <div><small>{t('DURATION')}</small><strong>{product.durationDays ?? 30} {t('days')}</strong></div>
        <div><small>{t('TOTAL ACCRUED RETURN')}</small><strong>{money(dailyIncome * (product.durationDays ?? 30))}</strong></div>
      </div>
      <p>{product.description || t('Daily income product package with guaranteed daily accrual.')}</p>
      {isComingSoon && product.availableFrom && (
        <div className='scheduled-badge'>
          {t('Available:')} {new Date(product.availableFrom).toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      <div className='button-row'>
        <Link className='secondary-button' to='/products'>← {t('Back to products')}</Link>
        <button className='primary-button' disabled={busy || isComingSoon || product.status !== 'AVAILABLE'} onClick={() => onPurchase(product.id)}>
          {isComingSoon ? t('Coming soon') : (product.status === 'AVAILABLE' ? t('Invest') : t('Not available'))}
          <span>↗</span>
        </button>
      </div>
    </section>
  );
}

function PurchasesPage() {
  const { t } = useLanguage();
  const [purchases, setPurchases] = useState([]);
  useEffect(() => {
    api('/purchases').then(setPurchases).catch(() => setPurchases([]));
  }, []);
  return (
    <section className='my-products-page'>
      <div className='section-lead'>
        <div>
<<<<<<< HEAD
          <p className='eyebrow'>YOUR PACKAGES</p>
          <h2>My Products</h2>
        </div>
        <div className='my-products-actions'>
          <Link className='secondary-button' to='/dashboard#home-products'>Browse products</Link>
          <Link className='primary-button' to='/tasks'>Daily Tasks</Link>
=======
          <p className='eyebrow'>{t('YOUR INVESTMENTS')}</p>
          <h2>{t('My Investments')}</h2>
        </div>
        <div className='my-products-actions'>
          <Link className='secondary-button' to='/dashboard#home-products'>{t('Browse products')}</Link>
          <Link className='primary-button' to='/tasks'>{t('Daily Tasks')}</Link>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
      </div>
      {purchases.length ? (
        <div className='my-products-grid'>
          {purchases.map((item) => {
            const dailyRate = rateFraction(item.dailyRate);
            const dailyReturn = Number(item.productPrice ?? item.amount) * dailyRate;
            return (
              <article className='my-product-card' key={item.id}>
                <img src={getProductImage(item)} alt={`${item.name} product`} loading='lazy' />
                <div className='my-product-content'>
                  <div className='my-product-heading'>
                    <div>
<<<<<<< HEAD
                      <p className='eyebrow'>VIP LEVEL</p>
=======
                      <p className='eyebrow'>{t('VIP LEVEL')}</p>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                      <h3>{item.name}</h3>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className='my-product-metrics'>
<<<<<<< HEAD
                    <div><small>AMOUNT</small><strong>{money(item.amount)}</strong></div>
                    <div><small>DAILY RETURN</small><strong className='highlight-green'>{money(dailyReturn)}</strong></div>
                    <div><small>DURATION</small><strong>{item.durationDays} days</strong></div>
                  </div>
                  <div className='my-product-dates'>
                    <span>Purchased {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</span>
                    <span>Activated {item.activatedAt ? new Date(item.activatedAt).toLocaleString() : '—'}</span>
=======
                    <div><small>{t('AMOUNT')}</small><strong>{money(item.amount)}</strong></div>
                    <div><small>{t('DAILY RETURN')}</small><strong className='highlight-green'>{money(dailyReturn)}</strong></div>
                    <div><small>{t('DURATION')}</small><strong>{item.durationDays} {t('days')}</strong></div>
                  </div>
                  <div className='my-product-dates'>
                    <span>{t('Invested')} {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</span>
                    <span>{t('Activated')} {item.activatedAt ? new Date(item.activatedAt).toLocaleString() : '—'}</span>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                  </div>
                </div>
              </article>
            );
          })}
        </div>
<<<<<<< HEAD
      ) : <section className='surface form-surface my-products-empty'><Empty>No purchased products yet.</Empty><div className='my-products-actions'><Link className='primary-button' to='/dashboard#home-products'>Browse products</Link><Link className='secondary-button' to='/tasks'>Daily Tasks</Link></div></section>}
=======
      ) : <section className='surface form-surface my-products-empty'><Empty>{t('No investments yet.')}</Empty><div className='my-products-actions'><Link className='primary-button' to='/dashboard#home-products'>{t('Browse products')}</Link><Link className='secondary-button' to='/tasks'>{t('Daily Tasks')}</Link></div></section>}
>>>>>>> d1aaf18 (Update OnlineTrade project)
    </section>
  );
}

function Team({ summary, members, loading, error, onDismissError, code, referralLink, rates, onCopyCode, onCopyLink, onShare }) {
<<<<<<< HEAD
  const safeRates = rates ?? { A: 22, B: 2, C: 1 };
=======
  const { t } = useLanguage();
  const safeRates = rates ?? { A: 10, B: 3, C: 2 };
>>>>>>> d1aaf18 (Update OnlineTrade project)
  const safeMembers = Array.isArray(members) ? members : [];
  const levelCards = [
    { name: 'Level A', rate: safeRates.A ?? 10, value: summary?.aLevel },
    { name: 'Level B', rate: safeRates.B ?? 3, value: summary?.bLevel },
    { name: 'Level C', rate: safeRates.C ?? 2, value: summary?.cLevel },
  ];

  const totalMembers = summary?.total?.userCount ?? 0;
  const activeMembers = summary?.total?.activeUserCount ?? 0;
  const totalEarnings = summary?.total?.totalEarnings ?? '0.00';

  const shareFallback = async () => {
    if (navigator.share && referralLink) {
      try {
        await navigator.share({ title: 'Online Trade Referral', text: `Join me on Online Trade: ${referralLink}`, url: referralLink });
        return;
      } catch {
        // The user cancelled the share sheet; fall through to copy fallback.
      }
    }
    await navigator.clipboard?.writeText(referralLink ?? '').catch(() => undefined);
  };
  const whatsappShareUrl = referralLink ? `https://wa.me/?text=${encodeURIComponent(`Join me on Online Trade: ${referralLink}`)}` : '';

  return (
    <>
      <div className='section-lead'>
        <div>
          <p className='eyebrow'>{t('YOUR NETWORK')}</p>
          <h2>{t('Share & Earn')}</h2>
        </div>
<<<<<<< HEAD
        {loading && <p className='quiet-label' role='status'>Loading referral details…</p>}
=======
        {loading && <p className='quiet-label' role='status'>{t('Loading referral details…')}</p>}
>>>>>>> d1aaf18 (Update OnlineTrade project)
        {error && <ErrorToast message={error} onDismiss={onDismissError} />}
      </div>

      <section className='surface form-surface referral-share-box'>
        <div className='referral-share-header'>
          <div>
            <p className='eyebrow'>{t('YOUR REFERRAL CODE')}</p>
            <h3>{code ?? 'Loading…'}</h3>
          </div>
          <button className='secondary-button' onClick={onCopyCode}><Copy size={15} /> {t('Copy code')}</button>
        </div>

        <div className='referral-link-block'>
          <label className='field'><span>{t('Referral Link')}</span><input type='text' value={referralLink ?? ''} readOnly /></label>
        </div>

        <div className='button-row'>
          <button type='button' className='secondary-button' onClick={onCopyLink}>{t('Copy link')}</button>
          {whatsappShareUrl && <a className='secondary-button' href={whatsappShareUrl} target='_blank' rel='noreferrer'>WhatsApp</a>}
          <button type='button' className='primary-button' onClick={onShare ?? shareFallback}>{t('Share')}</button>
        </div>
      </section>

      <div className='level-grid'>
        <Metric label={t('Total Referrals')} value={totalMembers} note={t('TEAM MEMBERS')} />
        <Metric label={t('Active Referrals')} value={activeMembers} tone={activeMembers > 0 ? 'positive' : ''} note={t('RECHARGED')} />
        <Metric label={t('Total Earnings')} value={money(totalEarnings)} tone='positive' note={t('COMMISSION')} />
      </div>

      <div className='level-grid'>
        {levelCards.map(({ name, rate, value }) => (
          <Metric key={name} label={`${t(name)} · ${rate}%`} value={`${value?.userCount ?? 0} / ${value?.activeUserCount ?? 0}`} note={t('TOTAL / ACTIVE')} />
        ))}
      </div>

      <section className='surface table-surface'>
        <div className='surface-heading'>
          <div>
            <p className='eyebrow'>{t('MEMBERS')}</p>
            <h3>{t('Referral history')}</h3>
          </div>
          <span className='quiet-label'>{t('LEVELS A–C')}</span>
        </div>
        {safeMembers.length ? (
          <div className='table-wrap'>
            <table>
              <thead>
                <tr><th>{t('Member')}</th><th>{t('Level')}</th><th>{t('Status')}</th><th>{t('Approved recharge')}</th><th>{t('Joined')}</th></tr>
              </thead>
              <tbody>
                {safeMembers.map((member) => (
                  <tr key={member.id}>
                    <td><strong>{member.fullName}</strong><small>{member.phoneNumber}</small></td>
                    <td><span className={`level-tag level-${(member.level ?? '').toLowerCase()}`}>{member.level}</span></td>
                    <td>{Number(member.approvedRechargeTotal ?? 0) > 0 ? <span className='status-active'>{t('Active')}</span> : <span className='status-inactive'>{t('Inactive')}</span>}</td>
                    <td>{money(member.approvedRechargeTotal)}</td>
                    <td>{member.registeredAt ? new Date(member.registeredAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty>{t('Your team members will appear here.')}</Empty>}
      </section>
    </>
  );
}

function RechargeProgress({ step }) {
  const { t } = useLanguage();
  const steps = ['Amount', 'Bank', 'Transfer'];
  return (
    <div className='recharge-progress' aria-label={`${t('Step')} ${step} ${t('of')} 3: ${t(steps[step - 1])}`}>
      {steps.map((label, index) => {
        const number = index + 1;
        return (
          <div key={label} className={`recharge-progress-step ${number === step ? 'active' : ''} ${number < step ? 'complete' : ''}`}>
            <span>{number < step ? '✓' : number}</span>
            <small>{t(label)}</small>
          </div>
        );
      })}
    </div>
  );
}

function Recharge({ settings }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const incomingAmount = location.state?.amount ?? new URLSearchParams(location.search).get('amount');
  const presetAmounts = [300, 600, 1000, 1800, 3000, 8000, 20000, 50000];
  const initialAmount = String(incomingAmount ?? '3000');
  const [customAmount, setCustomAmount] = useState(presetAmounts.includes(Number(initialAmount)) ? '' : initialAmount);
  const [selectedPreset, setSelectedPreset] = useState(presetAmounts.includes(Number(initialAmount)) ? initialAmount : '');
  const [localError, setLocalError] = useState('');
  const minimumRechargeAmount = Number(settings?.minimumRechargeAmount ?? 300);
  const maximumRechargeAmount = Number(settings?.maximumRechargeAmount ?? 1000000);
  const selectedAmount = Number(customAmount || selectedPreset || 0);

  const continueToBanks = (event) => {
    event.preventDefault();
    if (!selectedAmount || selectedAmount < minimumRechargeAmount) {
      setLocalError(`${t('Minimum recharge amount is')} ${minimumRechargeAmount.toLocaleString()} ETB.`);
      return;
    }
    if (selectedAmount > maximumRechargeAmount) {
      setLocalError(`${t('Maximum recharge amount is')} ${maximumRechargeAmount.toLocaleString()} ETB.`);
      return;
    }
    setLocalError('');
    navigate(`/recharge/bank?amount=${encodeURIComponent(selectedAmount)}`, { state: { amount: selectedAmount } });
  };

  return (
    <div className='recharge-page'>
<<<<<<< HEAD
      <div className='section-lead'>
        <div>
          <p className='eyebrow'>ADD FUNDS</p>
          <h2>Recharge Wallet</h2>
=======
      <section className='surface recharge-mobile-screen'>
        <div className='recharge-screen-header'>
          <button className='recharge-screen-back' type='button' onClick={() => navigate('/my')} aria-label={t('Back to My page')}><ChevronLeft size={20} /></button>
          <div><p className='eyebrow'>{t('ADD FUNDS')}</p><h2>{t('Recharge Wallet')}</h2></div>
          <Link className='recharge-history-shortcut' to='/recharge/history'>{t('History')}</Link>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
        <RechargeProgress step={1} />
        <form className='form-stack recharge-main-card' onSubmit={continueToBanks}>
          <div className='surface-heading'>
            <div>
              <h3>{t('Select Amount')}</h3>
            </div>
            <span className='quiet-label'>MIN: {minimumRechargeAmount} ETB</span>
          </div>

          <p className='form-subtitle'>{t('Choose an amount to add to your wallet.')}</p>
          <div className='preset-amount-grid'>
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                type='button'
                className={`preset-button ${selectedPreset === String(amount) && !customAmount ? 'active' : ''}`}
                onClick={() => { setSelectedPreset(String(amount)); setCustomAmount(''); setLocalError(''); }}
              >
                <strong>{amount.toLocaleString()} ETB</strong>
                <small>{amount >= 8000 ? t('VIP Tier') : t('Standard')}</small>
              </button>
            ))}
          </div>

          <label className='field'>
            <span>{t('Or enter custom amount (ETB)')}</span>
            <input
              type='number'
              min={minimumRechargeAmount}
              max={maximumRechargeAmount}
              step='0.01'
              value={customAmount}
              onChange={(event) => { setCustomAmount(event.target.value); setSelectedPreset(''); setLocalError(''); }}
              placeholder={`${t('Enter amount (minimum')} ${minimumRechargeAmount.toLocaleString()} ETB)`}
            />
          </label>

<<<<<<< HEAD
          <div className='selected-summary-bar'>
            <span>Recharge Amount:</span>
            <strong>{selectedAmount ? `${selectedAmount.toLocaleString()} ETB` : '0.00 ETB'}</strong>
          </div>

          <div className='surface-heading recharge-payment-step'>
            <div>
              <p className='eyebrow'>STEP 2</p>
              <h3>Payment Method</h3>
=======
          <div className='order-amount-banner'>
            <span className='order-amount-label'>{t('Deposit amount')}</span>
            <div className='order-amount-value'>
              ETB {selectedAmount ? Number(selectedAmount).toFixed(2) : '0.00'}
>>>>>>> d1aaf18 (Update OnlineTrade project)
            </div>
          </div>

          {localError && <ErrorToast message={localError} onDismiss={() => setLocalError('')} />}
          <button className='primary-button recharge-next-button' type='submit'>
            {t('Continue to payment')} <ChevronRight size={19} />
          </button>
        </form>
      </section>
    </div>
  );
}

function RechargeBankSelectionPage({ methods }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const amount = Number(location.state?.amount ?? params.get('amount'));
  const selectedMethodId = params.get('methodId');
  const activeMethods = [...methods]
    .filter((method) => method.isActive !== false)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  if (!amount) return <Navigate to='/recharge' replace />;

  return (
    <div className='recharge-page'>
      <section className='surface recharge-mobile-screen'>
        <div className='recharge-screen-header'>
          <button className='recharge-screen-back' type='button' onClick={() => navigate(`/recharge?amount=${encodeURIComponent(amount)}`, { state: { amount } })} aria-label={t('Back to amount selection')}><ChevronLeft size={20} /></button>
          <div><p className='eyebrow'>{t('ADD FUNDS')}</p><h2>{t('Payment method')}</h2></div>
          <span className='recharge-step-placeholder' aria-hidden='true' />
        </div>
        <RechargeProgress step={2} />
        <div className='recharge-step-content'>
          <div className='recharge-selected-amount'>
            <span>{t('Deposit amount')}</span><strong>{money(amount)}</strong>
          </div>
<<<<<<< HEAD

          {localError && <ErrorToast message={localError} onDismiss={() => setLocalError('')} />}

          <div className='button-row recharge-continue-row'>
            <button className='primary-button large-btn' type='button' disabled={busy || !selectedAmount} onClick={continueToPayment}>
              Continue to Payment Details <span>→</span>
            </button>
          </div>
        </div>

        <section className='surface history-surface recharge-recent-history'>
          <div className='surface-heading'>
            <div>
              <p className='eyebrow'>RECENT</p>
              <h3>Recent recharges</h3>
            </div>
          </div>
          <History rows={history} />
        </section>
      </div>
=======
          <div>
            <h3 className='choose-payment-title'>{t('Choose your bank or wallet')}</h3>
            {activeMethods.length ? (
              <div className='payment-method-list'>
                {activeMethods.map((method) => (
                  <button
                    type='button'
                    key={method.id}
                    className={`payment-method-row recharge-method-row ${selectedMethodId === method.id ? 'selected' : ''}`}
                    aria-pressed={selectedMethodId === method.id}
                    onClick={() => navigate(`/recharge/payment?amount=${encodeURIComponent(amount)}&methodId=${encodeURIComponent(method.id)}`, { state: { amount, paymentMethodId: method.id } })}
                  >
                    <div className='payment-method-row-main'><BankLogo name={method.name} className='payment-bank-logo' /><span className='payment-bank-name'>{method.name}</span></div>
                    <ChevronRight size={20} className='payment-method-chevron' />
                  </button>
                ))}
              </div>
            ) : <Empty>{t('No payment methods are available.')}</Empty>}
          </div>
          <div className='friendly-reminder-box'>
            <div className='friendly-reminder-icon'><CircleAlert size={20} /></div>
            <div className='friendly-reminder-content'>{t('Choose the bank or wallet you will use to make the transfer.')}</div>
          </div>
        </div>
      </section>
>>>>>>> d1aaf18 (Update OnlineTrade project)
    </div>
  );
}

function RechargePaymentPage({ methods, settings, onCustomerSuccess }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedMethodId = location.state?.paymentMethodId ?? params.get('methodId') ?? methods[0]?.id ?? '';
  const amount = Number(location.state?.amount ?? params.get('amount') ?? 3000);
  const [selected, setSelected] = useState(methods.find((method) => method.id === selectedMethodId) ?? methods[0] ?? null);
  const [copiedField, setCopiedField] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  useEffect(() => {
    setSelected(methods.find((method) => method.id === selectedMethodId) ?? methods[0] ?? null);
  }, [methods, selectedMethodId]);

  if (!selected) return <Empty>{t('No payment methods are available.')} <Link to='/recharge'>{t('Back to recharge')}</Link></Empty>;

  const isTelebirr = /telebirr/i.test(selected.name ?? '');
  const accountValue = isTelebirr
    ? (selected.phoneNumber ?? selected.accountNumber ?? '0929688828')
    : (selected.accountNumber ?? selected.phoneNumber ?? '');
  const accountName = selected.accountName || (isTelebirr ? 'Markos' : 'Tesema');
  const copyLabel = isTelebirr ? t('Copy Phone Number') : t('Copy Account Number');

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2500);
    }).catch(() => undefined);
  };

  const handleTransactionSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const reference = String(form.get('transactionReference') ?? '').trim();
      if (reference.length < 5) {
        throw new Error(t('FT / Transaction reference must be at least 5 digits/characters.'));
      }
      form.set('amount', String(amount));
      form.set('paymentMethodId', selected.id);

      await api('/recharges', {
        method: 'POST',
        body: form,
      });

      onCustomerSuccess?.(t('Recharge submitted successfully and is pending review.'));
      navigate('/recharge/history');
    } catch (cause) {
      setFormError(cause.message || 'Unable to submit recharge request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='recharge-payment-container'>
      <section className='surface recharge-mobile-screen recharge-transfer-screen'>
        <div className='recharge-screen-header'>
          <button className='recharge-screen-back' type='button' onClick={() => navigate(`/recharge/bank?amount=${encodeURIComponent(amount)}&methodId=${encodeURIComponent(selected.id)}`, { state: { amount } })} aria-label={t('Back to payment methods')}><ChevronLeft size={20} /></button>
          <div><p className='eyebrow'>{t('ADD FUNDS')}</p><h2>{t('Transfer details')}</h2></div>
          <span className='recharge-step-placeholder' aria-hidden='true' />
        </div>
        <RechargeProgress step={3} />

      <div className='order-amount-banner'>
        <span className='order-amount-label'>{t('Order Amount')}</span>
        <div className='order-amount-value'>
          ETB {amount ? Number(amount).toFixed(2) : '3000.00'}
        </div>
      </div>

      <div className='selected-payment-channel'>
        <BankLogo name={selected.name} className='selected-payment-channel-logo' />
        <div className='selected-payment-channel-name'><small>{t('PAYMENT CHANNEL')}</small><strong>{selected.name}</strong></div>
      </div>

      <div className='payment-instruction-box'>
        <div className='payment-card-header'>
          <div className='payment-header-brand-wrap'>
            <BankLogo name={selected.name} className='payment-header-logo recharge-payment-logo' />
            <div>
              <span className='provider-pill'>{selected.name}</span>
              <h3 style={{ margin: '6px 0 2px', fontSize: '20px' }}>{selected.name} {t('Deposit Account')}</h3>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: '12px' }}>
                {t('Please make the bank/wallet transfer using the details below, then enter your transaction reference.')}
              </p>
            </div>
          </div>
          <div className='amount-highlight-badge'>
            <small>{t('AMOUNT TO TRANSFER')}</small>
            <strong>{amount ? `ETB ${Number(amount).toFixed(2)}` : '—'}</strong>
          </div>
        </div>

        <div className='payment-credentials-grid'>
          <div className='credential-item'>
            <small>{t('ACCOUNT HOLDER / BENEFICIARY')}</small>
            <div className='credential-copy-row'>
              <span className='credential-value'>{accountName}</span>
              <button
                type='button'
                className='copy-action-btn'
                onClick={() => copyToClipboard(accountName, 'accountName')}
              >
                {copiedField === 'accountName' ? `✓ ${t('Copied')}` : t('Copy Name')}
              </button>
            </div>
          </div>

          <div className='credential-item'>
            <small>{isTelebirr ? t('PHONE NUMBER') : t('ACCOUNT NUMBER')}</small>
            <div className='credential-copy-row'>
              <span className='credential-value'>{accountValue || '—'}</span>
              <button
                type='button'
                className='copy-action-btn'
                onClick={() => copyToClipboard(accountValue, 'account')}
              >
                {copiedField === 'account' ? `✓ ${t('Copied')}` : copyLabel}
              </button>
            </div>
          </div>

          <div className='credential-item'>
            <small>{t('TRANSFER AMOUNT')}</small>
            <div className='credential-copy-row'>
              <span className='credential-value'>{amount ? `ETB ${Number(amount).toFixed(2)}` : '—'}</span>
              <button
                type='button'
                className='copy-action-btn'
                onClick={() => copyToClipboard(String(amount), 'amount')}
              >
                {copiedField === 'amount' ? `✓ ${t('Copied')}` : t('Copy Amount')}
              </button>
            </div>
          </div>
        </div>

        {selected.instructions && (
          <div className='payment-note-box'>
            <strong>{t('Instructions:')}</strong> {selected.instructions}
          </div>
        )}
      </div>

<<<<<<< HEAD
=======
      <div className='friendly-reminder-box'>
        <div className='friendly-reminder-icon'>
          <CircleAlert size={20} />
        </div>
        <div className='friendly-reminder-content'>
          <strong>{t('Friendly reminder:')}</strong> {t('Please use the corresponding bank to complete the transfer. Please do not use interbank transfers from other banks to avoid delays and inconvenience. Thank you for your understanding!')}
        </div>
      </div>

>>>>>>> d1aaf18 (Update OnlineTrade project)
      <section className='surface form-surface form-stack recharge-payment-verification'>
        <div className='surface-heading'>
          <div>
            <p className='eyebrow'>{t('VERIFICATION')}</p>
            <h3>{t('Submit Transaction Information')}</h3>
          </div>
        </div>

        {formError && <ErrorToast message={formError} onDismiss={() => setFormError('')} />}

        <form className='form-stack' onSubmit={handleTransactionSubmit} encType='multipart/form-data'>
          <input type='hidden' name='amount' value={amount} />
          <input type='hidden' name='paymentMethodId' value={selected.id} />

          <label className='field'>
            <span>{t('FT / Transaction Reference * (at least 5 characters)')}</span>
            <input
              name='transactionReference'
              defaultValue='FT'
              placeholder='FT260901234'
              minLength={5}
              maxLength={120}
              required
            />
            <small>{t('FT is prefilled. Complete it with the exact reference from your SMS or receipt.')}</small>
          </label>

          <button className='secondary-button' type='button' aria-expanded={showOtherOptions} onClick={() => setShowOtherOptions((open) => !open)}>
            {showOtherOptions ? t('Hide other options') : t('Other options')}
          </button>

          {showOtherOptions && (
            <>
              <label className='field'>
                <span>{t('Sender Full Name (optional)')}</span>
                <input name='senderName' placeholder={t('Name on external bank/wallet account')} />
              </label>

              <label className='field'>
                <span>{t('Sender Account Number / Phone (optional)')}</span>
                <input name='senderAccount' placeholder={t('Your bank account or phone number used')} />
              </label>

              <label className='field'>
                <span>{t('Payment Proof Screenshot / Receipt (optional)')}</span>
                <input name='proof' type='file' accept='image/jpeg,image/png,image/webp,application/pdf' />
                <small>{t('Accepted formats: JPG, JPEG, PNG, WEBP, PDF up to 5 MB. You can also upload it later in Recharge History.')}</small>
              </label>
            </>
          )}

          <div className='button-row' style={{ marginTop: '12px' }}>
            <button className='primary-button large-btn' type='submit' disabled={submitting}>
              {submitting ? t('Submitting for review…') : t('Submit Recharge Information')} <span>↗</span>
            </button>
            <button className='secondary-button' type='button' onClick={() => navigate('/recharge')}>
              {t('Cancel')}
            </button>
          </div>
        </form>
      </section>
      </section>
    </div>
  );
}

function RechargeHistoryPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [uploadingId, setUploadingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadHistory = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api('/recharges');
      setItems(data);
    } catch (cause) {
      setLoadError(cause.message || 'Unable to load recharge history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredItems = items.filter((item) => {
    const status = String(item.status).toUpperCase();
    return statusFilter === 'ALL' || (statusFilter === 'PENDING'
      ? ['PENDING', 'UNDER_REVIEW'].includes(status)
      : status === statusFilter);
  });

  const handleUploadProof = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    setFeedback('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('proof', file);
      await api(`/recharges/${id}/proof`, {
        method: 'POST',
        body: formData,
      });
      setFeedback(t('Payment proof uploaded successfully!'));
      await loadHistory();
    } catch (cause) {
      setError(cause.message || 'Unable to upload payment proof.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <section className='surface table-surface recharge-history-page'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>{t('RECHARGE HISTORY')}</p>
          <h3>{t('Submitted recharge transactions')}</h3>
        </div>
        <Link className='secondary-button' to='/recharge'>+ {t('New Recharge')}</Link>
      </div>

      {feedback && <SuccessToast message={feedback} onDismiss={() => setFeedback('')} />}
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}

      {loadError ? (
        <div className='history-load-error' role='alert'>
          <span className='history-load-error-icon' aria-hidden='true'>!</span>
          <div>
<<<<<<< HEAD
            <strong>History could not be loaded</strong>
            <p>{loadError}</p>
          </div>
          <button className='secondary-button' type='button' onClick={loadHistory}>Try again</button>
=======
            <strong>{t('History could not be loaded')}</strong>
            <p>{loadError}</p>
          </div>
          <button className='secondary-button' type='button' onClick={loadHistory}>{t('Try again')}</button>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
      ) : loading ? (
        <div className='history-loading' role='status' aria-live='polite'>
          <span className='history-loading-spinner' aria-hidden='true' />
<<<<<<< HEAD
          <span>Loading your recharge history…</span>
        </div>
      ) : items.length ? (
        <>
          <div className='recharge-history-summary' aria-label='Recharge status summary'>
            <div className='recharge-summary-card'>
              <span>Total requests</span>
              <strong>{items.length}</strong>
              <small>All submitted recharges</small>
            </div>
            <div className='recharge-summary-card'>
              <span>Waiting for review</span>
              <strong>{items.filter((item) => ['PENDING', 'UNDER_REVIEW'].includes(String(item.status).toUpperCase())).length}</strong>
              <small>Being processed by the team</small>
            </div>
            <div className='recharge-summary-card'>
              <span>Approved</span>
              <strong>{items.filter((item) => String(item.status).toUpperCase() === 'APPROVED').length}</strong>
              <small>Added to your wallet</small>
            </div>
          </div>
          <div className='recharge-history-tools'>
            <div className='recharge-history-filters' role='group' aria-label='Filter recharge requests by status'>
              {[
                { value: 'ALL', label: 'All requests' },
                { value: 'PENDING', label: 'In review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
=======
          <span>{t('Loading your recharge history…')}</span>
        </div>
      ) : items.length ? (
        <>
          <div className='recharge-history-summary' aria-label={t('Recharge status summary')}>
            <div className='recharge-summary-card'>
              <span>{t('Total requests')}</span>
              <strong>{items.length}</strong>
              <small>{t('All submitted recharges')}</small>
            </div>
            <div className='recharge-summary-card'>
              <span>{t('Waiting for review')}</span>
              <strong>{items.filter((item) => ['PENDING', 'UNDER_REVIEW'].includes(String(item.status).toUpperCase())).length}</strong>
              <small>{t('Being processed by the team')}</small>
            </div>
            <div className='recharge-summary-card'>
              <span>{t('Approved')}</span>
              <strong>{items.filter((item) => String(item.status).toUpperCase() === 'APPROVED').length}</strong>
              <small>{t('Added to your wallet')}</small>
            </div>
          </div>
          <div className='recharge-history-tools'>
            <div className='recharge-history-filters' role='group' aria-label={t('Filter recharge requests by status')}>
              {[
                { value: 'ALL', label: t('All requests') },
                { value: 'PENDING', label: t('In review') },
                { value: 'APPROVED', label: t('Approved') },
                { value: 'REJECTED', label: t('Rejected') },
>>>>>>> d1aaf18 (Update OnlineTrade project)
              ].map((filter) => {
                const count = filter.value === 'ALL'
                  ? items.length
                  : items.filter((item) => {
                    const status = String(item.status).toUpperCase();
                    return filter.value === 'PENDING'
                      ? ['PENDING', 'UNDER_REVIEW'].includes(status)
                      : status === filter.value;
                  }).length;

                return (
                  <button
                    key={filter.value}
                    type='button'
                    className={`recharge-filter-chip${statusFilter === filter.value ? ' active' : ''}`}
                    aria-pressed={statusFilter === filter.value}
                    onClick={() => setStatusFilter(filter.value)}
                  >
                    {filter.label}<span>{count}</span>
                  </button>
                );
              })}
            </div>
            <span className='recharge-results-count'>
<<<<<<< HEAD
              {filteredItems.length} shown
=======
              {filteredItems.length} {t('shown')}
>>>>>>> d1aaf18 (Update OnlineTrade project)
            </span>
          </div>
          {filteredItems.length ? (
            <div className='table-wrap'>
              <table>
                <thead>
                  <tr>
<<<<<<< HEAD
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Proof</th>
                    <th>Date</th>
=======
                    <th>{t('Amount')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Proof')}</th>
                    <th>{t('Date')}</th>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const status = String(item.status).toUpperCase();
                    const canUploadProof = ['PENDING', 'UNDER_REVIEW'].includes(status);
                    const hasProof = Boolean(item.proofStorageKey);

                    return (
                      <tr key={item.id}>
                        <td><strong>{money(item.amount)}</strong></td>
                        <td>
                          <span className={`history-status ${status.toLowerCase().replace(/_/g, '-')}`}>
<<<<<<< HEAD
                            {status.replaceAll('_', ' ')}
=======
                            {t(status.replaceAll('_', ' '))}
>>>>>>> d1aaf18 (Update OnlineTrade project)
                          </span>
                        </td>
                        <td>
                          {hasProof ? (
<<<<<<< HEAD
                            <span className='proof-badge verified'>✓ Proof attached</span>
                          ) : (
                            <span className='proof-badge missing'>Missing proof</span>
=======
                            <span className='proof-badge verified'>✓ {t('Proof attached')}</span>
                          ) : (
                            <span className='proof-badge missing'>{t('Missing proof')}</span>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                          )}
                          {canUploadProof && (
                            <label className='inline-upload-btn'>
                              <input
                                type='file'
                                accept='image/jpeg,image/png,image/webp,application/pdf'
                                disabled={uploadingId === item.id}
                                onChange={(e) => handleUploadProof(item.id, e.target.files?.[0])}
                                style={{ display: 'none' }}
                              />
<<<<<<< HEAD
                              <span>{uploadingId === item.id ? 'Uploading…' : hasProof ? 'Change proof' : 'Upload proof'}</span>
=======
                              <span>{uploadingId === item.id ? t('Uploading…') : hasProof ? t('Change proof') : t('Upload proof')}</span>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                            </label>
                          )}
                        </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='recharge-filter-empty'>
              <span aria-hidden='true'>✓</span>
<<<<<<< HEAD
              <strong>No {statusFilter === 'PENDING' ? 'recharges in review' : statusFilter.toLowerCase() + ' recharges'} right now</strong>
              <p>Choose another filter to see more of your recharge history.</p>
              <button type='button' className='recharge-filter-reset' onClick={() => setStatusFilter('ALL')}>Show all requests</button>
            </div>
          )}
        </>
      ) : <Empty>No recharge requests submitted yet.</Empty>}
=======
              <strong>{t(statusFilter === 'PENDING' ? 'No recharges in review right now' : `No ${statusFilter.toLowerCase()} recharges right now`)}</strong>
              <p>{t('Choose another filter to see more of your recharge history.')}</p>
              <button type='button' className='recharge-filter-reset' onClick={() => setStatusFilter('ALL')}>{t('Show all requests')}</button>
            </div>
          )}
        </>
      ) : <Empty>{t('No recharge requests submitted yet.')}</Empty>}
>>>>>>> d1aaf18 (Update OnlineTrade project)
    </section>
  );
}

function Withdraw({ accounts, history, balance, settings, busy, onSubmit }) {
  const { t } = useLanguage();
  const minimum = Number(settings?.minimumWithdrawalBalance ?? 70);
  const feePercent = Number(settings?.withdrawalFee ?? 10);
  const [amountInput, setAmountInput] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.find((a) => a.isDefault)?.id ?? accounts[0]?.id ?? '');
  const requestedAmount = Number(amountInput);
  const estimatedFee = Number.isFinite(requestedAmount) && requestedAmount > 0
    ? Math.round((requestedAmount * feePercent) + Number.EPSILON) / 100
    : 0;
  const estimatedNet = Number.isFinite(requestedAmount) && requestedAmount > 0
    ? requestedAmount - estimatedFee
    : 0;

  useEffect(() => {
    if (!selectedAccountId && accounts.length) {
      setSelectedAccountId(accounts.find((a) => a.isDefault)?.id ?? accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  return (
    <>
      <div className='section-lead'>
        <div>
          <p className='eyebrow'>{t('PAYOUTS')}</p>
          <h2>{t('Withdraw funds')}</h2>
        </div>
        <span className='balance-pill'>{t('Available:')} {money(balance)}</span>
      </div>

      <div className='form-layout'>
        <div className='form-stack'>
          <form className='surface form-surface form-stack' onSubmit={onSubmit}>
            <h3>{t('Submit Withdrawal Request')}</h3>

            <div className='withdrawal-info-banner'>
              <div className='info-row'><span>{t('Withdrawal Fee:')}</span><strong>{feePercent}%</strong></div>
              <div className='info-row'><span>{t('Processing Time:')}</span><strong>{t('Within 1–8 hours')}</strong></div>
              <div className='info-row'><span>{t('Frequency Limit:')}</span><strong>{t('1 withdrawal every 24 hours')}</strong></div>
              <div className='info-row'><span>{t('Minimum Withdrawal:')}</span><strong>{money(minimum)}</strong></div>
              {requestedAmount > 0 && (
                <>
                  <div className='info-row'><span>{t('Estimated fee:')}</span><strong>{money(estimatedFee)}</strong></div>
                  <div className='info-row'><span>{t('You receive:')}</span><strong>{money(estimatedNet)}</strong></div>
                </>
              )}
            </div>

            {accounts.length ? (
              <div className='field'>
                <span>{t('Select Withdrawal Account')}</span>
                <div className='account-selection-list'>
                  {accounts.map((account) => (
                    <label key={account.id} className={`account-select-card ${selectedAccountId === account.id ? 'active' : ''}`}>
                      <input
                        type='radio'
                        name='withdrawalAccountId'
                        value={account.id}
                        checked={selectedAccountId === account.id}
                        onChange={() => setSelectedAccountId(account.id)}
                      />
                      <div className='account-card-body'>
                        <div className='account-card-header'>
                          <strong>{account.paymentProvider}</strong>
                          {account.isDefault && <span className='default-badge'>{t('DEFAULT')}</span>}
                        </div>
                        <div className='account-card-name'>{account.accountHolderName}</div>
                        <div className='account-card-number'>{account.accountNumber}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className='notice-box'>
<<<<<<< HEAD
                <p>You must add a verified withdrawal account before requesting a withdrawal.</p>
                <Link className='primary-button' to='/profile'>Set up Personal Information ↗</Link>
=======
                <p>{t('You must add a verified withdrawal account before requesting a withdrawal.')}</p>
                <Link className='primary-button' to='/profile'>{t('Set up Personal Information ↗')}</Link>
>>>>>>> d1aaf18 (Update OnlineTrade project)
              </div>
            )}

            <label className='field'>
              <span>{t('Withdrawal Amount (ETB)')}</span>
              <input
                name='amount'
                type='number'
                min={minimum}
                max={Number(balance ?? 0)}
                step='0.01'
                placeholder={`${t('Minimum')} ${minimum} ETB`}
                value={amountInput}
                onChange={(event) => setAmountInput(event.target.value)}
                required
              />
              <small>{t('The fee is deducted from your requested amount. The remaining net amount is sent to your payout account.')}</small>
            </label>

            <label className='field'>
              <span>{t('Withdrawal Password')}</span>
              <input
                name='withdrawalPassword'
                type='password'
                autoComplete='current-password'
                placeholder={t('Enter your 6+ character withdrawal password')}
                required
              />
            </label>

            <button className='primary-button large-btn' disabled={busy || !accounts.length}>
              {busy ? t('Processing withdrawal…') : t('Submit Withdrawal Request')} <span>↗</span>
            </button>
          </form>
        </div>

        <section className='surface history-surface'>
          <div className='surface-heading'>
            <div>
              <p className='eyebrow'>{t('RECENT')}</p>
              <h3>{t('Withdrawal history')}</h3>
            </div>
          </div>
          <History rows={history} />
        </section>
      </div>
    </>
  );
}

function WithdrawalAccountPage({ accounts, methods, support, busy, onSaveAccount }) {
  const { t } = useLanguage();
  const [withdrawalPasswordSet, setWithdrawalPasswordSet] = useState(true);
  const [providerId, setProviderId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [validationHint, setValidationHint] = useState('');

  useEffect(() => {
    api('/profile').then((profile) => setWithdrawalPasswordSet(Boolean(profile.withdrawalPasswordSet))).catch(() => undefined);
  }, []);

  const supportUrl = support?.customerSupportEnabled
    ? (support.customerSupportUrl || support.whatsappUrl || '/support')
    : (support?.whatsappUrl || '/support');

  const selectedProvider = methods.find((method) => method.id === providerId)?.name ?? '';
  const isTelebirr = selectedProvider === 'Telebirr';
  const accountLabel = isTelebirr ? t('Phone Number') : t('Account Number');

  useEffect(() => {
    switch (selectedProvider) {
      case 'Awash Bank':
        setValidationHint(t('Must be 14 or 15 digits (e.g. 013201013577300)'));
        break;
      case 'CBE':
        setValidationHint(t('Must be exactly 13 digits (e.g. 1000419637649)'));
        break;
      case 'Telebirr':
        setValidationHint(t('Must be exactly 10 digits (e.g. 0929688828)'));
        break;
      case 'Abyssinia Bank':
        setValidationHint(t('Must be 6 to 9 digits (e.g. 221759389)'));
        break;
      default:
        setValidationHint(t('Enter valid digits without spaces or special characters'));
    }
  }, [selectedProvider, t]);

  return (
    <section className='surface form-surface form-stack'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>{t('PAYOUT CONFIGURATION')}</p>
          <h2>{t('Withdrawal Account')}</h2>
        </div>
      </div>

      {accounts.length ? (
        <div className='saved-accounts-view'>
          <p className='form-subtitle'>
            {t('Your linked withdrawal destination is saved below. To protect your funds against unauthorized changes, withdrawal accounts are locked once added.')}
          </p>

          <div className='saved-accounts-grid'>
            {accounts.map((account) => (
              <div className='saved-account-card' key={account.id}>
                <div className='account-badge-row'>
                  <span className='provider-tag'>{account.paymentProvider}</span>
                  <span className='status-pill active'>{t('ACTIVE')}</span>
                </div>
                <div className='account-holder-name'>{account.accountHolderName}</div>
                <div className='account-number-masked'>{account.accountNumber}</div>
                <div className='account-date'>{t('Added')} {new Date(account.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          <div className='immutable-account-notice'>
            <div className='notice-icon'>🔒</div>
            <div>
              <strong>{t('Need to update or change your bank account?')}</strong>
              <p>{t('For your security, accounts cannot be edited directly from the app. Please contact official customer support with your verification details.')}</p>
              <a
                className='secondary-button'
                href={supportUrl}
                target={supportUrl.startsWith('http') ? '_blank' : undefined}
                rel='noreferrer'
              >
                {t('Contact Customer Support to Change Account ↗')}
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h3>{t('Add Withdrawal Account')}</h3>
          <p className='form-subtitle'>
            {t('Link your verified Ethiopian bank or mobile money account. One account may be registered per customer.')}
          </p>

          <form className='form-stack' onSubmit={onSaveAccount}>
            <label className='field'>
              <span>{t('Payment Provider *')}</span>
              <select name='paymentMethodId' value={providerId} onChange={(event) => setProviderId(event.target.value)} required>
                <option value='' disabled>{t('Select your bank or mobile provider')}</option>
                {methods.filter((method) => ['Awash Bank', 'CBE', 'Telebirr', 'Abyssinia Bank'].includes(method.name)).map((method) => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </label>

            <label className='field'>
              <span>{t('Account Holder Full Name *')}</span>
              <input
                name='accountHolderName'
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder={t('Full legal name as shown on bank/telebirr account')}
                autoComplete='name'
                required
              />
            </label>

            {!withdrawalPasswordSet && (
              <div className='field-grid'>
                <label className='field'>
                  <span>{t('Create Withdrawal Password * (min 6 chars)')}</span>
                  <input
                    name='newWithdrawalPassword'
                    type='password'
                    minLength={6}
                    placeholder={t('Create secure password')}
                    autoComplete='new-password'
                    required
                  />
                  <small>{t('Required to authorize future cash payouts.')}</small>
                </label>
                <label className='field'>
                  <span>{t('Confirm Withdrawal Password *')}</span>
                  <input
                    name='confirmNewWithdrawalPassword'
                    type='password'
                    minLength={6}
                    placeholder={t('Repeat withdrawal password')}
                    autoComplete='new-password'
                    required
                  />
                </label>
              </div>
            )}

            <label className='field'>
              <span>{accountLabel} *</span>
              <input
                name='accountNumber'
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                inputMode='numeric'
                placeholder={validationHint}
                pattern={selectedProvider === 'Awash Bank' ? '[0-9]{14,15}' : selectedProvider === 'CBE' ? '[0-9]{13}' : selectedProvider === 'Telebirr' ? '[0-9]{10}' : '[0-9]{6,9}'}
                required
              />
              <small className='highlight-hint'>{validationHint}</small>
            </label>

            <div className='button-row' style={{ marginTop: '12px' }}>
              <button className='primary-button large-btn' disabled={busy || !providerId}>
                {busy ? t('Saving account…') : t('Save Withdrawal Account')} <span>↗</span>
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}

function WithdrawHistoryPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  useEffect(() => { api('/withdrawals').then(setItems).catch(() => setItems([])); }, []);
  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>{t('WITHDRAWAL HISTORY')}</p>
          <h3>{t('Requested payouts')}</h3>
        </div>
      </div>
      {items.length ? (
        <div className='table-wrap'>
          <table>
            <thead>
<<<<<<< HEAD
              <tr><th>Amount</th><th>Status</th><th>Requested</th></tr>
=======
              <tr><th>{t('Amount')}</th><th>{t('Status')}</th><th>{t('Requested')}</th></tr>
>>>>>>> d1aaf18 (Update OnlineTrade project)
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{money(item.amount)}</td>
                  <td>
                    <span className={`history-status ${String(item.status).toLowerCase().replace(/_/g, '-')}`}>
<<<<<<< HEAD
                      {String(item.status).replaceAll('_', ' ')}
=======
                      {t(String(item.status).replaceAll('_', ' '))}
>>>>>>> d1aaf18 (Update OnlineTrade project)
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>{t('No withdrawals yet.')}</Empty>}
    </section>
  );
}

function TransactionsPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState({ items: [], pagination: { total: 0 } });
  const [selectedTab, setSelectedTab] = useState('DEPOSIT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api('/transactions?page=1&limit=100')
      .then((result) => {
        if (active) setItems(result);
      })
      .catch((cause) => {
        if (active) setError(cause.message || 'Unable to load transaction history.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = (items.items ?? []).filter((item) => {
    const type = String(item.type ?? '').toUpperCase();
    const referenceType = String(item.referenceType ?? '').toLowerCase();
    return selectedTab === 'DEPOSIT'
      ? type === 'DEPOSIT' || referenceType === 'recharge'
      : type === 'WITHDRAWAL' || referenceType.includes('withdraw');
  });

  const statusLabel = (status) => String(status ?? 'PENDING')
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const formatTransactionDate = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('Date unavailable');
    const day = date.toLocaleDateString('en-GB').replaceAll('/', '-');
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${day} ${time}`;
  };

  return (
    <section className='transactions-page'>
      <header className='transactions-page-header'>
        <button className='transactions-back-button' type='button' onClick={() => navigate('/my')} aria-label='Back to My page'>
          <ChevronLeft size={20} />
        </button>
        <h1>{t('Transaction History')}</h1>
        <LanguageSwitcher />
      </header>
      <div className='transactions-tabs' role='tablist' aria-label={t('Transaction type')}>
        {['DEPOSIT', 'WITHDRAW'].map((tab) => (
          <button
            key={tab}
            type='button'
            role='tab'
            aria-selected={selectedTab === tab}
            className={selectedTab === tab ? 'active' : ''}
            onClick={() => setSelectedTab(tab)}
          >
            {tab === 'DEPOSIT' ? t('Deposit') : t('Withdraw')}
          </button>
        ))}
      </div>
      <section className='transactions-activity-card'>
        <div className='transactions-activity-heading'>
          <h2>{t('ACTIVITY LOG')}</h2>
          <span>{filteredItems.length} {filteredItems.length === 1 ? t('item') : t('items')}</span>
        </div>
        {error && <div className='transactions-error' role='alert'>{error}</div>}
        {loading ? <p className='transactions-empty'>{t('Loading activity…')}</p> : filteredItems.length ? (
          <div className='transactions-activity-list'>
            {filteredItems.map((item) => (
              <article className='transactions-activity-item' key={item.id}>
                <span className={`transactions-type-icon ${selectedTab === 'DEPOSIT' ? 'deposit' : 'withdraw'}`} aria-hidden='true'>
                  {selectedTab === 'DEPOSIT' ? <ArrowUpFromLine size={18} /> : <ArrowDownToLine size={18} />}
                </span>
                <div className='transactions-item-details'>
                  <strong>{selectedTab === 'DEPOSIT' ? t('Deposit') : t('Withdraw')}</strong>
                  <time dateTime={item.createdAt}>{formatTransactionDate(item.createdAt)}</time>
                  <b className={String(item.direction).toUpperCase() === 'CREDIT' ? 'deposit-amount' : 'withdraw-amount'}>
                    {String(item.direction).toUpperCase() === 'CREDIT' ? '+' : '−'}{money(item.amount)}
                  </b>
                  <span className={`transactions-status ${String(item.status ?? '').toLowerCase().replaceAll('_', '-')}`}>
                    <i aria-hidden='true' />{statusLabel(item.status)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className='transactions-empty'>{selectedTab === 'DEPOSIT' ? t('No deposits yet.') : t('No withdrawals yet.')}</p>
        )}
      </section>
    </section>
  );
}

function NotificationsPage({ onMarkRead }) {
<<<<<<< HEAD
=======
  const { t } = useLanguage();
>>>>>>> d1aaf18 (Update OnlineTrade project)
  const [items, setItems] = useState({ items: [], pagination: { total: 0 } });
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api('/notifications?page=1&limit=25')
      .then((result) => {
        if (active) {
          setItems(result);
          setError('');
        }
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      });
    return () => {
      active = false;
    };
  }, []);

  async function markRead(id) {
    await api(`/notifications/${id}/read`, { method: 'PATCH' });
    setItems((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, isRead: true } : item),
    }));
    onMarkRead?.();
  }

  return (
    <section className='surface table-surface'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>{t('NOTIFICATIONS')}</p>
          <h3>{t('Recent messages')}</h3>
        </div>
      </div>
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      {items.items.length ? (
        <div className='history-list'>
          {items.items.map((item) => (
            <div className='history-row' key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <small>{item.message}</small>
              </div>
              <div>
                <span className={`history-status ${item.isRead ? 'completed' : 'pending'}`}>{item.isRead ? t('Read') : t('Unread')}</span>
                {!item.isRead && <button type='button' className='secondary-button small' onClick={() => markRead(item.id)}>{t('Mark read')}</button>}
              </div>
            </div>
          ))}
        </div>
      ) : <Empty>{t('You have no notifications yet.')}</Empty>}
    </section>
  );
}

function MyPage({ support = {}, dashboard, onCurrentVipChange, onSignOut }) {
<<<<<<< HEAD
=======
  const { t } = useLanguage();
>>>>>>> d1aaf18 (Update OnlineTrade project)
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api('/purchases')
      .then((items) => {
        if (active) {
          const currentPurchase = items.find((purchase) => purchase.status === 'ACTIVE') ?? null;
          onCurrentVipChange({ loading: false, purchase: currentPurchase });
        }
      })
      .catch((cause) => {
        if (active) {
<<<<<<< HEAD
          setError(cause.message || 'Unable to load your current VIP level.');
=======
          setError(t(cause.message || 'Unable to load your current VIP level.'));
>>>>>>> d1aaf18 (Update OnlineTrade project)
          onCurrentVipChange({ loading: false, purchase: null });
        }
      });
    return () => {
      active = false;
    };
  }, [onCurrentVipChange]);

  const supportDestination = support.customerSupportEnabled && support.customerSupportUrl
    ? support.customerSupportUrl
    : '/support';
  const activityDestinations = [
<<<<<<< HEAD
    { to: '/profile', label: 'Personal Information', icon: UserCircle },
    { to: '/transactions', label: 'Transactions', icon: Wallet },
    { to: '/recharge/history', label: 'Recharge History', icon: FileText },
    { to: '/rewards', label: 'Rewards', icon: Gift },
    { to: '/tasks', label: 'Daily Tasks', icon: CheckCircle2 },
=======
    { to: '/profile', label: t('Personal Information'), icon: UserCircle },
    { to: '/transactions', label: t('Transactions'), icon: Wallet },
    { to: '/recharge/history', label: t('Recharge History'), icon: FileText },
    { to: '/rewards', label: t('Rewards'), icon: Gift },
    { to: '/tasks', label: t('Daily Tasks'), icon: CheckCircle2 },
>>>>>>> d1aaf18 (Update OnlineTrade project)
  ];
  const resourceDestinations = [
    { to: supportDestination, label: support.customerSupportLabel || 'Customer Support', icon: ShieldCheck, external: Boolean(support.customerSupportEnabled && support.customerSupportUrl) },
    { to: support.officialGroupEnabled ? (support.officialGroupUrl || '/support') : '/support', label: support.officialGroupLabel || 'Official Group', icon: Users, external: Boolean(support.officialGroupEnabled && support.officialGroupUrl) },
<<<<<<< HEAD
    { to: support.appDownloadUrl?.startsWith('http') ? support.appDownloadUrl : '/download', label: 'Download App', icon: ArrowDownToLine, external: Boolean(support.appDownloadUrl?.startsWith('http')) },
=======
    { to: support.appDownloadUrl?.startsWith('http') ? support.appDownloadUrl : '/download', label: t('Download App'), icon: ArrowDownToLine, external: Boolean(support.appDownloadUrl?.startsWith('http')) },
>>>>>>> d1aaf18 (Update OnlineTrade project)
  ];

  const renderDestinationLinks = (destinations) => destinations.map(({ to, label, icon: Icon, external }) => {
    const content = (
      <>
        <span className='my-page-link-icon'><Icon size={19} strokeWidth={1.8} /></span>
        <span>{label}</span>
        <span className='my-page-arrow' aria-hidden='true'>↗</span>
      </>
    );
    return external ? (
      <a key={label} className='my-page-link' href={to} target='_blank' rel='noreferrer'>{content}</a>
    ) : (
      <Link key={label} className='my-page-link' to={to}>{content}</Link>
    );
  });

  return (
    <section className='my-page'>
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      <section className='my-wallet-actions' aria-label='Wallet balance and actions'>
        <div className='my-wallet-balance'>
<<<<<<< HEAD
          <span>Available balance</span>
          <strong>{money(dashboard?.wallet?.availableBalance)}</strong>
        </div>
        <div className='my-wallet-action-buttons'>
          <Link className='secondary-button' to='/withdraw'>Withdraw</Link>
          <Link className='primary-button' to='/recharge'>Recharge</Link>
=======
          <span>{t('Available balance')}</span>
          <strong>{money(dashboard?.wallet?.availableBalance)}</strong>
        </div>
        <div className='my-wallet-action-buttons'>
          <Link className='secondary-button' to='/withdraw'>{t('Withdraw')}</Link>
          <Link className='primary-button' to='/recharge'>{t('Recharge')}</Link>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
      </section>
      <section className='my-page-link-group' aria-label='Account activity'>
        <div className='my-page-group-heading'>
<<<<<<< HEAD
          <h3>Account activity</h3>
          <p>Manage your details, wallet activity, and member benefits.</p>
=======
          <h3>{t('Account activity')}</h3>
          <p>{t('Manage your details, wallet activity, and member benefits.')}</p>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
        <div className='my-page-links'>{renderDestinationLinks(activityDestinations)}</div>
      </section>
      <section className='my-page-link-group' aria-label='Help and resources'>
        <div className='my-page-group-heading'>
<<<<<<< HEAD
          <h3>Help &amp; resources</h3>
          <p>Get support and access MKM resources.</p>
=======
          <h3>{t('Help & resources')}</h3>
          <p>{t('Get support and access Online Trade resources.')}</p>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
        <div className='my-page-links'>{renderDestinationLinks(resourceDestinations)}</div>
      </section>
      <button className='my-page-logout-button' type='button' onClick={onSignOut}>
<<<<<<< HEAD
        <LogOut size={17} /> Log out
=======
        <LogOut size={17} /> {t('Log out')}
>>>>>>> d1aaf18 (Update OnlineTrade project)
      </button>
    </section>
  );
}

function ProfilePage({ methods = [], support = {}, busy = false, onSaveAccount }) {
<<<<<<< HEAD
=======
  const { t } = useLanguage();
>>>>>>> d1aaf18 (Update OnlineTrade project)
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [fullName, setFullName] = useState('');
  const [saveBusy, setSaveBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    Promise.all([api('/profile'), api('/withdrawal-accounts')]).then(([result, savedAccounts]) => {
      setProfile(result);
      setFullName(result.fullName ?? '');
      setAccounts(savedAccounts);
    }).catch(() => {
      setProfile(null);
      setAccounts([]);
    });
  }, []);

  async function saveProfile(event) {
    event.preventDefault();
    setSaveBusy(true);
    setError('');
    setNotice('');

    try {
      const trimmed = fullName.trim();
      if (trimmed.length < 2) {
        throw new Error(t('Full name must be at least 2 characters long.'));
      }

      const updated = await api('/profile', {
        method: 'PATCH',
        ...jsonBody({ fullName: trimmed }),
      });
      setProfile(updated);
      setFullName(updated.fullName ?? '');
      setNotice(t('Profile updated successfully.'));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSaveBusy(false);
    }
  }

  return (
    <section className='surface form-surface form-stack'>
<<<<<<< HEAD
      <p className='eyebrow'>PERSONAL INFORMATION</p>
      <h2>Account details</h2>
=======
      <p className='eyebrow'>{t('PERSONAL INFORMATION')}</p>
      <h2>{t('Account details')}</h2>
>>>>>>> d1aaf18 (Update OnlineTrade project)
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      {notice && <SuccessToast message={notice} onDismiss={() => setNotice('')} />}
      {profile ? (
        <>
          <form className='form-stack' onSubmit={saveProfile}>
            <div className='profile-form-grid'>
              <label className='field'>
                <span>{t('Full Name')}</span>
                <input type='text' value={fullName} onChange={(event) => setFullName(event.target.value)} required />
              </label>
              <label className='field'>
                <span>{t('Phone')}</span>
                <input type='tel' value={profile.phoneNumber ?? ''} disabled />
              </label>
            </div>
            <div className='profile-form-grid'>
              <label className='field'>
                <span>{t('Referral Code')}</span>
                <input type='text' value={profile.referralCode ?? ''} disabled />
              </label>
              <label className='field'>
                <span>{t('Referral Link')}</span>
                <input type='text' value={profile.referralLink ?? (profile.referralCode ? `${window.location.origin}/register?ref=${profile.referralCode}` : '')} disabled />
              </label>
            </div>
            <div className='profile-form-grid'>
              <label className='field'>
                <span>{t('Sponsor / Referrer')}</span>
                <input type='text' value={t(profile.sponsorName ?? 'Not available')} disabled />
              </label>
              <label className='field'>
                <span>{t('Account Status')}</span>
                <input type='text' value={t(profile.status ?? 'ACTIVE')} disabled />
              </label>
            </div>
            <div className='profile-form-grid'>
              <label className='field'>
                <span>{t('Registration Date')}</span>
                <input type='text' value={profile.registeredAt ? new Date(profile.registeredAt).toLocaleDateString() : '—'} disabled />
              </label>
              <div className='field'>
<<<<<<< HEAD
                <span>Profile Actions</span>
                <button className='primary-button' type='submit' disabled={saveBusy}>{saveBusy ? 'Saving…' : 'Save changes'}<span>↗</span></button>
=======
                <span>{t('Profile Actions')}</span>
                <button className='primary-button' type='submit' disabled={saveBusy}>{saveBusy ? t('Saving…') : t('Save changes')}<span>↗</span></button>
>>>>>>> d1aaf18 (Update OnlineTrade project)
              </div>
            </div>
          </form>

          <WithdrawalAccountPage accounts={accounts} methods={methods} support={support} busy={busy} onSaveAccount={onSaveAccount} />
        </>
      ) : <Empty>{t('Profile information is unavailable.')}</Empty>}
    </section>
  );
}

<<<<<<< HEAD
function formatUnlockTime(eligibleAt) {
  if (!eligibleAt) return 'Upcoming';
  const diffMs = new Date(eligibleAt) - new Date();
  if (diffMs <= 0) return 'Ready';
=======
function formatUnlockTime(eligibleAt, t) {
  if (!eligibleAt) return t('Upcoming');
  const diffMs = new Date(eligibleAt) - new Date();
  if (diffMs <= 0) return t('Ready');
>>>>>>> d1aaf18 (Update OnlineTrade project)
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
<<<<<<< HEAD
    return `In ${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `In ${hours}h ${minutes}m`;
  }
  return `In ${minutes}m`;
}

function TasksPage({ onRefreshDashboard }) {
=======
    return `${days}${t('d')} ${hours % 24}${t('h')}`;
  }
  if (hours > 0) {
    return `${hours}${t('h')} ${minutes}${t('m')}`;
  }
  return `${minutes}${t('m')}`;
}

function TasksPage({ onRefreshDashboard }) {
  const { t, language } = useLanguage();
>>>>>>> d1aaf18 (Update OnlineTrade project)
  const [tasks, setTasks] = useState({ items: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('asc');

  const refresh = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setPageError('');
    try {
      const result = await api('/tasks');
      setTasks(result);
      if (result.autoCredited) {
        await onRefreshDashboard?.();
      }
    } catch (cause) {
      setPageError(cause.message || 'Failed to load daily tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh(true);
    const interval = window.setInterval(() => refresh(), 60000);
    return () => window.clearInterval(interval);
  }, []);

  // Group tasks by purchased product / purchase so each VIP displays its 30 days individually
  const productGroups = useMemo(() => {
    const map = new Map();
    for (const item of (tasks.items || [])) {
      const key = item.productPurchaseId || item.productName || 'vip';
      if (!map.has(key)) {
        map.set(key, {
          key,
          purchaseId: item.productPurchaseId,
          productName: item.productName || 'VIP Product',
          items: [],
        });
      }
      map.get(key).items.push(item);
    }
    const list = Array.from(map.values());
    for (const group of list) {
      group.items.sort((a, b) => {
        const tA = new Date(a.businessDate).getTime();
        const tB = new Date(b.businessDate).getTime();
        return sortOrder === 'asc' ? tA - tB : tB - tA;
      });
      group.completedCount = group.items.filter((it) => it.status === 'COMPLETED').length;
      group.totalDays = group.items.length;
      group.dailyEarnings = group.items[0]?.calculatedAmount ?? '0.00';
    }
    return list;
  }, [tasks.items, sortOrder]);

  const activeGroups = selectedProduct === 'ALL'
    ? productGroups
    : productGroups.filter((g) => g.productName === selectedProduct || g.key === selectedProduct);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <section className='surface table-surface'>
        <div className='surface-heading'>
          <div>
<<<<<<< HEAD
            <p className='eyebrow'>DAILY TASKS</p>
            <h3>VIP Activity Progress</h3>
=======
            <p className='eyebrow'>{t('DAILY TASKS')}</p>
            <h3>{t('VIP Activity Progress')}</h3>
>>>>>>> d1aaf18 (Update OnlineTrade project)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {tasks.summary?.completedCount > 0 && (
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
<<<<<<< HEAD
                ✓ {tasks.summary.completedCount} completed of {tasks.items?.length || tasks.summary.totalTasks} total
=======
                ✓ {tasks.summary.completedCount} {t('completed of')} {tasks.items?.length || tasks.summary.totalTasks} {t('total')}
>>>>>>> d1aaf18 (Update OnlineTrade project)
              </p>
            )}
            <button
              type='button'
              className='secondary-button'
              style={{ padding: '5px 12px', fontSize: '0.75rem', fontWeight: 700 }}
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
<<<<<<< HEAD
              title='Toggle chronological sort order'
            >
              {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
=======
              title={t('Toggle chronological sort order')}
            >
              {sortOrder === 'asc' ? t('Oldest first') : t('Newest first')}
>>>>>>> d1aaf18 (Update OnlineTrade project)
            </button>
          </div>
        </div>

        {productGroups.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '4px 0 0' }}>
            <button
              type='button'
              className={selectedProduct === 'ALL' ? 'primary-button' : 'secondary-button'}
              style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
              onClick={() => setSelectedProduct('ALL')}
            >
<<<<<<< HEAD
              All VIPs ({productGroups.length})
=======
              {t('All VIPs')} ({productGroups.length})
>>>>>>> d1aaf18 (Update OnlineTrade project)
            </button>
            {productGroups.map((group) => (
              <button
                key={group.key}
                type='button'
                className={selectedProduct === group.key || selectedProduct === group.productName ? 'primary-button' : 'secondary-button'}
                style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}
                onClick={() => setSelectedProduct(group.key)}
              >
<<<<<<< HEAD
                {group.productName} ({group.totalDays} Days)
=======
                {group.productName} ({group.totalDays} {t('Days')})
>>>>>>> d1aaf18 (Update OnlineTrade project)
              </button>
            ))}
          </div>
        )}

        {pageError && <ErrorToast message={pageError} onDismiss={() => setPageError('')} />}
      </section>

      {loading ? (
<<<<<<< HEAD
        <section className='surface table-surface'><p className='empty-state' role='status'>Loading tasks…</p></section>
=======
        <section className='surface table-surface'><p className='empty-state' role='status'>{t('Loading tasks…')}</p></section>
>>>>>>> d1aaf18 (Update OnlineTrade project)
      ) : activeGroups.length ? (
        activeGroups.map((group) => (
          <section key={group.key} className='surface table-surface'>
            <div className='surface-heading' style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
<<<<<<< HEAD
                <p className='eyebrow' style={{ color: '#059669', fontWeight: 700 }}>INDIVIDUAL VIP PLAN</p>
                <h3 style={{ margin: 0 }}>{group.productName} — 30 Days Tasks</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                  Daily Reward: {money(group.dailyEarnings)}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>
                  {group.completedCount} of {group.totalDays} credited
=======
                <p className='eyebrow' style={{ color: '#059669', fontWeight: 700 }}>{t('INDIVIDUAL VIP PLAN')}</p>
                <h3 style={{ margin: 0 }}>{group.productName} — 30 {t('Days Tasks')}</h3>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                  {t('Daily Reward:')} {money(group.dailyEarnings)}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>
                  {group.completedCount} {t('of')} {group.totalDays} {t('credited')}
>>>>>>> d1aaf18 (Update OnlineTrade project)
                </p>
              </div>
            </div>

            <div className='table-wrap'>
              <table>
                <thead>
                  <tr>
<<<<<<< HEAD
                    <th>Business date</th>
                    <th>Daily earnings</th>
                    <th>Wallet credit</th>
=======
                    <th>{t('Business date')}</th>
                    <th>{t('Daily earnings')}</th>
                    <th>{t('Wallet credit')}</th>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => {
                    const eligible = item.eligibleAt ? new Date(item.eligibleAt) <= new Date() : false;
                    return (
                      <tr key={item.id}>
<<<<<<< HEAD
                        <td><strong>{new Date(item.businessDate).toLocaleDateString()}</strong></td>
                        <td><strong>{money(item.calculatedAmount)}</strong></td>
                        <td>
                          {item.status === 'COMPLETED' ? (
                            <strong style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>✓ Added to wallet</strong>
                          ) : item.status === 'WAITING' ? (
                            <strong
                              style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              title={`Unlocks at ${new Date(item.eligibleAt).toLocaleString()}`}
                            >
                              {eligible ? 'Automatic credit processing' : `Available in ${formatUnlockTime(item.eligibleAt)}`}
                            </strong>
                          ) : item.status === 'NOT_ELIGIBLE' ? (
                            <strong style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af' }}>Expired</strong>
=======
                        <td><strong>{new Date(item.businessDate).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-GB')}</strong></td>
                        <td><strong>{money(item.calculatedAmount)}</strong></td>
                        <td>
                          {item.status === 'COMPLETED' ? (
                            <strong style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>✓ {t('Added to wallet')}</strong>
                          ) : item.status === 'WAITING' ? (
                            <strong
                              style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              title={`${t('Unlocks at')} ${new Date(item.eligibleAt).toLocaleString(language === 'am' ? 'am-ET' : 'en-GB')}`}
                            >
                              {eligible ? t('Automatic credit processing') : `${t('Available in')} ${formatUnlockTime(item.eligibleAt, t)}`}
                            </strong>
                          ) : item.status === 'NOT_ELIGIBLE' ? (
                            <strong style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9ca3af' }}>{t('Expired')}</strong>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      ) : (
<<<<<<< HEAD
        <section className='surface table-surface'><Empty>No daily tasks yet.</Empty></section>
=======
        <section className='surface table-surface'><Empty>{t('No daily tasks yet.')}</Empty></section>
>>>>>>> d1aaf18 (Update OnlineTrade project)
      )}
    </div>
  );
}

function RewardsPage({ onCustomerSuccess }) {
  const { t } = useLanguage();
  const [rewards, setRewards] = useState({ items: [], summary: {} });
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setError('');
    setLoading(true);
    try {
      setRewards(await api('/rewards'));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refresh(); }, []);
  const claim = async (reward) => {
    setBusyId(reward.id);
    setError('');
    try {
      await api(`/rewards/${reward.id}/claim`, { method: 'POST', ...jsonBody({}) });
      await refresh();
      onCustomerSuccess?.(t('Reward claim submitted. It is waiting for admin approval.'));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <section className='surface customer-rewards'>
      <div className='surface-heading'>
        <div>
<<<<<<< HEAD
          <p className='eyebrow'>REWARDS</p>
          <h3>Friends' recharge rewards</h3>
=======
          <p className='eyebrow'>{t('REWARDS')}</p>
          <h3>{t("Friends' recharge rewards")}</h3>
>>>>>>> d1aaf18 (Update OnlineTrade project)
        </div>
      </div>
      {error && <ErrorToast message={error} onDismiss={() => setError('')} />}
      <div className='metric-grid customer-reward-summary'>
<<<<<<< HEAD
        <Metric label="Friends' approved recharges" value={money(rewards.qualifyingRechargeAmount ?? rewards.items?.[0]?.qualifyingRechargeAmount ?? 0)} />
        <Metric label='Available to claim' value={money(rewards.summary?.totalClaimable ?? 0)} />
        <Metric label='Waiting for approval' value={money(rewards.summary?.totalPending ?? 0)} />
        <Metric label='Paid / approved' value={money(rewards.summary?.totalCompleted ?? 0)} />
      </div>
      {loading ? <p className='empty-state' role='status'>Loading rewards…</p> : rewards.items?.length ? (
=======
        <Metric label={t("Friends' approved recharges")} value={money(rewards.qualifyingRechargeAmount ?? rewards.items?.[0]?.qualifyingRechargeAmount ?? 0)} />
        <Metric label={t('Available to claim')} value={money(rewards.summary?.totalClaimable ?? 0)} />
        <Metric label={t('Waiting for approval')} value={money(rewards.summary?.totalPending ?? 0)} />
        <Metric label={t('Paid / approved')} value={money(rewards.summary?.totalCompleted ?? 0)} />
      </div>
      {loading ? <p className='empty-state' role='status'>{t('Loading rewards…')}</p> : rewards.items?.length ? (
>>>>>>> d1aaf18 (Update OnlineTrade project)
        <div className='customer-reward-grid'>
          {rewards.items.map((item) => {
            const progress = item.ruleType === 'MILESTONE' && Number(item.thresholdAmount) > 0
              ? Math.min(100, (Number(item.qualifyingRechargeAmount) / Number(item.thresholdAmount)) * 100)
              : 0;
            return (
              <article className='customer-reward-card' key={item.id}>
                <div className='customer-reward-card-heading'>
<<<<<<< HEAD
                  <div><p className='eyebrow'>{item.ruleType === 'MILESTONE' ? 'FRIENDS’ RECHARGE REWARD' : item.ruleType}</p><h4>{item.name}</h4></div>
=======
                  <div><p className='eyebrow'>{item.ruleType === 'MILESTONE' ? t('FRIENDS’ RECHARGE REWARD') : t(item.ruleType)}</p><h4>{item.name}</h4></div>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                  <span className='customer-reward-amount'>{money(item.rewardAmount)}</span>
                </div>
                {item.ruleType === 'MILESTONE' ? (
                  <div className='customer-reward-progress'>
<<<<<<< HEAD
                    <div className='customer-reward-progress-label'><span>Friends' approved recharges</span><strong>{money(item.qualifyingRechargeAmount)} <small>of {money(item.thresholdAmount)}</small></strong></div>
=======
                    <div className='customer-reward-progress-label'><span>{t("Friends' approved recharges")}</span><strong>{money(item.qualifyingRechargeAmount)} <small>{t('of')} {money(item.thresholdAmount)}</small></strong></div>
>>>>>>> d1aaf18 (Update OnlineTrade project)
                    <div className='customer-reward-progress-track' role='progressbar' aria-label={`${item.name} friends' recharge progress`} aria-valuemin='0' aria-valuemax='100' aria-valuenow={Math.round(progress)}><span style={{ width: `${progress}%` }} /></div>
                  </div>
                ) : null}
                <div className='customer-reward-footer'>
                  <StatusBadge status={item.status} />
                  {item.status === 'CLAIMABLE'
<<<<<<< HEAD
                    ? <button type='button' className='primary-button' disabled={Boolean(busyId)} onClick={() => claim(item)}>{busyId === item.id ? 'Submitting…' : 'Claim reward'}<span>↗</span></button>
                    : <span className='customer-reward-status-copy'>{item.status === 'PENDING' ? 'Waiting for admin approval'
                      : item.status === 'APPROVED' ? 'Approved — awaiting payment'
                        : item.status === 'PAID' ? 'Paid to wallet'
                          : item.status === 'REJECTED' ? 'Claim rejected'
                            : item.ruleType === 'MILESTONE' ? 'Friends’ recharge target not reached' : 'Not available'}</span>}
=======
                    ? <button type='button' className='primary-button' disabled={Boolean(busyId)} onClick={() => claim(item)}>{busyId === item.id ? t('Submitting…') : t('Claim reward')}<span>↗</span></button>
                    : <span className='customer-reward-status-copy'>{item.status === 'PENDING' ? t('Waiting for admin approval')
                      : item.status === 'APPROVED' ? t('Approved — awaiting payment')
                        : item.status === 'PAID' ? t('Paid to wallet')
                          : item.status === 'REJECTED' ? t('Claim rejected')
                            : item.ruleType === 'MILESTONE' ? t('Friends’ recharge target not reached') : t('Not available')}</span>}
>>>>>>> d1aaf18 (Update OnlineTrade project)
                </div>
              </article>
            );
          })}
        </div>
<<<<<<< HEAD
      ) : <Empty>No friends' recharge rewards are available yet.</Empty>}
=======
      ) : <Empty>{t("No friends' recharge rewards are available yet.")}</Empty>}
>>>>>>> d1aaf18 (Update OnlineTrade project)
    </section>
  );
}

function CustomerDownloadPage({ support }) {
<<<<<<< HEAD
=======
  const { t } = useLanguage();
>>>>>>> d1aaf18 (Update OnlineTrade project)
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const downloadUrl = support?.appDownloadUrl;

  return (
    <section className='surface form-surface form-stack'>
<<<<<<< HEAD
      <p className='eyebrow'>MKM MOBILE APP</p>
      <h2>Download & Install MKM</h2>
      <p>Get instant access to your account, daily tasks, wallet, and notifications directly on your mobile device.</p>
=======
      <p className='eyebrow'>{t('ONLINE TRADE MOBILE APP')}</p>
      <h2>{t('Download & Install Online Trade')}</h2>
      <p>{t('Get instant access to your account, daily tasks, wallet, and notifications directly on your mobile device.')}</p>
>>>>>>> d1aaf18 (Update OnlineTrade project)

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
        {downloadUrl && (
          <a
            className='primary-button'
            href={downloadUrl}
            target='_blank'
            rel='noreferrer'
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', fontSize: '15px' }}
          >
<<<<<<< HEAD
            <ArrowDownToLine size={18} /> Download Official MKM APK
=======
            <ArrowDownToLine size={18} /> {t('Download Official Online Trade APK')}
>>>>>>> d1aaf18 (Update OnlineTrade project)
          </a>
        )}

        {deferredPrompt && !isInstalled && (
          <button
            type='button'
            className='primary-button'
            onClick={handleInstallClick}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 20px', fontSize: '15px' }}
          >
<<<<<<< HEAD
            <ArrowDownToLine size={18} /> Install Web App on this Device
          </button>
        )}

        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(23, 61, 49, 0.05)', border: '1px solid rgba(23, 61, 49, 0.15)' }}>
          <h4 style={{ marginBottom: '8px', color: '#173d31' }}>📱 Fast install without download:</h4>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
            <li><strong>Android (Chrome):</strong> Tap the browser menu (⋮) → select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
            <li><strong>iPhone / iPad (Safari):</strong> Tap the Share icon (⎋) → select <strong>"Add to Home Screen"</strong>.</li>
=======
            <ArrowDownToLine size={18} /> {t('Install Web App on this Device')}
          </button>
        )}

        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(13, 79, 79, 0.05)', border: '1px solid rgba(13, 79, 79, 0.15)' }}>
          <h4 style={{ marginBottom: '8px', color: '#0d4f4f' }}>📱 {t('Fast install without download:')}</h4>
          <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
            <li><strong>{t('Android (Chrome):')}</strong> {t('Tap the browser menu (⋮) → select')} <strong>"{t('Install app')}"</strong> {t('or')} <strong>"{t('Add to Home screen')}"</strong>.</li>
            <li><strong>{t('iPhone / iPad (Safari):')}</strong> {t('Tap the Share icon (⎋) → select')} <strong>"{t('Add to Home Screen')}"</strong>.</li>
>>>>>>> d1aaf18 (Update OnlineTrade project)
          </ol>
        </div>
      </div>
    </section>
  );
}

function SupportPage() {
  const { t } = useLanguage();
  const [support, setSupport] = useState(null);
  useEffect(() => { api('/support').then(setSupport).catch(() => setSupport(null)); }, []);
  return (
    <section className='surface form-surface form-stack'>
      <p className='eyebrow'>{t('CUSTOMER SUPPORT')}</p>
      <h2>{t('Reach the Online Trade team')}</h2>
      {support ? (
        <>
          <div className='product-details'>
            <div><small>{t('SUPPORT NAME')}</small><strong>{support.supportName}</strong></div>
            <div><small>{t('PHONE')}</small><strong>{support.supportPhone}</strong></div>
            <div><small>{t('OFFICIAL GROUP')}</small><strong>{support.officialGroupName}</strong></div>
          </div>
          <p>{support.supportMessage}</p>
<<<<<<< HEAD
          {support.whatsappEnabled !== false && support.whatsappUrl && <a className='primary-button' href={support.whatsappUrl} target='_blank' rel='noreferrer'><MessageCircle size={16} /> {support.whatsappMessage ? 'Chat on WhatsApp' : 'Contact us on WhatsApp'}</a>}
          {support.officialGroupEnabled !== false && support.officialGroupUrl && <a className='secondary-button' href={support.officialGroupUrl} target='_blank' rel='noreferrer'>{support.officialGroupLabel ?? 'Join Official Group'}</a>}
          {support.customerSupportEnabled !== false && support.customerSupportUrl && <a className='secondary-button' href={support.customerSupportUrl} target='_blank' rel='noreferrer'>{support.customerSupportLabel ?? 'Customer Support'}</a>}
          {support.appDownloadUrl && <a className='secondary-button' href={support.appDownloadUrl} target='_blank' rel='noreferrer'><ArrowDownToLine size={16} /> Download App</a>}
=======
          {support.whatsappEnabled !== false && support.whatsappUrl && <a className='primary-button' href={support.whatsappUrl} target='_blank' rel='noreferrer'><MessageCircle size={16} /> {support.whatsappMessage ? t('Chat on WhatsApp') : t('Contact us on WhatsApp')}</a>}
          {support.officialGroupEnabled !== false && support.officialGroupUrl && <a className='secondary-button' href={support.officialGroupUrl} target='_blank' rel='noreferrer'>{t(support.officialGroupLabel ?? 'Join Official Group')}</a>}
          {support.customerSupportEnabled !== false && support.customerSupportUrl && <a className='secondary-button' href={support.customerSupportUrl} target='_blank' rel='noreferrer'>{t(support.customerSupportLabel ?? 'Customer Support')}</a>}
          {support.appDownloadUrl && <a className='secondary-button' href={support.appDownloadUrl} target='_blank' rel='noreferrer'><ArrowDownToLine size={16} /> {t('Download App')}</a>}
>>>>>>> d1aaf18 (Update OnlineTrade project)
          {support.publicLinks?.length ? (
            <div className='product-details'>
              {support.publicLinks.filter((link) => link.enabled !== false).map((link) => (
                <div key={`${link.name}-${link.url}`}>
                  <small>{String(link.name).toUpperCase()}</small>
                  <strong><a href={link.url} target={link.target ?? '_blank'} rel='noreferrer'>{link.name}</a></strong>
                  {link.description ? <p>{link.description}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : <Empty>{t('Support information is currently unavailable.')}</Empty>}
    </section>
  );
}

function SupportChatPage({ support = {} }) {
  const { t } = useLanguage();
  const supportLinks = [
    {
      label: t(support.customerSupportLabel || 'Customer Support'),
      href: support.customerSupportUrl,
      enabled: support.customerSupportEnabled,
      Icon: ShieldCheck,
    },
    {
      label: t(support.officialGroupLabel || 'Official Group'),
      href: support.officialGroupUrl,
      enabled: support.officialGroupEnabled,
      Icon: Users,
    },
  ].filter(({ enabled, href }) => enabled !== false && href);

  return (
    <section className='surface support-chat-page'>
      <header className='support-chat-welcome'>
        <span className='support-chat-avatar'><UserCircle size={27} strokeWidth={1.7} /></span>
        <div className='support-chat-welcome-copy'>
          <p className='eyebrow'>{t('ONLINE TRADE CUSTOMER CARE')}</p>
          <h2>{t('Welcome to support')}</h2>
          <p>{t('How can we help you today? Send us a message and our team will reply here.')}</p>
        </div>
      </header>
      {supportLinks.length > 0 && (
        <nav className='support-chat-links' aria-label={t('Other support options')}>
          {supportLinks.map(({ label, href, Icon }) => {
            const external = /^https?:\/\//i.test(href);
            const content = <><Icon size={17} /><span>{label}</span></>;
            return external ? (
              <a className='support-chat-link' href={href} target='_blank' rel='noreferrer' key={label}>{content}</a>
            ) : (
              <Link className='support-chat-link' to={href} key={label}>{content}</Link>
            );
          })}
        </nav>
      )}
      <SupportChatConversation
        messagesUrl='/support/chat/messages'
        sendUrl='/support/chat/messages'
        viewerRole='CUSTOMER'
        attachmentUrlFor={(messageId) => `/api/support/chat/messages/${messageId}/attachment`}
      />
    </section>
  );
}

function SupportChatConversation({ messagesUrl, sendUrl, viewerRole, attachmentUrlFor, customerName }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messageListRef = useRef(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const latest = await api(messagesUrl);
        if (active) {
          const list = messageListRef.current;
          shouldScrollRef.current = !list || list.scrollHeight - list.scrollTop - list.clientHeight < 80;
          setMessages(latest);
          setError('');
        }
      } catch (cause) {
        if (active) setError(cause.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 8000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [messagesUrl]);

  useEffect(() => {
    const list = messageListRef.current;
    if (list && shouldScrollRef.current) list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function submitMessage(event) {
    event.preventDefault();
    if (!text.trim() && !file) return;
    const formElement = event.currentTarget;
    const payload = new FormData();
    if (text.trim()) payload.append('text', text.trim());
    if (file) payload.append('file', file);
    setSending(true);
    setError('');
    try {
      await api(sendUrl, { method: 'POST', body: payload });
      setText('');
      setFile(null);
      formElement.reset();
      shouldScrollRef.current = true;
      setMessages(await api(messagesUrl));
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className='support-chat-conversation'>
      <div className='support-chat-messages' role='log' aria-live='polite' aria-label={t('Chat messages')} ref={messageListRef}>
        {loading ? <Empty>{t('Loading messages…')}</Empty> : messages.length === 0 ? (
          <Empty>{t('No messages yet. Send a message and our team will get back to you.')}</Empty>
        ) : messages.map((message) => {
          const isMine = message.senderRole === viewerRole;
          return (
            <article className={`support-chat-message ${isMine ? 'is-mine' : ''}`} key={message.id}>
              <div className='support-chat-message-meta'>
                <strong>{isMine ? t('You') : (customerName || t('Online Trade Support'))}</strong>
                <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time>
              </div>
              {message.text && <p>{message.text}</p>}
              {message.hasAttachment && (
                ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(message.attachmentMime) ? (
                  <SupportChatImage
                    src={assetUrl(attachmentUrlFor(message.id))}
                    downloadUrl={assetUrl(`${attachmentUrlFor(message.id)}?download=1`)}
                    name={message.attachmentName || t('Attached image')}
                  />
                ) : (
                  <a className='support-chat-attachment' href={assetUrl(attachmentUrlFor(message.id))}>
                    <FileText size={16} />
                    <span>{message.attachmentName || t('Download attachment')}</span>
                    <ArrowDownToLine size={15} />
                  </a>
                )
              )}
            </article>
          );
        })}
      </div>
      {error && <p className='support-chat-error' role='alert'>{error}</p>}
      <form className='support-chat-composer' onSubmit={submitMessage}>
        <label className='support-chat-input-label' htmlFor='support-chat-text'>{t('Message')}</label>
        <textarea
          id='support-chat-text'
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={2000}
          rows={3}
          placeholder={t('Write your message…')}
        />
        <div className='support-chat-composer-actions'>
          <label className='support-chat-file-button'>
            <Paperclip size={17} />
            <span>{file ? file.name : t('Attach file')}</span>
            <input
              type='file'
              accept='.jpg,.jpeg,.png,.webp,.gif,.pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md'
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <small>{t('Up to 5 MB')}</small>
          <button className='primary-button' type='submit' disabled={sending || (!text.trim() && !file)}>
            <Send size={16} /> {sending ? t('Sending…') : t('Send')}
          </button>
        </div>
      </form>
    </div>
  );
}

function SupportChatImage({ src, downloadUrl, name }) {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  return (
    <div className='support-chat-image'>
      <div className='support-chat-image-controls'>
        <span>{name}</span>
        <button
          type='button'
          onClick={() => setZoom((current) => Math.max(0.5, Number((current - 0.25).toFixed(2))))}
          disabled={zoom <= 0.5}
          aria-label={`${t('Zoom out')} ${name}`}
        >
          <ZoomOut size={16} />
        </button>
        <button
          type='button'
          onClick={() => setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))))}
          disabled={zoom >= 3}
          aria-label={`${t('Zoom in')} ${name}`}
        >
          <ZoomIn size={16} />
        </button>
        <a href={downloadUrl} aria-label={`${t('Download')} ${name}`}><ArrowDownToLine size={16} /></a>
      </div>
      <div className='support-chat-image-viewport'>
        <img src={src} alt={name} crossOrigin='use-credentials' style={{ width: `${zoom * 100}%` }} />
      </div>
    </div>
  );
}

function AdminSupportInboxPage() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(() => new URLSearchParams(location.search).get('customerId') ?? '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedId(new URLSearchParams(location.search).get('customerId') ?? '');
  }, [location.search]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const latest = await api('/admin/support/chats');
        if (active) {
          setConversations(latest);
          setError('');
        }
      } catch (cause) {
        if (active) setError(cause.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const selected = conversations.find(({ customerId }) => customerId === selectedId)
    ?? (selectedId ? {
      customerId: selectedId,
      customerName: new URLSearchParams(location.search).get('customerName') || 'Customer',
      phoneNumber: '',
      unreadCount: 0,
    } : null);
  return (
    <section className='surface support-chat-inbox'>
      <div className='surface-heading'>
        <div>
          <p className='eyebrow'>CUSTOMER MESSAGES</p>
          <h3>Online chat inbox</h3>
        </div>
      </div>
      {error && <p className='support-chat-error' role='alert'>{error}</p>}
      <div className='support-chat-inbox-layout'>
        <div className='support-chat-inbox-list' aria-label='Customer conversations'>
          {loading && conversations.length === 0 ? <Empty>Loading conversations…</Empty> : conversations.length === 0 ? (
            <Empty>No customer chats yet.</Empty>
          ) : conversations.map((conversation) => (
            <button
              type='button'
              key={conversation.customerId}
              className={`support-chat-inbox-item ${selectedId === conversation.customerId ? 'is-selected' : ''}`}
              onClick={() => {
                setSelectedId(conversation.customerId);
                setConversations((current) => current.map((item) => item.customerId === conversation.customerId
                  ? { ...item, unreadCount: 0 }
                  : item));
              }}
            >
              <span className='support-chat-inbox-item-heading'>
                <strong>{conversation.customerName}</strong>
                {conversation.unreadCount > 0 && <span className='support-chat-unread'>{conversation.unreadCount}</span>}
              </span>
              <small>{conversation.phoneNumber}</small>
              <span className='support-chat-preview'>{conversation.lastText || conversation.lastAttachmentName || 'Attachment'}</span>
            </button>
          ))}
        </div>
        <div className='support-chat-inbox-thread'>
          {selected ? (
            <>
              <div className='support-chat-customer-heading'>
                <strong>{selected.customerName}</strong>
                <span>{selected.phoneNumber}</span>
              </div>
              <SupportChatConversation
                key={selected.customerId}
                messagesUrl={`/admin/support/chats/${selected.customerId}/messages`}
                sendUrl={`/admin/support/chats/${selected.customerId}/messages`}
                viewerRole='ADMIN'
                customerName={selected.customerName}
                attachmentUrlFor={(messageId) => `/api/admin/support/chats/${selected.customerId}/messages/${messageId}/attachment`}
              />
            </>
          ) : <Empty>Select a customer conversation to view and reply.</Empty>}
        </div>
      </div>
    </section>
  );
}

function History({ rows }) {
  return rows.length ? (
    <div className='history-list'>
      {rows.map((row) => (
        <div className='history-row' key={row.id}>
          <div>
            <strong>{money(row.amount)}</strong>
            <small>{row.paymentMethod ?? row.transactionReference ?? new Date(row.createdAt).toLocaleDateString()}</small>
          </div>
          <span className={`history-status ${String(row.status).toLowerCase()}`}>{String(row.status).replaceAll('_', ' ')}</span>
        </div>
      ))}
    </div>
  ) : <Empty>No requests yet.</Empty>;
}

function Empty({ children }) {
  return <p className='empty-state'>{children}</p>;
}
