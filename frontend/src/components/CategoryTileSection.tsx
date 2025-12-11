import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface CategoryTile {
  id: string;
  name: string;
  productImages: (string | undefined)[];
  productCount?: number;
  categoryId?: string;
  bgColor?: string;
}

interface CategoryTileSectionProps {
  title: string;
  tiles: CategoryTile[];
  columns?: 2 | 3 | 4; // Allow 2, 3, or 4 columns
  showProductCount?: boolean; // Show product count only for bestsellers
}

export default function CategoryTileSection({ title, tiles, columns = 2, showProductCount = false }: CategoryTileSectionProps) {
  const handleTileClick = (tile: CategoryTile) => {
    if (tile.categoryId) {
      // Navigate to category if categoryId is provided
      return;
    }
    // Otherwise just log for now
    console.log('Clicked tile', tile.id);
  };

  const gridCols = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  const gapClass = columns === 4 ? 'gap-2' : 'gap-3';

  return (
    <div className="mb-6 mt-0 overflow-visible">
      <h2 className="text-lg font-semibold text-neutral-900 mb-3 px-4 tracking-tight">{title}</h2>
      <div className="px-4 overflow-visible">
        <div className={`grid ${gridCols} ${gapClass} overflow-visible`}>
          {tiles.map((tile) => {
            const hasImages = tile.productImages.filter(Boolean).length > 0;

            return (
              <motion.div
                key={tile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col"
              >
                <Link
                  to={tile.categoryId ? `/category/${tile.categoryId}` : '#'}
                  onClick={(e) => {
                    if (!tile.categoryId) {
                      e.preventDefault();
                      handleTileClick(tile);
                    }
                  }}
                  className={`block bg-white rounded-xl shadow-sm border border-neutral-200 hover:shadow-md transition-shadow ${
                    showProductCount ? 'p-2.5' : 'p-2'
                  }`}
                >
                {/* Image - Single image for non-bestsellers, 2x2 grid for bestsellers */}
                <div
                  className={`w-full rounded-lg overflow-hidden ${
                    showProductCount ? 'h-20 mb-2' : 'h-16 mb-1.5'
                  } ${
                    tile.bgColor || 'bg-cyan-50'
                  }`}
                >
                  {hasImages ? (
                    showProductCount ? (
                      // Bestsellers: 2x2 grid
                      <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5">
                        {tile.productImages.slice(0, 4).map((img, idx) =>
                          img ? (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              className="w-full h-full object-contain bg-white rounded-sm"
                            />
                          ) : (
                            <div
                              key={idx}
                              className="w-full h-full bg-neutral-200 rounded-sm flex items-center justify-center text-xs text-neutral-400"
                            >
                              {idx + 1}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      // Other sections: Single image
                      <img
                        src={tile.productImages[0]}
                        alt={tile.name}
                        className="w-full h-full object-contain bg-white rounded-lg"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-neutral-300">
                      {tile.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Product count - shown first (only for bestsellers) */}
                {showProductCount && tile.productCount && (
                  <div className="mb-1.5 flex justify-center">
                    <span className="inline-block bg-neutral-100 text-neutral-600 text-[10px] font-medium px-2 py-0.5 rounded-full leading-tight">
                      +{tile.productCount} more
                    </span>
                  </div>
                )}

                {/* Tile name - inside card only for bestsellers */}
                {showProductCount && (
                  <div className="text-[11px] font-semibold text-neutral-900 line-clamp-2 leading-tight text-center w-full block">
                    {tile.name}
                  </div>
                )}
                </Link>
                
                {/* Tile name - outside card for all other sections */}
                {!showProductCount && (
                  <div className="mt-1.5 text-center">
                    <span className="text-xs font-semibold text-neutral-900 line-clamp-2 leading-tight">
                      {tile.name}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

