(function () {
  "use strict";

  function endpoint() {
    return (window.TREASURE_HUNT_SUBMISSION_URL || "").trim();
  }

  function eventId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  window.logTreasureHuntEvent = function (details) {
    var url = endpoint();
    if (!url) {
      console.warn("Submission logging is not configured. Set TREASURE_HUNT_SUBMISSION_URL in submission-config.js.");
      return Promise.resolve(false);
    }

    var payload = {
      eventId: eventId(),
      event: details.event,
      teamName: details.teamName,
      hint: details.hint,
      answer: details.answer || "",
      correct: typeof details.correct === "boolean" ? details.correct : null,
      clientTime: new Date().toISOString(),
      page: window.location.pathname
    };

    // text/plain avoids a CORS preflight. Apps Script records its own trusted
    // server timestamp, so changing the browser clock cannot alter the record.
    return fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      keepalive: true
    }).then(function () {
      return true;
    }).catch(function (error) {
      console.error("Could not save treasure hunt submission:", error);
      return false;
    });
  };
}());
