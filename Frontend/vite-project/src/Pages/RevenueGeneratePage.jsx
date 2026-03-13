import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { apiUrl } from "../config/api";

const RevenueGeneratePage = () => {
  const [marketDemands, setMarketDemands] = useState([]);
  const [estimateHistory, setEstimateHistory] = useState([]);
  const [filterCrop, setFilterCrop] = useState("all");
  const [filterSeason, setFilterSeason] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [cultivationCost, setCultivationCost] = useState(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [hasAutoExpandedHistory, setHasAutoExpandedHistory] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    demandId: location.state?.demandId || "",
    plannedQuantity: "",
    landArea: "",
    landAreaUnit: "acre",
    seeds: "",
    fertilizers: "",
    pesticides: "",
    labor: "",
    irrigation: "",
    machinery: "",
    transportation: "",
  });

  const cultivationFields = [
    { key: "seeds", label: "Seeds Cost" },
    { key: "fertilizers", label: "Fertilizers Cost" },
    { key: "pesticides", label: "Pesticides Cost" },
    { key: "labor", label: "Labor Cost" },
    { key: "irrigation", label: "Irrigation Cost" },
    { key: "machinery", label: "Machinery Cost" },
    { key: "transportation", label: "Transportation Cost" },
  ];

  useEffect(() => {
    fetchMarketDemands();
    fetchEstimateHistory();
  }, []);

  const fetchMarketDemands = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl("/api/market/demand"), {
        withCredentials: true,
      });
      const demands = res.data.demands || [];
      setMarketDemands(demands);

      if (!form.demandId && demands.length > 0) {
        setForm((prev) => ({ ...prev, demandId: demands[0]._id }));
      }
    } catch (error) {
      console.error("Error loading market demands:", error);
      setMessage("Unable to load market demand data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEstimateHistory = async () => {
    try {
      const res = await axios.get(
        apiUrl("/api/market/revenue-estimate/history"),
        {
          withCredentials: true,
        },
      );
      setEstimateHistory(res.data.estimates || []);
    } catch (error) {
      console.error("Error loading estimate history:", error);
    }
  };

  const selectedDemand = useMemo(
    () => marketDemands.find((d) => d._id === form.demandId),
    [marketDemands, form.demandId],
  );

  const cropOptions = useMemo(() => {
    return [
      ...new Set(estimateHistory.map((item) => item.crop).filter(Boolean)),
    ];
  }, [estimateHistory]);

  const seasonOptions = useMemo(() => {
    return [
      ...new Set(estimateHistory.map((item) => item.season).filter(Boolean)),
    ];
  }, [estimateHistory]);

  const filteredHistory = useMemo(() => {
    return estimateHistory.filter((item) => {
      const cropMatch = filterCrop === "all" || item.crop === filterCrop;
      const seasonMatch =
        filterSeason === "all" || item.season === filterSeason;
      return cropMatch && seasonMatch;
    });
  }, [estimateHistory, filterCrop, filterSeason]);

  useEffect(() => {
    if (filteredHistory.length === 0) {
      setExpandedHistoryId(null);
      return;
    }

    if (
      expandedHistoryId &&
      !filteredHistory.some((item) => item._id === expandedHistoryId)
    ) {
      setExpandedHistoryId(null);
      return;
    }

    if (hasAutoExpandedHistory) return;

    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches;

    if (isDesktop) {
      setExpandedHistoryId(filteredHistory[0]._id);
      setHasAutoExpandedHistory(true);
    }
  }, [filteredHistory, expandedHistoryId, hasAutoExpandedHistory]);

  const exportFilteredHistoryCsv = () => {
    if (filteredHistory.length === 0) {
      setMessage("No filtered records available to export.");
      return;
    }

    const headers = [
      "Crop",
      "Region",
      "Season",
      "LandArea",
      "LandAreaUnit",
      "PlannedQuantity",
      "QuantityUnit",
      "Seeds",
      "Fertilizers",
      "Pesticides",
      "Labor",
      "Irrigation",
      "Machinery",
      "Transportation",
      "TotalCultivationCost",
      "CostPerAcre",
      "CostPerHectare",
      "ExpectedRevenue",
      "EstimatedCost",
      "EstimatedProfit",
      "CreatedAt",
    ];

    const rows = filteredHistory.map((item) => [
      item.crop,
      item.region,
      item.season,
      item.landArea,
      item.landAreaUnit,
      item.plannedQuantity,
      item.quantityUnit,
      item.cultivationCostBreakdown?.seeds,
      item.cultivationCostBreakdown?.fertilizers,
      item.cultivationCostBreakdown?.pesticides,
      item.cultivationCostBreakdown?.labor,
      item.cultivationCostBreakdown?.irrigation,
      item.cultivationCostBreakdown?.machinery,
      item.cultivationCostBreakdown?.transportation,
      item.cultivationCostBreakdown?.totalCost,
      item.cultivationCostBreakdown?.costPerAcre,
      item.cultivationCostBreakdown?.costPerHectare,
      item.expectedRevenue,
      item.estimatedCost,
      item.estimatedProfit,
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
    ]);

    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "revenue-estimate-history.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCultivationCost(null);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildCultivationPayload = () => ({
    landArea: Number(form.landArea),
    landAreaUnit: form.landAreaUnit,
    seeds: Number(form.seeds),
    fertilizers: Number(form.fertilizers),
    pesticides: Number(form.pesticides),
    labor: Number(form.labor),
    irrigation: Number(form.irrigation),
    machinery: Number(form.machinery),
    transportation: Number(form.transportation),
  });

  const handleEstimateCultivationCost = async () => {
    setSubmitting(true);
    setMessage("");

    try {
      const res = await axios.post(
        apiUrl("/api/market/revenue-estimate/cultivation-cost"),
        buildCultivationPayload(),
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      setCultivationCost(res.data.cultivationCost || null);
      setMessage("Cultivation cost estimated successfully.");
    } catch (error) {
      setCultivationCost(null);
      setMessage(
        error?.response?.data?.message ||
          "Failed to estimate cultivation cost.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setEstimate(null);

    if (!cultivationCost) {
      setMessage("Please estimate cultivation cost before generating revenue.");
      setSubmitting(false);
      return;
    }

    if (
      selectedDemand &&
      Number(form.plannedQuantity) > Number(selectedDemand.quantity)
    ) {
      setMessage(
        `Planned quantity cannot exceed ${selectedDemand.quantity} ${selectedDemand.quantityUnit || "kg"}.`,
      );
      setSubmitting(false);
      return;
    }

    try {
      const res = await axios.post(
        apiUrl("/api/market/revenue-estimate/save"),
        {
          demandId: form.demandId,
          plannedQuantity: Number(form.plannedQuantity),
          ...buildCultivationPayload(),
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      setEstimate(res.data.estimate);
      setMessage("Revenue estimate generated and saved successfully.");
      await fetchEstimateHistory();
    } catch (error) {
      setMessage(
        error?.response?.data?.message ||
          "Failed to generate revenue estimate.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-4 bg-gradient-to-br from-emerald-50 via-white to-lime-50">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="glass-card rounded-3xl p-8 border border-white/60 shadow-[0_16px_40px_rgba(16,185,129,0.12)]">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">
                  Revenue Generator
                </h1>
                <p className="text-slate-600">
                  Estimate expected revenue from admin market demand prices.
                </p>
              </div>
              <button
                onClick={() => navigate("/farmer")}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 bg-white/80">
            {loading ? (
              <p className="text-slate-500">Loading market demand list...</p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Admin Demand Crop
                  </label>
                  <select
                    name="demandId"
                    value={form.demandId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300"
                    required
                  >
                    {marketDemands.map((demand) => (
                      <option key={demand._id} value={demand._id}>
                        {demand.crop} - {demand.region} - Qty {demand.quantity}{" "}
                        {demand.quantityUnit || "kg"} - Price {demand.price}/
                        {demand.quantityUnit || "kg"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Planned Quantity ({selectedDemand?.quantityUnit || "kg"})
                  </label>
                  <input
                    name="plannedQuantity"
                    type="number"
                    min="1"
                    max={selectedDemand?.quantity || undefined}
                    value={form.plannedQuantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300"
                    placeholder={`Enter quantity in ${selectedDemand?.quantityUnit || "kg"}`}
                    required
                  />
                  {selectedDemand && (
                    <p className="mt-1 text-xs text-slate-500">
                      Maximum allowed: {selectedDemand.quantity}{" "}
                      {selectedDemand.quantityUnit || "kg"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Land Area
                  </label>
                  <input
                    name="landArea"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.landArea}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300"
                    placeholder="Enter total land area"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Land Area Unit
                  </label>
                  <select
                    name="landAreaUnit"
                    value={form.landAreaUnit}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300"
                    required
                  >
                    <option value="acre">Acre</option>
                    <option value="hectare">Hectare</option>
                  </select>
                </div>

                {cultivationFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {field.label}
                    </label>
                    <input
                      name={field.key}
                      type="number"
                      min="0"
                      step="0.01"
                      value={form[field.key]}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300"
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      required
                    />
                  </div>
                ))}

                {selectedDemand && (
                  <div className="md:col-span-2 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-sm text-slate-700">
                    Using price from admin demand:{" "}
                    <span className="font-semibold">
                      {selectedDemand.price}
                    </span>{" "}
                    per {selectedDemand.quantityUnit || "kg"} for{" "}
                    <span className="font-semibold">{selectedDemand.crop}</span>{" "}
                    in{" "}
                    <span className="font-semibold">
                      {selectedDemand.region}
                    </span>{" "}
                    ({selectedDemand.season}). Available quantity:{" "}
                    {selectedDemand.quantity}{" "}
                    {selectedDemand.quantityUnit || "kg"}.
                    <p className="mt-2 font-semibold text-emerald-900">
                      Revenue basis: 1 {selectedDemand.quantityUnit || "kg"} ={" "}
                      {selectedDemand.price}. If you enter{" "}
                      {form.plannedQuantity || 0}{" "}
                      {selectedDemand.quantityUnit || "kg"}, expected revenue is{" "}
                      {(
                        Number(form.plannedQuantity || 0) *
                        Number(selectedDemand.price || 0)
                      ).toFixed(2)}
                      .
                    </p>
                  </div>
                )}

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleEstimateCultivationCost}
                    disabled={submitting || !form.demandId}
                    className="px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60"
                  >
                    {submitting ? "Estimating..." : "Estimate Cultivation Cost"}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !form.demandId || !cultivationCost}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {submitting ? "Generating..." : "Generate Revenue"}
                  </button>
                </div>

                {cultivationCost && (
                  <div className="md:col-span-2 p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-slate-700 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-slate-500">Total Cultivation Cost</p>
                      <p className="font-semibold text-slate-900">
                        {cultivationCost.totalCost}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Cost Per Acre</p>
                      <p className="font-semibold text-slate-900">
                        {cultivationCost.costPerAcre?.toFixed?.(2) ?? "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Cost Per Hectare</p>
                      <p className="font-semibold text-slate-900">
                        {cultivationCost.costPerHectare?.toFixed?.(2) ?? "-"}
                      </p>
                    </div>
                  </div>
                )}

                {message && (
                  <p className="md:col-span-2 text-sm text-slate-700">
                    {message}
                  </p>
                )}
              </form>
            )}
          </div>

          {estimate && (
            <div className="glass-card rounded-2xl p-6 border border-slate-200/70 bg-white/90">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Estimated Result
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-500">Expected Revenue</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {estimate.expectedRevenue}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-500">Estimated Cost</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {estimate.estimatedCost}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-sm text-slate-500">Estimated Profit</p>
                  <p
                    className={`text-2xl font-bold ${estimate.estimatedProfit >= 0 ? "text-emerald-700" : "text-rose-600"}`}
                  >
                    {estimate.estimatedProfit}
                  </p>
                </div>
              </div>
              <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                Revenue basis used: {estimate.plannedQuantity}{" "}
                {estimate.quantityUnit || "kg"} x {estimate.adminPricePerUnit}{" "}
                per {estimate.quantityUnit || "kg"} = {estimate.expectedRevenue}
              </p>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 border border-slate-200/70 bg-white/90">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">
                Saved Estimate History
              </h2>
              <button
                onClick={exportFilteredHistoryCsv}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm"
              >
                Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Filter By Crop
                </label>
                <select
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                >
                  <option value="all">All Crops</option>
                  {cropOptions.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                  Filter By Season
                </label>
                <select
                  value={filterSeason}
                  onChange={(e) => setFilterSeason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300"
                >
                  <option value="all">All Seasons</option>
                  {seasonOptions.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <p className="text-slate-500">No saved estimates yet.</p>
            ) : (
              <>
                <div className="md:hidden space-y-4">
                  {filteredHistory.map((item) => {
                    const isExpanded = expandedHistoryId === item._id;

                    return (
                      <article
                        key={item._id}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 text-lg">
                              {item.crop}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {item.region} • {item.season}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHistoryId(isExpanded ? null : item._id)
                            }
                            className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-sm"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                        </div>

                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <p className="text-slate-700">
                            <span className="text-slate-500">Qty:</span>{" "}
                            {item.plannedQuantity} {item.quantityUnit || "kg"}
                          </p>
                          <p className="text-slate-700">
                            <span className="text-slate-500">Revenue:</span>{" "}
                            {item.expectedRevenue}
                          </p>
                          <p className="text-slate-700">
                            <span className="text-slate-500">Cost:</span>{" "}
                            {item.estimatedCost}
                          </p>
                          <p
                            className={`font-semibold ${item.estimatedProfit >= 0 ? "text-emerald-700" : "text-rose-600"}`}
                          >
                            <span className="text-slate-500 font-normal">
                              Profit:
                            </span>{" "}
                            {item.estimatedProfit}
                          </p>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 grid grid-cols-1 gap-2 text-sm rounded-lg bg-slate-50 border border-slate-200 p-3">
                            <p className="text-slate-700">
                              <span className="text-slate-500">Land:</span>{" "}
                              {item.landArea
                                ? `${item.landArea} ${item.landAreaUnit || "acre"}`
                                : "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">Seeds:</span>{" "}
                              {item.cultivationCostBreakdown?.seeds ?? "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">
                                Fertilizers:
                              </span>{" "}
                              {item.cultivationCostBreakdown?.fertilizers ??
                                "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">
                                Pesticides:
                              </span>{" "}
                              {item.cultivationCostBreakdown?.pesticides ?? "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">Labor:</span>{" "}
                              {item.cultivationCostBreakdown?.labor ?? "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">
                                Irrigation:
                              </span>{" "}
                              {item.cultivationCostBreakdown?.irrigation ?? "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">Machinery:</span>{" "}
                              {item.cultivationCostBreakdown?.machinery ?? "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">
                                Transportation:
                              </span>{" "}
                              {item.cultivationCostBreakdown?.transportation ??
                                "-"}
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-500">
                                Total Cost:
                              </span>{" "}
                              {item.cultivationCostBreakdown?.totalCost ??
                                item.estimatedCost}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>

                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Crop
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Region
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Season
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Qty
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Revenue
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Cost
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Profit
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-600">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((item) => {
                        const isExpanded = expandedHistoryId === item._id;

                        return (
                          <React.Fragment key={item._id}>
                            <tr className="border-b border-slate-100">
                              <td className="py-3 px-3 font-medium text-slate-800">
                                {item.crop}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                {item.region}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                {item.season}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                {item.plannedQuantity}{" "}
                                {item.quantityUnit || "kg"}
                              </td>
                              <td className="py-3 px-3 text-emerald-700 font-semibold">
                                {item.expectedRevenue}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                {item.estimatedCost}
                              </td>
                              <td
                                className={`py-3 px-3 font-semibold ${item.estimatedProfit >= 0 ? "text-emerald-700" : "text-rose-600"}`}
                              >
                                {item.estimatedProfit}
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedHistoryId(
                                      isExpanded ? null : item._id,
                                    )
                                  }
                                  className="px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                                >
                                  <span className="inline-flex items-center gap-1.5">
                                    <span>{isExpanded ? "Hide" : "View"}</span>
                                    <span
                                      className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                                    >
                                      ^
                                    </span>
                                  </span>
                                </button>
                              </td>
                            </tr>

                            <tr
                              className={`border-b border-slate-100 bg-slate-50/60 transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}
                            >
                              <td
                                colSpan={8}
                                className={`px-4 transition-all duration-300 ${isExpanded ? "py-4" : "py-0"}`}
                              >
                                <div
                                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[1200px]" : "max-h-0"}`}
                                >
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Land
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.landArea
                                        ? `${item.landArea} ${item.landAreaUnit || "acre"}`
                                        : "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Seeds
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown?.seeds ??
                                        "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Fertilizers
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown
                                        ?.fertilizers ?? "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Pesticides
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown
                                        ?.pesticides ?? "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Labor
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown?.labor ??
                                        "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Irrigation
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown
                                        ?.irrigation ?? "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Machinery
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown
                                        ?.machinery ?? "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Transportation
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown
                                        ?.transportation ?? "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Total Cost
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown
                                        ?.totalCost ?? item.estimatedCost}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Cost Per Acre
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown?.costPerAcre?.toFixed?.(
                                        2,
                                      ) ?? "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Cost Per Hectare
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.cultivationCostBreakdown?.costPerHectare?.toFixed?.(
                                        2,
                                      ) ?? "-"}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                                      Created At
                                    </p>
                                    <p className="font-semibold text-slate-900 mt-1">
                                      {item.createdAt
                                        ? new Date(
                                            item.createdAt,
                                          ).toLocaleString()
                                        : "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RevenueGeneratePage;
