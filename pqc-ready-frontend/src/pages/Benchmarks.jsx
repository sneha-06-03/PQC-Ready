import {
  BarChart3,
  Clock,
  Cpu,
  Activity,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function Benchmarks() {
  const keySizeData = [
    { algorithm: "RSA-2048", publicKey: 0.3, privateKey: 0.1 },
    { algorithm: "RSA-3072", publicKey: 0.4, privateKey: 0.1 },
    { algorithm: "ML-KEM-768", publicKey: 1.2, privateKey: 2.4 },
  ];

  const performanceData = [
    { operation: "Key Generation", rsa: 0, mlkem: 0 },
    { operation: "Encapsulation", rsa: 0, mlkem: 0 },
    { operation: "Decapsulation", rsa: 0, mlkem: 0 },
  ];

  return (
    <div className="p-8 space-y-8">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Cryptographic Benchmarks
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Compare traditional and post-quantum cryptographic algorithms.
        </p>
      </div>

      {/* Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-3">
        <Info className="text-amber-600 shrink-0" size={22} />
        <div>
          <h3 className="font-semibold text-amber-900">
            Benchmark Data Pending
          </h3>
          <p className="text-sm text-amber-800 mt-1">
            The charts will display actual execution times and key sizes
            after connection with the cryptographic benchmarking backend.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Cpu className="text-blue-600" size={22} />
            </div>
            <p className="text-sm text-slate-500">Algorithms</p>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mt-4">2</h2>
          <p className="text-xs text-slate-500 mt-1">
            RSA and ML-KEM
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <Clock className="text-green-600" size={22} />
            </div>
            <p className="text-sm text-slate-500">Execution Time</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-4">Pending</h2>
          <p className="text-xs text-slate-500 mt-1">
            Awaiting measurements
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Activity className="text-purple-600" size={22} />
            </div>
            <p className="text-sm text-slate-500">Test Status</p>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-4">Not Run</h2>
          <p className="text-xs text-slate-500 mt-1">
            Backend integration required
          </p>
        </div>

      </div>

      {/* Key Size Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">

        <div className="mb-6">
          <h3 className="font-semibold text-slate-800">
            Public and Private Key Sizes
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Comparison of RSA and ML-KEM key sizes.
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={keySizeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="algorithm" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="publicKey" name="Public Key (KB)" fill="#2563eb" />
              <Bar dataKey="privateKey" name="Private Key (KB)" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          Illustrative values only. Actual encoded key sizes will be
          obtained from the cryptographic backend.
        </p>

      </div>

      {/* Performance Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">

        <div className="mb-6">
          <h3 className="font-semibold text-slate-800">
            Algorithm Performance Comparison
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Execution time for cryptographic operations.
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operation" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rsa" name="RSA (ms)" fill="#2563eb" />
              <Bar dataKey="mlkem" name="ML-KEM (ms)" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-slate-500 mt-3">
          No performance measurements have been entered yet. These charts
          will be populated with actual benchmark results later.
        </p>

      </div>

    </div>
  );
}

export default Benchmarks;