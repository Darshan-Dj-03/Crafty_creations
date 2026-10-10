# Crafty Creations demo storefront

A responsive, multi-page customer storefront demo for the Crafty Creations handmade gifting brand. It uses plain HTML, CSS and JavaScript so there is no build setup or backend to maintain for this demo.

## Preview

Open `index.html` directly in a browser. Customers can browse the home page, filter and search the shop, view product details, save favourites, add items to the bag, adjust quantities, enter delivery and gift details, and complete a clearly labelled demo checkout.

## Updating the product photos and catalog

- Product photos are stored in `public/products/`.
- Product names, categories, prices, descriptions and image paths are in `products.js` (`window.CRAFTY_PRODUCTS`). Add or remove objects there as needed.
- Replace a photo by keeping its existing filename, or update the matching `image` value in `products.js`.
- The red rose bouquet uses the supplied product photo. The other three early catalog visuals are crops from the supplied Instagram highlight screenshot, so replace them with original-resolution Instagram photos before launch.
- The supplied brand logo is in `public/brand-mark.png`.

When a backend is added, `products.js` can be replaced with data from an API while keeping the storefront UI and product fields intact.

## Demo behavior

- `shop.html` is the searchable, filterable catalog.
- `product.html?id=rose-bouquet` shows a selected product and sample customization choices.
- `cart.html` supports quantity changes and removing products.
- `checkout.html` collects sample delivery and gift details. Submitting stores a local demo order and opens `order-confirmation.html`; it does not charge or submit to the business.
- Category filters, product links, favourites, and bag contents work across pages. Favourites and the demo bag persist in local storage.
- Mobile navigation collapses into a menu. Scroll-entry reveals and pointer-driven depth/tilt add motion, while the page keeps normal non-smooth scrolling and respects reduced-motion settings.
- Instagram links point to the brand profile shown in the supplied reference.

The displayed prices are illustrative placeholders and should be confirmed by the business before publication. A real checkout needs a backend, delivery rules, and payment/order integrations before it can accept customer orders.
