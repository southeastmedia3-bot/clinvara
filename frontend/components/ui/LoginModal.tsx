"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useToast } from "@/components/providers/ToastProvider";
import { sendFirebaseOtp, verifyFirebaseOtp } from "@/lib/firebase/client";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { apiUrl } from "@/lib/api/client";

function GoogleMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-sm font-bold">
      <span className="bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] bg-clip-text text-transparent">
        G
      </span>
    </span>
  );
}

function FacebookMark() {
  return (
    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-xs font-bold text-[#1877F2]">
      f
    </span>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  required = true,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      <span className="mb-2 block text-[var(--brand-text-muted)]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full border border-[var(--brand-border)] px-4 text-sm outline-none transition focus:border-black"
      />
    </label>
  );
}

function PhoneField({
  countryCode,
  onCountryCodeChange,
  phone,
  onPhoneChange,
}: {
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      <span className="mb-2 block text-[var(--brand-text-muted)]">Mobile Number</span>
      <span className="flex h-12 items-center rounded-full border border-[var(--brand-border)] transition focus-within:border-black">
        <select
          aria-label="Country code"
          className="ml-4 bg-transparent text-sm outline-none"
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
        >
          <option value="+91">+91</option>
          <option value="+1">+1</option>
          <option value="+44">+44</option>
        </select>
        <span className="mx-3 h-5 w-px bg-[var(--brand-border)]" />
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          required
          autoComplete="tel-national"
          onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, "").slice(0, 10))}
          className="min-w-0 flex-1 bg-transparent pr-4 text-sm outline-none"
          placeholder="9876543210"
        />
      </span>
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block text-sm font-medium">
      <span className="mb-2 block text-[var(--brand-text-muted)]">{label}</span>
      <span className="flex h-12 items-center rounded-full border border-[var(--brand-border)] px-4 transition focus-within:border-black">
        <input
          type={show ? "text" : "password"}
          value={value}
          required
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          className="ml-2 text-[var(--brand-text-muted)] hover:text-black"
          onClick={() => setShow((v) => !v)}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

function SocialButtons() {
  return (
    <div className="space-y-3">
      <a
        href={apiUrl("/api/auth/oauth/google")}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-black text-sm font-semibold text-white transition hover:bg-black/85"
      >
        <GoogleMark />
        Continue with Google
      </a>
      <a
        href={apiUrl("/api/auth/oauth/facebook")}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#1877F2] text-sm font-semibold text-white transition hover:bg-[#166fe5]"
      >
        <FacebookMark />
        Continue with Facebook
      </a>
    </div>
  );
}

