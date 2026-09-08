/**
 * Dynamically calculates professional experience based on start date (March 19, 2025).
 * Updates automatically over time without manual code changes (e.g. 1.4+, 1.5+, 2+).
 */
export const getExperienceYears = (startDate = new Date(2025, 2, 19)) => {
  const now = new Date();

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();

  if (now.getDate() < startDate.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = Math.max(0, years * 12 + months);
  const rawYears = totalMonths / 12;
  const formatted = rawYears.toFixed(1);

  return formatted.endsWith(".0")
    ? `${parseInt(formatted, 10)}+`
    : `${formatted}+`;
};

export default getExperienceYears;
