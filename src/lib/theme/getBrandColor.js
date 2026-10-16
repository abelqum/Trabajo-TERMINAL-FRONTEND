export function getBrandColor() {
  if (typeof window === "undefined") {
    return "#1D4ED8";
  }

  const dashboard = document.querySelector("[data-brand-root]");

  if (!dashboard) {
    return "#1D4ED8";
  }

  const styles = getComputedStyle(dashboard);

  return styles.getPropertyValue("--brand-700").trim() || "#1D4ED8";
}
