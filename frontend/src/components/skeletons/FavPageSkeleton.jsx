const FavPageSkeleton = () => {
	return (
	  <div className="animate-pulse">
		{/* Header skeleton */}
		<div className="bg-gray-800 rounded-md w-48 h-8 mb-8 shimmer"></div>
		
		{/* Warning banner skeleton (optional) */}
		<div className="bg-yellow-900/30 rounded w-full h-10 mb-6 shimmer"></div>
		
		{/* Grid layout for favorites */}
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
		  {[...Array(10)].map((_, i) => (
			<div key={i} className="shimmer">
			  {/* Poster skeleton */}
			  <div className="aspect-[2/3] bg-gray-800 rounded-md mb-2"></div>
			  {/* Title skeleton */}
			  <div className="bg-gray-800 rounded-md w-full h-4 mb-2"></div>
			  {/* Info skeleton */}
			  <div className="bg-gray-800 rounded-md w-2/3 h-3 mb-1"></div>
			  {/* Rating skeleton */}
			  <div className="bg-gray-800 rounded-md w-1/2 h-2"></div>
			</div>
		  ))}
		</div>
	  </div>
	);
  };
  
  export default FavPageSkeleton;