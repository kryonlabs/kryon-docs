# KRB Binary Format Reference

KRB (Kryon Binary) is the compact, optimized binary format that KRY source files compile to. This reference covers the binary structure, encoding, and runtime considerations for KRB files.

## Format Overview

KRB files are highly optimized binary representations of user interfaces, designed for:

- **Ultra-compact size** - Minimal file size for fast loading
- **Fast parsing** - Direct memory mapping and rapid deserialization  
- **Platform independence** - Consistent format across all runtimes
- **Version compatibility** - Forward and backward compatibility support

## File Structure

Every KRB file follows a standardized binary structure:

```
┌─────────────────────────────────────┐
│            File Header              │ ← Magic number, version, metadata
├─────────────────────────────────────┤
│           String Table              │ ← Compressed string storage
├─────────────────────────────────────┤
│          Resource Table             │ ← External resource references
├─────────────────────────────────────┤
│          Variable Table             │ ← Variable definitions and values
├─────────────────────────────────────┤
│           Style Table               │ ← Style definitions
├─────────────────────────────────────┤
│         Component Table             │ ← Component definitions
├─────────────────────────────────────┤
│          Script Table               │ ← Embedded scripts
├─────────────────────────────────────┤
│         Element Tree                │ ← UI element hierarchy
├─────────────────────────────────────┤
│        Property Blocks              │ ← Element properties
├─────────────────────────────────────┤
│          Checksum                   │ ← File integrity verification
└─────────────────────────────────────┘
```

## Binary Encoding

### Data Types

KRB uses efficient encoding for different data types:

```
String (Variable Length)
┌─────────┬─────────────────────────┐
│ Length  │        UTF-8 Data       │
│ (VarInt)│      (Length bytes)     │
└─────────┴─────────────────────────┘

Integer (Variable Length)
┌─────────────────────────────────────┐
│            VarInt Encoded           │
│         (1-5 bytes)                 │
└─────────────────────────────────────┘

Color (4 bytes)
┌─────┬─────┬─────┬─────┐
│  R  │  G  │  B  │  A  │ 
│(u8) │(u8) │(u8) │(u8) │
└─────┴─────┴─────┴─────┘

Boolean (1 bit)
┌─┐
│B│ ← Packed into bit arrays
└─┘

Float (4 bytes)
┌─────────────────────────────────────┐
│         IEEE 754 Float32            │
└─────────────────────────────────────┘
```

### String Compression

Strings are stored in a compressed string table with deduplication:

```
String Table Header
┌─────────────┬─────────────┬─────────────┐
│ Entry Count │Dedup Entries│Total Length │
│   (VarInt)  │  (VarInt)   │  (VarInt)   │
└─────────────┴─────────────┴─────────────┘

String Entry
┌─────────────┬─────────────────────────┐
│   Length    │      Compressed Data    │
│  (VarInt)   │    (LZ4/Zstd encoded)   │
└─────────────┴─────────────────────────┘

String Reference
┌─────────────────────────────────────┐
│         String Table Index          │
│            (VarInt)                 │
└─────────────────────────────────────┘
```

## File Sections

### Header Section

The file header contains metadata and version information:

```
KRB Header (32 bytes)
┌─────────┬─────────┬─────────┬─────────┐
│ Magic   │ Version │ Flags   │ Size    │
│ "KRB1"  │  u16    │  u16    │  u32    │
├─────────┼─────────┼─────────┼─────────┤
│CRC32    │Reserved │Reserved │Reserved │
│  u32    │   u32   │   u32   │   u32   │
└─────────┴─────────┴─────────┴─────────┘

Version Format: MAJOR.MINOR (u16)
- MAJOR: Breaking changes
- MINOR: Compatible additions

Flags Bitfield:
- Bit 0: Has Scripts
- Bit 1: Has Resources  
- Bit 2: Compressed
- Bit 3: Debug Info
- Bits 4-15: Reserved
```

### Element Tree Section

The core UI structure encoded as a tree:

```
Element Node
┌─────────────┬─────────────┬─────────────┐
│ Element Type│ Property    │ Child Count │
│  (VarInt)   │ Block Index │  (VarInt)   │
│             │  (VarInt)   │             │
└─────────────┴─────────────┴─────────────┘

Element Types:
0x01: App          0x02: Container
0x03: Text         0x04: Button  
0x05: Input        0x06: Image
0x07: Custom       0x08-0xFF: Reserved

Child References (if Child Count > 0)
┌─────────────┬─────────────┬─────────────┐
│   Child 1   │   Child 2   │     ...     │
│  (VarInt)   │  (VarInt)   │             │
└─────────────┴─────────────┴─────────────┘
```

### Property Blocks

Efficient property storage with type-specific encoding:

```
Property Block Header
┌─────────────┬─────────────┬─────────────┐
│Property Count│  Block Size │  Flags      │
│  (VarInt)   │  (VarInt)   │  (u8)       │
└─────────────┴─────────────┴─────────────┘

Property Entry
┌─────────────┬─────────────┬─────────────┐
│Property ID  │  Data Type  │    Value    │
│  (VarInt)   │    (u8)     │ (Variable)  │
└─────────────┴─────────────┴─────────────┘

Data Types:
0x01: String Ref   0x02: Integer    0x03: Float
0x04: Color        0x05: Boolean    0x06: Enum
0x07: Style Ref    0x08: Variable   0x09: Event
```

## Optimization Techniques

### Property Deduplication

Common properties are deduplicated across elements:

```
Original KRY:
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

### Tree Compression

Element trees are compressed using reference sharing:

```
Before Compression:
Container A
├── Button (Save)
├── Button (Cancel)
└── Container B
    ├── Button (Save)     ← Duplicate structure
    └── Button (Cancel)   ← Duplicate structure

