# Kryon Documentation

**Build efficient, cross-platform user interfaces with a compact binary format**

Welcome to Kryon, a universal UI language designed for performance, simplicity, and portability. Whether you're building apps for embedded systems, desktop applications, or modern web interfaces, Kryon lets you write once and deploy everywhere.

## What is Kryon?

Kryon consists of two main parts:

- **KRY Source Language** (`.kry`) - A clean, human-readable language for describing user interfaces
- **KRB Binary Format** (`.krb`) - An ultra-compact binary representation optimized for fast parsing and minimal memory usage

You write your UI in `.kry` files, compile them with the Kryon compiler (`kryc`), and deploy the resulting `.krb` files to any platform with a Kryon runtime.

## Why Choose Kryon?

### ⚡ **Performance First**
- Binary format designed for lightning-fast parsing
- Minimal memory footprint (works on 8-bit systems)
- No runtime interpretation overhead

### 🌍 **Universal Compatibility**
- Runs on everything from microcontrollers to modern desktops
- Platform-independent binary format
- Consistent behavior across all runtimes

### 🎨 **Modern UI Features**
- CSS-like styling with inheritance
- Reusable components with `Define` blocks
- Interactive states (hover, focus, active)
- Embedded scripting (Lua, JavaScript, Python, Wren)

### 🛠️ **Developer Friendly**
- Clean, readable syntax
- Powerful theming and variable system
- Excellent tooling and error messages

## Quick Example

Here's a simple Kryon app:

```kry
App {
    window_title: "Hello Kryon"
    window_width: 400
    window_height: 300
    
    Container {
        layout: column center
        gap: 16
        padding: 24
        
        Text {
            text: "Welcome to Kryon!"
            font_size: 24
            font_weight: bold
        }
        
        Button {
            text: "Click Me"
            background_color: "#007BFFFF"
            text_color: "#FFFFFFFF"
            padding: 12
            border_radius: 6
            onClick: "handleClick"
        }
    }
}
```

This compiles to a tiny binary file that any Kryon runtime can display instantly.

## How It Works

```
┌─────────────┐    ┌──────────┐    ┌─────────────┐
│   app.kry   │───▶│   kryc   │───▶│   app.krb   │
│ (Human Code)│    │(Compiler)│    │ (Binary UI) │
└─────────────┘    └──────────┘    └─────────────┘
                                           │
                                           ▼
                                   ┌─────────────┐
                                   │   Runtime   │
                                   │  (Any OS)   │
                                   └─────────────┘
```

1. **Write** your UI in clean, readable `.kry` files
2. **Compile** with `kryc` to generate optimized `.krb` binaries
3. **Deploy** the tiny binary files to any platform
4. **Run** with a Kryon runtime on the target system

## File Size Comparison

A typical mobile app UI that might be 50KB as a web page becomes just 2-5KB as a Kryon binary - a 90%+ size reduction while maintaining full functionality.

## What's Next?

Ready to build your first Kryon app? Start with our step-by-step tutorial:

**[→ Get Started with Installation](getting-started/installation.md)**

Or explore the documentation:

- **[Core Concepts](getting-started/core-concepts.md)** - Understand elements, properties, and layout
- **[Language Reference](reference/kry/index.md)** - Complete KRY syntax guide  
- **[Styling Guide](styling/basics.md)** - Learn the CSS-like styling system
- **[Examples](examples/calculator.md)** - See complete, working projects

## Community

Kryon is actively developed and welcomes contributions. Whether you're building apps, creating runtimes for new platforms, or improving the documentation, we'd love your help.

---

*Kryon v1.2 | Last updated: June 2025*