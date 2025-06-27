# KRB Binary Format - Minimal AI Specification

## Overview
KRB (Kryon Binary) is the highly optimized binary format that KRY source files compile to. It's the actual runtime format that executes on all platforms - desktop, mobile, web, and embedded.

## Purpose & Design Goals
- **Ultra-compact size** - 65-75% smaller than uncompressed
- **Fast parsing** - Memory-mapped loading, direct access
- **Platform independence** - Same binary runs everywhere
- **Version compatibility** - Forward/backward compatible

## Binary Structure (10 Sections)
```
Header (32 bytes)
├── Magic: "KRB1" 
├── Version: u16 (MAJOR.MINOR)
├── Flags: Scripts, Resources, Compressed, Debug
└── CRC32 checksum

String Table (compressed)
├── Deduplication (identical strings stored once)
├── LZ4/Zstd compression
└── UTF-8 encoding with length prefixes

Resource Table
├── External file references (images, fonts)
└── Resource metadata and paths

Variable Table  
├── Compile-time resolved variables
└── Runtime variables (dynamic themes, etc.)

Style Table
├── Style definitions with inheritance
└── Property blocks for styles

Component Table
├── Reusable component definitions
└── Property schemas and defaults

Script Table
├── Embedded Lua/JavaScript/Python/Wren
└── Function definitions and runtime API bindings

Element Tree
├── UI hierarchy structure
├── Parent-child relationships
└── Element type references

Property Blocks
├── Type-specific encoding (strings, numbers, colors)
├── Property deduplication across elements
└── Reference-based property sharing

Checksum
└── File integrity verification
```

## Data Type Encoding
```
VarInt (1-5 bytes): Most integers, length prefixes
IEEE 754 Float32: Floating-point numbers
4-byte RGBA: Colors (0x007BFFFF = blue with full alpha)
Bit-packed: Booleans (packed into arrays)
String References: Index into string table (not inline)
Property IDs: Predefined property type constants
```

## Element Type System
```
0x01: App        - Application root, window properties
0x02: Container  - Layout container (column/row/center/grow)
0x03: Text       - Text display with typography
0x04: Button     - Interactive button with click handlers
0x05: Input      - Text input with validation
0x06: Image      - Image display with sizing
0x07: Custom     - User-defined components
0x08-0xFF: Reserved for future elements
```

## Compression Techniques

### String Compression
- **Deduplication**: "Click Me" appears once, referenced multiple times
- **Substring optimization**: Common prefixes factored out
- **Algorithm chaining**: LZ4 (fast) or Zstd (max compression)

### Property Optimization
```
Source KRY:
Button { background_color: "#007BFFFF"; padding: 12 }
Button { background_color: "#007BFFFF"; padding: 16 }
Container { background_color: "#007BFFFF" }

Optimized KRB:
Property Block #1: background_color = 0x007BFFFF
Property Block #2: padding = 12
Property Block #3: padding = 16

Element References:
Button[0] → [Block #1, Block #2]
Button[1] → [Block #1, Block #3]  
Container[0] → [Block #1]
```

### Tree Structure Compression
- **Subtree deduplication**: Repeated UI patterns stored once
- **Template system**: Common button groups, form layouts
- **Reference sharing**: Multiple elements point to same structure

## Runtime Loading Process
```
1. Memory map file (mmap on Unix, MapViewOfFile on Windows)
2. Verify header magic and checksum
3. Parse section offsets (direct pointer arithmetic)
4. Index string table and property blocks
5. Parse root element only (lazy load children)
6. Initialize script engines if present
7. Begin rendering pipeline
```

## Performance Characteristics
```
File Size → Load Time (typical):
5KB     → 0.8-2.1ms   (simple forms, small apps)
50KB    → 3.2-9.4ms   (medium complexity apps)
500KB   → 28.4-78.6ms (complex dashboards)

Memory Usage:
Runtime overhead: 1.5-3x file size
Peak memory: File size + decompressed strings + element cache
Efficiency: 45-75% reduction vs uncompressed XML/JSON
```

## Development Toolchain
```bash
# Compile KRY to KRB
kryc app.kry --output app.krb --optimize=max

# Inspect binary structure
krb-inspect app.krb
├── Shows section sizes, element counts
├── String deduplication statistics  
└── Property block usage analysis

# Analyze performance
krb-profile app.krb --load-time
├── Measures parsing speed by section
├── Memory allocation tracking
└── Cache hit/miss statistics

# Optimize file size
krb-analyze app.krb --size
├── Identifies redundant data
├── Suggests compression improvements
└── Reports potential savings
```

## Variable Resolution
```
Compile-time (optimized):
@variables { primary_color: "#007BFFFF" }
Button { background_color: $primary_color }
→ Button { background_color: 0x007BFFFF }

Runtime (dynamic):
@variables { theme: "dark" }  
Button { background_color: $theme == "dark" ? $dark_bg : $light_bg }
→ Stored as conditional expression, resolved at runtime
```

## Version Evolution
- **KRB 1.0**: Core elements, property system, string compression
- **KRB 1.1**: Component system, property inheritance, tree compression
- **KRB 1.2**: Script integration, pseudo-selectors, enhanced optimization

## Key AI Understanding Points

1. **KRB is compiled binary** - Never edit directly, always compile from KRY
2. **Extremely space-efficient** - Uses every optimization trick (dedup, compression, references)
3. **Fast runtime loading** - Memory-mapped, lazy-loaded, cache-friendly
4. **Cross-platform consistency** - Same binary works on desktop/mobile/web/embedded
5. **Property sharing is key** - Elements reference shared property blocks, not inline data
6. **String tables are central** - All text goes through deduplicated, compressed string table
7. **Tree structure is optimized** - Repeated UI patterns become templates, not duplicated trees
8. **Scripts are embedded** - Lua/JS/Python code lives inside the binary, not external files
9. **Loading is incremental** - Parse header first, then load sections as needed
10. **Tools are essential** - Use krb-inspect/analyze/profile for understanding and optimization

The binary format is the secret to Kryon's performance - it's not just "another binary format" but a sophisticated system designed specifically for UI applications with extreme size and speed requirements.