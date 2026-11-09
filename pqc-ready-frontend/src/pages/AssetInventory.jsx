
import { useState, useEffect } from "react";

import {
  Search,
  Plus,
  Filter,
  Server,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";

import API from "../services/api";

function AssetInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessingId, setAssessingId] = useState(null);
  const [error, setError] = useState("");
  const [assets, setAssets] = useState([]);

  // Extract key size from algorithm names such as RSA-2048 or AES-256.
  const getKeySize = (algorithm) => {
    const match = String(algorithm || "").match(/\d{3,5}/);
    return match ? Number(match[0]) : null;
  };

  // Convert backend errors into readable messages.
  const getErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;
    const message = err.response?.data?.message;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.msg || "Invalid input"
        )
        .join(", ");
    }

    if (detail && typeof detail === "object") {
      return detail.msg || JSON.stringify(detail);
    }

    if (typeof message === "string") return message;

    if (typeof err.message === "string") return err.message;

    return fallback;
  };

  // Call the backend risk assessment engine.
  const assessAsset = async (asset) => {
    try {
      const response = await API.post("/assess", {
        algorithm: asset.algorithm,
        key_size: getKeySize(asset.algorithm),
      });

      return {
        riskScore: response.data.risk_score ?? null,
        assessmentStatus: response.data.status || "Unknown",
        recommendation: response.data.recommendation || "",
      };
    } catch (err) {
      console.error(
        `Risk assessment failed for ${asset.name}:`,
        err
      );

      return {
        riskScore: null,
        assessmentStatus: "Not assessed",
        recommendation: getErrorMessage(
          err,
          "Risk assessment could not be completed."
        ),
      };
    }
  };

  // Convert backend asset data into frontend format.
  const formatAsset = (asset, index, assessment = {}) => {
    return {
      id: asset.id ?? `${asset.name}-${index}`,
      backendId: asset.id ?? null,
      name: asset.name || asset.asset_name || "Unnamed Asset",
      type: asset.category || asset.asset_type || "Other",
      algorithm: asset.algorithm || "Not specified",
      system: asset.system || "",

      riskScore:
        assessment.riskScore ??
        asset.pqc_risk_score ??
        null,

      assessmentStatus:
        assessment.assessmentStatus ||
        asset.assessment_status ||
        "Not assessed",

      recommendation:
        assessment.recommendation ||
        asset.recommendation ||
        "",
    };
  };

  // Fetch assets and assess their risks.
  const fetchAssets = async () => {
    const response = await API.get("/assets");

    const backendAssets = Array.isArray(response.data)
      ? response.data
      : response.data.assets || [];

    const validAssets = backendAssets.filter(
      (asset) => asset.name || asset.asset_name
    );

    // Assess each asset independently.
    const results = await Promise.all(
      validAssets.map(async (asset) => {
        const assessment = await assessAsset(asset);

        return {
          ...formatAsset(
            asset,
            validAssets.indexOf(asset),
            assessment
          ),
        };
      })
    );

    setAssets(results);
  };

  // Load assets when the page opens.
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchAssets();
      } catch (err) {
        console.error("Could not fetch assets:", err);

        setError(
          getErrorMessage(
            err,
            "Could not load assets from the backend."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  // Add a new asset or update an existing asset.
  const handleAddAsset = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      algorithm: String(formData.get("algorithm") || "").trim(),
      category: String(formData.get("type") || "").trim(),
      system: String(formData.get("system") || "").trim(),
    };

    if (
      !payload.name ||
      !payload.algorithm ||
      !payload.category ||
      !payload.system
    ) {
      setError("Please fill in all four fields.");
      return;
    }

    try {
      setLoading(true);

      if (editingAsset) {
        if (editingAsset.backendId === null) {
          throw new Error(
            "This asset does not have a valid backend ID. Refresh and try again."
          );
        }

        await API.put(
          `/assets/${editingAsset.backendId}`,
          payload
        );
      } else {
        await API.post("/assets", payload);
      }

      await fetchAssets();

      setShowAddForm(false);
      setEditingAsset(null);
      setSearchTerm("");
      setRiskFilter("All");
      setError("");
    } catch (err) {
      console.error("Asset saving failed:", err);

      setError(
        getErrorMessage(err, "Could not save the asset.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Manually reassess an individual asset.
  const handleAssessAsset = async (asset) => {
    setAssessingId(asset.id);
    setError("");

    const result = await assessAsset(asset);

    setAssets((previousAssets) =>
      previousAssets.map((item) =>
        item.id === asset.id
          ? {
              ...item,
              ...result,
            }
          : item
      )
    );

    setAssessingId(null);
  };

  // Delete an asset through the backend.
  const handleDeleteAsset = async (asset) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${asset.name}"?`
    );

    if (!confirmDelete) return;

    if (asset.backendId === null) {
      setError(
        "This asset does not have a valid backend ID. Refresh and try again."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.delete(`/assets/${asset.backendId}`);

      setAssets((previousAssets) =>
        previousAssets.filter(
          (item) => item.backendId !== asset.backendId
        )
      );
    } catch (err) {
      console.error("Asset deletion failed:", err);

      setError(
        getErrorMessage(
          err,
          "Could not delete the asset."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh inventory and risk assessments.
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");
      await fetchAssets();
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not refresh assets.")
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate dashboard statistics using actual assessment results.
  const assessedAssets = assets.filter(
    (asset) => asset.riskScore !== null
  );

  const highRiskAssets = assets.filter((asset) =>
    String(asset.assessmentStatus).toLowerCase().includes("high")
  );

  // Build available risk filters from actual backend responses.
  const riskStatuses = [
    ...new Set(
      assets
        .map((asset) => asset.assessmentStatus)
        .filter((status) => status !== "Not assessed")
    ),
  ];

  // Search and filter assets.
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      `${asset.name} ${asset.type} ${asset.algorithm} ${asset.system}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRisk =
      riskFilter === "All" ||
      asset.assessmentStatus === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-8 space-y-6">

      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Asset Inventory
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Manage and monitor your organization's cryptographic assets.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={() => {
              setEditingAsset(null);
              setError("");
              setShowAddForm(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium"
          >
            <Plus size={18} />
            Add New Asset
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">
            {editingAsset
              ? "Edit Cryptographic Asset"
              : "Add New Cryptographic Asset"}
          </h3>

          <form
            onSubmit={handleAddAsset}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Asset Name
              </label>

              <input
                name="name"
                type="text"
                placeholder="Enter asset name"
                defaultValue={editingAsset?.name || ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <select
                name="type"
                defaultValue={editingAsset?.type || ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              >
                <option value="">Select category</option>
                <option value="Asymmetric">Asymmetric</option>
                <option value="Digital Signature">Digital Signature</option>
                <option value="Application">Application</option>
                <option value="Database">Database</option>
                <option value="API">API</option>
                <option value="Server">Server</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cryptographic Algorithm
              </label>

              <input
                name="algorithm"
                type="text"
                placeholder="e.g. RSA-2048, AES-256"
                defaultValue={editingAsset?.algorithm || ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none"
              />

              <p className="text-xs text-slate-400 mt-1">
                Include the key size in the algorithm name when available.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                System
              </label>

              <input
                name="system"
                type="text"
                placeholder="e.g. Auth Gateway"
                defaultValue={editingAsset?.system || ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none"
              />
            </div>

            {error && (
              <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg text-sm font-medium"
              >
                {loading
                  ? "Saving..."
                  : editingAsset
                    ? "Update Asset"
                    : "Save Asset"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAsset(null);
                  setError("");
                }}
                disabled={loading}
                className="border border-slate-200 px-5 py-3 rounded-lg text-sm text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading and Error Messages */}
      {loading && !showAddForm && (
        <p className="text-sm text-blue-600">
          Loading assets and calculating risk assessments...
        </p>
      )}

      {error && !showAddForm && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Total Assets</p>
          <h2 className="text-2xl font-bold mt-2 text-slate-800">
            {assets.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">High Risk Assets</p>
          <h2 className="text-2xl font-bold mt-2 text-red-600">
            {highRiskAssets.length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Assessed Assets</p>
          <h2 className="text-2xl font-bold mt-2 text-green-600">
            {assessedAssets.length}
          </h2>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1 border border-slate-200 rounded-lg px-4 py-3">
          <Search size={19} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search by name, type or algorithm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-2">
          <Filter size={18} className="text-slate-500" />

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="outline-none text-sm text-slate-600 bg-white"
          >
            <option value="All">All Risk Assessments</option>

            {riskStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">
            Cryptographic Assets
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredAssets.length} matching assets
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Asset Name</th>
                <th className="px-6 py-4">Asset Type</th>
                <th className="px-6 py-4">Algorithm</th>
                <th className="px-6 py-4">Risk Score</th>
                <th className="px-6 py-4">Assessment</th>
                <th className="px-6 py-4">Recommendation</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Server size={18} />
                        </div>

                        <span className="font-medium text-sm text-slate-800">
                          {asset.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {asset.type}
                    </td>

                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {asset.algorithm}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {asset.riskScore !== null
                        ? asset.riskScore
                        : "Not assessed"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700">
                        {asset.assessmentStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600 min-w-48 max-w-xs">
                      {asset.recommendation || "No recommendation available."}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAssessAsset(asset)}
                          disabled={
                            loading || assessingId === asset.id
                          }
                          className="text-indigo-600 hover:text-indigo-800 disabled:opacity-50 text-sm font-medium text-left"
                        >
                          {assessingId === asset.id
                            ? "Assessing..."
                            : asset.riskScore !== null
                              ? "Reassess"
                              : "Assess"}
                        </button>

                        <button
                          onClick={() => {
                            setEditingAsset(asset);
                            setError("");
                            setShowAddForm(true);
                          }}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium text-left"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteAsset(asset)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium text-left"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-8 text-slate-500 text-sm"
                  >
                    {loading
                      ? "Loading assets..."
                      : "No matching assets found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AssetInventory;
