export const formatDate = (dateString) => {
  if (!dateString) return "Present";

  const date = new Date(dateString);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : "Present";
  return `${start} - ${end}`;
};

export default formatDateRange;