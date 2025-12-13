(function () {
  function initVendorChatWidget() {
    // Do not inject the widget inside iframes
    if (window.self !== window.top) {
      return;
    }

    // Find the script tag that loaded this file
    var scriptEl = document.currentScript;

    if (!scriptEl) {
      var candidates = document.querySelectorAll(
        'script[data-vendor-chat-widget]'
      );
      if (candidates.length) {
        scriptEl = candidates[candidates.length - 1];
      }
    }

    if (!scriptEl) {
      console.warn("Vendor chat widget script tag not found");
      return;
    }

    var organisationId =
      scriptEl.getAttribute("data-organisation-id") || "";
    var agentId = scriptEl.getAttribute("data-agent-id") || "";

    // Default to your Vercel app that serves /vendors-chat
    var baseUrl =
      scriptEl.getAttribute("data-base-url") ||
      "https://5-star-wedding-agent.vercel.app";

    // Create chat button
    var button = document.createElement("button");
    button.innerText = "Chat with concierge";
    button.type = "button";

    Object.assign(button.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      zIndex: "999999",
      padding: "10px 16px",
      borderRadius: "999px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      backgroundColor: "#183F34",
      color: "#ffffff",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.18)",
    });

    // Create chat panel container
    var panel = document.createElement("div");
    Object.assign(panel.style, {
      position: "fixed",
      right: "20px",
      bottom: "70px",
      width: "360px",
      maxWidth: "100%",
      height: "480px",
      maxHeight: "70vh",
      backgroundColor: "#ffffff",
      borderRadius: "16px",
      boxShadow: "0 18px 40px rgba(0, 0, 0, 0.25)",
      overflow: "hidden",
      display: "none",
      zIndex: "999999",
    });

    // Simple header with close button
    var header = document.createElement("div");
    Object.assign(header.style, {
      height: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 12px",
      backgroundColor: "#183F34",
      color: "#ffffff",
      fontSize: "13px",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    });
    header.textContent = "5 Star Weddings concierge";

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.innerText = "×";
    Object.assign(closeBtn.style, {
      border: "none",
      background: "transparent",
      color: "#ffffff",
      fontSize: "18px",
      cursor: "pointer",
      padding: "0",
      lineHeight: "1",
    });

    header.appendChild(closeBtn);

    // Iframe with your vendors chat page
    var iframe = document.createElement("iframe");
    iframe.setAttribute("allow", "clipboard-read; clipboard-write");
    iframe.title = "Vendor concierge chat";

    var src =
      baseUrl +
      "/vendors-chat?embed=1" +
      (organisationId
        ? "&organisationId=" + encodeURIComponent(organisationId)
        : "") +
      (agentId ? "&agentId=" + encodeURIComponent(agentId) : "");

    iframe.src = src;
    Object.assign(iframe.style, {
      width: "100%",
      height: "calc(100% - 44px)",
      border: "none",
    });

    panel.appendChild(header);
    panel.appendChild(iframe);

    // Attach elements
    document.body.appendChild(button);
    document.body.appendChild(panel);

    // Behaviour
    function togglePanel() {
      var isOpen = panel.style.display === "block";
      panel.style.display = isOpen ? "none" : "block";
    }

    button.addEventListener("click", togglePanel);
    closeBtn.addEventListener("click", togglePanel);
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initVendorChatWidget();
  } else {
    document.addEventListener("DOMContentLoaded", initVendorChatWidget);
  }
})();