After Compression:
Container A → [Child Template #1, Container B]
Container B → [Child Template #1]

Child Template #1:
├── Button (Save)
└── Button (Cancel)
```

### Variable Resolution

Variables are resolved at compile time when possible:

```
Source KRY:
@variables { primary: "#007BFFFF" }
Button { background_color: $primary }

Compiled KRB:
Button { background_color: 0x007BFFFF }  ← Resolved at compile time

Dynamic Variables (resolved at runtime):
@variables { user_theme: "light" }
Button { background_color: $user_theme ? $light_color : $dark_color }

Compiled KRB:
Button { background_color: VARIABLE_REF(conditional_expression) }
```

## Runtime Loading

### Memory Mapping

KRB files are designed for efficient memory mapping:

```
Loading Process:
1. mmap() file into memory
2. Verify header and checksum
3. Parse section offsets
4. Create element tree (lazy)
5. Initialize property tables
6. Register event handlers
7. Begin rendering

Memory Layout:
┌─────────────────┐ ← File start (mmap base)
│ Header (parsed) │
├─────────────────┤ ← String table (direct access)
│ String Table    │
├─────────────────┤ ← Property blocks (indexed)
│ Property Data   │
├─────────────────┤ ← Element tree (lazy parsed)
│ Element Tree    │
└─────────────────┘ ← File end
```

### Lazy Loading

Elements and properties are loaded on-demand:

```
Initial Load:
- Parse file header ✓
- Load string table ✓
- Index property blocks ✓
- Parse root element only ✓

On-Demand Loading:
- Parse child elements when accessed
- Load properties when element is created
- Decompress strings when displayed
- Initialize scripts when first called
```

### Caching Strategy

Runtimes implement efficient caching:

```
Cache Layers:
1. Parsed Element Cache (in-memory)
2. Property Block Cache (frequently accessed)
3. String Cache (decompressed strings)
4. Style Resolution Cache (computed styles)

Cache Eviction:
- LRU eviction for memory pressure
- Keep active elements always
- Preload likely-needed elements
- Clear cache on theme changes
```

## Development Tools

### Binary Inspector

The KRB inspector shows internal file structure:

```bash
# Inspect KRB file structure
krb-inspect app.krb

Output:
KRB File: app.krb (1,247 bytes)
├── Header (32 bytes)
│   ├── Version: 1.2
│   ├── Flags: Scripts, Compressed
│   └── CRC32: 0xABCD1234
├── String Table (312 bytes, 47 entries)
│   ├── "Click Me" (8 bytes, refs: 3)
│   ├── "Save Document" (13 bytes, refs: 1)
│   └── "handleButtonClick" (17 bytes, refs: 2)
├── Property Blocks (523 bytes, 15 blocks)
│   ├── Block #1: background_color=#007BFFFF (refs: 8)
│   ├── Block #2: padding=12 (refs: 12)
│   └── Block #3: onClick="handleClick" (refs: 3)
├── Element Tree (334 bytes, 23 elements)
│   └── App
│       └── Container (layout=column)
│           ├── Button (style=primary)
│           └── Button (style=secondary)
└── Scripts (46 bytes, 1 script)
    └── Lua: 38 lines, 3 functions
```

### Performance Analysis

Analyze KRB loading and runtime performance:

```bash
# Profile KRB loading
krb-profile app.krb --load-time

Output:
Load Performance Analysis:
├── File I/O: 0.8ms
├── Header Parse: 0.1ms  
├── String Table: 1.2ms
├── Property Index: 0.5ms
├── Element Tree: 2.1ms
└── Total Load: 4.7ms

Memory Usage:
├── File Size: 1,247 bytes
├── Runtime Overhead: 2,341 bytes  
├── Peak Memory: 3,588 bytes
└── Efficiency: 65.3%
```

### Size Optimization

Optimize KRB files for minimal size:

```bash
# Analyze size breakdown
krb-analyze app.krb --size

Output:
Size Analysis:
├── Header: 32 bytes (2.6%)
├── Strings: 312 bytes (25.0%) 
│   ├── Duplicated: 45 bytes (14.4%)
│   └── Compressible: 89 bytes (28.5%)
├── Properties: 523 bytes (41.9%)
│   ├── Redundant: 78 bytes (14.9%)
│   └── Default values: 123 bytes (23.5%)
├── Elements: 334 bytes (26.8%)
│   └── Optimizable: 67 bytes (20.1%)
└── Scripts: 46 bytes (3.7%)

Optimization Recommendations:
- Remove 12 unused strings (-45 bytes)
- Compress property blocks (-78 bytes)  
- Use default values (-123 bytes)
- Total savings: 246 bytes (19.7%)
```

## Reference Sections

### [Binary Specification](specification.md)
- Complete binary format specification
- Data type encoding details
- Section format definitions
- Compliance requirements

### [Compression](compression.md)
- String compression algorithms
- Property block optimization
- Tree structure compression
- Size vs. speed tradeoffs

### [Runtime Integration](runtime.md)
- Loading and parsing APIs
- Memory management
- Error handling
- Performance considerations

### [Tooling](tooling.md)
- Compiler integration
- Debug information
- Profiling and analysis tools
- Optimization utilities

### [Version History](versions.md)
- Format evolution and changes
- Compatibility matrices
- Deprecation timelines

---

The KRB binary format enables Kryon's exceptional performance and compact size while maintaining the expressive power of the KRY source language. Understanding this format helps developers optimize their applications and integrate with Kryon runtimes effectively.