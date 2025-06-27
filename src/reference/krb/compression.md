# Compression

KRB files employ sophisticated compression techniques to minimize file size while maintaining fast decompression performance. This document details the compression algorithms, optimization strategies, and performance characteristics of the KRB format.

## Compression Overview

KRB uses multi-layered compression strategies:

- **String deduplication** - Remove duplicate strings across the file
- **Property block optimization** - Share common property sets
- **Tree structure compression** - Compress element hierarchies
- **Algorithmic compression** - LZ4, Zstd, or DEFLATE for data streams
- **Binary packing** - Efficient bit-level packing for small values

## String Compression

### String Deduplication

Identical strings are stored only once in the string table:

```
Before Deduplication (Original KRY):
Button { text: "Save"; onClick: "handleSave" }
Button { text: "Save"; onClick: "handleSave" }
Text { text: "Save complete" }

After Deduplication (KRB String Table):
Index 1: "Save" (referenced 2 times)
Index 2: "handleSave" (referenced 2 times)  
Index 3: "Save complete" (referenced 1 time)

Size Reduction: 23 bytes → 15 bytes (35% savings)
```

### Substring Optimization

Common substrings are factored out when beneficial:

```
Original Strings:
"background_color"
"background_image" 
"background_repeat"
"text_color"
"border_color"

Optimized Representation:
Base: "background"
Base: "color"
Fragments: "_", "_image", "_repeat", "text_", "border_"

Result Strings:
"background" + "_" + "color"
"background" + "_image"
"background" + "_repeat"
"text" + "_" + "color"
"border" + "_" + "color"
```

### Compression Algorithms

#### LZ4 Compression (Default)

Fast compression optimized for decompression speed:

```
Characteristics:
- Compression Speed: ~300 MB/s
- Decompression Speed: ~1200 MB/s  
- Compression Ratio: ~50-60%
- Memory Usage: Low

Best For:
- Real-time applications
- Memory-constrained devices
- Fast loading requirements
```

#### Zstd Compression (High Compression)

Balanced compression with better ratios:

```
Characteristics:
- Compression Speed: ~100 MB/s
- Decompression Speed: ~800 MB/s
- Compression Ratio: ~60-75%
- Memory Usage: Medium

Best For:
- Storage-sensitive applications
- Download distribution
- Archive storage
```

#### DEFLATE Compression (Maximum Compatibility)

Standard compression with wide support:

```
Characteristics:
- Compression Speed: ~50 MB/s
- Decompression Speed: ~400 MB/s
- Compression Ratio: ~55-70%
- Memory Usage: Medium

Best For:
- Legacy system compatibility
- Web distribution
- Standard tooling support
```

### Compression Selection

The compiler automatically selects compression based on string content:

```
Selection Criteria:
1. String length > 32 bytes → Consider compression
2. Repetitive content → Favor higher compression
3. Random content → Use fast compression
4. Binary data → Skip compression

Compression Threshold:
- Compress if size reduction > 20%
- Skip if compression overhead > savings
- Always compress strings > 1KB
```

## Property Block Optimization

### Property Deduplication

Common property combinations are shared across elements:

```
Original Elements:
Button A: background_color=#007BFFFF, padding=12, font_size=14
Button B: background_color=#007BFFFF, padding=12, font_size=16  
Button C: background_color=#007BFFFF, padding=16, font_size=14

Optimized Property Blocks:
Block 1: background_color=#007BFFFF
Block 2: padding=12
Block 3: padding=16
Block 4: font_size=14
Block 5: font_size=16

Element References:
Button A: [Block 1, Block 2, Block 4]
Button B: [Block 1, Block 2, Block 5]
Button C: [Block 1, Block 3, Block 4]
```

### Default Value Elimination

Properties matching default values are omitted:

```
Before Optimization:
Button {
    background_color: "#007BFFFF"    # Custom value
    text_color: "#FFFFFFFF"         # Default for buttons
    padding: 12                     # Default value
    border_radius: 0                # Default value
    disabled: false                 # Default value
}

After Optimization:
Button {
    background_color: "#007BFFFF"    # Only non-default value stored
}

Size Reduction: 45 bytes → 9 bytes (80% savings)
```

### Property Type Optimization

Properties are encoded using the most efficient representation:

```
Property Value Encodings:
Small integers (0-127): 1 byte VarInt
Medium integers (128-16383): 2 byte VarInt
Large integers: Up to 5 byte VarInt

Boolean arrays: Bit-packed (8 booleans per byte)
Colors: 4-byte RGBA (no compression needed)
Percentages: Basis points (10000 = 100%)

Enum values: Optimized index mapping
Common strings: Pre-defined string indices
```

## Tree Structure Compression

### Subtree Deduplication

Identical element subtrees are stored once and referenced:

```
Original Tree:
Container A
├── Button { text: "OK" }
└── Button { text: "Cancel" }

Container B  
├── Button { text: "OK" }       ← Identical subtree
└── Button { text: "Cancel" }   ← Identical subtree

Optimized Representation:
Template 1:
├── Button { text: "OK" }
└── Button { text: "Cancel" }

Container A → Template 1
Container B → Template 1

Space Savings: 60% reduction in tree size
```

