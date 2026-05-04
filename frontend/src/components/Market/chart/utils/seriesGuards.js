export const safeSetData = (series, data) => {
  if (!series || !Array.isArray(data) || data.length < 2) return;
  try { series.setData(data); } catch {}
};

export const safeUpdate = (series, bar) => {
  if (!series || !bar) return;
  try { series.update(bar); } catch {}
};