export function LoginModal() {
  const loginOpen = useAuthStore((s) => s.loginModalOpen);
  const registerOpen = useAuthStore((s) => s.registerModalOpen);
  const setLoginOpen = useAuthStore((s) => s.setLoginModalOpen);
  const setRegisterOpen = useAuthStore((s) => s.setRegisterModalOpen);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInMode, setSignInMode] = useState<"email" | "mobile">("email");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerCountryCode, setRegisterCountryCode] = useState("+91");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerOtp, setRegisterOtp] = useState("");
  const [registerOtpSent, setRegisterOtpSent] = useState(false);
  const [registerOtpLoading, setRegisterOtpLoading] = useState(false);
  const [registerEmail, setRegisterEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updates, setUpdates] = useState(true);

  const anyOpen = loginOpen || registerOpen;

  useEffect(() => {
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLoginOpen(false);
        setRegisterOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [anyOpen, setLoginOpen, setRegisterOpen]);

  const close = () => {
    setLoginOpen(false);
    setRegisterOpen(false);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const openSignIn = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const requestMobileOtp = async (target: "signin" | "register") => {
    const activePhone = target === "signin" ? phone : registerPhone;
    const activeCode = target === "signin" ? countryCode : registerCountryCode;
    if (!/^\d{10}$/.test(activePhone)) {
      showToast({ message: "Enter a valid 10-digit mobile number.", variant: "error" });
      return;
    }
    const setLoading = target === "signin" ? setOtpLoading : setRegisterOtpLoading;
    setLoading(true);
    try {
      await sendFirebaseOtp(`${activeCode}${activePhone}`, "firebase-recaptcha");
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Unable to send OTP right now.",
        variant: "error",
        durationMs: 5000,
      });
      setLoading(false);
      return;
    }
    setLoading(false);
    if (target === "signin") setOtpSent(true);
    else setRegisterOtpSent(true);
    showToast({ message: "OTP sent!", variant: "success" });
  };

  const verifyMobileOtp = async (target: "signin" | "register") => {
    const activePhone = target === "signin" ? phone : registerPhone;
    const activeCode = target === "signin" ? countryCode : registerCountryCode;
    const activeOtp = target === "signin" ? otp : registerOtp;
    if (!/^\d{4,8}$/.test(activeOtp)) {
      showToast({ message: "Enter the OTP sent to your mobile number.", variant: "error" });
      return false;
    }
    const setLoading = target === "signin" ? setOtpLoading : setRegisterOtpLoading;
    setLoading(true);
    try {
      await verifyFirebaseOtp(activeOtp);
    } catch (error) {
      showToast({
        message:
          error instanceof Error
            ? error.message
            : "Invalid or expired OTP.",
        variant: "error",
        durationMs: 5000,
      });
      setLoading(false);
      return false;
    }
    setLoading(false);
    return true;
  };

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    setAuthenticated(true, { email, provider: "email" });
    close();
    showToast({ message: keepLoggedIn ? "Welcome back!" : "Signed in for this session.", variant: "success" });
  };

  const signInWithMobile = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await verifyMobileOtp("signin");
    if (!ok) return;
    setAuthenticated(true, { provider: "otp" });
    close();
    showToast({ message: "Welcome back!", variant: "success" });
  };

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registerEmail !== confirmEmail) {
      showToast({ message: "Email addresses do not match.", variant: "error" });
      return;
    }
    if (registerPassword !== confirmPassword) {
      showToast({ message: "Passwords do not match.", variant: "error" });
      return;
    }
    if (!/^\d{10}$/.test(registerPhone)) {
      showToast({ message: "Enter a valid mobile number.", variant: "error" });
      return;
    }
    if (registerOtpSent) {
      const ok = await verifyMobileOtp("register");
      if (!ok) return;
    }
    setAuthenticated(true, {
      firstName,
      lastName,
      email: registerEmail,
      provider: "email",
    });
    close();
    showToast({ message: "Account created. Welcome to CLINVARA.", variant: "success" });
  };

  return (
    <AnimatePresence>
      {anyOpen && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center px-4 py-6">
          <div id="firebase-recaptcha" />
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label="Close account dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {loginOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="signin-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative max-h-[92vh] w-full max-w-[500px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                aria-label="Close sign in"
                className="absolute right-5 top-5 rounded-full p-2 hover:bg-[var(--brand-off-white)]"
                onClick={close}
              >
                <X className="h-5 w-5" />
              </button>
              <BrandLogo className="h-16 w-28" />
              <h2 id="signin-title" className="mt-6 font-display text-4xl font-semibold">
                Sign In
              </h2>
              <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
                Access orders, saved products, and personalized skincare care.
              </p>

              <div className="mt-7 grid grid-cols-2 rounded-full bg-[var(--brand-off-white)] p-1 text-sm font-semibold">
                <button
                  type="button"
                  className={`h-10 rounded-full transition ${signInMode === "email" ? "bg-white shadow-sm" : "text-[var(--brand-text-muted)]"}`}
                  onClick={() => setSignInMode("email")}
                >
                  Email
                </button>
                <button
                  type="button"
                  className={`h-10 rounded-full transition ${signInMode === "mobile" ? "bg-white shadow-sm" : "text-[var(--brand-text-muted)]"}`}
                  onClick={() => setSignInMode("mobile")}
                >
                  Mobile
                </button>
              </div>

              <form className="mt-5 space-y-4" onSubmit={signInMode === "email" ? signIn : signInWithMobile}>
                {signInMode === "email" ? (
                  <>
                    <Field
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />
                    <PasswordField
                      label="Password"
                      value={password}
                      onChange={setPassword}
                      autoComplete="current-password"
                    />
                  </>
                ) : (
                  <>
                    <PhoneField
                      countryCode={countryCode}
                      onCountryCodeChange={setCountryCode}
                      phone={phone}
                      onPhoneChange={setPhone}
                    />
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                      <Field
                        label="OTP"
                        value={otp}
                        onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 8))}
                        autoComplete="one-time-code"
                      />
                      <button
                        type="button"
                        className="mt-7 h-12 rounded-full border border-black px-5 text-sm font-semibold disabled:opacity-50"
                        disabled={otpLoading}
                        onClick={() => void requestMobileOtp("signin")}
                      >
                        {otpLoading ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    </div>
                  </>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <label className="inline-flex items-center gap-2 text-[var(--brand-text-muted)]">
                    <input
                      type="checkbox"
                      checked={keepLoggedIn}
                      onChange={(event) => setKeepLoggedIn(event.target.checked)}
                      className="h-4 w-4 rounded border-[var(--brand-border)]"
                    />
                    Keep me logged in
                  </label>
                  <button type="button" className="font-semibold underline underline-offset-4">
                    Reset password
                  </button>
                </div>
                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-black text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  {signInMode === "email" ? "Sign In" : "Verify & Sign In"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--brand-border)]" />
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                  Or
                </span>
                <div className="h-px flex-1 bg-[var(--brand-border)]" />
              </div>

              <SocialButtons />

              <p className="mt-6 text-center text-sm text-[var(--brand-text-muted)]">
                New to CLINVARA?{" "}
                <button type="button" className="font-semibold text-black underline" onClick={openRegister}>
                  Create Account
                </button>
              </p>
            </motion.div>
          )}

          {registerOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="register-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="relative max-h-[92vh] w-full max-w-[980px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <button
                type="button"
                aria-label="Close create account"
                className="absolute right-5 top-5 z-10 rounded-full bg-white/80 p-2 backdrop-blur hover:bg-[var(--brand-off-white)]"
                onClick={close}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <section className="bg-[var(--brand-off-white)] p-6 sm:p-8 lg:p-10">
                  <BrandLogo className="h-16 w-28" />
                  <h2 id="register-title" className="mt-8 font-display text-4xl font-semibold">
                    Create Account
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                    Join for faster checkout, skin routine notes, wishlist access, and early product updates.
                  </p>
                  <div className="mt-8">
                    <SocialButtons />
                  </div>
                  <label className="mt-6 flex items-start gap-3 text-sm text-[var(--brand-text-muted)]">
                    <input
                      type="checkbox"
                      checked={updates}
                      onChange={(event) => setUpdates(event.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[var(--brand-border)]"
                    />
                    Keep me updated on launches, skincare edits, and member-only offers.
                  </label>
                  <p className="mt-6 text-xs leading-relaxed text-[var(--brand-text-muted)]">
                    By creating an account, you agree to the{" "}
                    <Link href="/terms-and-conditions" className="underline">Terms</Link> and{" "}
                    <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
                  </p>
                </section>

                <form className="space-y-4 p-6 sm:p-8 lg:p-10" onSubmit={createAccount}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First Name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
                    <Field label="Last Name" value={lastName} onChange={setLastName} autoComplete="family-name" />
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                    <PhoneField
                      countryCode={registerCountryCode}
                      onCountryCodeChange={setRegisterCountryCode}
                      phone={registerPhone}
                      onPhoneChange={setRegisterPhone}
                    />
                    <button
                      type="button"
                      className="mt-7 h-12 rounded-full border border-black px-5 text-sm font-semibold disabled:opacity-50"
                      disabled={registerOtpLoading}
                      onClick={() => void requestMobileOtp("register")}
                    >
                      {registerOtpLoading ? "Sending..." : registerOtpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  </div>
                  {registerOtpSent && (
                    <Field
                      label="Mobile OTP"
                      value={registerOtp}
                      onChange={(value) => setRegisterOtp(value.replace(/\D/g, "").slice(0, 8))}
                      autoComplete="one-time-code"
                    />
                  )}
                  <Field label="Email" type="email" value={registerEmail} onChange={setRegisterEmail} autoComplete="email" />
                  <Field label="Confirm Email" type="email" value={confirmEmail} onChange={setConfirmEmail} autoComplete="email" />
                  <PasswordField label="Password" value={registerPassword} onChange={setRegisterPassword} autoComplete="new-password" />
                  <PasswordField label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
                  <button
                    type="submit"
                    className="h-12 w-full rounded-full bg-black text-sm font-semibold text-white transition hover:bg-black/85"
                  >
                    Create Account
                  </button>
                  <p className="text-center text-sm text-[var(--brand-text-muted)]">
                    Already have an account?{" "}
                    <button type="button" className="font-semibold text-black underline" onClick={openSignIn}>
                      Sign in
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