### Structural Patterns

Common UI patterns are compressed using templates:

```
Dialog Pattern Template:
Container (dialog_container)
├── Text (dialog_title)
├── Container (dialog_content)
└── Container (dialog_buttons)
    ├── Button (dialog_cancel)
    └── Button (dialog_confirm)

Pattern Usage:
SaveDialog → Dialog Pattern + { title: "Save File", ... }
DeleteDialog → Dialog Pattern + { title: "Delete Item", ... }
ExitDialog → Dialog Pattern + { title: "Exit Application", ... }
```

### Depth-First Encoding

Elements are encoded in depth-first order for better compression:

```
Tree Structure:
App
├── Header
│   ├── Logo
│   └── Navigation
│       ├── Home
│       └── About
└── Content

Encoding Order: App, Header, Logo, Navigation, Home, About, Content

Benefits:
- Related elements stored together
- Better locality for compression algorithms
- Efficient parent-child relationships
```

## Advanced Optimization Techniques

### Variable Resolution

Variables are resolved at compile time when possible:

```
Source KRY:
@variables {
    primary_color: "#007BFFFF"
    button_padding: 12
}

Button {
    background_color: $primary_color    # Resolved at compile time
    padding: $button_padding           # Resolved at compile time
}

Compiled KRB:
Button {
    background_color: 0x007BFFFF       # Direct value, no variable lookup
    padding: 12                        # Direct value
}

Runtime variables (theme changes, user preferences) remain as references.
```

### Style Flattening

Style inheritance is resolved and flattened for optimal storage:

```
Source Styles:
style "base" {
    padding: 12
    border_radius: 6
}

style "button" {
    extends: "base"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
}

Flattened Result:
Button {
    padding: 12                        # From base
    border_radius: 6                   # From base  
    background_color: "#007BFFFF"      # From button
    text_color: "#FFFFFFFF"           # From button
}

No runtime style resolution overhead.
```

### Event Handler Optimization

Event handlers are optimized based on usage patterns:

```
Single Handler:
onClick: "handleClick" → Direct string reference

Multiple Same Handler:
onClick: "handleClick" (used 50 times) → Deduplicated string

Inline Handlers:
onClick: "item.selected = true" → Compiled to bytecode

Complex Handlers:
onClick: "processComplexLogic" → External script reference
```

## Compression Performance Analysis

### Size Comparison

Typical compression ratios across different content types:

```
Content Type          Uncompressed    Compressed    Ratio
Simple UI (buttons)   2.4 KB          0.8 KB        67%
Form with validation  8.1 KB          2.3 KB        72%
Dashboard layout      15.7 KB         4.2 KB        73%
Complex application   67.3 KB         16.8 KB       75%
Data-heavy interface  123.4 KB        28.9 KB       77%

Average compression ratio: 73%
```

### Load Time Performance

Compression impact on loading performance:

```
File Size        Uncompressed Load    Compressed Load    Benefit
Small (< 5KB)    0.8ms               1.2ms              -50%
Medium (5-50KB)  3.2ms               2.1ms              +34%
Large (50KB+)    12.8ms              6.4ms              +50%

Network Transfer:
- 3G: 75% faster loading (compression dominates)
- 4G: 60% faster loading  
- WiFi: 30% faster loading
- Local: 10% slower loading (decompression overhead)
```

### Memory Usage

Compression effects on runtime memory consumption:

```
Memory Category      Uncompressed    Compressed    Ratio
File buffer          100%            35%           65% reduction
String table         100%            45%           55% reduction
Property blocks      100%            25%           75% reduction
Element tree         100%            40%           60% reduction
Total runtime        100%            55%           45% reduction

Peak memory during loading: +15% (temporary decompression buffers)
```

## Compression Configuration

### Compiler Options

Control compression behavior through compiler flags:

```bash
# Maximum compression (slow compile, smallest files)
kryc app.kry --compression=max -o app.krb

# Balanced compression (default)
kryc app.kry --compression=balanced -o app.krb

# Fast compression (fast compile, larger files)  
kryc app.kry --compression=fast -o app.krb

# No compression (debugging)
kryc app.kry --compression=none -o app.krb

# Custom algorithm selection
kryc app.kry --string-compression=zstd --property-compression=lz4 -o app.krb
```

### Size vs Speed Tradeoffs

Different optimization levels and their characteristics:

```
Level     Compile Time    File Size    Load Time    Memory
none      1.0x           1.0x         1.0x         1.0x
fast      1.2x           0.6x         0.9x         0.7x
balanced  1.8x           0.4x         0.8x         0.6x
max       3.2x           0.3x         0.7x         0.5x

Recommended by use case:
- Development: fast (quick iteration)
- Testing: balanced (realistic performance)
- Production: max (optimal distribution)
- Embedded: balanced (memory/size balance)
```

### Per-Section Configuration

Fine-tune compression for different file sections:

