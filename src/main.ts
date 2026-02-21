import "./style.css";
import { initWebShare } from "./web-share";
import { install } from "pwafire";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/service-worker.js");
    } catch (err) {
      console.warn("Service Worker registration failed:", err);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initWebShare();
  void install("before");
});
