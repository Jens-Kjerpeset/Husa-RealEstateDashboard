import './PropertiesSkeleton.css';

export function PropertiesSkeleton() {
  const SKELETON_COUNT = 5;
  return (
    <div className="skeleton-container" data-testid="properties-skeleton">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image"></div>
          <div className="skeleton-text skeleton-address"></div>
          <div className="skeleton-text skeleton-price"></div>
        </div>
      ))}
    </div>
  );
}
