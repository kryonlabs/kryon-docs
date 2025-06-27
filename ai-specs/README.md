# Kryon AI-Friendly Specifications

This directory contains minimalistic, AI-optimized specifications for the Kryon UI framework. These files are designed to be easily copy-pasted when working with AI assistants, providing essential information without overwhelming detail.

## Files

### `kry-minimal-spec.md`
Essential KRY language specification including:
- Basic syntax and file structure
- Core elements (App, Container, Text, Button, Input, Image)
- Property system and common properties
- Variables, styles, and pseudo-selectors
- Component system and scripting basics

### `krb-minimal-spec.md`
Essential KRB binary format specification including:
- Binary structure overview
- Compression and encoding details
- Performance characteristics
- Version support and toolchain
- Platform compatibility

### `runtime-minimal-spec.md`
Essential runtime specification including:
- Platform support matrix (Desktop, Mobile, Web, Embedded)
- Performance metrics and memory requirements
- Scripting capabilities
- Runtime variants and optimization

## Usage

When working with AI assistants on Kryon projects:

1. **For KRY language questions**: Use `kry-minimal-spec.md`
2. **For binary format questions**: Use `krb-minimal-spec.md`
3. **For platform/runtime questions**: Use `runtime-minimal-spec.md`
4. **For comprehensive overview**: Use all three files

## Quick Reference

### Kryon Technology Stack
```
KRY Source Files (.kry)
        ↓ compile
KRB Binary Files (.krb)
        ↓ execute
Kryon Runtime (cross-platform)
```

### Key Concepts
- **KRY**: Human-readable declarative UI language
- **KRB**: Ultra-compact binary format (65-75% size reduction)
- **Runtime**: Cross-platform execution environment
- **Components**: Reusable UI definitions with properties
- **Scripting**: Multi-language runtime manipulation (Lua, JS, Python, Wren)