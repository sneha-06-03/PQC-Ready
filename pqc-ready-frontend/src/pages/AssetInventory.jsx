
import { useState } from "react";
import { Search, Plus, Filter, Server, ShieldAlert } from "lucide-react";

function AssetInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [assets, setAssets] = useState([
    {
      id: 1,
      name: "Payment Gateway",
      type: "Application",
      algorithm: "RSA-2048",
      risk: "High",
      status: "Needs Migration",
    },
    {
      id: 2,
      name: "Customer Database",
      type: "Database",
      algorithm: "ECC",
      risk: "High",
      status: "Needs Migration",
    },
    {
      id: 3,
      name: "Internal API",
      type: "API",
      algorithm: "AES-256",
      risk: "Low",
      status: "Protected",
    },
    {
      id: 4,
      name: "Web Server",
      type: "Server",
      algorithm: "RSA-3072",
      risk: "Medium",
      status: "Under Review",
    },
  ]);

  const handleAddAsset = (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const newAsset = {
    id: editingAsset ? editingAsset.id : Date.now(),
    name: formData.get("name"),
    type: formData.get("type"),
    algorithm: formData.get("algorithm"),
    risk: formData.get("risk"),
    status: editingAsset ? editingAsset.status : "Under Review",
  };

  if (editingAsset) {
    setAssets((previousAssets) =>
      previousAssets.map((asset) =>
        asset.id === editingAsset.id ? newAsset : asset
      )
    );
  } else {
    setAssets((previousAssets) => [...previousAssets, newAsset]);
  }

  setShowAddForm(false);
  setEditingAsset(null);
  e.target.reset();
  setSearchTerm("");
  setRiskFilter("All");
};

 
 const filteredAssets = assets.filter((asset) => {
  const matchesSearch = `${asset.name} ${asset.type} ${asset.algorithm}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesRisk =
    riskFilter === "All" || asset.risk === riskFilter;

  return matchesSearch && matchesRisk;
});

  return (
    <div className="p-8 space-y-6">

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
  setShowAddForm(true);
}}
  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium"
>
  <Plus size={18} />
  Add New Asset
</button>
      </div>


      {/* Add Asset Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">
  {editingAsset ? "Edit Cryptographic Asset" : "Add New Cryptographic Asset"}
</h3>

          <form onSubmit={handleAddAsset} className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                Asset Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Enter asset name"
                defaultValue={editingAsset ? editingAsset.name : ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Asset Type
              </label>
              <select
                name="type"
                defaultValue={editingAsset ? editingAsset.type : ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              >
                <option value="">Select type</option>
                <option value="Application">Application</option>
                <option value="Database">Database</option>
                <option value="API">API</option>
                <option value="Server">Server</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cryptographic Algorithm
              </label>
              <input
                name="algorithm"
                type="text"
                placeholder="e.g. RSA-2048"
                defaultValue={editingAsset ? editingAsset.algorithm : ""}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Risk Level
              </label>
              <select
                name="risk"
                defaultValue={editingAsset ? editingAsset.risk : "High"}
                required
                className="w-full border border-slate-200 rounded-lg p-3 text-sm"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg text-sm font-medium"
              >
                {editingAsset ? "Update Asset" : "Save Asset"}
              </button>

              <button
                type="button"
               onClick={() => {
  setShowAddForm(false);
  setEditingAsset(null);
}}
                className="border border-slate-200 px-5 py-3 rounded-lg text-sm text-slate-600"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">Total Assets</p>
          <h2 className="text-2xl font-bold mt-2 text-slate-800">{assets.length}</h2>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">High Risk Assets</p>
          <h2 className="text-2xl font-bold mt-2 text-red-600">{assets.filter((asset) => asset.risk === "High").length}</h2>
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
    <option value="All">All Risks</option>
    <option value="High">High Risk</option>
    <option value="Medium">Medium Risk</option>
    <option value="Low">Low Risk</option>
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
                <th className="px-6 py-4">Risk Level</th>
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        asset.risk === "High"
                          ? "bg-red-100 text-red-700"
                          : asset.risk === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {asset.risk}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600 flex items-center gap-2">
                        <ShieldAlert size={15} />
                        {asset.status}
                      </span>
                    </td>
                   <td className="px-6 py-4">
  <button
    onClick={() => {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this asset?"
      );

      if (confirmDelete) {
        setAssets((previousAssets) =>
          previousAssets.filter((item) => item.id !== asset.id)
        );
      }
    }}
    className="text-red-600 hover:text-red-800 text-sm font-medium"
  >
    Delete
  </button>

  <button
    onClick={() => {
  setEditingAsset(asset);
  setShowAddForm(true);
}}
    className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-3"
  >
    Edit
  </button>
</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-500 text-sm">
                    No matching assets found.
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
