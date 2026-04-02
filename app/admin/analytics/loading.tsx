export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="skeleton h-8 w-64" />
        <div className="flex gap-2">
          <div className="skeleton h-10 w-32" />
          <div className="skeleton h-10 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="skeleton h-32 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton h-80 w-full" />
        <div className="skeleton h-80 w-full" />
        <div className="lg:col-span-2 skeleton h-96 w-full" />
      </div>
    </div>
  );
}
