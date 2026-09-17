const API_URL = "https://fooddel-i1su.onrender.com";
const foods = [
  { id: 1, name: "Campus Burger", category: "Burgers", price: 99, emoji: "🍔", description: "Crispy patty, lettuce, tomato and house sauce." },
  { id: 2, name: "Farmhouse Pizza", category: "Pizza", price: 199, emoji: "🍕", description: "Loaded with onion, capsicum, corn and cheese." },
  { id: 3, name: "Paneer Wrap", category: "Wraps", price: 119, emoji: "🌯", description: "Spicy paneer, fresh veggies and creamy dressing." },
  { id: 4, name: "Masala Maggi", category: "Snacks", price: 69, emoji: "🍜", description: "Classic noodles tossed with campus-style masala." },
  { id: 5, name: "Veg Sandwich", category: "Snacks", price: 79, emoji: "🥪", description: "Toasted bread with vegetables, cheese and chutney." },
  { id: 6, name: "French Fries", category: "Sides", price: 89, emoji: "🍟", description: "Golden, crispy fries with a seasoning sprinkle." },
  { id: 7, name: "Choco Shake", category: "Drinks", price: 109, emoji: "🥤", description: "Cold chocolate shake topped with chocolate." },
  { id: 8, name: "Cold Coffee", category: "Drinks", price: 99, emoji: "🧋", description: "Creamy chilled coffee for late-night study sessions." },
  { id: 9, name: "Veg Biryani", category: "Meals", price: 149, emoji: "🍛", description: "Fragrant basmati rice with vegetables and spices." },
  { id: 10, name: "Chole Bhature", category: "Meals", price: 129, emoji: "🥘", description: "Spiced chickpeas served with fluffy bhature." },
  { id: 11, name: "Momos", category: "Snacks", price: 109, emoji: "🥟", description: "Steamed vegetable momos with spicy chutney." },
  { id: 12, name: "Gulab Jamun", category: "Desserts", price: 59, emoji: "🍮", description: "Soft sweet dumplings served warm." }
];

let cart = JSON.parse(localStorage.getItem("campusbite-cart") || "[]");
let activeCategory = "All";
let searchTerm = "";

const foodGrid = document.getElementById("foodGrid");
const categories = document.getElementById("categories");
const emptyState = document.getElementById("emptyState");
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const subtotalEl = document.getElementById("subtotal");
const deliveryEl = document.getElementById("delivery");
const totalEl = document.getElementById("total");
const checkoutModal = document.getElementById("checkoutModal");
const successModal = document.getElementById("successModal");

function money(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function saveCart() {
  localStorage.setItem("campusbite-cart", JSON.stringify(cart));
}

function renderCategories() {
  const cats = ["All", ...new Set(foods.map(food => food.category))];
  categories.innerHTML = cats.map(cat =>
    `<button class="category-btn ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${cat}</button>`
  ).join("");

  categories.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderCategories();
      renderFoods();
    });
  });
}

function filteredFoods() {
  return foods.filter(food => {
    const categoryMatch = activeCategory === "All" || food.category === activeCategory;
    const searchMatch = `${food.name} ${food.description} ${food.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });
}

function renderFoods() {
  const list = filteredFoods();
  foodGrid.innerHTML = list.map(food => `
    <article class="food-card">
      <div class="food-image" aria-hidden="true">${food.emoji}</div>
      <div class="food-info">
        <div class="food-top">
          <h3>${food.name}</h3>
          <span class="price">${money(food.price)}</span>
        </div>
        <p>${food.description}</p>
        <button class="add-btn" data-add="${food.id}" type="button">+ Add to Cart</button>
      </div>
    </article>
  `).join("");

  emptyState.classList.toggle("hidden", list.length !== 0);
  foodGrid.querySelectorAll("[data-add]").forEach(button => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.add)));
  });
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
  renderCart();
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const detailed = cart.map(item => ({
    ...item,
    food: foods.find(food => food.id === item.id)
  })).filter(item => item.food);

  if (!detailed.length) {
    cartItems.innerHTML = `<div class="empty-cart">Your cart is empty.<br><br>Add something delicious from the menu.</div>`;
  } else {
    cartItems.innerHTML = detailed.map(item => `
      <div class="cart-item">
        <div class="cart-thumb">${item.food.emoji}</div>
        <div>
          <h4>${item.food.name}</h4>
          <div class="item-price">${money(item.food.price)} each</div>
          <div class="qty">
            <button type="button" data-minus="${item.id}" aria-label="Decrease quantity">−</button>
            <span>${item.qty}</span>
            <button type="button" data-plus="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div style="text-align:right">
          <strong>${money(item.food.price * item.qty)}</strong><br>
          <button class="remove" type="button" data-remove="${item.id}">Remove</button>
        </div>
      </div>
    `).join("");
  }

  cartItems.querySelectorAll("[data-minus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.minus), -1)));
  cartItems.querySelectorAll("[data-plus]").forEach(btn => btn.addEventListener("click", () => changeQty(Number(btn.dataset.plus), 1)));
  cartItems.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => removeFromCart(Number(btn.dataset.remove))));

  const subtotal = detailed.reduce((sum, item) => sum + item.food.price * item.qty, 0);
  const delivery = subtotal > 0 ? 30 : 0;
  cartCount.textContent = detailed.reduce((sum, item) => sum + item.qty, 0);
  subtotalEl.textContent = money(subtotal);
  deliveryEl.textContent = money(delivery);
  totalEl.textContent = money(subtotal + delivery);
  document.getElementById("checkoutBtn").disabled = detailed.length === 0;
}

function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

document.getElementById("cartBtn").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.getElementById("search").addEventListener("input", event => {
  searchTerm = event.target.value;
  renderFoods();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  closeCart();
  openModal(checkoutModal);
});
document.getElementById("closeCheckout").addEventListener("click", () => closeModal(checkoutModal));
document.getElementById("doneBtn").addEventListener("click", () => closeModal(successModal));

document.getElementById("checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();

  const form = new FormData(event.target);

  const orderData = {
    name: form.get("name"),
    phone: form.get("phone"),
    address: form.get("address"),
    payment: form.get("payment"),
    items: cart
  };

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to place order");
    }

    document.getElementById("successMessage").textContent =
      `Order ${data.order.orderId} has been placed for ${money(data.order.total)}. Your food will be prepared shortly.`;

    cart = [];
    saveCart();
    renderCart();
    event.target.reset();
    closeModal(checkoutModal);
    openModal(successModal);

  } catch (error) {
    alert("Unable to place order: " + error.message);
  }
});

renderCategories();
renderFoods();
renderCart();
