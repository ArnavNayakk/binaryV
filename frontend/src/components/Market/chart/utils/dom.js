export const pxClamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const createVertLine = () => {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.top = "0";
  el.style.bottom = "0";
  el.style.width = "1px";
  el.style.background = "rgba(200,200,200,0.6)";
  el.style.pointerEvents = "none";
  el.style.transform = "translateX(-0.5px)";
  el.style.display = "none";
  el.style.zIndex = "120";
  return el;
};

export const createHorzLine = () => {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.left = "0";
  el.style.right = "0";
  el.style.height = "1px";
  el.style.background = "rgba(200,200,200,0.6)";
  el.style.pointerEvents = "none";
  el.style.transform = "translateY(-0.5px)";
  el.style.display = "none";
  el.style.zIndex = "120";
  return el;
};
