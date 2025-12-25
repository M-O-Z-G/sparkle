# Sparkle

<h3 align="center">Another <a href="https://github.com/MetaCubeX/mihomo">Mihomo</a> GUI</h3>

<p align="center">
  <a href="https://github.com/xishang0128/sparkle/releases">
    <img src="https://img.shields.io/github/release/xishang0128/sparkle/all.svg">
  </a>
  <a href="https://t.me/+y7rcYjEKIiI1NzZl">
    <img src="https://img.shields.io/badge/Telegram-Group-blue?logo=telegram">
  </a>
</p>

## Features

- [x] Out-of-the-box TUN without service mode
- [x] Multiple color themes available, brand new UI
- [x] Support for most common Mihomo configuration modifications
- [x] Built-in stable and preview version of Mihomo core
- [x] One-click backup and restore configuration via WebDAV
- [x] Powerful override function, arbitrary modification of configuration files
- [x] Deep integration with Sub-Store for easy subscription management

## Development

This project is for personal use, most PRs may not be merged, you can fork and modify it yourself.

### Environment Requirements

- **Node.js**: >= 20.0.0 (LTS version recommended)
- **pnpm**: >= 9.0.0 (required)
- **Git**: Latest version

### Technology Stack

Sparkle is built on Electron + React + TypeScript

#### Frontend Technology Stack

- **React 19** - User interface framework
- **TypeScript** - Type-safe JavaScript
- **HeroUI (NextUI)** - UI component library
- **Tailwind CSS** - Atomic CSS framework
- **Monaco Editor** - Code editor

#### Backend Technology Stack

- **Electron** - Application main process
- **Mihomo Core** - Proxy core
- **sysproxy-go** - System proxy integration

### Quick Start

1. **Clone the project**

```bash
git clone https://github.com/xishang0128/sparkle.git
cd sparkle
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Handle Electron installation issues** (if pnpm dev and other commands fail to run successfully)

```bash
# If Electron is not installed correctly, execute the following commands
cd node_modules/electron
node install.js
cd ../..
```

4. **Start development server**

```bash
pnpm dev
```

### Notes

On Windows, there may be a white screen during development, just disable TUN (virtual network adapter)

### Project Structure

```
sparkle/
├── src/
│   ├── main/               # Electron main process
│   │   ├── core/           # Core management
│   │   ├── config/         # Configuration management
│   │   ├── resolve/        # Resolvers
│   │   ├── sys/            # System integration
│   │   └── utils/          # Utility functions
│   ├── renderer/           # Electron renderer process (frontend interface)
│   │   ├── src/
│   │   │   ├── assets/     # Static assets
│   │   │   ├── components/ # React components
│   │   │   ├── pages/      # Page components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── routes/     # Route configuration
│   │   │   └── utils/      # Frontend utilities
│   │   └── index.html      # Renderer process entry HTML
│   ├── preload/            # Electron preload scripts (inter-process communication bridge)
│   │   ├── index.ts        # Preload script main file
│   │   └── index.d.ts      # Preload script type definitions
│   └── shared/             # Shared resources
│       └── types           # Global type definitions
├── resources/              # Application resource files
├── build/                  # Build configuration
├── extra/                  # Extra resources
├── dist/                   # Build output directory
├── electron-builder.yml    # Package configuration
├── package.json            # Project configuration
└── README.md               # Project documentation
```

### Available Scripts

#### Development Commands

- `pnpm dev` - Start development server (frontend hot reload, backend requires manual restart)
- `pnpm typecheck` - TypeScript type checking
- `pnpm typecheck:node` - Main process type checking
- `pnpm typecheck:web` - Renderer process type checking
- `pnpm lint` - Run code linting
- `pnpm format` - Format code

#### Build Commands

- `pnpm build:win` - Build Windows version
- `pnpm build:mac` - Build macOS version
- `pnpm build:linux` - Build Linux version

#### Other Commands

- `pnpm prepare` - Prepare build environment
- `pnpm postinstall` - Install Electron dependencies

### Build and Release

#### Environment Preparation

Prepare the corresponding build environment according to the target platform:

**Windows build:**

```bash
pnpm build:win
```

**macOS build:**

```bash
pnpm build:mac
```

**Linux build:**

```bash
pnpm build:linux
```

**Specify architecture:**

```bash
pnpm build:win --x64/--arm64
pnpm build:mac --arm64/--x64
pnpm build:linux --x64/--arm64
```

**Specify artifact type:**

```bash
pnpm build:win 7z/nsis
pnpm build:linux deb/rpm/pacman
pnpm build:mac pkg/dmg
```

**Specify architecture and artifact type:**

```bash
pnpm build:win 7z --x64
pnpm build:mac pkg --arm64
pnpm build:linux deb --x64
```

#### Build Artifacts

- **Windows**: `.exe` installer and `.7z` portable version
- **macOS**: `.pkg` installer
- **Linux**: `.deb`, `.rpm`, `.pkg.tar.xz (pacman)` and other formats

### Common Issues

#### Package Manager Requirement

This project uses pnpm as the package manager.

Make sure to use pnpm 9.0.0 or higher:

```bash
pnpm --version
```

#### Node.js Version Requirement

Make sure to use Node.js 20.0.0 or higher:

```bash
node --version
```

#### Development Environment Issues

- Make sure Node.js version >= 20.0.0
- Use pnpm for dependency management

### Contribution Guide

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create a Pull Request

### Development Notes

- Make sure code passes ESLint checks
- Run `pnpm format` to format code before committing
- Follow existing code style and naming conventions
- Update relevant documentation when adding new features
- Main process code modifications require restarting the development server
- Renderer process code supports hot reloading
- All commands use pnpm
- After modifying type definitions, TypeScript service needs to be restarted
- Preload script modifications require restarting the application

## Star History

<a href="https://www.star-history.com/#xishang0128/sparkle&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=xishang0128/sparkle&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=xishang0128/sparkle&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=xishang0128/sparkle&type=Date" />
 </picture>
</a>
