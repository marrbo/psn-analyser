// app/components/ui/LoadingSpinner.tsx
export default function LoadingSpinner({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="z-999999 absolute min-w-screen min-h-[calc()100vh - 80px] -left-[calc(100vw - 1/3)] top-0 right-0 bottom-0 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-20 h-20 border-8 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="w-20 h-20 border-8 border-green-400 border-b-transparent rounded-full animate-spin-reverse absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <h2 className="text-5xl font-games font-bold bg-linear-to-r from-blue-400 to-green-500 bg-clip-text text-transparent mb-2">
          {title || 'ANALISANDO ...'}
        </h2>
        <p className="text-gray-400">{ subtitle || 'Carregando dados épicos...'}</p>
        
        <div className="flex justify-center mt-4 space-x-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}