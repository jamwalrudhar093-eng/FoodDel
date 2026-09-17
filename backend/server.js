const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

app.use(express.json());
app.use(express.static(__dirname));

const foods = [
  { id: 1, name: 'Campus Burger', category: 'Burgers', price: 99, emoji: '🍔', description: 'Crispy patty, lettuce, tomato and house sauce.' },
  { id: 2, name: 'Farmhouse Pizza', category: 'Pizza', price: 199, emoji: '🍕', description: 'Loaded with onion, capsicum, corn and cheese.' },
  { id: 3, name: 'Paneer Wrap', category: 'Wraps', price: 119, emoji: '🌯', description: 'Spicy paneer, fresh veggies and creamy dressing.' },
  { id: 4, name: 'Masala Maggi', category: 'Snacks', price: 69, emoji: '🍜', description: 'Classic noodles tossed with campus-style masala.' },
  { id: 5, name: 'Veg Sandwich', category: 'Snacks', price: 79, emoji: '🥪', description: 'Toasted bread with vegetables, cheese and chutney.' },
  { id: 6, name: 'French Fries', category: 'Sides', price: 89, emoji: '🍟', description: 'Golden, crispy fries with a seasoning sprinkle.' },
  { id: 7, name: 'Choco Shake', category: 'Drinks', price: 109, emoji: '🥤', description: 'Cold chocolate shake topped with chocolate.' },
  { id: 8, name: 'Cold Coffee', category: 'Drinks', price: 99, emoji: '🧋', description: 'Creamy chilled coffee for late-night study sessions.' },
  { id: 9, name: 'Veg Biryani', category: 'Meals', price: 149, emoji: '🍛', description: 'Fragrant basmati rice with vegetables and spices.' },
  { id: 10, name: 'Chole Bhature', category: 'Meals', price: 129, emoji: '🥘', description: 'Spiced chickpeas served with fluffy bhature.' },
  { id: 11, name: 'Momos', category: 'Snacks', price: 109, emoji: '🥟', description: 'Steamed vegetable momos with spicy chutney.' },
  { id: 12, name: 'Gulab Jamun', category: 'Desserts', price: 59, emoji: '🍮', description: 'Soft sweet dumplings served warm.' }
];

function ensureDataFile() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, '[]');
  }
}

function readOrders() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
}

function writeOrders(orders) {
  ensureDataFile();
  fs.writeFileSync(
    ORDERS_FILE,
    JSON.stringify(orders, null, 2)
  );
}

function calculateOrder(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty');
  }

  const detailed = items.map(item => {
    const food = foods.find(
      f => f.id === Number(item.id)
    );

    const qty = Number(item.qty);

    if (
      !food ||
      !Number.isInteger(qty) ||
      qty < 1 ||
      qty > 50
    ) {
      throw new Error('Invalid cart item');
    }

    return {
      id: food.id,
      name: food.name,
      price: food.price,
      qty,
      emoji: food.emoji
    };
  });

  const subtotal = detailed.reduce(
    (sum, item) =>
      sum + item.price * item.qty,
    0
  );

  const delivery = subtotal > 0 ? 30 : 0;

  return {
    items: detailed,
    subtotal,
    delivery,
    total: subtotal + delivery
  };
}

/* Health Check */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'CampusBite API'
  });
});

/* Get Food Menu */
app.get('/api/foods', (req, res) => {
  const { category, search } = req.query;

  let result = foods;

  if (category && category !== 'All') {
    result = result.filter(
      food =>
        food.category.toLowerCase() ===
        String(category).toLowerCase()
    );
  }

  if (search) {
    const q = String(search).toLowerCase();

    result = result.filter(food =>
      `${food.name} ${food.description} ${food.category}`
        .toLowerCase()
        .includes(q)
    );
  }

  res.json(result);
});

/* Get All Orders */
app.get('/api/orders', (req, res) => {
  const orders = readOrders().sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  res.json(orders);
});

/* Get Single Order */
app.get('/api/orders/:id', (req, res) => {
  const orders = readOrders();

  const order = orders.find(
    o => o.orderId === req.params.id
  );

  if (!order) {
    return res
      .status(404)
      .json({ error: 'Order not found' });
  }

  res.json(order);
});

/* Create Order */
app.post('/api/orders', (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      payment,
      items
    } = req.body;

    if (!name || !phone || !address || !payment) {
      return res.status(400).json({
        error:
          'Name, phone, address and payment are required'
      });
    }

    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({
        error:
          'Phone number must contain 10 digits'
      });
    }

    if (
      !['Cash on Delivery', 'UPI'].includes(payment)
    ) {
      return res.status(400).json({
        error: 'Invalid payment method'
      });
    }

    const bill = calculateOrder(items);

    const now = new Date().toISOString();

    const order = {
      orderId:
        'CB-' +
        crypto
          .randomBytes(4)
          .toString('hex')
          .toUpperCase(),

      customer: {
        name: String(name).trim(),
        phone: String(phone),
        address: String(address).trim()
      },

      payment,

      ...bill,

      status: 'Placed',

      createdAt: now,
      updatedAt: now
    };

    const orders = readOrders();

    orders.push(order);

    writeOrders(orders);

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

/* Update Order Status */
app.patch('/api/orders/:id/status', (req, res) => {

  const allowed = [
    'Placed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({
      error: 'Invalid status'
    });
  }

  const orders = readOrders();

  const order = orders.find(
    o => o.orderId === req.params.id
  );

  if (!order) {
    return res.status(404).json({
      error: 'Order not found'
    });
  }

  order.status = req.body.status;
  order.updatedAt = new Date().toISOString();

  writeOrders(orders);

  res.json(order);
});

/* Serve Frontend */
ensureDataFile();

app.listen(PORT, () => {
  console.log(
    `CampusBite running on port ${PORT}`
  );
});

ensureDataFile();

app.listen(PORT, () => {
  console.log(
    `CampusBite running on port ${PORT}`
  );
});
