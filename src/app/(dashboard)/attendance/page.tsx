"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import OrgTreeSelect from "@/components/OrgTreeSelect";
import EmployeeSelect, { EmpOption } from "@/components/EmployeeSelect";
import ProgressModal from "@/components/ProgressModal";
import { orgTreeData, ChunkDetail } from "@/lib/mock-data";
import toast, { Toaster } from "react-hot-toast";

export default function SyncAttendancePage() {
  const [orgIds, setOrgIds] = useState<string[]>([]);
  const [empIds, setEmpIds] = useState<string[]>([]);
  const [empData, setEmpData] = useState<Record<string, string>>({});
  const [employees, setEmployees] = useState<EmpOption[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("Initializing...");
  const [progressSub, setProgressSub] = useState("");
  const [progressStatus, setProgressStatus] = useState<"running" | "success" | "error">("running");
  const [chunks, setChunks] = useState<ChunkDetail[]>([]);
  const displayedChunks = useRef(new Set<number>());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const responseRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  function fmt(d: Date) {
    return d.toISOString().slice(0, 10);
  }
  const maxEndForStart = (start: string) => {
    if (!start) return "";
    const s = new Date(start);
    const max = new Date(s);
    max.setDate(max.getDate() + 29);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return fmt(max > today ? yesterday : max);
  };
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startMax = fmt(yesterday);
  const endMin = startDate || undefined;
  const endMax = startDate ? maxEndForStart(startDate) : undefined;

  const filterEmployees = async () => {
    if (!orgIds.length) {
      toast.error("Please select at least one organization");
      return;
    }
    setLoadingEmployees(true);
    setShowProgress(true);
    setProgress(10);
    setProgressMsg("Fetching employees from organization...");
    setProgressSub("This may take some time for large organizations");
    setProgressStatus("running");
    setEmployees([]);
    setEmpIds([]);
    setEmpData({});
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_ids: orgIds }),
      });
      const data = await res.json();
      if (data.status === 1) {
        setEmployees(data.users || []);
        setProgress(100);
        setProgressMsg(`Employees loaded successfully! (${data.users?.length || 0} employees)`);
        setProgressStatus("success");
        toast.success(`Loaded ${data.users?.length || 0} employees`);
        setTimeout(() => setShowProgress(false), 1500);
      } else {
        setProgressStatus("error");
        setProgressMsg(data.message || "Failed to load employees");
        toast.error(data.message || "Failed to load employees");
        setTimeout(() => setShowProgress(false), 2000);
      }
    } catch {
      setProgressStatus("error");
      setProgressMsg("Network error while loading employees");
      toast.error("Network error");
      setTimeout(() => setShowProgress(false), 2000);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startPolling = useCallback((batchId: string) => {
    stopPolling();
    displayedChunks.current.clear();
    setChunks([]);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/sync/${batchId}`);
        const data = await res.json();
        if (data.status !== 1 || !data.batch) return;
        const batch = data.batch;
        setProgress(batch.progress);
        setProgressMsg(`Completed ${batch.completed_chunks} of ${batch.total_chunks} batches`);
        setProgressSub(`Total records saved: ${batch.total_records || 0} · Status: ${batch.status}`);
        const newChunks: ChunkDetail[] = [];
        for (const c of batch.chunk_details || []) {
          if (!displayedChunks.current.has(c.chunk_index)) {
            displayedChunks.current.add(c.chunk_index);
            newChunks.push(c);
          }
        }
        if (newChunks.length) {
          setChunks((prev) => [...prev, ...newChunks]);
          setTimeout(() => responseRef.current?.scrollTo({ top: responseRef.current.scrollHeight, behavior: "smooth" }), 50);
        }
        if (batch.status === "completed") {
          stopPolling();
          setProgress(100);
          setProgressMsg("Sync completed successfully!");
          setProgressStatus("success");
          toast.success("Attendance sync completed!");
          setIsSyncing(false);
          setTimeout(() => setShowProgress(false), 2000);
          setStartDate("");
          setEndDate("");
          setEmpIds([]);
          setEmpData({});
        } else if (batch.status === "failed") {
          stopPolling();
          setProgressStatus("error");
          setProgressMsg(batch.error_message || "Sync failed");
          toast.error("Sync failed");
          setIsSyncing(false);
          setTimeout(() => setShowProgress(false), 2500);
        }
      } catch {
        // ignore transient errors
      }
    }, 2000);
  }, [stopPolling]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) {
      toast.error("Please wait, sync is in progress...");
      return;
    }
    if (!orgIds.length) {
      toast.error("Please select at least one organization and filter employees");
      return;
    }
    if (!empIds.length) {
      toast.error("Please select at least one employee");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    setIsSyncing(true);
    setShowProgress(true);
    setProgress(0);
    setProgressMsg("Initializing...");
    setProgressSub("Preparing to process attendance data");
    setProgressStatus("running");
    setChunks([]);
    displayedChunks.current.clear();
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_ids: orgIds.join(","),
          emp_ids: empIds.join(","),
          start_date: startDate,
          end_date: endDate,
          emp_data: JSON.stringify(empData),
        }),
      });
      const data = await res.json();
      if (data.status === "chunked") {
        toast.success(`Sync started! ${data.total_chunks} batches queued.`);
        setProgressMsg(`Processing ${data.total_employees} employees in ${data.total_chunks} batches`);
        setProgressSub("This will run in background. You can leave this page.");
        startPolling(data.batch_id);
      } else {
        setProgressStatus("error");
        setProgressMsg(data.message || "Failed to start sync");
        toast.error(data.message || "Failed to start sync");
        setIsSyncing(false);
        setTimeout(() => setShowProgress(false), 2000);
      }
    } catch {
      setProgressStatus("error");
      setProgressMsg("Failed to start sync");
      toast.error("Network error");
      setIsSyncing(false);
      setTimeout(() => setShowProgress(false), 2000);
    }
  };

  useEffect(() => () => stopPolling(), [stopPolling]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Save Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Sync attendance schedules for selected organizations and employees</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <OrgTreeSelect data={orgTreeData} selectedIds={orgIds} onChange={(ids) => { setOrgIds(ids); setEmployees([]); setEmpIds([]); setEmpData({}); }} />
                </div>
                <button type="button" onClick={filterEmployees} disabled={loadingEmployees || !orgIds.length} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                  {loadingEmployees ? "Loading..." : "Filter"}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
              <EmployeeSelect options={employees} selectedIds={empIds} onChange={(ids, data) => { setEmpIds(ids); setEmpData(data); }} disabled={employees.length === 0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={startDate} max={startMax} onChange={(e) => { setStartDate(e.target.value); setEndDate(""); }} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              <p className="text-xs text-gray-500 mt-1">Cannot select today or future dates. Max range 30 days.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={endDate} min={endMin} max={endMax} disabled={!startDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <button type="submit" disabled={isSyncing} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSyncing ? "Syncing..." : "Submit"}
            </button>
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 border border-gray-100 flex flex-col min-h-[420px]">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Response :</h3>
          <div id="responseContainer" ref={responseRef} className="flex-1 overflow-y-auto max-h-[520px] space-y-3">
            {chunks.length === 0 && !isSyncing && (
              <p className="text-sm text-gray-400 text-center py-12">Chunk details will appear here after you start a sync.</p>
            )}
            {chunks.map((chunk) => {
              const missingIn = chunk.missing_punches?.in || 0;
              const missingOut = chunk.missing_punches?.out || 0;
              const missingBoth = chunk.missing_punches?.both || 0;
              const totalMissing = missingIn + missingOut + missingBoth;
              const sync = chunk.people365_sync || { synced: 0, failed: 0 };
              return (
                <div key={chunk.chunk_index} className="chunk-detail">
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-blue-600 text-base">📦 Chunk {chunk.chunk_index}</strong>
                    <small className="text-gray-500">{chunk.completed_at}</small>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <div className="bg-white p-2 rounded border"><span className="text-gray-500 text-xs">👥 Employees</span><div className="font-semibold text-lg">{chunk.employees_processed}</div></div>
                    <div className="bg-white p-2 rounded border"><span className="text-gray-500 text-xs">💾 Records Saved</span><div className="font-semibold text-lg">{chunk.records_saved}</div></div>
                    <div className="bg-white p-2 rounded border"><span className="text-gray-500 text-xs">🔄 People365</span><div className="font-semibold text-sm">{sync.synced} Synced / {sync.failed} Failed</div></div>
                    <div className="bg-white p-2 rounded border"><span className="text-gray-500 text-xs">⏱️ Overtime</span><div className="font-semibold text-lg text-amber-500">{chunk.overtime}</div></div>
                    <div className="bg-white p-2 rounded border"><span className="text-gray-500 text-xs">⚠️ Missing Punches</span><div className="font-semibold text-lg text-red-500">{totalMissing}</div><div className="text-[10px] text-gray-500">In: {missingIn} | Out: {missingOut} | Both: {missingBoth}</div></div>
                    <div className="bg-white p-2 rounded border"><span className="text-gray-500 text-xs">🔒 Restricted</span><div className="font-semibold text-lg text-orange-500">{chunk.restricted_punches}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ProgressModal show={showProgress} percent={progress} message={progressMsg} subMessage={progressSub} status={progressStatus} />
    </div>
  );
}
