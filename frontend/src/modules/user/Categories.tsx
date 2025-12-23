import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getCategories,
  Category,
} from "../../services/api/customerProductService";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoryRes = await getCategories(true); // tree with subcategories filtered by products

        // Backend already filters to categories that have products (and subcategories with products).
        const filtered = (categoryRes.data || []).map((cat) => ({
          ...cat,
          subcategories:
            cat.subcategories?.filter((sub) => sub && sub.name)?.slice() || [],
        }));

        setCategories(filtered);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderSubcategoryTile = (sub: any, parentCategoryId: string) => {
    const fallbackLetter = sub.name?.charAt(0)?.toUpperCase() || "?";
    // Navigate to parent category with subcategory filter
    const subcategoryId = sub._id || sub.id;
    const linkTo = `/category/${parentCategoryId}?subcategory=${subcategoryId}`;

    return (
      <Link
        key={sub._id || sub.id}
        to={linkTo}
        className="flex flex-col items-center gap-1 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-neutral-50 to-white flex items-center justify-center">
          {sub.image ? (
            <img
              src={sub.image}
              alt={sub.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-lg font-semibold text-green-700">${fallbackLetter}</div>`;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-green-700">
              {fallbackLetter}
            </div>
          )}
        </div>
        <span className="text-[11px] font-semibold text-neutral-900 text-center leading-tight line-clamp-2">
          {sub.name}
        </span>
      </Link>
    );
  };

  const renderCategoryBlock = (category: Category) => {
    const subcats = category.subcategories || [];
    const categoryId = category.id || category._id;
    const fallbackLetter = category.name?.charAt(0)?.toUpperCase() || "?";

    return (
      <div key={category._id} className="space-y-3">
        <div className="px-1 flex items-center gap-3">
          {/* Category Image */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-neutral-50 to-white flex items-center justify-center flex-shrink-0 border border-neutral-200">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-lg font-semibold text-green-700">${fallbackLetter}</div>`;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-green-700">
                {fallbackLetter}
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">
              Category
            </p>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {category.name}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {subcats.map((sub) => renderSubcategoryTile(sub, categoryId))}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-4 bg-white min-h-screen">
      <div className="px-4 py-4 bg-white border-b border-neutral-200 mb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-neutral-900">Categories</h1>
      </div>

      {loading ? (
        <div className="flex justify-center pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="space-y-8 px-4">
          {categories.length > 0 ? (
            categories.map((cat) => renderCategoryBlock(cat))
          ) : (
            <div className="text-center py-10 text-gray-500">
              No categories found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

