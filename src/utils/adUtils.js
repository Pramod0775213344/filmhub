export const AD_LINK = "https://www.effectivegatecpm.com/hew8bcwm?key=3b03fdae560f4d30269e44adf3dad5dd";

export const handleAdClick = () => {
  if (typeof window !== "undefined") {
    // Only open if not already open recently to avoid being too spammy
    // or just open it as requested.
    window.open(AD_LINK, '_blank');
  }
};
