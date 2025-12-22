import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/button';
import { Product } from '../../types/domain';
import { useEffect, useState } from 'react';
import { getProducts, getCategoryById } from '../../services/api/customerProductService';

export default function StorePage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { cart, addToCart, updateQuantity } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!slug) return;
            try {
                setLoading(true);

                // 1. Fetch products for this category (using slug as category ID/filter)
                const response = await getProducts({ category: slug });
                setProducts(response.data as unknown as Product[]);

                // 2. Fetch category details to get the banner/name
                const catRes = await getCategoryById(slug);
                if (catRes.success) {
                    setCategory(catRes.data.category);
                }
            } catch (error) {
                console.error('Failed to fetch store data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const storeName = category?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ') : 'Store');
    const bannerImage = category?.image || `/assets/shopbystore/${slug}/${slug}header.png`;

    return (
        <div className="min-h-screen bg-white">
            {/* Store Banner */}
            <div className="relative w-full aspect-[2/1] bg-neutral-100 overflow-hidden">
                <img
                    src={bannerImage}
                    alt={storeName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback if component-specific image doesn't exist
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000';
                    }}
                />

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
                            const cartItem = cart.items.find((item) => item?.product && (item.product.id === product.id || item.product._id === product.id));
                            const inCartQty = cartItem?.quantity || 0;
                            const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

                            return (
                                <motion.div
                                    key={product.id}
                                    className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden flex flex-col"
                                >
                                    <Link to={`/product/${product.id}`} className="relative bg-neutral-50 aspect-square flex items-center justify-center p-4">
                                        {product.imageUrl || product.mainImage ? (
                                            <img src={product.imageUrl || product.mainImage} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-4xl">📦</span>
                                        )}
                                        {discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {discount}% OFF
                                            </div>
                                        )}
                                    </Link>

                                    <div className="p-3 flex-1 flex flex-col">
                                        <div className="text-[10px] text-neutral-500 mb-1">{product.pack}</div>
                                        <h4 className="text-sm font-bold text-neutral-900 line-clamp-2 mb-2">{product.name}</h4>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-neutral-900">₹{product.price}</span>
                                                {product.mrp && product.mrp > product.price && (
                                                    <span className="text-[10px] text-neutral-400 line-through">₹{product.mrp}</span>
                                                )}
                                            </div>

                                            <div className="w-20">
                                                {inCartQty === 0 ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addToCart(product)}
                                                        className="w-full border-green-600 text-green-600 hover:bg-green-50 rounded-lg h-8 text-xs font-bold"
                                                    >
                                                        ADD
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center justify-between bg-green-600 text-white rounded-lg h-8 px-1">
                                                        <button onClick={() => updateQuantity(product.id, inCartQty - 1)} className="w-6 h-6 flex items-center justify-center font-bold">−</button>
                                                        <span className="text-xs font-bold">{inCartQty}</span>
                                                        <button onClick={() => updateQuantity(product.id, inCartQty + 1)} className="w-6 h-6 flex items-center justify-center font-bold">+</button>
                                                    </div>
                                                )}
                                            </div>
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
