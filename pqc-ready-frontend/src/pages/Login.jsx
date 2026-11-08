
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Atom, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 p-4 rounded-2xl mb-4">
            <Atom size={35} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">PQC-Ready</h1>
          <p className="text-slate-400 mt-2">
            Quantum-Safe Security Platform
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Sign in to access your security dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg px-4">
                <Mail size={19} className="text-slate-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full p-3 outline-none text-sm"
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="flex items-center border border-slate-200 rounded-lg px-4">
                <Lock size={19} className="text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full p-3 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="accent-blue-600" />
                Remember me
              </label>
              <button type="button" className="text-blue-600 hover:underline">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={16} className="text-green-600" />
            Enterprise Security Platform
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 PQC-Ready. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Login;
