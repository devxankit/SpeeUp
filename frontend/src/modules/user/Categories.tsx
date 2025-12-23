import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  getCategories,
  Category,
} from "../../services/api/customerProductService";
import { getHeaderCategoriesPublic, HeaderCategory } from "../../services/api/headerCategoryService";

export default function Categories() {
  const [headerCategories, setHeaderCategories] = useState<HeaderCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const [headerRes, categoryRes] = await Promise.all([
          getHeaderCategoriesPublic(),
          getCategories(true), // tree with subcategories filtered by products
        ]);

        setHeaderCategories(headerRes || []);

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

  const grouped = useMemo(() => {
    const byHeader = headerCategories
      .map((header) => {
        const headerId = header._id;
        const cats = categories.filter((cat) => {
          const catHeader =
            typeof cat.headerCategoryId === "string"
              ? cat.headerCategoryId
              : (cat.headerCategoryId as { _id?: string })?._id;
          return catHeader === headerId;
        });
        return { header, categories: cats };
      })
      .filter((group) => group.categories.length > 0);

    const unassigned = categories.filter((cat) => {
      const catHeader =
        typeof cat.headerCategoryId === "string"
          ? cat.headerCategoryId
          : (cat.headerCategoryId as { _id?: string })?._id;
      return !catHeader;
    });

    return { byHeader, unassigned };
  }, [categories, headerCategories]);

  const renderSubcategoryTile = (sub: Category) => {
    const fallbackLetter = sub.name?.charAt(0)?.toUpperCase() || "?";
    return (
      <Link
        key={sub._id || sub.id}
        to={`/category/${sub.id || sub._id}`}
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
    return (
      <div key={category._id} className="space-y-3">
        <div className="px-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-semibold text-sm">
            {category.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-neutral-500">
              Category
            </p>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {category.name}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {subcats.map((sub) => renderSubcategoryTile(sub))}
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
        <div className="space-y-10">
          {grouped.byHeader.map((group) => (
            <section key={group.header._id} className="space-y-3">
              <div className="px-4 py-2 flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold text-lg">
                  {group.header.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Header
                  </p>
                  <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                    {group.header.name}
                  </h2>
                </div>
              </div>

              <div className="px-4">
                <div className="space-y-6">
                  {group.categories.map((cat) => renderCategoryBlock(cat))}
                </div>
              </div>
            </section>
          ))}

          {grouped.unassigned.length > 0 && (
            <section className="space-y-3">
              <div className="px-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center font-semibold text-lg">
                  +
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Other Categories
                  </p>
                  <h2 className="text-lg font-bold text-neutral-900 leading-tight">
                    More to explore
                  </h2>
                </div>
              </div>

              <div className="px-4">
                <div className="space-y-6">
                  {grouped.unassigned.map((cat) => renderCategoryBlock(cat))}
                </div>
              </div>
            </section>
          )}

          {categories.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No categories found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

