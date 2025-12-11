import { Product } from '../types/domain';
import { useNavigate } from 'react-router-dom';

interface SimilarProductsProps {
  products: Product[];
  currentProductId: string;
}

export default function SimilarProducts({ products, currentProductId }: SimilarProductsProps) {
  const navigate = useNavigate();

  // Filter out current product and limit to 6
  const similarProducts = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 6);

  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 px-4">Similar products</h3>
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 scroll-smooth">
          {similarProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="flex-shrink-0 w-32 bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="w-full h-24 bg-neutral-100 flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400 text-2xl">
                    {product.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs text-neutral-500 mb-1">{product.pack}</p>
                <h4 className="text-xs font-semibold text-neutral-900 line-clamp-2 mb-1 min-h-[2rem]">
                  {product.name}
                </h4>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-neutral-900">₹{product.price}</span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-xs text-neutral-500 line-through">₹{product.mrp}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


