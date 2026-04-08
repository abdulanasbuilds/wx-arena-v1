export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-[#1e1e2d] rounded w-1/4"></div>
        <div className="h-4 bg-[#1e1e2d] rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-[#1e1e2d] rounded-xl"></div>
          <div className="h-32 bg-[#1e1e2d] rounded-xl"></div>
          <div className="h-32 bg-[#1e1e2d] rounded-xl"></div>
        </div>
        <div className="h-64 bg-[#1e1e2d] rounded-xl"></div>
      </div>
    </div>
  );
}
