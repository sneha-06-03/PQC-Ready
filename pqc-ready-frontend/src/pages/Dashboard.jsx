
import { useEffect, useState } from "react";
import API from "../services/api";

import {
  ShieldCheck,
  Server,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";

function Dashboard() {
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await API.get("/status");
        setBackendStatus("Connected");
      } catch (error) {
        console.error("Backend connection failed:", error);
        setBackendStatus("Unavailable");
      }
    };

    checkBackend();
  }, []);

  const stats = [
    {
      title: "Total Assets",
      value: "1,248",
      description: "Cryptographic assets identified",
      icon: Server,
      color: "blue",
    },
    {
      title: "Quantum Risk",
      value: "68%",
      description: "Assets requiring attention",
      icon: AlertTriangle,
      color: "amber",
    },
    {
      title: "Protected Assets",
      value: "856",
      description: "Assets marked as protected",
      icon: ShieldCheck,
      color: "green",
    },
    {
      title: "Migration Progress",
      value: "42%",
      description: "Migration completion status",
      icon: CheckCircle,
      color: "purple",
    },
  ];

  return (
    <div className="p-8 space-y-8">

      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Security Overview
        </h1>

        <p className="text-slate-500 mt-2">
          Monitor your organization's post-quantum cryptography readiness.
        </p>

        {/* Backend Connection Status */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              backendStatus === "Connected"
                ? "bg-green-500"
                : backendStatus === "Unavailable"
                ? "bg-red-500"
                : "bg-amber-400"
            }`}
          ></span>

          <span className="text-sm text-slate-600">
            Backend Status: <strong>{backendStatus}</strong>
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.title}
                  </p>

                  <h2 className="text-3xl font-bold text-slate-800 mt-3">
                    {stat.value}
                  </h2>
                </div>

                <div className="p-3 rounded-lg bg-slate-100 text-blue-600">
                  <Icon size={25} />
                </div>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Quantum Readiness
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Overall readiness assessment
          </p>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Readiness Score</span>
              <span className="font-semibold text-blue-600">42%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full w-[42%]"></div>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-4">
            More cryptographic assets need to be assessed and migrated.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">
            Recommended Actions
          </h3>

          <div className="mt-5 space-y-4">

            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 mt-1" size={20} />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Identify vulnerable algorithms
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Review systems using RSA and ECC.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="text-blue-600 mt-1" size={20} />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Prepare migration strategy
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Prioritize assets for post-quantum migration.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowUpRight className="text-green-600 mt-1" size={20} />

              <div>
                <p className="text-sm font-medium text-slate-800">
                  Monitor migration progress
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Track your organization's security improvements.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
