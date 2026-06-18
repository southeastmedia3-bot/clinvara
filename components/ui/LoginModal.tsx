"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { useToast } from "@/components/providers/ToastProvider";
import {
  createFirebaseEmailAccount,
  firebaseAuth,
  sendFirebaseOtp,
  sendFirebasePasswordReset,
  signInFirebaseFacebook,
  signInFirebaseEmail,
  signInFirebaseGoogle,
  verifyFirebaseOtp,
} from "@/lib/firebase/client";
import { BrandLogo } from "@/components/shared/BrandLogo";
import {
  customerToAuthUser,
  ensureCustomerFromFirebaseUser,
  readCustomerProfile,
  saveCustomerProfile,
} from "@/lib/firebase/customerData";

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

function SocialButtons({
  onSocialSignIn,
}: {
  onSocialSignIn: (provider: "google" | "facebook") => void;
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => onSocialSignIn("google")}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-black text-sm font-semibold text-white transition hover:bg-black/85"
      >
        <GoogleMark />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => onSocialSignIn("facebook")}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-[#1877F2] text-sm font-semibold text-white transition hover:bg-[#166fe5]"
      >
        <FacebookMark />
        Continue with Facebook
      </button>
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
  const [mobileProfileRequired, setMobileProfileRequired] = useState(false);
  const [mobileProfileName, setMobileProfileName] = useState("");
  const [mobileProfilePincode, setMobileProfilePincode] = useState("");
  const [verifiedMobileNumber, setVerifiedMobileNumber] = useState("");
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
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [updates, setUpdates] = useState(true);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  const getFirebaseErrorCode = (error: unknown) =>
    typeof error === "object" && error && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  const sanitizeOtpError = (error: unknown) => {
    const code = getFirebaseErrorCode(error);
    if (code.includes("invalid-verification-code") || code.includes("code-expired")) {
      return "Incorrect or expired OTP. Please try again.";
    }
    return "Unable to verify OTP. Please request a new code.";
  };

  const firebaseEmailErrorMessage = (error: unknown) => {
    const code = getFirebaseErrorCode(error);
    if (code.includes("email-already-in-use")) {
      return "This email is already registered. Please sign in instead.";
    }
    if (code.includes("operation-not-allowed")) {
      return "Email/password sign up is not enabled in Firebase Authentication.";
    }
    if (code.includes("weak-password")) {
      return "Use a stronger password with at least 8 characters.";
    }
    if (code.includes("invalid-email")) {
      return "Enter a valid email address.";
    }
    if (code.includes("network-request-failed")) {
      return "Network error. Please check your connection and try again.";
    }
    if (code.includes("too-many-requests")) {
      return "Too many attempts. Please wait a few minutes and try again.";
    }
    return "Unable to create this email account. Please check Firebase Auth settings and try again.";
  };

  const socialSignIn = async (provider: "google" | "facebook") => {
    let result: Awaited<ReturnType<typeof signInFirebaseGoogle>>;

    try {
      result =
        provider === "google"
          ? await signInFirebaseGoogle()
          : await signInFirebaseFacebook();
    } catch (error) {
      const code = getFirebaseErrorCode(error);

      showToast({
        message: code.includes("popup-closed-by-user")
          ? "Sign in was cancelled."
          : code.includes("unauthorized-domain")
            ? "This domain is not authorized in Firebase Authentication."
            : code.includes("operation-not-allowed")
              ? `${provider === "google" ? "Google" : "Facebook"} sign in is not enabled in Firebase Authentication.`
              : `${provider === "google" ? "Google" : "Facebook"} sign in failed. Please try again.`,
        variant: "error",
        durationMs: 6000,
      });
      return;
    }

    try {
      const profile = await saveCustomerProfile(result.user.uid, {
        name: result.user.displayName ?? undefined,
        email: result.user.email ?? undefined,
        phone: result.user.phoneNumber ?? undefined,
        checkoutEmail: result.user.email ?? undefined,
        provider,
      });

      setAuthenticated(true, customerToAuthUser(profile));
      close();
      showToast({ message: "Welcome back!", variant: "success" });
    } catch (error) {
      console.error("Signed in, but profile sync failed:", error);

      close();
      showToast({
        message: "Signed in successfully.",
        variant: "success",
        durationMs: 2500,
      });

      window.setTimeout(() => {
        window.location.reload();
      }, 700);
    }
  };

  const requestMobileOtp = async (target: "signin" | "register") => {
    const activePhone = target === "signin" ? phone : registerPhone;
    const activeCode = target === "signin" ? countryCode : registerCountryCode;
    if (!/^\d{10}$/.test(activePhone)) {
      showToast({ message: "Enter a valid 10-digit mobile number.", variant: "error" });
      return;
    }
    const setLoading = target === "signin" ? setOtpLoading : setRegisterOtpLoading;
    if (target === "signin") {
      setOtpSent(true);
      setMobileProfileRequired(false);
      setVerifiedMobileNumber("");
    } else {
      setRegisterOtpSent(true);
    }
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
      if (target === "signin") setOtpSent(false);
      else setRegisterOtpSent(false);
      setLoading(false);
      return;
    }
    setLoading(false);
    showToast({ message: "OTP sent!", variant: "success" });
  };

  const verifyMobileOtp = async (target: "signin" | "register") => {
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
        message: sanitizeOtpError(error),
        variant: "error",
        durationMs: 5000,
      });
      setLoading(false);
      return false;
    }
    setLoading(false);
    return true;
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const credential = await signInFirebaseEmail(email, password);
      if (!credential.user.emailVerified) {
        showToast({
          message: "Please verify your email before signing in.",
          variant: "error",
          durationMs: 5000,
        });
        return;
      }
      setAuthenticated(true, {
        ...customerToAuthUser(
          await ensureCustomerFromFirebaseUser(credential.user, {
            email: credential.user.email ?? email,
            provider: "email",
          }),
        ),
      });
      close();
      showToast({ message: keepLoggedIn ? "Welcome back!" : "Signed in for this session.", variant: "success" });
    } catch {
      showToast({
        message: "Invalid email or password. Please use a registered account.",
        variant: "error",
        durationMs: 5000,
      });
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const targetEmail = resetEmail.trim() || email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      showToast({ message: "Enter a valid registered email address.", variant: "error" });
      return;
    }
    setResetLoading(true);
    console.info("EMAIL_TRIGGERED", {
      eventName: "passwordReset",
      provider: "Firebase Authentication",
    });
    try {
      await sendFirebasePasswordReset(targetEmail);
      console.info("EMAIL_SENT_SUCCESS", {
        eventName: "passwordReset",
        provider: "Firebase Authentication",
      });
    } catch (error) {
      console.error("EMAIL_SENT_FAILED", {
        eventName: "passwordReset",
        provider: "Firebase Authentication",
        code: getFirebaseErrorCode(error),
      });
      console.info("Password reset request completed with safe response", getFirebaseErrorCode(error));
    } finally {
      setResetLoading(false);
    }
    setResetSent(true);
    showToast({
      message: "If an account exists for this email, a reset link has been sent.",
      variant: "success",
      durationMs: 6000,
    });
  };

  const signInWithMobile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (mobileProfileRequired) {
      if (!mobileProfileName.trim() || !/^\d{6}$/.test(mobileProfilePincode)) {
        showToast({
          message: "Enter your name and a valid 6-digit PIN code.",
          variant: "error",
        });
        return;
      }
      const currentUser = firebaseAuth.currentUser;
      if (!currentUser) {
        showToast({ message: "Unable to finish mobile sign in. Please try again.", variant: "error" });
        return;
      }
      const profile = await saveCustomerProfile(currentUser.uid, {
        name: mobileProfileName.trim(),
        pincode: mobileProfilePincode,
        phone: verifiedMobileNumber,
        provider: "otp",
      });
      setAuthenticated(true, customerToAuthUser(profile));
      close();
      showToast({ message: "Welcome to CLINVARA!", variant: "success" });
      return;
    }
    const ok = await verifyMobileOtp("signin");
    if (!ok) return;
    const mobileNumber = `${countryCode}${phone}`;
    const currentUser = firebaseAuth.currentUser;
    const profile = await readCustomerProfile(currentUser?.uid);
    if (!profile) {
      setVerifiedMobileNumber(mobileNumber);
      setMobileProfileRequired(true);
      showToast({
        message: "Add your name and PIN code to finish signing in.",
        variant: "info",
      });
      return;
    }
    setAuthenticated(true, customerToAuthUser(profile));
    close();
    showToast({ message: "Welcome back!", variant: "success" });
  };

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registerEmail !== confirmEmail) {
      showToast({ message: "Email addresses do not match.", variant: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      showToast({ message: "Enter a valid email address.", variant: "error" });
      return;
    }
    if (registerPassword.length < 8) {
      showToast({ message: "Password must be at least 8 characters.", variant: "error" });
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
    if (!registerOtpSent) {
      showToast({ message: "Verify your mobile number before creating an account.", variant: "error" });
      return;
    }
    if (!addressLine1.trim() || !city.trim() || !stateName.trim() || !/^\d{6}$/.test(pincode)) {
      showToast({ message: "Enter your complete address and a valid 6-digit PIN code.", variant: "error" });
      return;
    }
    const ok = await verifyMobileOtp("register");
    if (!ok) return;
    let verificationEmailSent = false;
    try {
      const result = await createFirebaseEmailAccount({
        email: registerEmail,
        password: registerPassword,
        displayName: `${firstName} ${lastName}`.trim(),
      });
      verificationEmailSent = result.verificationEmailSent;
      const profile = await saveCustomerProfile(result.credential.user.uid, {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email: registerEmail,
        phone: `${registerCountryCode}${registerPhone}`,
        pincode,
        checkoutEmail: registerEmail,
        provider: "email",
        marketingOptIn: updates,
        addresses: [
          {
            id: crypto.randomUUID(),
            label: "Home",
            fullName: `${firstName} ${lastName}`.trim(),
            phone: `${registerCountryCode}${registerPhone}`,
            line1: addressLine1,
            line2: addressLine2,
            city,
            state: stateName,
            pincode,
          },
        ],
      });
      setAuthenticated(true, customerToAuthUser(profile));
    } catch (error) {
      showToast({
        message: firebaseEmailErrorMessage(error),
        variant: "error",
        durationMs: 7000,
      });
      return;
    }
    close();
    showToast({
      message: verificationEmailSent
        ? "Account created. We sent a verification email."
        : "Account created. Sign in later to resend the verification email.",
      variant: "success",
      durationMs: 6000,
    });
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
                    {mobileProfileRequired && (
                      <div className="grid gap-4 rounded-xl bg-[var(--brand-off-white)] p-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <p className="text-sm font-semibold">Complete your profile</p>
                          <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
                            Name and PIN code are required once for mobile sign in.
                          </p>
                        </div>
                        <Field
                          label="Full Name"
                          value={mobileProfileName}
                          onChange={setMobileProfileName}
                          autoComplete="name"
                        />
                        <Field
                          label="PIN Code"
                          value={mobileProfilePincode}
                          onChange={(value) => setMobileProfilePincode(value.replace(/\D/g, "").slice(0, 6))}
                          autoComplete="postal-code"
                        />
                      </div>
                    )}
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
                  <button
                    type="button"
                    className="font-semibold underline underline-offset-4"
                    onClick={() => {
                      setResetEmail(email);
                      setResetOpen(true);
                    }}
                  >
                    Reset password
                  </button>
                </div>
                <button
                  type="submit"
                  className="h-12 w-full rounded-full bg-black text-sm font-semibold text-white transition hover:bg-black/85"
                >
                  {signInMode === "email" ? "Sign In" : mobileProfileRequired ? "Complete Sign In" : "Verify & Sign In"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--brand-border)]" />
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
                  Or
                </span>
                <div className="h-px flex-1 bg-[var(--brand-border)]" />
              </div>

              <SocialButtons onSocialSignIn={(provider) => void socialSignIn(provider)} />

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
                    <SocialButtons onSocialSignIn={(provider) => void socialSignIn(provider)} />
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
                  <div className="rounded-xl bg-[var(--brand-off-white)] p-4 text-sm leading-relaxed text-[var(--brand-text-muted)]">
                    Account creation requires mobile OTP verification and a
                    verification email. Google and Facebook sign-in use the
                    provider&apos;s verified account flow.
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Address Line 1"
                      value={addressLine1}
                      onChange={setAddressLine1}
                      autoComplete="address-line1"
                    />
                    <Field
                      label="Address Line 2"
                      value={addressLine2}
                      onChange={setAddressLine2}
                      autoComplete="address-line2"
                      required={false}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="City" value={city} onChange={setCity} autoComplete="address-level2" />
                    <Field label="State" value={stateName} onChange={setStateName} autoComplete="address-level1" />
                    <Field
                      label="PIN Code"
                      value={pincode}
                      onChange={(value) => setPincode(value.replace(/\D/g, "").slice(0, 6))}
                      autoComplete="postal-code"
                    />
                  </div>
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

          {resetOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-password-title"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              className="relative z-[180] w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <button
                type="button"
                  aria-label="Close password reset"
                  className="absolute right-4 top-4 rounded-full p-2 hover:bg-[var(--brand-off-white)]"
                  onClick={() => {
                    setResetOpen(false);
                    setResetSent(false);
                    setResetLoading(false);
                  }}
                >
                <X className="h-5 w-5" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-text-muted)]">
                Account support
              </p>
              <h2 id="reset-password-title" className="mt-2 font-display text-3xl font-semibold">
                Reset password
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--brand-text-muted)]">
                {resetSent
                  ? "If a CLINVARA account exists for that email, Firebase has sent a secure reset link."
                  : "Enter your registered email and we will send a secure Firebase password reset link."}
              </p>
              {resetSent ? (
                <div className="mt-5 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-off-white)] p-4 text-sm leading-6 text-[var(--brand-text-muted)]">
                  Check your inbox and spam folder. The link opens Firebase&apos;s secure reset page and then returns you to CLINVARA.
                </div>
              ) : (
                <form onSubmit={resetPassword} className="mt-5 space-y-4">
                  <Field
                    label="Registered Email"
                    type="email"
                    value={resetEmail}
                    onChange={setResetEmail}
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="h-12 w-full rounded-full bg-black text-sm font-semibold text-white disabled:cursor-wait disabled:bg-black/60"
                  >
                    {resetLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
