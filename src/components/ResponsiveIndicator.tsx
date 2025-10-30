// Only shows in development
const ResponsiveIndicator: React.FC = () => {
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-xs font-mono z-50">
      <div className="sm:hidden">XS</div>
      <div className="hidden sm:block md:hidden">SM</div>
      <div className="hidden md:block lg:hidden">MD</div>
      <div className="hidden lg:block xl:hidden">LG</div>
      <div className="hidden xl:block 2xl:hidden">XL</div>
      <div className="hidden 2xl:block">2XL</div>
    </div>
  );
};

export default ResponsiveIndicator;