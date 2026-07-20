const API_BASE_URL = "http://127.0.0.1:8000/api";

export const uploadAndAnalyzeBinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Analysis failed");
  }

  return await response.json();
};

export const fetchSampleAnalysis = async () => {
  const response = await fetch(`${API_BASE_URL}/sample/generate`);
  if (!response.ok) {
    throw new Error("Failed to generate sample binary analysis");
  }
  return await response.json();
};

export const fetchTelemetryTick = async (fileId, step) => {
  const response = await fetch(`${API_BASE_URL}/telemetry/tick/${fileId}?step=${step}`);
  if (!response.ok) {
    throw new Error("Failed to fetch telemetry tick");
  }
  return await response.json();
};

export const compareBinaries = async (fileA, fileB) => {
  const formData = new FormData();
  formData.append("file_a", fileA);
  formData.append("file_b", fileB);

  const response = await fetch(`${API_BASE_URL}/compare`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Binary comparison failed");
  }

  return await response.json();
};

export const fetchPluginsList = async () => {
  const response = await fetch(`${API_BASE_URL}/plugins`);
  if (!response.ok) {
    throw new Error("Failed to load plugins");
  }
  return await response.json();
};

export const executePlugin = async (pluginId, fileId) => {
  const response = await fetch(`${API_BASE_URL}/plugins/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plugin_id: pluginId, file_id: fileId }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Plugin execution failed");
  }

  return await response.json();
};

export const exportReportFile = async (fileId, format) => {
  const response = await fetch(`${API_BASE_URL}/report/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId, format: format }),
  });

  if (!response.ok) {
    throw new Error("Report export failed");
  }

  if (format === "json" || format === "markdown" || format === "html") {
    const text = await response.text();
    const blob = new Blob([text], {
      type: format === "html" ? "text/html" : format === "json" ? "application/json" : "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opcodevision_report.${format}`;
    a.click();
  } else if (format === "pdf") {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opcodevision_report_${fileId}.pdf`;
    a.click();
  }
};
