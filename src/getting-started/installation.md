# Installation & Setup

Get up and running with Kryon in minutes. This guide covers installing the Kryon compiler (`kryc`) and setting up your development environment.

## Install from Source

Currently, Kryon is available by building from source:

```bash
# Clone the repository
git clone https://github.com/kryon-lang/kryon.git
cd kryon

# Build with Rust (requires Rust 1.70+)
cargo build --release

# Install globally
cargo install --path .

# Or add to PATH manually
export PATH="$PWD/target/release:$PATH"
```

## Verify Installation

Check that the compiler is installed correctly:

```bash
kryc --version
# Should output: kryc 1.2.0
```

## Development Environment

### Text Editor Support

**Visual Studio Code** (Recommended)
- Install the [Kryon Extension](https://marketplace.visualstudio.com/items?itemName=kryon-lang.kryon)
- Provides syntax highlighting, IntelliSense, and live preview

```bash
code --install-extension kryon-lang.kryon
```

**Vim/Neovim**
```bash
# Install via vim-plug
Plug 'kryon-lang/vim-kryon'
```

**Sublime Text**
- Package Control: Install "Kryon Language Support"

**Other Editors**
- Generic syntax highlighting available for most editors
- See [Editor Support](../tools/editors/) for complete list

### Project Structure

Create a new Kryon project:

```bash
mkdir my-kryon-app
cd my-kryon-app

# Create main source file
touch main.kry

# Create assets directory
mkdir assets

# Optional: Initialize git
git init
echo "*.krb" >> .gitignore
echo "build/" >> .gitignore
```

Recommended project structure:

```
my-kryon-app/
├── main.kry              # Main application file
├── styles/
│   ├── theme.kry         # Theme and variables
│   └── components.kry    # Reusable styles
├── components/
│   ├── button.kry        # Custom components
│   └── card.kry
├── assets/
│   ├── images/
│   └── fonts/
├── scripts/
│   └── app.lua           # Application logic
└── build/                # Compiled output
    └── app.krb
```

## Compile Your First App

Create a simple app to test your setup:

```kry
# main.kry
App {
    window_title: "My First Kryon App"
    window_width: 400
    window_height: 300
    
    Container {
        layout: column center
        padding: 20
        
        Text {
            text: "Hello, Kryon!"
            font_size: 24
            font_weight: bold
            text_color: "#333333FF"
        }
        
        Button {
            text: "Click Me"
            background_color: "#007BFFFF"
            text_color: "#FFFFFFFF"
            padding: 12
            border_radius: 6
            margin_top: 16
        }
    }
}
```

Compile it:

```bash
kryc main.kry -o build/app.krb
```

You should see output like:

```
Compiling main.kry...
✓ Parsed 4 elements
✓ Resolved 12 properties  
✓ Generated 847 bytes
→ build/app.krb
```

## Runtime Options

To view your compiled app, you need a Kryon runtime:

### Desktop Runtime

```bash
# Build desktop runtime from kryon repo
cd kryon/runtimes/desktop
cargo build --release

# Run your app
./target/release/kryon-desktop ../../my-kryon-app/build/app.krb
```

### Web Runtime

```bash
# Build web runtime from kryon repo
cd kryon/runtimes/web
npm install
npm run build

# Serve your app
npm run serve ../../my-kryon-app/build/app.krb
# Open http://localhost:3000
```

### Mobile Development

For mobile development, see the platform-specific guides:
- [iOS Development](../runtime/platforms/ios.md)
- [Android Development](../runtime/platforms/android.md)

## Compiler Options

Common `kryc` options:

```bash
# Basic compilation
kryc input.kry -o output.krb

# Development mode (larger file, better debugging)
kryc input.kry --dev -o output.krb

# Production mode (maximum optimization)
kryc input.kry --release -o output.krb

# Include additional files
kryc main.kry -I styles/ -I components/ -o app.krb

# Watch mode (recompile on changes)
kryc main.kry --watch -o app.krb

# Verbose output
kryc input.kry --verbose -o output.krb

# Generate source maps
kryc input.kry --sourcemap -o output.krb
```

## Troubleshooting

### Build Issues

If the build fails:

1. **Check Rust Version**: Ensure you have Rust 1.70 or newer
   ```bash
   rustc --version
   rustup update
   ```

2. **Dependencies**: Make sure all dependencies are available
   ```bash
   cargo clean
   cargo build --release
   ```

### Command Not Found

If `kryc` is not found after installation:

1. **Check Installation**: Verify cargo install succeeded
2. **PATH Setup**: Add cargo bin to PATH
   ```bash
   echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

### Compilation Errors

Common issues:

- **Syntax Error**: Check your `.kry` file syntax
- **Missing Files**: Ensure all `@include` files exist
- **Property Conflicts**: Check for conflicting property definitions

### Performance Issues

- Use `--release` flag for production builds
- Minimize the number of included files
- Consider breaking large files into smaller components

## What's Next?

Now that you have Kryon installed, let's build your first real app:

**[→ Create Your First App](hello-world.md)**

Or explore more advanced topics:
- [Core Concepts](core-concepts.md) - Elements, properties, and layout
- [Language Reference](../reference/kry/index.md) - Complete syntax guide
- [Examples](../examples/calculator.md) - Working projects to learn from
