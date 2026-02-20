import "./style.css";
import { initWebShare } from "./web-share";
import { install } from "pwafire";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
    } catch {}
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("wrapper");
  if (!wrapper) return;

  const panels = [...wrapper.querySelectorAll<HTMLElement>(".panel")];
  panels.forEach((panel) => {
    const imageEl = panel.querySelector<HTMLElement>(".image");
    const img = imageEl?.querySelector<HTMLImageElement>("img");
    if (imageEl && img) {
      const { src } = img;
      const position = img.dataset.position;
      if (src) imageEl.style.backgroundImage = `url(${src})`;
      if (position) imageEl.style.backgroundPosition = position;
      img.style.display = "none";
    }
  });

  initWebShare();
  void install("before");
});
