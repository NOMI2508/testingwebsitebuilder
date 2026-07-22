const mockChartData = {
  revenue: {
    title: "Revenue Trends",
    type: "line",
    data: [
      { date: "Jan", value: 3200 },
      { date: "Feb", value: 4100 },
      { date: "Mar", value: 3800 },
      { date: "Apr", value: 5200 },
      { date: "May", value: 4800 },
      { date: "Jun", value: 6100 },
      { date: "Jul", value: 5900 },
      { date: "Aug", value: 7200 },
      { date: "Sep", value: 6800 },
      { date: "Oct", value: 8100 },
      { date: "Nov", value: 7900 },
      { date: "Dec", value: 9200 },
    ],
  },
  userActivity: {
    title: "User Activity",
    type: "bar",
    data: [
      { day: "Mon", active: 245, new: 32 },
      { day: "Tue", active: 312, new: 45 },
      { day: "Wed", active: 289, new: 28 },
      { day: "Thu", active: 356, new: 51 },
      { day: "Fri", active: 423, new: 67 },
      { day: "Sat", active: 278, new: 22 },
      { day: "Sun", active: 198, new: 18 },
    ],
  },
  distribution: {
    title: "User Distribution",
    type: "pie",
    data: [
      { name: "Admin", value: 12, color: "#4F46E5" },
      { name: "Editor", value: 45, color: "#10B981" },
      { name: "User", value: 328, color: "#F59E0B" },
      { name: "Guest", value: 184, color: "#6366F1" },
    ],
  },
};

export default mockChartData;