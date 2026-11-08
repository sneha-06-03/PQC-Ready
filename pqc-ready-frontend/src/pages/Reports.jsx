import {
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  Clock,
  FileCheck,
} from "lucide-react";

function Reports() {
  const reports = [
    {
      id: 1,
      name: "PQC Readiness Assessment",
      description: "Overview of cryptographic assets and quantum risk.",
      date: "Not generated",
      status: "Pending",
      icon: ShieldCheck,
    },
    {
      id: 2,
      name: "Cryptographic Migration Report",
      description: "Migration priorities and recommended algorithms.",
      date: "Not generated",
      status: "Pending",
      icon: FileCheck,
    },
    {
      id: 3,
      name: "Algorithm Benchmark Report",
      description: "Comparison of RSA and ML-KEM performance.",
      date: "Not generated",
      status: "Pending",
      icon: Clock,
    },
  ];

  return (
    <div className="p-8 space-y-8">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Reports
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          View and download your organization's security and migration reports.
        </p>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <FileText className="text-blue-600" size={25} />
          <h2 className="text-3xl font-bold text-slate-800 mt-4">3</h2>
          <p className="text-sm text-slate-500 mt-1">
            Report Templates
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <FileCheck className="text-green-600" size={25} />
          <h2 className="text-3xl font-bold text-slate-800 mt-4">0</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generated Reports
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Calendar className="text-purple-600" size={25} />
          <h2 className="text-xl font-bold text-slate-800 mt-4">
            Not Available
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Last Generated
          </p>
        </div>

      </div>

      {/* Available Reports */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">
            Available Report Templates
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Reports that can be generated after backend integration.
          </p>
        </div>

        <div className="divide-y divide-slate-100">

          {reports.map((report) => {
            const Icon = report.icon;

            return (
              <div
                key={report.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
              >

                <div className="flex items-start gap-4">

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Icon className="text-blue-600" size={23} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {report.name}
                    </h4>

                    <p className="text-sm text-slate-500 mt-1">
                      {report.description}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      {report.date}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {report.status}
                  </span>

                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-400 text-sm cursor-not-allowed"
                  >
                    <Download size={17} />
                    Download
                  </button>

                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h3 className="font-semibold text-blue-900">
          About PQC Reports
        </h3>

        <p className="text-sm text-blue-800 mt-2">
          These reports will summarize cryptographic asset discovery,
          quantum risk assessment, migration recommendations and algorithm
          benchmark results. Report generation and PDF downloads will be
          enabled after backend integration.
        </p>
      </div>

    </div>
  );
}

export default Reports;