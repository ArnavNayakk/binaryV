self.onmessage = (e) => {
  const { progress, totalCards } = e.data;
  const index = Math.round(Math.min(Math.max(progress, 0), 1) * (totalCards - 1));
  self.postMessage({ index });
};
