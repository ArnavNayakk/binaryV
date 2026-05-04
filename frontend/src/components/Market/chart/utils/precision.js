export const getPricePrecision = (price) => {
  if (price >= 10) return 2;
  if (price >= 1) return 4;
  if (price >= 0.1) return 4;
  if (price >= 0.01) return 5;
  return 6;
};

export const precisionToMinMove = (p) => {
  const mm = Number((1 / Math.pow(10, p)).toFixed(p));
  return mm || 0.01;
};

export const updatePriceFormat = (series, priceSample, setPrecisionRef, minMoveFn) => {
  if (!series) return;
  const p = getPricePrecision(priceSample ?? 1);
  if (setPrecisionRef) setPrecisionRef.current = p;
  const mm = (minMoveFn || precisionToMinMove)(p);
  try {
    series.applyOptions({
      priceFormat: {
        type: "custom",
        formatter: (price) => Number(price).toFixed(p),
        minMove: mm,
      },
    });
  } catch {}
};
