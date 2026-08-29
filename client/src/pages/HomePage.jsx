import { useEffect, useState, useRef } from "react";
import { api } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    api("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => {});
    api("/products/brands")
      .then((d) => setBrands(d.brands))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), sort });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);
    if (minPrice) params.set("minPrice", String(Math.round(parseFloat(minPrice) * 100) || 0));
    if (maxPrice) params.set("maxPrice", String(Math.round(parseFloat(maxPrice) * 100) || 0));

    const timer = setTimeout(() => {
      api(`/products?${params}`)
        .then((data) => {
          setProducts(data.products);
          setTotalPages(data.totalPages);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, brand, minPrice, maxPrice, sort, page]);

  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(() => {
      api(`/products/autocomplete?q=${encodeURIComponent(search)}`)
        .then((d) => setSuggestions(d.suggestions))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  function handleCategoryClick(name) {
    setCategory(category === name ? "" : name);
    setPage(1);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white border border-line rounded-2xl p-4 hard-shadow-sm mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative" ref={searchRef}>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setShowSugg(true);
              }}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 200)}
              placeholder="Search products..."
              className="w-full px-4 py-2.5 rounded-full border border-line bg-paper focus:outline-none focus:ring-2 focus:ring-accent placeholder:text-muted"
            />
            {showSugg && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-line rounded-2xl overflow-hidden hard-shadow-sm z-10">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onMouseDown={() => {
                      setSearch(s.name);
                      setShowSugg(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-paper flex items-center gap-3 text-sm"
                  >
                    <img src={s.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-line" />
                    <span className="flex-1 truncate text-ink">{s.name}</span>
                    <span className="text-muted text-xs">₹{(s.price / 100).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {brands.length > 0 && (
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Price:</span>
            <input
              type="number"
              min="0"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setPage(1);
              }}
              className="w-24 px-3 py-1.5 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="text-muted">—</span>
            <input
              type="number"
              min="0"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              className="w-24 px-3 py-1.5 rounded-full border border-line bg-paper text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          {(minPrice || maxPrice || sort !== "newest" || brand) && (
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                setSort("newest");
                setSearch("");
                setCategory("");
                setBrand("");
                setPage(1);
              }}
              className="text-xs font-medium text-ink underline underline-offset-4 ml-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.name)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              category === cat.name ? "bg-accent text-ink border-ink" : "bg-white text-ink border-line hover:bg-paper"
            }`}
          >
            {cat.name} ({cat._count.products})
          </button>
        ))}
      </div>

      {error && <p className="text-center py-16 text-red-600">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-line rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center py-16 text-muted">No products found. Try a different search or filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-full border border-line bg-white disabled:opacity-40 hover:bg-paper text-sm font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-full border border-line bg-white disabled:opacity-40 hover:bg-paper text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