```yaml
# .kryconfig compression settings
compression:
  strings:
    algorithm: zstd
    level: 6
    threshold: 32  # bytes
    
  properties:
    deduplicate: true
    eliminate_defaults: true
    pack_booleans: true
    
  tree:
    deduplicate_subtrees: true
    pattern_templates: true
    depth_first_encoding: true
    
  overall:
    target_ratio: 0.3  # 30% of original size
    max_compile_time: 10s
```

## Debugging Compressed Files

### Compression Analysis

Analyze compression effectiveness:

```bash
# Detailed compression analysis
krb-analyze app.krb --compression

Output:
Compression Analysis:
├── String Table (312 → 98 bytes, 69% compression)
│   ├── Deduplication: 156 bytes saved (15 duplicates)
│   ├── Algorithm (LZ4): 58 bytes saved
│   └── Efficiency: Excellent
├── Property Blocks (523 → 127 bytes, 76% compression)
│   ├── Deduplication: 234 bytes saved (23 common blocks)
│   ├── Default elimination: 162 bytes saved
│   └── Efficiency: Excellent  
├── Element Tree (334 → 89 bytes, 73% compression)
│   ├── Subtree sharing: 178 bytes saved (8 shared subtrees)
│   ├── Pattern templates: 67 bytes saved
│   └── Efficiency: Good
└── Total (1169 → 314 bytes, 73% compression)

Recommendations:
- Consider higher compression for string table
- Property deduplication working well
- No further optimization needed
```

### Decompression Profiling

Profile decompression performance:

```bash
# Profile decompression bottlenecks
krb-profile app.krb --decompression

Output:
Decompression Profile:
├── String decompression: 0.8ms (35%)
├── Property block parsing: 1.2ms (52%)
├── Tree reconstruction: 0.3ms (13%)
└── Total decompression: 2.3ms

Memory allocation:
├── String buffers: 1.2KB
├── Property cache: 0.8KB
├── Tree nodes: 0.4KB
└── Peak memory: 2.4KB

Bottlenecks:
- Property block parsing dominates
- String decompression acceptable
- No memory pressure
```

## Best Practices

### 1. Structure for Compression

Organize source code to maximize compression efficiency:

```kry
# Good: Consistent property patterns
style "button_base" {
    padding: 12
    border_radius: 6
    font_weight: 500
}

Button { style: "button_base"; text: "Save" }
Button { style: "button_base"; text: "Cancel" }
Button { style: "button_base"; text: "OK" }

# Avoid: Inconsistent inline styles
Button { padding: 12; border_radius: 6; text: "Save" }
Button { padding: 11; border_radius: 5; text: "Cancel" }  # Slightly different
Button { padding: 12; border_radius: 6; text: "OK" }
```

### 2. Use Variables Effectively

Leverage variables for values that compress well:

```kry
# Good: Consistent variables
@variables {
    primary_color: "#007BFFFF"
    secondary_color: "#6C757DFF"
    border_radius: 6
}

# Multiple elements using same values compress better
Button { background_color: $primary_color }
Container { border_color: $primary_color }
Text { text_color: $primary_color }

# Avoid: Hardcoded variations
Button { background_color: "#007BFFFF" }
Container { border_color: "#007CFFFF" }  # Slightly different
Text { text_color: "#007AFFFF" }         # Slightly different
```

### 3. Minimize Unique Strings

Reduce the number of unique strings:

```kry
# Good: Reuse common strings
@variables {
    save_text: "Save"
    cancel_text: "Cancel"
    ok_text: "OK"
}

Dialog1 {
    Button { text: $save_text }
    Button { text: $cancel_text }
}

Dialog2 {
    Button { text: $ok_text }
    Button { text: $cancel_text }    # Reused
}

# Avoid: Many unique strings
Dialog1 {
    Button { text: "Save Document" }
    Button { text: "Cancel Operation" }
}

Dialog2 {
    Button { text: "Confirm Action" }
    Button { text: "Abort Process" }
}
```

### 4. Optimize Component Hierarchies

Design components to maximize subtree sharing:

```kry
# Good: Reusable component structure
Define DialogButtons {
    Container {
        layout: row center
        gap: 8
        
        Button { text: "Cancel"; onClick: $cancel_handler }
        Button { text: "OK"; onClick: $ok_handler }
    }
}

# Multiple dialogs can share this structure
SaveDialog { DialogButtons { /* properties */ } }
DeleteDialog { DialogButtons { /* properties */ } }

# Avoid: Unique structures for each dialog
Define SaveDialog {
    Container {
        Button { text: "Cancel Save" }     # Unique structure
        Button { text: "Save Now" }
    }
}

Define DeleteDialog {
    Container {
        Button { text: "Keep Item" }       # Different structure
        Button { text: "Delete Item" }
    }
}
```

### 5. Profile and Measure

Regularly analyze compression effectiveness:

```bash
# Regular compression checks during development
kryc app.kry --analyze-compression

# Compare compression across versions
krb-compare app_v1.krb app_v2.krb --compression

# Profile real-world loading performance
krb-profile app.krb --runtime-performance
```

---

Effective compression is crucial for KRB's performance characteristics. By understanding these techniques and following best practices, developers can create highly optimized applications that load quickly and use memory efficiently across all target platforms.
