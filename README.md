# 🌱 Fresh Greenhouse - E-commerce Website

A modern, professional e-commerce website for selling fresh vegetables from greenhouse farms. Built with Next.js, Prisma, and Neon Database with beautiful animations and a green theme.

## ✨ Features

- **Modern Design**: Beautiful, responsive design with green theme
- **Smooth Animations**: Powered by Framer Motion for engaging user experience
- **Product Catalog**: Browse peppers, carrots, and cucumbers with filtering
- **Shopping Cart**: Add products to cart with real-time updates
- **Database Integration**: Prisma ORM with Neon PostgreSQL database
- **TypeScript**: Full type safety throughout the application
- **Responsive**: Mobile-first design that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom green theme
- **Animations**: Framer Motion
- **Database**: Neon PostgreSQL with Prisma ORM
- **Icons**: Lucide React
- **Deployment Ready**: Optimized for Vercel deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon Database account (free tier available)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd greenhouse-ecommerce
npm install
```

### 2. Database Setup

1. Create a free account at [Neon](https://neon.tech)
2. Create a new database project
3. Copy your database URL
4. Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xyz-123456.us-east-1.aws.neon.tech/greenhouse_db?sslmode=require"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Fresh Greenhouse"
```

### 3. Database Migration and Seeding

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample products
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your website!

## 📁 Project Structure

```
greenhouse-ecommerce/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with green theme
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   └── products/
│   │       └── page.tsx         # Products page
│   ├── lib/
│   │   └── db.ts               # Database connection
│   └── generated/
│       └── prisma/             # Generated Prisma client
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding script
├── public/
│   └── images/                 # Product images
└── tailwind.config.ts          # Tailwind configuration
```

## 🎨 Design Features

### Color Palette
- **Primary Green**: Various shades of green for the main theme
- **Secondary Yellow**: Warm yellows for accents and highlights
- **Accent Blue**: Cool blues for additional elements
- **Neutral Grays**: For text and subtle elements

### Animations
- **Page Transitions**: Smooth fade-in and slide-up animations
- **Hover Effects**: Scale and rotation effects on interactive elements
- **Loading States**: Skeleton loading and stagger animations
- **Floating Elements**: Gentle floating animations for visual interest

### Typography
- **Font**: Inter font family for modern, clean readability
- **Hierarchy**: Clear typography scale with proper contrast
- **Responsive**: Fluid typography that scales with screen size

## 🗄️ Database Schema

### Products
- ID, name, description, price
- Image URL, category, color
- Stock quantity and availability
- Timestamps for creation and updates

### Cart & Orders
- Shopping cart functionality
- Order management system
- Customer information storage
- Order status tracking

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production

```env
DATABASE_URL="your-neon-production-database-url"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_NAME="Fresh Greenhouse"
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
```

## 📱 Pages

### Homepage (`/`)
- Hero section with animated elements
- Feature highlights (Natural, Fresh Delivery, Sustainable)
- Product preview cards
- Customer testimonials section
- Professional footer

### Products Page (`/products`)
- Complete product catalog
- Category filtering (All, Peppers, Carrots, Cucumbers)
- Shopping cart functionality
- Product ratings and stock status
- Responsive grid layout

## 🎯 Future Enhancements

- [ ] User authentication and accounts
- [ ] Checkout and payment processing
- [ ] Order tracking and history
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Admin dashboard for inventory management
- [ ] Email notifications
- [ ] Search functionality
- [ ] Product recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Prisma](https://www.prisma.io/) for database management
- [Neon](https://neon.tech/) for serverless PostgreSQL
- [Lucide](https://lucide.dev/) for beautiful icons

---

Built with ❤️ for sustainable agriculture and fresh produce delivery.
