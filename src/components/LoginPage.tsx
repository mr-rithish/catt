import React, { useState, useEffect, useMemo } from 'react';
import { FaEye, FaEyeSlash, FaGraduationCap, FaChartBar, FaCalendar, FaShieldAlt, FaSync, FaCalculator } from 'react-icons/fa';
import { startLogin, completeLogin } from '../services/api';
import { AttendanceResponse } from '../types/attendance';

interface LoginPageProps {
  onLoginSuccess?: (data: AttendanceResponse) => void;
}

/** Landing: manual bunk / attendance planner (ERP sign-in preserved below as LegacyLoginPage). */
export default function LoginPage(_props: LoginPageProps) {
  const [totalClasses, setTotalClasses] = useState('');
  const [presentClasses, setPresentClasses] = useState('');
  const [requiredPercent, setRequiredPercent] = useState('75');

  const parsed = useMemo(() => {
    const T = parseInt(totalClasses, 10);
    const P = parseInt(presentClasses, 10);
    const R = parseFloat(requiredPercent);
    if (!Number.isFinite(T) || !Number.isFinite(P) || !Number.isFinite(R)) return null;
    if (T <= 0 || R <= 0 || R >= 100) return null;
    if (P < 0 || P > T) return null;
    return { T, P, R };
  }, [totalClasses, presentClasses, requiredPercent]);

  const result = useMemo(() => {
    if (!parsed) return null;
    const { T, P, R } = parsed;
    const currentPct = (100 * P) / T;

    // Max bunks b with P/(T+b) >= R/100  →  b <= (100*P - R*T) / R
    const bRaw = (100 * P - R * T) / R;
    const maxBunks = Math.max(0, Math.floor(bRaw + 1e-9));

    // Min attends a with (P+a)/(T+a) >= R/100  →  a >= (R*T - 100*P) / (100 - R)
    let minAttends = 0;
    if (currentPct + 1e-9 < R) {
      const aRaw = (R * T - 100 * P) / (100 - R);
      minAttends = Math.max(0, Math.ceil(aRaw - 1e-9));
    }

    return { currentPct, maxBunks, minAttends };
  }, [parsed]);

  const features = [
    { icon: FaCalculator, text: 'Plan bunks vs required %' },
    { icon: FaChartBar, text: 'See current attendance %' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] flex relative overflow-hidden">

      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <FaGraduationCap className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">AttendanceTracker</span>
        </div>

        <div>
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">Bunk &amp; attendance planner</p>
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6">
            Know how many<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              you can skip.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Enter classes conducted and classes attended. We assume every future bunk is an absence until you hit your required percentage.
          </p>

          <div className="mt-10 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="text-blue-400 text-sm" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs">
          
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative z-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 mb-4">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight">AttendanceTracker</h1>
            <p className="text-gray-500 text-sm mt-1">Bunk planner</p>
          </div>

          <div className="bg-[#1a1d27] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
            <div className="mb-7">
              <h2 className="text-white text-2xl font-bold">Attendance math</h2>
              <p className="text-gray-500 text-sm mt-1">Total vs present — we handle the rest</p>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="total" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Total classes (conducted)
                </label>
                <input
                  id="total"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="e.g. 120"
                />
              </div>

              <div>
                <label htmlFor="present" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Present (attended)
                </label>
                <input
                  id="present"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={presentClasses}
                  onChange={(e) => setPresentClasses(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="e.g. 90"
                />
              </div>

              <div>
                <label htmlFor="req" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Required attendance (%)
                </label>
                <input
                  id="req"
                  type="number"
                  min={1}
                  max={99}
                  step={0.5}
                  inputMode="decimal"
                  value={requiredPercent}
                  onChange={(e) => setRequiredPercent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="75"
                />
              </div>

              {parsed && result ? (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-gray-300 text-sm">
                    Current:{' '}
                    <span className="text-white font-semibold tabular-nums">{result.currentPct.toFixed(2)}%</span>
                  </p>
                  {result.currentPct + 1e-9 >= parsed.R ? (
                    <p className="text-emerald-400/95 text-sm leading-relaxed">
                      You can bunk up to{' '}
                      <span className="font-bold tabular-nums">{result.maxBunks}</span> more class
                      {result.maxBunks === 1 ? '' : 'es'} .
                    </p>
                  ) : (
                    <p className="text-amber-400/95 text-sm leading-relaxed">
                      You are below {parsed.R}%. Attend at least{' '}
                      <span className="font-bold tabular-nums">{result.minAttends}</span> more class
                      {result.minAttends === 1 ? '' : 'es'}.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-gray-500 text-sm">
                    Enter valid numbers: total ≥ 1, present between 0 and total, required % between 1 and 99.
                  </p>
                </div>
              )}
            </div>

            <p className="text-center text-gray-500 text-xs mt-6">
              <span className="text-gray-300 font-semibold">Suggestions &amp; Report Issues</span>{' '}
              <a
                href="https://forms.gle/AcEeaEnrAAEh6kFy7"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-medium"
              >
                link
              </a>
            </p>
          </div>

          <div className="lg:hidden mt-6 grid grid-cols-3 gap-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center">
                <Icon className="text-blue-400 text-base mx-auto mb-1.5" />
                <p className="text-gray-500 text-[10px] leading-tight">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Original ERP captcha sign-in — wire this in App when the college portal works again. */
export function LegacyLoginPage({ onLoginSuccess }: { onLoginSuccess: (data: AttendanceResponse) => void }) {
  const [htno, setHtno] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [tokenTimestamp, setTokenTimestamp] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    setIsRefreshingCaptcha(true);
    try {
      const { captchaImage, sessionToken } = await startLogin();
      setCaptchaImage(captchaImage);
      setSessionToken(sessionToken);
      setTokenTimestamp(Date.now());
    } catch (err) {
      setError('Failed to load captcha. Refresh the page.');
    } finally {
      setIsRefreshingCaptcha(false);
    }
  };

  const refreshCaptcha = () => {
    setError(null);
    setCaptchaInput('');
    fetchCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htno.trim() || !password.trim() || !captchaInput.trim() || !sessionToken) return;
    if (isSubmitting) return;

    if (tokenTimestamp && Date.now() - tokenTimestamp > 4 * 60 * 1000) {
      setError('Session expired. Please refresh the captcha.');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await completeLogin(htno.trim(), password.trim(), captchaInput.trim(), sessionToken);
      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');

      if (err.newCaptcha && err.newSessionToken) {
        setCaptchaImage(err.newCaptcha);
        setCaptchaInput('');
        setSessionToken(err.newSessionToken);
        setTokenTimestamp(Date.now());
      } else {
        refreshCaptcha();
      }
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const features = [
    { icon: FaChartBar, text: 'Real-time attendance analytics' },
    { icon: FaCalendar, text: 'Subject-wise tracking' },
    { icon: FaShieldAlt, text: 'Secure and private' },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] flex relative overflow-hidden">

      {isLoading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-[#1a1d27] border border-white/10 rounded-2xl shadow-2xl p-8 max-w-xs w-full mx-4 text-center">
            <div className="relative w-14 h-14 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-white font-semibold text-lg tracking-wide">Signing you in</p>
            <p className="text-gray-400 text-sm mt-1">Fetching your attendance…</p>
          </div>
        </div>
      )}

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-blue-500/40 to-transparent" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <FaGraduationCap className="text-white text-lg" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">AttendanceTracker</span>
        </div>

        <div>
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">VCE Student Attendance Tracker</p>
          <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.1] mb-6">
            Know where<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              you stand.
            </span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Track your attendance, plan your bunks.
          </p>

          <div className="mt-10 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="text-blue-400 text-sm" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs">
          Your credentials are never stored. All data is fetched live from the ERP.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 relative z-10">
        <div className="w-full max-w-sm">

          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 mb-4">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <h1 className="text-white text-2xl font-bold tracking-tight">AttendanceTracker</h1>
            <p className="text-gray-500 text-sm mt-1">VCE Student Portal</p>
          </div>

          <div className="bg-[#1a1d27] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">

            <div className="mb-7">
              <h2 className="text-white text-2xl font-bold">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label htmlFor="htno" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Hall Ticket Number
                </label>
                <input
                  id="htno"
                  type="text"
                  value={htno}
                  onChange={(e) => setHtno(e.target.value.toUpperCase())}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="HTNO"
                  required
                  maxLength={15}
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                  </button>
                </div>
              </div>

              {captchaImage && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Captcha
                    </label>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      disabled={isRefreshingCaptcha}
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <FaSync className={`text-xs ${isRefreshingCaptcha ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>

                  <div className="bg-white rounded-xl p-2 inline-block mb-3 shadow-inner">
                    <img
                      src={captchaImage}
                      alt="Captcha"
                      className="h-12 w-36 object-contain block"
                    />
                  </div>

                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all tracking-widest"
                    placeholder="Type the characters above"
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!htno || !password || !captchaInput || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/30 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 mt-1"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 text-xs mt-6">
              <span className="text-gray-300 font-semibold">Suggestions &amp; Report Issues</span>{' '}
              <a
                href="https://forms.gle/AcEeaEnrAAEh6kFy7"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-medium"
              >
                link
              </a>
            </p>
          </div>

          <div className="lg:hidden mt-6 grid grid-cols-3 gap-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 text-center">
                <Icon className="text-blue-400 text-base mx-auto mb-1.5" />
                <p className="text-gray-500 text-[10px] leading-tight">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
