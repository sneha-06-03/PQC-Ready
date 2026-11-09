
import { useState, useEffect } from "react";

import {
  Search,
  Plus,
  Filter,
  Server,
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

  const getKeySize = (algorithm) => {
    const match = String(algorithm || "").match(/\d{3,5}/);
    return match ? Number(match[0]) : null;
  };

  const getErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;
    const message = err.response?.data?.message;

    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail.map((item) =>
        typeof item === "string"
          ? item
          : item?.msg || "Invalid input"
      ).join(", ");
    }

    if (detail && typeof detail === "object") {
      return detail.msg || JSON.stringify(detail);
    }

    if (typeof message === "string") return message;
    if (typeof err.message === "string") return err.message;

    return fallback;
  };

  // Risk assessment using the backend endpoint.
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

  // Convert database/backend fields into frontend fields.
  const formatAsset = (asset, index, assessment = {}) => {
    return {
      id: asset.asset_id ?? asset.id ?? `${asset.asset_name}-${index}`,
      backendId: asset.asset_id ?? asset.id ?? null,

      name: asset.asset_name || asset.name || "Unnamed Asset",

      type: asset.asset_type || asset.category || "Other",

      algorithm:
        asset.current_algorithm ||
        asset.algorithm ||
        "Not specified",

      sensitivity: asset.data_sensitivity || "Medium",

      internetFacing: asset.internet_facing || "No",

      retentionYears: asset.data_retention_years ?? 0,

      owner: asset.owner || "",

      status: asset.status || "Active",

      riskScore:
        assessment.riskScore ??
        asset.risk_score ??
        asset.pqc_risk_score ??
        null,

      assessmentStatus:
        assessment.assessmentStatus ||
        asset.risk_level ||
        asset.assessment_status ||
        "Not assessed",

      recommendation:
        assessment.recommendation ||
        asset.recommendation ||
        "",
    };
  };

  // Fetch all assets and calculate their risk scores.
  const fetchAssets = async () => {
    const response = await API.get("/assets");

    const backendAssets = Array.isArray(response.data)
      ? response.data
      : response.data.assets || [];

    const validAssets = backendAssets.filter(
      (asset) => asset.asset_name || asset.name
    );

    const results = await Promise.all(
      validAssets.map(async (asset, index) => {
        const formatted = formatAsset(asset, index);
        const assessment = await assessAsset(formatted);

        return {
          ...formatted,
          ...assessment,
        };
      })
    );

    setAssets(results);
  };

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

  // Add or edit using the exact backend request format.
  const handleAddAsset = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);

    const payload = {
      asset_name: String(formData.get("asset_name") || "").trim(),

      asset_type: String(formData.get("asset_type") || "").trim(),

      current_algorithm: String(
        formData.get("current_algorithm") || ""
      ).trim(),

      data_sensitivity: String(
        formData.get("data_sensitivity") || ""
      ).trim(),

      internet_facing: String(
        formData.get("internet_facing") || ""
      ).trim(),

      data_retention_years: Number(
        formData.get("data_retention_years")
      ),

      owner: String(formData.get("owner") || "").trim(),

      status: String(formData.get("status") || "Active").trim(),
    };

    if (
      !payload.asset_name ||
      !payload.asset_type ||
      !payload.current_algorithm ||
      !payload.data_sensitivity ||
      !payload.internet_facing ||
      !payload.owner ||
      !Number.isInteger(payload.data_retention_years) ||
      payload.data_retention_years < 0
    ) {
      setError("Please complete all fields with valid values.");
      return;
    }

    try {
      setLoading(true);

      if (editingAsset) {
        if (editingAsset.backendId === null) {
          throw new Error(
            "This asset has no valid backend ID. Please refresh and try again."
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

  // Reassess an individual asset.
  const handleAssessAsset = async (asset) => {
    setAssessingId(asset.id);
    setError("");

    const result = await assessAsset(asset);

    setAssets((previousAssets) =>
      previousAssets.map((item) =>
        item.id === asset.id
          ? { ...item, ...result }
          : item
      )
    );

    setAssessingId(null);
  };

  // Delete an asset.
  const handleDeleteAsset = async (asset) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${asset.name}"?`
    );

    if (!confirmDelete) return;

    if (asset.backendId === null) {
      setError(
        "This asset has no valid backend ID. Please refresh."
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
        getErrorMessage(err, "Could not delete the asset.")
      );
    } finally {
      setLoading(false);
    }
  };

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

  const assessedAssets = assets.filter(
    (asset) => asset.riskScore !== null
  );

  const highRiskAssets = assets.filter((asset) =>
    String(asset.assessmentStatus).toLowerCase().includes("high") ||
    String(asset.assessmentStatus).toLowerCase().includes("critical")
  );

  const riskStatuses = [
    ...new Set(
      assets
        .map((asset) => asset.assessmentStatus)
        .filter((status) => status !== "Not assessed")
    ),
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      `${asset.name} ${asset.type} ${asset.algorithm} ${asset.owner}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRisk =
      riskFilter === "All" ||
      asset.assessmentStatus === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="p-8 space-y-6">

      {/* Page heading */}
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
            className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 px-4 py-3 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50"
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium"
          >
            <Plus size={18} />
            Add New Asset
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
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
                name="asset_name"
                defaultValue={editingAsset?.name || ""}
                placeholder="e.g. Customer Portal"
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Asset Type
              </label>
              <input
                name="asset_type"
                defaultValue={editingAsset?.type || ""}
                placeholder="e.g. Web Application"
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Cryptographic Algorithm
              </label>
              <input
                name="current_algorithm"
                defaultValue={editingAsset?.algorithm || ""}
                placeholder="e.g. RSA-2048, AES-256"
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Data Sensitivity
              </label>
              <select
                name="data_sensitivity"
                defaultValue={editingAsset?.sensitivity || "Medium"}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Internet Facing
              </label>
              <select
                name="internet_facing"
                defaultValue={editingAsset?.internetFacing || "No"}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Data Retention (Years)
              </label>
              <input
                name="data_retention_years"
                type="number"
                min="0"
                step="1"
                defaultValue={editingAsset?.retentionYears ?? 0}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Asset Owner / Responsible Team
              </label>
              <input
                name="owner"
                defaultValue={editingAsset?.owner || ""}
                placeholder="e.g. IT Security Team"
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                name="status"
                defaultValue={editingAsset?.status || "Active"}
                className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Under Review">Under Review</option>
              </select>
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

      {/* Loading and error messages */}
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

      {/* Summary cards */}
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

      {/* Search and filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3 flex-1 border border-slate-200 rounded-lg px-4 py-3">
          <Search size={19} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, type, algorithm or owner..."
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

      {/* Asset table */}
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
                <th className="px-6 py-4">Sensitivity</th>
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

                        <div>
                          <span className="font-medium text-sm text-slate-800">
                            {asset.name}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {asset.owner}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {asset.type}
                    </td>

                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {asset.algorithm}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {asset.sensitivity}
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
                      {asset.recommendation ||
                        "No recommendation available."}
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
                    colSpan="8"
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
