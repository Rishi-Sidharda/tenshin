"use client";

import { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Geist_Mono } from "next/font/google";
import { Eye, EyeOff, Lock, CheckCircle, User } from "lucide-react"; // Added User icon
import Footer from "@/components/ui/footer";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState(null); // New state to hold the user's email
  const router = useRouter();

  // Fetch the user's email as soon as the component loads
  useEffect(() => {
    const fetchUser = async () => {
      // Supabase checks the active session (created by clicking the magic link)
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user?.email) {
        setUserEmail(data.session.user.email);
      }
    };
    fetchUser();
  }, []); // Run only once on mount

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    const newPassword = e.target["new-password"].value;
    const confirmPassword = e.target["confirm-password"].value;

    // --- Client-Side Validation ---
    if (newPassword !== confirmPassword) {
      setErrorMsg("Error: Passwords do not match.");
      setLoading(false);
      return;
    }
    // -----------------------------

    // Supabase method for updating the user's password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("✅ Your password has been successfully updated!");
      // Redirect the user to sign-in after a short delay
      setTimeout(() => {
        router.push("/signin");
      }, 5000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main>
      <section>
        <div className="flex items-center bg-[#121212] justify-center min-h-screen">
          <div
            className={`flex flex-1 flex-col justify-center items-center px-4 py-10 lg:px-6 ${geistMono.variable} font-mono`}>
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-black shadow-2xl p-10">
              <div className="flex items-center space-x-1.5 mb-6">
                <Lock className="size-6 text-[#ff8383]" />
                <h3 className="text-xl font-semibold text-white">
                  Set New Password
                </h3>
              </div>

              <p className="mt-2 text-sm text-gray-400 mb-6">
                Enter your new password below.
              </p>

              {/* === Display User Email (New) === */}
              {userEmail && (
                <div className="mb-6 flex items-center space-x-3 rounded-md bg-[#2a2a2a] p-4 border border-[#4a4a4a]">
                  <User className="size-5 shrink-0 text-gray-400" />
                  <p className="text-sm font-medium text-white">
                    Resetting password for:{" "}
                    <span className="text-[#ff8383] font-bold">
                      {userEmail}
                    </span>
                  </p>
                </div>
              )}
              {/* ================================== */}

              {/* Success Message Banner */}
              {successMsg && (
                <div className="mb-6 flex items-start space-x-3 rounded-md bg-[#22c55e]/10 p-4 border border-[#22c55e]">
                  <CheckCircle className="size-5 flex-shrink-0 text-[#22c55e] mt-0.5" />
                  <p className="text-sm font-medium text-white">
                    {successMsg} Redirecting to sign in...
                  </p>
                </div>
              )}

              {/* Only show form if successful reset hasn't occurred */}
              {!successMsg && (
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  {/* New Password Field */}
                  <div>
                    <Label
                      htmlFor="new-password"
                      className="text-sm text-white font-medium">
                      New Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="new-password"
                        name="new-password"
                        required
                        placeholder="••••••••"
                        disabled={loading}
                        className="text-white border-[#2a2a2a] border-2 rounded-md pr-10"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        disabled={loading}
                        className="absolute inset-y-0 right-0 cursor-pointer flex items-center pr-3 text-white focus:outline-none">
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-[#ff8383]" />
                        ) : (
                          <Eye className="h-5 w-5 text-[#ff8383]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm text-white font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative mt-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="confirm-password"
                        name="confirm-password"
                        required
                        placeholder="••••••••"
                        disabled={loading}
                        className="text-white border-[#2a2a2a] border-2 rounded-md pr-10"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-sm text-red-400">{errorMsg}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full py-2 font-medium bg-[#ff8383] hover:bg-[#ff8383]/80 focus:bg-[#ff8383] cursor-pointer"
                    disabled={loading}>
                    {loading ? "Updating Password..." : "Update Password"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
