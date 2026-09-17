# CampusBite — Food Ordering App

A responsive front-end food ordering website made with **HTML, CSS and vanilla JavaScript**. It is designed as a college project and can be deployed directly to GitHub Pages.

## Features

- Responsive modern UI
- Food menu with 12 sample items
- Category filtering
- Search dishes
- Add to cart
- Increase/decrease item quantity
- Remove items
- Cart subtotal, delivery fee and total
- Checkout form
- Order confirmation with generated order ID
- Cart saved in `localStorage`
- No backend or database required
- Ready for GitHub Pages

## Project structure

```text
food-ordering-app/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Run locally

Simply open `index.html` in a browser.

For a local development server, you can also use VS Code Live Server.

## Deploy on GitHub Pages

1. Create a new GitHub repository, for example `food-ordering-app`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save.
7. GitHub will provide your public website URL.

## Important project limitation

This is a front-end demonstration. Orders are not sent to a real restaurant because there is no backend/database/payment gateway.

For a full-stack version, you could add:
- Node.js + Express backend
- MongoDB database
- User login/signup
- Restaurant/admin dashboard
- Real order tracking
- Payment gateway
- Order history
