import { useLocation } from 'react-router-dom';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0B0F]">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-7xl font-light text-white/10">404</h1>
        <div className="h-px w-16 bg-white/10 mx-auto" />
        <h2 className="text-2xl font-medium text-white">Page Not Found</h2>
        <p className="text-white/40 leading-relaxed">
          The page <span className="font-medium text-white/60">"{pageName}"</span> could not be found.
        </p>
        <div className="pt-4">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}