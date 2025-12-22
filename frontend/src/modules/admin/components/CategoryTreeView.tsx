import { Category } from "../../../services/api/admin/adminProductService";

interface CategoryTreeViewProps {
  categories: Category[];
  onAddSubcategory: (parent: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  level?: number;
}

export default function CategoryTreeView({
  categories,
  onAddSubcategory,
  onEdit,
  onDelete,
  onToggleStatus,
  expandedIds,
  onToggleExpand,
  level = 0,
}: CategoryTreeViewProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No categories found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const hasChildren =
          (category.children && category.children.length > 0) ||
          (category.childrenCount && category.childrenCount > 0);
        const isExpanded = expandedIds.has(category._id);
        const indentLevel = level * 24; // 24px per level

        return (
          <div key={category._id} className="relative">
            {/* Category Card */}
            <div
              className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              style={{ marginLeft: `${indentLevel}px` }}>
              <div className="flex items-start gap-4">
                {/* Expand/Collapse Icon */}
                {hasChildren ? (
                  <button
                    onClick={() => onToggleExpand(category._id)}
                    className="flex-shrink-0 mt-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`transform transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}>
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <div className="w-5" /> // Spacer for alignment
                )}

                {/* Category Image */}
                <div className="flex-shrink-0">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center">
                      <span className="text-2xl font-semibold text-neutral-400">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-neutral-900 truncate">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            category.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                          {category.status}
                        </span>

                        {/* Children Count Badge */}
                        {hasChildren && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {category.childrenCount ||
                              category.children?.length ||
                              0}{" "}
                            {category.childrenCount === 1 ||
                            category.children?.length === 1
                              ? "subcategory"
                              : "subcategories"}
                          </span>
                        )}

                        {/* Order Badge */}
                        <span className="text-xs text-neutral-500">
                          Order: {category.order || 0}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Add Subcategory Button */}
                      <button
                        onClick={() => onAddSubcategory(category)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded transition-colors"
                        title="Add Subcategory">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="inline-block mr-1">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Subcategory
                      </button>

                      {/* Toggle Status Button */}
                      <button
                        onClick={() => onToggleStatus(category)}
                        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                          category.status === "Active"
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                        title={
                          category.status === "Active"
                            ? "Deactivate"
                            : "Activate"
                        }>
                        {category.status === "Active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onEdit(category)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        title="Edit">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(category)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                        title="Delete">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Children (Recursive) */}
            {hasChildren && isExpanded && category.children && (
              <div className="mt-2">
                <CategoryTreeView
                  categories={category.children}
                  onAddSubcategory={onAddSubcategory}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  expandedIds={expandedIds}
                  onToggleExpand={onToggleExpand}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
