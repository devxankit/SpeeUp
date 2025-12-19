import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCategories, Category } from '../../services/api/customerProductService';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch category tree (top level categories with children)
        const response = await getCategories(true);
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
        <div className="space-y-6">
          {categories.map((section) => (
            <div key={section._id} className="mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-3 px-4 tracking-tight flex items-center gap-2">
                {section.image && (
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={section.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                {section.name}
              </h2>
              <div className="px-4">
                <div className="grid grid-cols-4 gap-2">
                  {section.children && section.children.length > 0 ? (
                    section.children.map((category) => (
                      <div key={category._id} className="flex flex-col">
                        <Link
                          to={`/category/${category.id || category._id}`} // Use virtual id if available for cleaner URLs
                          className="bg-white rounded-xl border border-neutral-200 p-2.5 hover:shadow-md transition-shadow aspect-square flex flex-col items-center justify-center p-1"
                        >
                          <div className="flex flex-col items-center justify-center text-center w-full h-full">
                            {category.image ? (
                              <div className="w-full h-full rounded-lg overflow-hidden bg-white mb-1">
                                <img
                                  src={category.image}
                                  alt={category.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full rounded-lg bg-cyan-50 flex items-center justify-center text-xl">
                                {/* Use first letter as fallback icon if no image */}
                                {category.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Category name - outside the card */}
                        <div className="mt-1.5 text-center">
                          <span className="text-[10px] font-semibold text-neutral-900 line-clamp-2 leading-tight">
                            {category.name}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    // If no children, show the section itself as a clickable item (fallback)
                    <div className="col-span-4 text-sm text-gray-500 italic pl-1">
                      No subcategories found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {categories.length === 0 && !loading && (
            <div className="text-center py-10 text-gray-500">
              No categories found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

