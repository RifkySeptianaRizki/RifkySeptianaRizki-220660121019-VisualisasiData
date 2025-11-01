const Loading: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card glossy-fix animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded-full bg-white/10" />
            <div className="h-8 w-2/3 rounded-full bg-white/10" />
            <div className="h-3 w-1/2 rounded-full bg-white/5" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="card glossy-fix animate-pulse h-[320px] space-y-4">
            <div className="h-5 w-1/2 rounded-full bg-white/10" />
            <div className="h-full rounded-3xl bg-white/5" />
          </div>
        ))}
      </div>
      <div className="card glossy-fix animate-pulse h-[360px] space-y-4">
        <div className="h-5 w-1/3 rounded-full bg-white/10" />
        <div className="h-full rounded-3xl bg-white/5" />
      </div>
    </div>
  );
};

export default Loading;
