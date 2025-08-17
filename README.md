# GroceryGo - Online Grocery Store

A modern, responsive online grocery store built with React.js, Node.js, Express, and MongoDB. Features include user authentication, product management, shopping cart functionality, and an admin dashboard.

## Features

### 🛒 Customer Features

- **User Authentication**: Secure login/signup system
- **Product Browsing**: Browse products by category with search and filter
- **Shopping Cart**: Add/remove items, update quantities
- **Quick Picks**: Random product recommendations
- **User Profile**: Manage personal information and view order history
- **Responsive Design**: Works on desktop, tablet, and mobile

### 👨‍💼 Admin Features

- **Dashboard**: Overview of sales, users, and products
- **Product Management**: CRUD operations for products
- **User Management**: View and manage user accounts
- **Order Management**: Track and manage orders
- **Real-time Statistics**: Sales and inventory analytics

### 🎨 Design Features

- **Modern UI**: Clean, professional design with Bootstrap 5
- **Theme Consistency**: Green color scheme matching grocery theme
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Mobile-First**: Responsive design for all screen sizes

## Tech Stack

### Frontend

- **React.js 19** - UI framework
- **Bootstrap 5** - CSS framework
- **React Router** - Navigation
- **React Icons** - Icon library
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Express Session** - Session management
- **CORS** - Cross-origin resource sharing

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd grocerygo
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Database Setup

Make sure MongoDB is running on your system. The application will connect to `mongodb://localhost:27017/grocerygo`

### 4. Seed the Database

```bash
npm run seed
```

This will create sample products and users:

- **Admin User**: admin@grocerygo.com / admin123
- **Regular User**: john@example.com / password123

### 5. Start Backend Server

```bash
npm start
# or for development with auto-restart
npm run dev
```

Backend will run on `http://localhost:5000`

### 6. Frontend Setup

```bash
cd ../frontend
npm install
```

### 7. Start Frontend Development Server

```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Project Structure

```
grocerygo/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── cartController.js
│   │   └── productController.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   └── cartModel.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── cartRoutes.js
│   │   └── productRoutes.js
│   ├── server.js
│   ├── seedData.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MyNavbar.js
│   │   │   ├── HomeBanner.js
│   │   │   ├── Categories.js
│   │   │   ├── Features.js
│   │   │   └── QuickPicks.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Products.js
│   │   │   ├── Cart.js
│   │   │   ├── Profile.js
│   │   │   ├── Admin.js
│   │   │   ├── Login.js
│   │   │   └── Signup.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Check session
- `PUT /api/auth/profile` - Update profile

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item quantity
- `DELETE /api/cart/:productId` - Remove item from cart

### Admin

- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/products` - Get all products

## Usage

### For Customers

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Products**: Use search and filters to find products
3. **Add to Cart**: Click "Add to Cart" on any product
4. **Manage Cart**: View cart, update quantities, or remove items
5. **Checkout**: Proceed to checkout (implementation pending)
6. **Profile**: Update personal information and view order history

### For Admins

1. **Login**: Use admin credentials (admin@grocerygo.com / admin123)
2. **Dashboard**: View sales statistics and overview
3. **Manage Products**: Add, edit, or delete products
4. **User Management**: View user accounts and details
5. **Order Management**: Track and manage customer orders

## Customization

### Adding New Categories

1. Update the category options in the Admin product form
2. Add category-specific styling in `App.css`
3. Update the filter options in the Products page

### Styling Changes

- Modify `frontend/src/App.css` for global styles
- Use Bootstrap classes for component-specific styling
- Update CSS variables in `:root` for theme colors

### Adding New Features

1. Create new components in `frontend/src/components/`
2. Add new pages in `frontend/src/pages/`
3. Create corresponding backend routes and controllers
4. Update the main App.js routing

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `backend/config/db.js`

2. **CORS Errors**

   - Verify backend CORS configuration
   - Check frontend API calls use correct URLs

3. **Session Issues**

   - Clear browser cookies
   - Check session configuration in `server.js`

4. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for version conflicts in package.json

### Development Tips

1. **Hot Reload**: Use `npm run dev` for backend auto-restart
2. **Database Reset**: Run `npm run seed` to reset with sample data
3. **Browser DevTools**: Use React DevTools for component debugging
4. **API Testing**: Use Postman or similar tools to test endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Happy Shopping! 🛒**
