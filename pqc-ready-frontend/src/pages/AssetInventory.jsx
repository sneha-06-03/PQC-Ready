
import { useState, useEffect } from "react";

import {
  Search,
  Plus,
  Filter,
  Server,
  ShieldAlert,
} from "lucide-react";

import API from "../services/api";

function AssetInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assets, setAssets] = useState([]);

  // Convert backend data into frontend format.
  const formatAsset = (asset, index) => {
    const sensitivity = asset.data_sensitivity || "medium";
    const migrationStatus =
      asset.pqc_migration_status || "pending";

    return {
      id: asset.id ?? `${asset.name || asset.asset_name}-${index}`,
      backendId: asset.id ?? null,
      name: asset.name || asset.asset_name || "Unnamed Asset",
      type: asset.category || asset.asset_type || "Other",
      algorithm: asset.algorithm || "Not specified",
      keyLength: asset.key_length || "",
      dataSensitivity: sensitivity,
      migrationStatus,
      system: asset.system || "",

      risk:
        sensitivity.charAt(0).toUpperCase() +
        sensitivity.slice(1),

      status:
        migrationStatus === "completed"
          ? "Protected"
          : migrationStatus === "in_progress"
            ? "In Progress"
            : "Needs Migration",

      riskScore: asset.pqc_risk_score ?? null,
    };
  };

  // Convert backend errors into readable text.
  const getErrorMessage = (err, fallback) => {
    const detail = err.response?.data?.detail;
    const message = err.response?.data?.message;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === "string") return item;
          return item?.msg || "Invalid input";
        })
        .join(", ");
    }

    if (detail && typeof detail === "object") {
      return detail.msg || JSON.stringify(detail);
    }

    if (typeof message === "string") {
      return message;
    }

    if (typeof err.message === "string") {
      return err.message;
    }

    return fallback;
  };

  // Fetch assets from backend.
  const fetchAssets = async () => {
    const response = await API.get("/assets");

    const backendAssets = Array.isArray(response.data)
      ? response.data
      : response.data.assets || [];

    const formattedAssets = backendAssets
      .filter((asset) => asset.name || asset.asset_name)
      .map((asset, index) => formatAsset(asset, index));

    setAssets(formattedAssets);
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
        // Update an existing asset.
        if (editingAsset.backendId === null) {
          throw new Error(
            "This asset does not have a valid backend ID. Refresh the inventory and try again."
          );
        }

        await API.put(
          `/assets/${editingAsset.backendId}`,
          payload
        );
      } else {
        // Add a new asset using the backend's required schema.
        await API.post("/assets", payload);
      }

      // Refresh inventory after successful operation.
      await fetchAssets();

      setShowAddForm(false);
      setEditingAsset(null);
      setSearchTerm("");
      setRiskFilter("All");
      setError("");
    } catch (err) {
      console.error("Asset saving failed:", err);

      setError(
        getErrorMessage(
          err,
          "Could not save the asset."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Delete an asset through the backend.
  const handleDeleteAsset = async (asset) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${asset.name}"?`
    );

    if (!confirmDelete) return;

    if (asset.backendId === null) {
      setError(
        "This asset does not have a valid backend ID. Refresh the inventory and try again."
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
          "Could not delete the asset from the backend."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Search and filter assets.
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      `${asset.name} ${asset.type} ${asset.algorithm} ${asset.system}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesRisk =
      riskFilter === "All" || asset.risk === riskFilter;

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
            {/* Asset Name */}
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

            {/* Category */}
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

            {/* Algorithm */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cryptographic Algorithm
              </label>

              <input
                name="algorithm"
                type="text"
                placeholder="e.g. RSA-2048"
                defaultValue={editingAsset?.algorithm || ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none"
              />
            </div>

            {/* System */}
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

            {/* Error Message */}
            {error && (
              <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Form Buttons */}
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
          Processing request...
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
          <p className="text-sm text-slate-500">
            High Sensitivity Assets
          </p>

          <h2 className="text-2xl font-bold mt-2 text-red-600">
            {assets.filter((asset) => asset.risk === "High").length}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Protected Assets</p>

          <h2 className="text-2xl font-bold mt-2 text-green-600">
            {assets.filter((asset) => asset.status === "Protected").length}
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
            <option value="All">All Sensitivities</option>
            <option value="High">High Sensitivity</option>
            <option value="Medium">Medium Sensitivity</option>
            <option value="Low">Low Sensitivity</option>
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
                <th className="px-6 py-4">Sensitivity</th>
                <th className="px-6 py-4">PQC Risk Score</th>
                <th className="px-6 py-4">Status</th>
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

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          asset.risk === "High"
                            ? "bg-red-100 text-red-700"
                            : asset.risk === "Medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {asset.risk}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                      {asset.riskScore !== null
                        ? `${asset.riskScore}/100`
                        : "Not assessed"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 flex items-center gap-2">
                        <ShieldAlert size={15} />
                        {asset.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteAsset(asset)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 text-sm font-medium"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => {
                          setEditingAsset(asset);
                          setError("");
                          setShowAddForm(true);
                        }}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-3"
                      >
                        Edit
                      </button>
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
