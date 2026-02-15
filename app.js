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
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartTotalSpan = document.getElementById("cart-total");

// Helper Functions
function formatCategoryName(category) {
  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function generateStarsHTML(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

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

  return starsHTML;
}

// Cart Functions
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

function displayCartItems() {
  if (!cartItemsContainer || !cartTotalSpan) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="text-center py-8">
        <i class="fa-solid fa-cart-shopping text-4xl text-gray-300 mb-4"></i>
        <p class="text-gray-500">Your cart is empty</p>
      </div>
    `;
    cartTotalSpan.textContent = "$0.00";
    return;
  }

  let total = 0;
  let cartHTML = "";

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    cartHTML += `
      <div class="flex items-center gap-4 bg-base-100 p-4 rounded-lg shadow-sm" data-cart-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain" />
        <div class="flex-1">
          <h4 class="font-semibold line-clamp-1">${item.title}</h4>
          <p class="text-sm text-gray-500">$${item.price.toFixed(2)} x ${item.quantity}</p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-xs btn-outline btn-primary quantity-btn" data-product-id="${item.id}" data-action="decrease">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="w-8 text-center">${item.quantity}</span>
          <button class="btn btn-xs btn-outline btn-primary quantity-btn" data-product-id="${item.id}" data-action="increase">
            <i class="fa-solid fa-plus"></i>
          </button>
          <button class="btn btn-xs btn-error remove-item" data-product-id="${item.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = cartHTML;
  cartTotalSpan.textContent = `$${total.toFixed(2)}`;
}

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

  // Show success feedback
  const cartIcon = document.querySelector(".fa-cart-shopping");
  if (cartIcon) {
    cartIcon.classList.add("text-primary", "scale-110");
    setTimeout(() => {
      cartIcon.classList.remove("text-primary", "scale-110");
    }, 300);
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  updateCartUI();
  displayCartItems();
}

function updateQuantity(productId, action) {
  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      removeFromCart(productId);
      return;
    }
  }

  updateCartUI();
  displayCartItems();
}

// Product Display Functions
function createProductCard(product) {
  const starsHTML = generateStarsHTML(product.rating.rate);
  const displayCategory = formatCategoryName(product.category);

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

function createTrendingCard(product) {
  const starsHTML = generateStarsHTML(product.rating.rate);

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

function getTopRatedProducts(products, count) {
  return [...products]
    .sort((a, b) => b.rating.rate - a.rating.rate)
    .slice(0, count);
}

// Category Functions
function displayCategories(categories) {
  if (!categoryContainer) return;

  let categoriesHTML = `
    <button class="btn btn-sm rounded-full category-btn ${currentCategory === "all" ? "bg-black text-white hover:bg-gray-800" : "bg-white hover:bg-gray-100"}" data-category="all">
      All Products
    </button>
  `;

  categories.forEach((category) => {
    const displayName = formatCategoryName(category);

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

      // Update active state for all category buttons
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
        const displayName = formatCategoryName(category);
        categoryTitle.textContent = displayName;
        categoryDescription.textContent = `Explore our ${displayName} collection`;
      }

      // Load products for selected category
      await loadProductsByCategory(category);
    });
  });
}

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

// Modal Functions
function showProductDetails(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product || !modal || !modalContent) return;

  const starsHTML = generateStarsHTML(product.rating.rate);

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

// Event Handlers
function handleButtonClick(e) {
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

    // Visual feedback
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
    if (cartModal) {
      displayCartItems();
      cartModal.showModal();
    }
  }

  // Quantity buttons in cart modal
  if (
    e.target.classList.contains("quantity-btn") ||
    e.target.parentElement?.classList.contains("quantity-btn")
  ) {
    const button = e.target.classList.contains("quantity-btn")
      ? e.target
      : e.target.parentElement;
    const productId = parseInt(button.dataset.productId);
    const action = button.dataset.action;
    updateQuantity(productId, action);
  }

  // Remove from cart
  if (
    e.target.classList.contains("remove-item") ||
    e.target.parentElement?.classList.contains("remove-item")
  ) {
    const button = e.target.classList.contains("remove-item")
      ? e.target
      : e.target.parentElement;
    const productId = parseInt(button.dataset.productId);
    removeFromCart(productId);
    displayCartItems();
  }

  // Checkout button
  if (
    e.target.id === "checkout-btn" ||
    e.target.parentElement?.id === "checkout-btn"
  ) {
    if (cart.length === 0) {
      alert("Your cart is empty!");
    } else {
      alert("Thank you for your purchase! This is a demo store.");
      cart = [];
      updateCartUI();
      if (cartModal) cartModal.close();
    }
  }
}

// Initialization
document.addEventListener("DOMContentLoaded", async () => {
  // Add global click listener
  document.addEventListener("click", handleButtonClick);

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

  // Initialize cart UI
  updateCartUI();
});
