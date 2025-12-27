import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/button';
import { Product } from '../../types/domain';
import { useEffect, useState } from 'react';
import { getStoreProducts } from '../../services/api/customerHomeService';
import { useLocation } from '../../hooks/useLocation';

export default function StorePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { cart, addToCart, updateQuantity } = useCart();
    const { location } = useLocation();
    const [products, setProducts] = useState<Product[]>([]);
    const [shopData, setShopData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            try {
                setLoading(true);

                // Fetch shop data and products using the shop API endpoint
                const response = await getStoreProducts(
                    slug,
                    location?.latitude,
                    location?.longitude
                );
                console.log(`[StorePage] Response for slug "${slug}":`, {
                    success: response.success,
                    productsCount: response.data?.length || 0,
                    shop: response.shop ? { name: response.shop.name, image: response.shop.image } : null,
                    message: response.message
                });
                if (response.success) {
                    setProducts(response.data || []);
                    setShopData(response.shop || null);
                } else {
                    setProducts([]);
                    setShopData(null);
                }
            } catch (error: any) {
                console.error('Failed to fetch store data:', error);
                console.error('Error details:', error.response?.data || error.message);
                setProducts([]);
                setShopData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, location]);

    const storeName = shopData?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ') : 'Store');
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    // Determine banner image source
    useEffect(() => {
        if (shopData?.image) {
            setBannerImage(shopData.image);
            setImageError(false);
        } else if (slug) {
            // Try multiple possible image paths
            const possiblePaths = [
                `/assets/shopbystore/${slug}/${slug}header.png`,
                `/assets/shopbystore/${slug}/header.png`,
                `/assets/shopbystore/${slug}.png`,
                `/assets/shopbystore/${slug}.jpg`,
            ];
            setBannerImage(possiblePaths[0]);
            setImageError(false);
        } else {
            setBannerImage(null);
            setImageError(true);
        }
    }, [shopData, slug]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.target as HTMLImageElement;
        const currentSrc = target.src;

        // Try fallback paths if current one fails
        if (slug && currentSrc.includes('/assets/shopbystore/')) {
            const fallbackPaths = [
                `/assets/shopbystore/${slug}/header.png`,
                `/assets/shopbystore/${slug}.png`,
                `/assets/shopbystore/${slug}.jpg`,
            ];
            const currentIndex = fallbackPaths.findIndex(path => currentSrc.includes(path));

            if (currentIndex < fallbackPaths.length - 1) {
                // Try next fallback path
                target.src = fallbackPaths[currentIndex + 1];
                return;
            }
        }

        // If all paths failed, show fallback
        setImageError(true);
        target.style.display = 'none';
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Store Banner */}
            <div className="relative w-full aspect-[2/1] bg-neutral-100 overflow-hidden">
                {bannerImage && !imageError ? (
                    <img
                        src={bannerImage}
                        alt={storeName}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                        loading="eager"
                    />
                ) : (
                    <div className="banner-fallback w-full h-full bg-gradient-to-br from-cyan-50 to-teal-100 flex items-center justify-center">
                        <div className="text-4xl font-bold text-neutral-400">
                            {storeName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}

                {/* Header Overlay */}
                <header className="absolute top-0 left-0 right-0 z-10">
                    <div className="px-3 py-2 flex items-center justify-between gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-lg bg-white/70 shadow-sm hover:bg-white/80 transition-colors flex-shrink-0 border border-white/20"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18L9 12L15 6" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>

                        <div className="flex-1 min-w-0 px-2">
                            <h1 className="text-sm font-bold text-neutral-900 drop-shadow-sm">{storeName}</h1>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                                onClick={() => navigate('/search')}
                                className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-lg bg-white/70 shadow-sm hover:bg-white/80 transition-colors border border-white/20"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="#000000" strokeWidth="2" />
                                    <path d="m21 21-4.35-4.35" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </div>

            {/* Products Section */}
            <div className="px-4 py-4">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top buys in {storeName}</h3>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => {
                            // Ensure consistent product ID - MongoDB returns _id, frontend expects id
                            const productId = product._id || product.id;
                            const cartItem = cart.items.find((item) => item?.product && (item.product.id === productId || item.product._id === productId));
                            const inCartQty = cartItem?.quantity || 0;
                            const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

                            return (
                                <motion.div
                                    key={productId}
                                    className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col"
                                >
                                    <Link
                                        to={`/product/${productId}`}
                                        state={{ fromStore: true }}
                                        className="relative bg-neutral-50 aspect-square flex items-center justify-center p-4"
                                    >
                                        {product.imageUrl || product.mainImage ? (
                                            <img src={product.imageUrl || product.mainImage} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-4xl">📦</span>
                                        )}
                                    </Link>

                                    <div className="p-3 flex-1 flex flex-col" style={{ background: '#fef9e7' }}>
                                        {/* Quantity */}
                                        {product.pack && (
                                            <p className="text-[9px] text-neutral-600 mb-0.5 leading-tight">
                                                {product.pack}
                                            </p>
                                        )}

                                        {/* Product Name */}
                                        <h3 className="text-[10px] font-bold text-neutral-900 mb-0.5 line-clamp-2 leading-tight min-h-[1.75rem] max-h-[1.75rem] overflow-hidden">
                                            {product.name || product.productName}
                                        </h3>

                                        {/* Time */}
                                        <p className="text-[9px] text-neutral-600 mb-0.5 flex items-center gap-0.5 leading-tight">
                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            <span>14 MINS</span>
                                        </p>

                                        {/* % OFF and Price with Discount */}
                                        <div className="mt-auto">
                                            {discount > 0 && (
                                                <p className="text-[9px] font-semibold text-green-600 mb-0.5 leading-tight">
                                                    {discount}% OFF
                                                </p>
                                            )}
                                            <div className="flex items-baseline gap-1 flex-wrap">
                                                <span className="text-[11px] font-bold text-neutral-900 leading-tight">
                                                    ₹{product.price.toFixed(0)}
                                                </span>
                                                {product.mrp && product.mrp > product.price && (
                                                    <span className="text-[8px] text-neutral-500 line-through leading-tight">
                                                        ₹{product.mrp.toFixed(0)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <div className="mt-2">
                                            {inCartQty === 0 ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addToCart(product)}
                                                    className="w-full border-green-600 text-green-600 hover:bg-green-50 rounded-lg h-7 text-xs font-bold"
                                                >
                                                    ADD
                                                </Button>
                                            ) : (
                                                <div className="flex items-center justify-between bg-green-600 text-white rounded-lg h-7 px-1">
                                                    <button onClick={() => updateQuantity(productId, inCartQty - 1)} className="w-6 h-6 flex items-center justify-center font-bold">−</button>
                                                    <span className="text-xs font-bold">{inCartQty}</span>
                                                    <button onClick={() => updateQuantity(productId, inCartQty + 1)} className="w-6 h-6 flex items-center justify-center font-bold">+</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 text-neutral-500">
                        <p>No products found in this store yet.</p>
                        <Link to="/" className="text-green-600 font-medium mt-2 inline-block">Explore other categories</Link>
                    </div>
                )}
            </div>
        </div>
    );
}
