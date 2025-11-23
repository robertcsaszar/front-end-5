# 🏛️ Rogue Merchant Guild

A medieval fantasy browser-based trading empire game where players build wealth through clever deals, strategic trading, and sometimes... questionable business practices.

## 🎮 Game Overview

Rise from a humble street peddler to a powerful merchant prince by:
- **Trading goods** across medieval kingdoms
- **Managing risk** between legal and illegal operations
- **Building your empire** with shops, warehouses, and black markets
- **Forming guilds** to dominate markets and compete with rivals
- **Navigating events** like wars, plagues, and festivals that affect prices
- **Competing** on leaderboards for wealth and influence

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/rogue-merchant-guild.git
cd rogue-merchant-guild

# Install dependencies
cd server && npm install
cd ../client && npm install

# Setup environment variables
cd ../server
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development servers
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

Visit `http://localhost:5173` to start playing!

## 📚 Documentation

- **[Technical Implementation Guide](./TECHNICAL_IMPLEMENTATION.md)** - Complete technical architecture and implementation details
- **[Development Guide](./DEVELOPMENT_GUIDE.md)** - Strict coding standards, patterns, and best practices
- **[Game Design Document](./GAME_DESIGN.md)** - Full game mechanics and features
- **[API Documentation](./docs/API.md)** - API endpoints reference (coming soon)

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Redux Toolkit + React Query
- Tailwind CSS
- Vite
- Socket.IO Client

### Backend
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- Redis
- JWT Authentication
- Socket.IO
- Bull (Job Queue)

### DevOps
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Nginx

## 🎯 Core Features

### Phase 1 (Current)
- ✅ User authentication and registration
- ✅ Player progression system
- ✅ Basic trading operations
- ✅ Inventory management
- ✅ Energy system
- ⏳ Market prices and economy

### Phase 2 (Planned)
- ⏳ Guild system
- ⏳ Player-to-player trading
- ⏳ Marketplace
- ⏳ Buildings and upgrades
- ⏳ Achievement system

### Phase 3 (Future)
- ⏳ Game events (wars, festivals, disasters)
- ⏳ Espionage and sabotage
- ⏳ Political influence
- ⏳ Multiple kingdoms
- ⏳ Caravan system

### Phase 4 (Long-term)
- ⏳ Mobile app
- ⏳ Advanced guild features
- ⏳ Player-run markets
- ⏳ Seasonal content

## 🔒 Security

This game implements multiple security measures:
- **JWT authentication** with refresh tokens
- **Bcrypt password hashing** (12 rounds)
- **Rate limiting** on all endpoints
- **Input validation** with express-validator
- **Anti-cheat detection** system
- **Server-side validation** for all game actions
- **Activity logging** for audit trails
- **SQL injection protection** via Prisma
- **XSS prevention** via React auto-escaping

See [Security Standards](./DEVELOPMENT_GUIDE.md#security-standards) for details.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

Target: 80%+ code coverage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the [Development Guide](./DEVELOPMENT_GUIDE.md)
4. Commit changes (`git commit -m 'feat: add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Commit Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New features
- `fix:` Bug fixes
- `refactor:` Code restructuring
- `perf:` Performance improvements
- `test:` Adding tests
- `docs:` Documentation changes
- `chore:` Maintenance tasks

## 📊 Project Structure

```
rogue-merchant-guild/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── features/    # Feature modules
│   │   ├── store/       # Redux store
│   │   ├── api/         # API integration
│   │   └── utils/       # Utilities
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # API routes
│   │   ├── validators/  # Input validation
│   │   └── prisma/      # Database schema
│   └── package.json
├── docs/                # Documentation
├── docker/              # Docker configuration
└── README.md
```

## 🎮 Game Mechanics

### Trading Operations
- **Simple Trade**: Low risk, 15% profit, 5 minutes
- **Smuggling**: Medium risk, 50% profit, 15 minutes (jail risk)
- **Black Market**: High risk, 100% profit, 30 minutes (high jail risk)
- **Caravan**: Medium risk, 200% profit, 2 hours

### Energy System
- All actions cost energy
- Regenerates 1 per minute
- Max energy increases with level

### Progression
- 15 merchant ranks from Street Peddler to Merchant King
- Level up by completing trades and earning experience
- Unlock new features, buildings, and operations

### Economy
- Dynamic market prices based on supply/demand
- Seasonal events affect prices
- Player actions influence the market

## 🐛 Bug Reports

Found a bug? Please create an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser/OS information

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inspired by The Crims and similar browser-based MMORPGs
- Built with modern web technologies
- Community feedback and suggestions

## 📧 Contact

- Project Link: [https://github.com/yourusername/rogue-merchant-guild](https://github.com/yourusername/rogue-merchant-guild)
- Discord: Coming soon
- Email: contact@rogueguild.com

---

**⚠️ Note**: This is a game project in active development. Features and mechanics are subject to change.

**🎮 Happy Trading, Merchant!**
