import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Wishlist() {
  const navigate = useNavigate();

  // Scroll to top on mount to mirror mobile view
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="p-2 -ml-2 rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18 9 12l6-6" />
            </svg>
          </button>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-neutral-900">
              Your wishlist
            </p>
            <span className="text-xs text-neutral-600 leading-tight">
              Delivering to: New Palasia, Indore Division, Indore, Madhya
              Pradesh, India
            </span>
          </div>
          <div className="ml-auto" />
          <button
            aria-label="Search"
            className="p-2 rounded-full border border-neutral-200 hover:bg-neutral-50 text-neutral-700"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center text-center px-6 pt-12 pb-16">
        <div className="flex gap-4 mb-6">
          {["gray", "white", "white"].map((fill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="w-20"
            >
              <div className="relative h-20 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center">
                {idx === 1 && (
                  <span className="absolute top-2 right-2 text-[10px]">
                    ❤️
                  </span>
                )}
                {idx === 0 || idx === 2 ? (
                  <span className="absolute top-2 right-2 text-[10px] text-neutral-500">
                    ♡
                  </span>
                ) : null}
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-2.5 w-14 mx-auto rounded-full bg-neutral-200" />
                <div className="h-2.5 w-12 mx-auto rounded-full bg-neutral-200" />
              </div>
            </motion.div>
          ))}
        </div>

        <h2 className="text-base font-semibold text-neutral-900 mb-2">
          Did you know?
        </h2>
        <p className="text-sm text-neutral-600 leading-snug max-w-xs">
          When you tap the heart icon on an item, you'll see it here. This way
          you can find things easily & shop faster!
        </p>
      </div>
    </div>
  );
}

