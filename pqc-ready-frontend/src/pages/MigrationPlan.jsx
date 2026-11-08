import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react";

function MigrationPlan() {
  const migrationTasks = [
    {
      id: 1,
      asset: "Payment Gateway",
      current: "RSA-2048",
      recommended: "ML-KEM-768",
      priority: "Critical",
      status: "Pending",
    },
    {
      id: 2,
      asset: "Customer Database",
      current: "ECC",
      recommended: "ML-KEM-768",
      priority: "High",
      status: "Pending",
    },
    {
      id: 3,
      asset: "Web Server",
      current: "RSA-3072",
      recommended: "ML-KEM-768",
      priority: "Medium",
      status: "In Progress",
    },
    {
      id: 4,
      asset: "Internal API",
      current: "AES-256",
      recommended: "Review Required",
      priority: "Low",
      status: "Completed",
    },
  ];

  return (
    <div className="p-8 space-y-8">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Migration Plan
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Plan and prioritize your organization's transition to post-quantum cryptography.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={22} />
            </div>
            <p className="text-sm text-slate-500">Critical Priority</p>
          </div>
          <h2 className="text-3xl font-bold mt-4 text-slate-800">12</h2>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Clock size={22} />
            </div>
            <p className="text-sm text-slate-500">In Progress</p>
          </div>
          <h2 className="text-3xl font-bold mt-4 text-slate-800">28</h2>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle size={22} />
            </div>
            <p className="text-sm text-slate-500">Completed</p>
          </div>
          <h2 className="text-3xl font-bold mt-4 text-slate-800">156</h2>
        </div>

      </div>

      {/* Migration Progress */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">
              Overall Migration Progress
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Sample progress for interface development
            </p>
          </div>
          <span className="text-xl font-bold text-blue-600">42%</span>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full">
          <div className="w-[42%] h-3 bg-blue-600 rounded-full"></div>
        </div>
      </div>

      {/* Migration Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">
            Recommended Migration Actions
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Review the recommended migration priorities.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Current Algorithm</th>
                <th className="px-6 py-4">Recommended</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {migrationTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">

                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {task.asset}
                  </td>

                  <td className="px-6 py-4 text-sm font-mono text-slate-600">
                    {task.current}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      {task.recommended}
                      <ArrowRight size={15} />
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.priority === "Critical"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "High"
                          ? "bg-orange-100 text-orange-700"
                          : task.priority === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">
                    {task.status}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
        <ShieldCheck className="text-blue-600 shrink-0" size={22} />
        <div>
          <h4 className="font-semibold text-blue-900">
            Post-Quantum Migration
          </h4>
          <p className="text-sm text-blue-800 mt-1">
            ML-KEM is designed for quantum-resistant key establishment.
            ML-DSA is designed for quantum-resistant digital signatures.
            The correct migration depends on how each cryptographic algorithm is used.
          </p>
        </div>
      </div>

    </div>
  );
}

export default MigrationPlan;