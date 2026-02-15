// API Endpoints
const API = {
  allProducts: "https://fakestoreapi.com/products",
  categories: "https://fakestoreapi.com/products/categories",
  byCategory: (category) =>
    `https://fakestoreapi.com/products/category/${category}`,
  singleProduct: (id) => `https://fakestoreapi.com/products/${id}`,
};

// State
let cart = [];
let allProducts = [];
let currentCategory = "all";

// DOM Elements
const trendingContainer = document.getElementById(
  "trending-products-container",
);
const productsContainer = document.getElementById("products-container");
const categoryContainer = document.getElementById("category-container");
const cartCount = document.querySelector(".badge-primary");
const cartItemsSpan = document.querySelector(".card-body .text-sm.font-medium");
const cartSubtotal = document.querySelector(".card-body .text-info");
const viewCartBtn = document.querySelector(".btn-primary.btn-block");
const categoryTitle = document.getElementById("category-title");
const categoryDescription = document.getElementById("category-description");
const modal = document.getElementById("product-modal");
const modalContent = document.getElementById("modal-content");

// Fetch all products on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(API.allProducts);
    allProducts = await response.json();

    // Get top 3 products by rating for trending section
    const topRated = getTopRatedProducts(allProducts, 3);
    displayTrendingProducts(topRated);

    // Load categories
    await loadCategories();

    // Load all products in the main grid
    displayProducts(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    const errorMessage = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-500">Failed to load products. Please try again later.</p>
      </div>
    `;
    if (trendingContainer) trendingContainer.innerHTML = errorMessage;
    if (productsContainer) productsContainer.innerHTML = errorMessage;
  }
});

// Fetch and display categories
async function loadCategories() {
  try {
    const response = await fetch(API.categories);
    const categories = await response.json();
    displayCategories(categories);
  } catch (error) {
    console.error("Error loading categories:", error);
    if (categoryContainer) {
      categoryContainer.innerHTML = `
        <p class="text-red-500">Failed to load categories</p>
      `;
    }
  }
}

// Display category buttons
function displayCategories(categories) {
  if (!categoryContainer) return;

  let categoriesHTML = `
    <button class="btn btn-sm rounded-full category-btn ${currentCategory === "all" ? "bg-black text-white hover:bg-gray-800" : "bg-white hover:bg-gray-100"}" data-category="all">
      All Products
    </button>
  `;

  categories.forEach((category) => {
    const displayName = category
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    categoriesHTML += `
      <button class="btn btn-sm rounded-full category-btn ${currentCategory === category ? "bg-black text-white hover:bg-gray-800" : "bg-white hover:bg-gray-100"}" data-category="${category}">
        ${displayName}
      </button>
    `;
  });

  categoryContainer.innerHTML = categoriesHTML;

  // Add event listeners to category buttons
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const category = e.target.dataset.category;
      currentCategory = category;

      // Update active state
      document.querySelectorAll(".category-btn").forEach((b) => {
        b.classList.remove("bg-black", "text-white");
        b.classList.add("bg-white", "hover:bg-gray-100");
      });
      e.target.classList.remove("bg-white", "hover:bg-gray-100");
      e.target.classList.add("bg-black", "text-white");

      // Update title
      if (category === "all") {
        categoryTitle.textContent = "All Products";
        categoryDescription.textContent = "Browse our complete collection";
      } else {
        const displayName = category
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        categoryTitle.textContent = displayName;
        categoryDescription.textContent = `Explore our ${displayName} collection`;
      }

      // Load products for selected category
      await loadProductsByCategory(category);
    });
  });
}

// Load products by category
async function loadProductsByCategory(category) {
  if (!productsContainer) return;

  productsContainer.innerHTML = `
    <div class="col-span-full flex justify-center py-12">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
  `;

  try {
    let products;
    if (category === "all") {
      products = allProducts;
    } else {
      const response = await fetch(API.byCategory(category));
      products = await response.json();
    }

    displayProducts(products);
  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-500">Failed to load products. Please try again.</p>
      </div>
    `;
  }
}

