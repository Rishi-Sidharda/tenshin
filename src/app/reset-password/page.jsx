"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Geist_Mono } from "next/font/google";
import { Mail, CheckCircle, ArrowLeft, Clock } from "lucide-react";
import Footer from "@/components/ui/footer";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function ResetPasswordRequestPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cooldown, setCooldown] = useState(0); // Timer state in seconds
  const router = useRouter();

  // --- Timer Logic (FIXED DEPENDENCIES) ---
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prevTime) => {
          const newTime = prevTime - 1;

          if (newTime === 0) {
            clearInterval(timer);

            // Call router.refresh() when the timer hits zero
            // This is safe because 'router' is stable and not in the dependency array
            window.location.href = "/reset-password";

            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [cooldown]); // 👈 DEPENDENCY ARRAY IS NOW ONLY [cooldown]
  // ----------------------------------------

  const handleRequestReset = async (e) => {
    e.preventDefault();
    // Prevent request if currently in cooldown
    if (cooldown > 0) return;

    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const targetEmail = email;

    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `https://tenshin.app/update-password`,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);

      // Still show a generic success message for 404/security
      if (error.status === 404) {
        setSuccessMsg("If an account exists, a reset link has been sent.");
        setCooldown(60); // Start cooldown on successful *attempt*
      } else {
        setErrorMsg(`Error: ${error.message}`);
      }
    } else {
      setSuccessMsg(
        "✅ Success! Check your inbox for the password reset link."
      );
      setEmail(""); // Clear the input field
      setCooldown(60); // Start 60-second cooldown
    }
  };

  const isButtonDisabled = loading || !!successMsg || cooldown > 0;
  const buttonText =
    cooldown > 0
      ? `Resend in ${cooldown}s`
      : loading
      ? "Sending Link..."
      : "Send Reset Link";

  return (
    <main>
      <section>
        <div className="flex items-center bg-[#121212] justify-center min-h-screen">
          <div
            className={`flex flex-1 flex-col justify-center items-center px-4 py-10 lg:px-6 ${geistMono.variable} font-mono`}>
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-black shadow-2xl p-10">
              <button
                onClick={() => router.push("/signin")}
                className="flex items-center cursor-pointer text-sm font-medium text-gray-400 hover:text-[#ff8383] mb-6 transition-colors">
                <ArrowLeft className="size-4 mr-2" />
                Back to Sign In
              </button>

              <div className="flex items-center space-x-1.5 mb-6">
                <Mail className="size-6 text-[#ff8383]" />
                <h3 className="text-xl font-semibold text-white">
                  Reset Password
                </h3>
              </div>

              <p className="mt-2 text-sm text-gray-400 mb-6">
                Enter your email address below. We'll send you a link to reset
                your password.
              </p>

              {/* Success Message Banner */}
              {successMsg && (
                <div className="mb-6 flex items-start space-x-3 rounded-md bg-[#22c55e]/10 p-4 border border-[#22c55e]">
                  <CheckCircle className="size-5 shrink-0 text-[#22c55e] mt-0.5" />
                  <p className="text-sm font-medium text-white">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleRequestReset} className="space-y-6">
                <div>
                  <Label
                    htmlFor="email-reset"
                    className="text-sm text-white font-medium">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    id="email-reset"
                    name="email-reset"
                    required
                    placeholder="ok@tenshin.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    // Input is disabled if loading or on cooldown
                    disabled={isButtonDisabled}
                    className="mt-2 text-white border-[#2a2a2a] border-2 rounded-md"
                  />
                </div>

                {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}

                {/* Cooldown Timer Message */}
                {cooldown > 0 && (
                  <div className="mb-6 flex items-start space-x-3 rounded-md p-4 text-muted-foreground">
                    <Clock className="size-5 shrink-0 text-[#ff8383] mt-0.5" />
                    <p className="text-sm font-medium text-gray-400">
                      Please wait **{cooldown} seconds** before requesting
                      another link.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className={`w-full py-2 font-medium cursor-pointer ${
                    isButtonDisabled
                      ? "bg-[#4a4a4a] cursor-not-allowed" // Darker color when disabled/cooldown
                      : "bg-[#ff8383] hover:bg-[#ff8383]/80 focus:bg-[#ff8383]" // Original active color
                  }`}
                  disabled={isButtonDisabled}>
                  {buttonText}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
