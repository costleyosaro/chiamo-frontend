let logoutTimer;

export const startInactivityTimer = (logoutCallback, timeout = 30 * 60 * 1000) => {
  const resetTimer = () => {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      logoutCallback();
    }, timeout);
  };

  // Reset timer on any user action
  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach((event) => {
    window.addEventListener(event, resetTimer);
  });

  resetTimer();
};