// Display products in grid
function displayProducts(products) {
  if (!productsContainer) return;

  if (!products || products.length === 0) {
    productsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500">No products found in this category.</p>
      </div>
    `;
    return;
  }

  productsContainer.innerHTML = products
    .map((product) => createProductCard(product))
    .join("");
}

// Create product card HTML
function createProductCard(product) {
  const rating = Math.round(product.rating.rate);
  const fullStars = rating;
  const hasHalfStar = product.rating.rate % 1 !== 0;
  const emptyStars = 5 - Math.ceil(product.rating.rate);

  let starsHTML = "";

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fa-solid fa-star"></i>';
  }

  if (hasHalfStar) {
    starsHTML += '<i class="fa-regular fa-star-half-stroke"></i>';
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="fa-regular fa-star"></i>';
  }

  const displayCategory = product.category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `
    <div class="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300" data-product-id="${product.id}">
      <figure class="px-4 pt-4 h-48">
        <img src="${product.image}" alt="${product.title}" class="h-full w-full object-contain" />
      </figure>
      <div class="card-body">
        <div class="flex items-center gap-2 mb-1">
          <span class="badge badge-sm badge-outline">${displayCategory}</span>
        </div>
        <h3 class="card-title text-base line-clamp-1">${product.title}</h3>
        <div class="flex items-center gap-2">
          <div class="flex text-yellow-400 text-sm">
            ${starsHTML}
          </div>
          <span class="text-xs text-gray-500">(${product.rating.count})</span>
        </div>
        <p class="text-gray-600 text-sm line-clamp-2 mt-1">${product.description}</p>
        <div class="flex items-center justify-between mt-4">
          <span class="text-2xl font-bold text-primary">$${product.price.toFixed(2)}</span>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-outline btn-primary details-btn" data-product-id="${product.id}">
              Details
            </button>
            <button class="btn btn-sm btn-primary add-to-cart" data-product-id="${product.id}">
              <i class="fa-solid fa-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Display trending products
function displayTrendingProducts(products) {
  if (!trendingContainer) return;

  if (!products || products.length === 0) {
    trendingContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500">No products available.</p>
      </div>
    `;
    return;
  }

  trendingContainer.innerHTML = products
    .map((product) => createTrendingCard(product))
    .join("");
}

// Create trending product card
function createTrendingCard(product) {
  const rating = Math.round(product.rating.rate);
  let starsHTML = "";

  for (let i = 0; i < rating; i++) {
    starsHTML += '<i class="fa-solid fa-star"></i>';
  }
  for (let i = rating; i < 5; i++) {
    starsHTML += '<i class="fa-regular fa-star"></i>';
  }

  return `
    <div class="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300" data-product-id="${product.id}">
      <figure class="px-4 pt-4">
        <img src="${product.image}" alt="${product.title}" class="rounded-xl h-48 w-full object-contain" />
      </figure>
      <div class="card-body">
        <div class="flex items-center gap-2 mb-2">
          <div class="flex text-yellow-400">
            ${starsHTML}
          </div>
          <span class="text-sm text-gray-600">(${product.rating.count})</span>
        </div>
        <h3 class="card-title text-lg line-clamp-1">${product.title}</h3>
        <p class="text-gray-600 text-sm line-clamp-2">${product.description}</p>
        <div class="flex items-center justify-between mt-4">
          <span class="text-2xl font-bold text-primary">$${product.price.toFixed(2)}</span>
          <button class="btn btn-sm btn-outline btn-primary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
}

// Get top rated products
function getTopRatedProducts(products, count) {
  return [...products]
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, count);
}

// Show product details in modal
function showProductDetails(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product || !modal || !modalContent) return;

  const rating = Math.round(product.rating.rate);
  const fullStars = rating;
  const hasHalfStar = product.rating.rate % 1 !== 0;
  const emptyStars = 5 - Math.ceil(product.rating.rate);

  let starsHTML = "";

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fa-solid fa-star"></i>';
  }

  if (hasHalfStar) {
    starsHTML += '<i class="fa-regular fa-star-half-stroke"></i>';
  }

  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="fa-regular fa-star"></i>';
  }

  modalContent.innerHTML = `
    <div class="flex flex-col md:flex-row gap-8">
      <div class="md:w-1/2">
        <img src="${product.image}" alt="${product.title}" class="w-full h-auto object-contain rounded-lg" />
      </div>
      <div class="md:w-1/2">
        <span class="badge badge-lg badge-outline mb-4">${product.category}</span>
        <h3 class="text-2xl font-bold mb-4">${product.title}</h3>
        <div class="flex items-center gap-4 mb-4">
          <div class="flex text-yellow-400">
            ${starsHTML}
          </div>
          <span class="text-gray-600">(${product.rating.count} reviews)</span>
        </div>
        <p class="text-gray-700 mb-6">${product.description}</p>
        <div class="flex items-center justify-between">
          <span class="text-3xl font-bold text-primary">$${product.price.toFixed(2)}</span>
          <button class="btn btn-primary add-to-cart-from-modal" data-product-id="${product.id}">
            <i class="fa-solid fa-cart-plus mr-2"></i>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  modal.showModal();

  // Add event listener for the modal's add to cart button
  const modalAddToCart = modalContent.querySelector(".add-to-cart-from-modal");
  if (modalAddToCart) {
    modalAddToCart.addEventListener("click", () => {
      addToCart(product.id);
      modal.close();
    });
  }
}

// Cart Functions
function addToCart(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  }

  updateCartUI();
}

function updateCartUI() {
  if (!cartCount || !cartItemsSpan || !cartSubtotal) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartItemsSpan.textContent = `${totalItems} item${totalItems !== 1 ? "s" : ""}`;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  cartSubtotal.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
}

// Event Listeners
document.addEventListener("click", (e) => {
  // Add to cart button
  if (
    e.target.classList.contains("add-to-cart") ||
    e.target.parentElement?.classList.contains("add-to-cart")
  ) {
    const button = e.target.classList.contains("add-to-cart")
      ? e.target
      : e.target.parentElement;
    const productId = parseInt(button.dataset.productId);
    addToCart(productId);

    button.classList.remove("btn-outline", "btn-primary");
    button.classList.add("btn-success");
    button.innerHTML = '<i class="fa-solid fa-check"></i>';

    setTimeout(() => {
      button.classList.remove("btn-success");
      button.classList.add("btn-outline", "btn-primary");
      button.innerHTML = '<i class="fa-solid fa-cart-plus"></i>';
    }, 1500);
  }

  // Details button
  if (
    e.target.classList.contains("details-btn") ||
    e.target.parentElement?.classList.contains("details-btn")
  ) {
    const button = e.target.classList.contains("details-btn")
      ? e.target
      : e.target.parentElement;
    const productId = parseInt(button.dataset.productId);
    showProductDetails(productId);
  }

  // View Cart button
  if (e.target === viewCartBtn || e.target.parentElement === viewCartBtn) {
    alert(
      `Cart has ${cart.length} items. Total: $${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}`,
    );
    console.log("Current cart:", cart);
  }
});

// Initialize cart UI
updateCartUI();
