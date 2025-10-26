export function formatFollowerCount(num) {
  if (num < 1000) {
    return num.toString();
  } else if (num < 1_000_000) {
    // Format with commas for thousands (e.g., 27,932)
    return num.toLocaleString("en-US");
  } else if (num < 1_000_000_000) {
    // Millions (e.g., 1.2M)
    const millions = num / 1_000_000;
    return `${millions.toFixed(millions < 10 ? 1 : 0)}M`;
  } else {
    // Billions (e.g., 2.3B)
    const billions = num / 1_000_000_000;
    return `${billions.toFixed(billions < 10 ? 1 : 0)}B`;
  }
}
