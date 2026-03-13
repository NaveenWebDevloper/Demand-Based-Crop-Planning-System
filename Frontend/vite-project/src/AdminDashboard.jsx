import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./Context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import { apiUrl } from "./config/api";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [marketDemands, setMarketDemands] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSubmitLoading, setMarketSubmitLoading] = useState(false);
  const [marketMessage, setMarketMessage] = useState("");
  const [selectedMarketImage, setSelectedMarketImage] = useState(null);
  const [marketImagePreview, setMarketImagePreview] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [marketForm, setMarketForm] = useState({
    crop: "",
    region: "",
    demandLevel: "medium",
    season: "",
    quantity: "",
    quantityUnit: "kg",
    price: "",
    imageUrl: "",
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        axios.get(apiUrl("/api/admin/pending-users"), {
          withCredentials: true,
        }),
        axios.get(apiUrl("/api/admin/users"), {
          withCredentials: true,
        }),
      ]);
      setPendingUsers(pendingRes.data.users);
      setAllUsers(allRes.data.users);
      await fetchMarketDemands();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketDemands = async () => {
    setMarketLoading(true);
    try {
      const res = await axios.get(apiUrl("/api/market/demand"), {
        withCredentials: true,
      });
      setMarketDemands(res.data.demands || []);
    } catch (error) {
      console.error("Error fetching market demands:", error);
    } finally {
      setMarketLoading(false);
    }
  };

  const handleMarketInput = (e) => {
    const { name, value } = e.target;
    setMarketForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarketImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedMarketImage(null);
      setMarketImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMarketMessage("Please select a valid image file.");
      setSelectedMarketImage(null);
      setMarketImagePreview("");
      return;
    }

    setMarketMessage("");
    setSelectedMarketImage(file);
    setMarketImagePreview(URL.createObjectURL(file));
  };

  const uploadMarketImageToImageKit = async () => {
    if (!selectedMarketImage) {
      return marketForm.imageUrl || "";
    }

    const formData = new FormData();
    formData.append("image", selectedMarketImage);

    const uploadRes = await axios.post(apiUrl("/api/image/upload"), formData, {
      withCredentials: true,
    });

    return uploadRes?.data?.imageUrl || "";
  };

  const handleMarketSubmit = async (e) => {
    e.preventDefault();
    setMarketSubmitLoading(true);
    setMarketMessage("");

    try {
      const uploadedImageUrl = await uploadMarketImageToImageKit();

      await axios.post(
        apiUrl("/api/market/demand"),
        {
          ...marketForm,
          imageUrl: uploadedImageUrl,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      setMarketMessage("Market demand added successfully with uploaded image.");
      setMarketForm({
        crop: "",
        region: "",
        demandLevel: "medium",
        season: "",
        quantity: "",
        quantityUnit: "kg",
        price: "",
        imageUrl: "",
      });
      setSelectedMarketImage(null);
      setMarketImagePreview("");
      setFileInputKey((k) => k + 1);
      await fetchMarketDemands();
    } catch (error) {
      setMarketMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to add market demand.",
      );
    } finally {
      setMarketSubmitLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    try {
      await axios.patch(
        apiUrl(`/api/admin/approve/${userId}`),
        {},
        { withCredentials: true },
      );
      await fetchData();
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    try {
      await axios.patch(
        apiUrl(`/api/admin/reject/${userId}`),
        {},
        { withCredentials: true },
      );
      await fetchData();
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading(userId);
    try {
      await axios.delete(apiUrl(`/api/admin/user/${userId}`), {
        withCredentials: true,
      });
      await fetchData();
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDemandLevelBadge = (level) => {
    const styles = {
      low: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
      high: "bg-green-100 text-green-700 border-green-200",
    };

    const normalizedLevel = (level || "").toLowerCase();

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[normalizedLevel] || "bg-slate-100 text-slate-700 border-slate-200"}`}
      >
        {normalizedLevel
          ? normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)
          : "N/A"}
      </span>
    );
  };

  const getSeasonBadge = (season) => {
    const normalizedSeason = (season || "").toLowerCase().trim();

    if (normalizedSeason === "summer" || normalizedSeason === "hot") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-orange-100 text-orange-700 border-orange-200">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0L16.95 7.05M7.05 16.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          {season}
        </span>
      );
    }

    if (normalizedSeason === "winter") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-sky-100 text-sky-700 border-sky-200">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 2v20m0-20 3 3m-3-3-3 3m3 17-3-3m3 3 3-3M4.93 4.93l14.14 14.14M4.93 19.07 19.07 4.93M2 12h20"
            />
          </svg>
          {season}
        </span>
      );
    }

    if (
      normalizedSeason === "rainy" ||
      normalizedSeason === "rain" ||
      normalizedSeason === "monsoon"
    ) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-200">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h8a4 4 0 10-.436-7.976A5.5 5.5 0 004 11.5 3.5 3.5 0 003 15zm6 4v2m3-2v2m3-2v2"
            />
          </svg>
          {season}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-200">
        {season || "N/A"}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="glass-card rounded-3xl p-8 mb-8 border border-white/60 shadow-[0_16px_40px_rgba(16,185,129,0.12)]">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center flex-wrap gap-4">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-emerald-700/80 mb-2">
                  Administration Panel
                </p>
                <h1 className="text-3xl font-bold ios-title mb-1 text-slate-900">
                  Admin Dashboard
                </h1>
                <p className="ios-body text-slate-600">
                  Welcome back, {user?.name}! Manage users and approvals.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("market")}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
                >
                  View Market Demand
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending Approvals</p>
                  <p className="text-2xl font-bold">{pendingUsers.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approved Users</p>
                  <p className="text-2xl font-bold">
                    {allUsers.filter((u) => u.status === "approved").length}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{allUsers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-card rounded-3xl p-8 border border-white/60 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 p-1.5 rounded-2xl bg-white/70 border border-slate-200/70 gap-1.5 mb-6">
              <button
                onClick={() => setActiveTab("pending")}
                className={`w-full px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "pending"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-transparent text-slate-600 hover:bg-white"
                }`}
              >
                Pending Approvals ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`w-full px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-transparent text-slate-600 hover:bg-white"
                }`}
              >
                All Users ({allUsers.length})
              </button>
              <button
                onClick={() => setActiveTab("market")}
                className={`w-full px-5 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "market"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-transparent text-slate-600 hover:bg-white"
                }`}
              >
                Market Demand ({marketDemands.length})
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 overflow-hidden">
                {activeTab === "pending" ? (
                  pendingUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p>No pending approvals</p>
                    </div>
                  ) : (
                    <>
                      <div className="md:hidden space-y-3 p-3">
                        {pendingUsers.map((pendingUser) => (
                          <article
                            key={pendingUser._id}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <h3 className="font-semibold text-slate-900">
                              {pendingUser.name}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {pendingUser.email}
                            </p>
                            <p className="text-sm text-slate-600">
                              {pendingUser.phone}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {pendingUser.address}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleApprove(pendingUser._id)}
                                disabled={actionLoading === pendingUser._id}
                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                              >
                                {actionLoading === pendingUser._id
                                  ? "..."
                                  : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(pendingUser._id)}
                                disabled={actionLoading === pendingUser._id}
                                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
                              >
                                {actionLoading === pendingUser._id
                                  ? "..."
                                  : "Reject"}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/70">
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Name
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Email
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Phone
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Address
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingUsers.map((pendingUser) => (
                              <tr
                                key={pendingUser._id}
                                className="border-b border-slate-100 hover:bg-emerald-50/30"
                              >
                                <td className="py-4 px-4 font-medium">
                                  {pendingUser.name}
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  {pendingUser.email}
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  {pendingUser.phone}
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  {pendingUser.address}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleApprove(pendingUser._id)
                                      }
                                      disabled={
                                        actionLoading === pendingUser._id
                                      }
                                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                                    >
                                      {actionLoading === pendingUser._id
                                        ? "..."
                                        : "Approve"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleReject(pendingUser._id)
                                      }
                                      disabled={
                                        actionLoading === pendingUser._id
                                      }
                                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
                                    >
                                      {actionLoading === pendingUser._id
                                        ? "..."
                                        : "Reject"}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )
                ) : activeTab === "all" ? (
                  allUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p>No users found</p>
                    </div>
                  ) : (
                    <>
                      <div className="md:hidden space-y-3 p-3">
                        {allUsers.map((u) => (
                          <article
                            key={u._id}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <div className="flex flex-col gap-2">
                              <div>
                                <h3 className="font-semibold text-slate-900">
                                  {u.name}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                  {u.email}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {u.phone}
                                </p>
                              </div>
                              <div>{getStatusBadge(u.status)}</div>
                            </div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {u.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(u._id)}
                                    disabled={actionLoading === u._id}
                                    className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(u._id)}
                                    disabled={actionLoading === u._id}
                                    className="w-full px-3 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {u.status === "rejected" && (
                                <button
                                  onClick={() => handleApprove(u._id)}
                                  disabled={actionLoading === u._id}
                                  className="w-full px-3 py-2 bg-green-400 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(u._id)}
                                disabled={actionLoading === u._id}
                                className="w-full px-3 py-2 bg-red-400 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm sm:col-span-2"
                              >
                                Delete
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>

                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/70">
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Name
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Email
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Phone
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Status
                              </th>
                              <th className="text-left py-4 px-4 font-semibold text-slate-600">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {allUsers.map((u) => (
                              <tr
                                key={u._id}
                                className="border-b border-slate-100 hover:bg-emerald-50/30"
                              >
                                <td className="py-4 px-4 font-medium">
                                  {u.name}
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  {u.email}
                                </td>
                                <td className="py-4 px-4 text-gray-600">
                                  {u.phone}
                                </td>
                                <td className="py-4 px-4">
                                  {getStatusBadge(u.status)}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex gap-2">
                                    {u.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() => handleApprove(u._id)}
                                          disabled={actionLoading === u._id}
                                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleReject(u._id)}
                                          disabled={actionLoading === u._id}
                                          className="px-3 py-1.5 bg-orange-400 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 text-sm"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    {u.status === "rejected" && (
                                      <button
                                        onClick={() => handleApprove(u._id)}
                                        disabled={actionLoading === u._id}
                                        className="px-3 py-1.5 bg-green-400 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm"
                                      >
                                        Approve
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDelete(u._id)}
                                      disabled={actionLoading === u._id}
                                      className="px-3 py-1.5 bg-red-400 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )
                ) : (
                  <div className="space-y-6">
                    <form
                      onSubmit={handleMarketSubmit}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 rounded-2xl p-6 border border-slate-200/70 shadow-sm"
                    >
                      <input
                        type="text"
                        name="crop"
                        value={marketForm.crop}
                        onChange={handleMarketInput}
                        placeholder="Crop"
                        className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="text"
                        name="region"
                        value={marketForm.region}
                        onChange={handleMarketInput}
                        placeholder="Region"
                        className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        required
                      />
                      <select
                        name="demandLevel"
                        value={marketForm.demandLevel}
                        onChange={handleMarketInput}
                        className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input
                        type="text"
                        name="season"
                        value={marketForm.season}
                        onChange={handleMarketInput}
                        placeholder="Season"
                        className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        required
                      />
                      <input
                        type="number"
                        name="quantity"
                        value={marketForm.quantity}
                        onChange={handleMarketInput}
                        placeholder="Total available quantity (e.g., 100)"
                        className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        required
                      />
                      <select
                        name="quantityUnit"
                        value={marketForm.quantityUnit}
                        onChange={handleMarketInput}
                        className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        <option value="kg">kg</option>
                        <option value="quintal">quintal</option>
                        <option value="ton">ton</option>
                      </select>
                      <input
                        type="number"
                        name="price"
                        value={marketForm.price}
                        onChange={handleMarketInput}
                        placeholder="Price for 1 selected unit"
                        className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        required
                      />
                      <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        <p className="font-semibold">
                          You are setting: 1 {marketForm.quantityUnit || "kg"} ={" "}
                          {marketForm.price || "..."}
                        </p>
                        <p className="mt-1 text-emerald-800">
                          Example: if unit is "kg" and price is "30", farmers
                          see it as 30 per kg.
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Upload Market Image
                        </label>
                        <input
                          key={fileInputKey}
                          type="file"
                          accept="image/*"
                          onChange={handleMarketImageChange}
                          className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 w-full file:mr-4 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200"
                          required
                        />
                        {marketImagePreview && (
                          <img
                            src={marketImagePreview}
                            alt="Selected market"
                            className="mt-3 h-24 w-24 rounded-lg object-cover border border-gray-200"
                          />
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={marketSubmitLoading}
                        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60 md:col-span-2 font-medium shadow-sm"
                      >
                        {marketSubmitLoading
                          ? "Submitting..."
                          : "Add Market Demand"}
                      </button>

                      {marketMessage && (
                        <p className="text-sm text-slate-700 md:col-span-2">
                          {marketMessage}
                        </p>
                      )}
                    </form>

                    {marketLoading ? (
                      <p className="text-gray-500">
                        Loading market demand records...
                      </p>
                    ) : marketDemands.length === 0 ? (
                      <p className="text-gray-500">
                        No market demand records found.
                      </p>
                    ) : (
                      <>
                        <div className="md:hidden space-y-4">
                          {marketDemands.map((demand) => (
                            <article
                              key={demand._id}
                              className="rounded-2xl border border-slate-200/80 bg-white/80 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h3 className="font-semibold text-slate-900 text-lg">
                                    {demand.crop}
                                  </h3>
                                  <p className="text-sm text-slate-600">
                                    {demand.region}
                                  </p>
                                </div>
                                {getDemandLevelBadge(demand.demandLevel)}
                              </div>

                              <div className="mt-3 space-y-2 text-sm">
                                <p className="text-slate-700">
                                  <span className="text-slate-500">
                                    Season:
                                  </span>{" "}
                                  {demand.season}
                                </p>
                                <p className="text-slate-700">
                                  <span className="text-slate-500">
                                    Quantity:
                                  </span>{" "}
                                  {demand.quantity}{" "}
                                  {demand.quantityUnit || "kg"}
                                </p>
                                <p className="text-slate-700">
                                  <span className="text-slate-500">Price:</span>{" "}
                                  {demand.price} / {demand.quantityUnit || "kg"}
                                </p>
                              </div>

                              <div className="mt-3">
                                {demand.imageUrl ? (
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={demand.imageUrl}
                                      alt={`${demand.crop} demand`}
                                      className="h-12 w-12 rounded-md object-cover border border-gray-200"
                                    />
                                    <a
                                      href={demand.imageUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-emerald-700 underline font-medium"
                                    >
                                      View Image
                                    </a>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    No image
                                  </p>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/70">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200 bg-slate-50/70">
                                <th className="text-left py-3 px-3 font-semibold text-slate-600">
                                  Crop
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-600">
                                  Region
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-600">
                                  Demand
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-600">
                                  Season
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-600">
                                  Quantity
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-600">
                                  Price
                                </th>
                                <th className="text-left py-3 px-3 font-semibold text-slate-600">
                                  Image
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {marketDemands.map((demand) => (
                                <tr
                                  key={demand._id}
                                  className="border-b border-slate-100 hover:bg-emerald-50/30"
                                >
                                  <td className="py-3 px-3 font-medium">
                                    {demand.crop}
                                  </td>
                                  <td className="py-3 px-3 text-gray-600">
                                    {demand.region}
                                  </td>
                                  <td className="py-3 px-3 text-gray-600">
                                    {getDemandLevelBadge(demand.demandLevel)}
                                  </td>
                                  <td className="py-3 px-3 text-gray-600">
                                    {getSeasonBadge(demand.season)}
                                  </td>
                                  <td className="py-3 px-3 text-gray-600">
                                    {demand.quantity}{" "}
                                    {demand.quantityUnit || "kg"}
                                  </td>
                                  <td className="py-3 px-3 text-gray-600">
                                    {demand.price} /{" "}
                                    {demand.quantityUnit || "kg"}
                                  </td>
                                  <td className="py-3 px-3 text-gray-600">
                                    {demand.imageUrl ? (
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={demand.imageUrl}
                                          alt={`${demand.crop} demand`}
                                          className="h-12 w-12 rounded-md object-cover border border-gray-200"
                                        />
                                        <a
                                          href={demand.imageUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-emerald-700 underline font-medium"
                                        >
                                          View Image
                                        </a>
                                      </div>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
