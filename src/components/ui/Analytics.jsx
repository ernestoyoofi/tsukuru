"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const googleScriptId = "tsukuru-google-analytics";
const umamiScriptId = "tsukuru-umami-analytics";
const plausibleScriptId = "tsukuru-plausible-analytics";
const matomoScriptId = "tsukuru-matomo-analytics";

function getScriptUrl(value) {
  try {
    const url = new URL(value, window.location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Analytics script URL must use HTTP or HTTPS.");
    }
    return url.href;
  } catch (error) {
    console.error("[Tsukuru Analytics] Invalid analytics script URL.", error);
    return null;
  }
}

function appendScript(id, src, attributes = {}) {
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  for (const [name, value] of Object.entries(attributes)) {
    script.setAttribute(name, value);
  }
  document.head.appendChild(script);
}

function initializeGoogleAnalytics(id) {
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args) {
      window.dataLayer.push(args);
    };

  if (!window.__tsukuruGoogleAnalyticsInitialized) {
    window.gtag("js", new Date());
    window.gtag("config", id, { send_page_view: false });
    window.__tsukuruGoogleAnalyticsInitialized = true;
  }

  const src = new URL("https://www.googletagmanager.com/gtag/js");
  src.searchParams.set("id", id);
  appendScript(googleScriptId, src.href);
}

function initializeUmamiAnalytics({ id, script: scriptUrl }) {
  const src = getScriptUrl(scriptUrl);
  if (!src) return;

  appendScript(umamiScriptId, src, { "data-website-id": id });
}

function initializePlausibleAnalytics({ id, script: scriptUrl }) {
  const src = getScriptUrl(scriptUrl);
  if (!src) return;

  appendScript(plausibleScriptId, src, { "data-domain": id });
}

function initializeMatomoAnalytics({ id, script: scriptUrl }) {
  const src = getScriptUrl(scriptUrl);
  if (!src || document.getElementById(matomoScriptId)) return;

  const trackerUrl = new URL(src);
  if (!/\.js$/i.test(trackerUrl.pathname)) {
    console.error(
      "[Tsukuru Analytics] Matomo script URL must point to a .js file so its sibling .php tracker can be derived.",
    );
    return;
  }

  trackerUrl.pathname = trackerUrl.pathname.replace(/\.js$/i, ".php");
  trackerUrl.search = "";
  trackerUrl.hash = "";

  window._paq = window._paq || [];
  window._paq.push(["setTrackerUrl", trackerUrl.href]);
  window._paq.push(["setSiteId", id]);
  window._paq.push(["enableLinkTracking"]);
  appendScript(matomoScriptId, src);
}

export default function Analytics({ config }) {
  const pathname = usePathname();

  useEffect(() => {
    if (
      !config ||
      config.type === "none" ||
      !config.id ||
      (["umami", "plausible", "matomo"].includes(config.type) && !config.script)
    ) {
      return;
    }

    switch (config.type) {
      case "google":
        initializeGoogleAnalytics(config.id);
        break;
      case "umami":
        initializeUmamiAnalytics(config);
        break;
      case "plausible":
        initializePlausibleAnalytics(config);
        break;
      case "matomo":
        initializeMatomoAnalytics(config);
        break;
    }
  }, [config]);

  useEffect(() => {
    if (!pathname || !["google", "matomo"].includes(config?.type)) return;

    const pageUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const pageKey = `__tsukuruAnalyticsPage_${config.type}_${config.id}`;
    if (window[pageKey] === pageUrl) return;
    window[pageKey] = pageUrl;

    if (config.type === "google") {
      window.gtag?.("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pageUrl,
      });
    } else {
      window._paq?.push(["setCustomUrl", pageUrl]);
      window._paq?.push(["setDocumentTitle", document.title]);
      window._paq?.push(["trackPageView"]);
    }
  }, [config, pathname]);

  return null;
}
