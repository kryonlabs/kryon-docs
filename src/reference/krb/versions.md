# Version History

This document chronicles the evolution of the KRB binary format, detailing changes between versions and compatibility requirements. Understanding version history is crucial for maintaining compatibility across different Kryon runtimes and deployment environments.

## Version Overview

### Format Versions

KRB has evolved through several major and minor versions:

```
Version Timeline:
├── KRB 1.0 (2023-03) - Initial stable release
├── KRB 1.1 (2023-08) - Component system and performance improvements
├── KRB 1.2 (2024-01) - Script integration and pseudo-selectors
├── KRB 1.3 (2024-06) - Advanced optimization and compression (planned)
└── KRB 2.0 (2024-12) - Next-generation format (planned)

Runtime Support:
├── Desktop Runtime: KRB 1.0-1.2 supported
├── Mobile Runtime: KRB 1.0-1.2 supported  
├── Web Runtime: KRB 1.1-1.2 supported
├── Embedded Runtime: KRB 1.0-1.1 supported
└── Server Runtime: KRB 1.0-1.2 supported
```

### Versioning Scheme

KRB follows semantic versioning principles:

```
Version Format: MAJOR.MINOR
├── MAJOR: Breaking changes, incompatible modifications
└── MINOR: Backward-compatible additions and improvements

Compatibility Promise:
├── Forward: Newer runtimes support older formats
├── Backward: Limited - depends on feature usage
└── Grace Period: 2 versions for deprecated features
```

## KRB 1.0 (Initial Release)

### Core Features

The foundational KRB format established the basic architecture:

```
KRB 1.0 Features:
├── Basic element types (App, Container, Text, Button, Input, Image)
├── Property system with type-safe encoding
├── String table with deduplication
├── Element tree compression
├── File integrity verification (CRC32)
├── Cross-platform binary format
└── Memory-mapped loading support

File Structure:
├── Header (32 bytes)
├── String Table (variable)
├── Element Tree (variable)
├── Property Blocks (variable)
└── Checksum (4 bytes)

Limitations:
├── No component system
├── Limited script support
├── Basic compression only
├── Fixed property set
└── No pseudo-selectors
```

### Element Types (1.0)

```
Supported Elements:
├── 0x01: App (application root)
├── 0x02: Container (layout container)
├── 0x03: Text (text display)
├── 0x04: Button (interactive button)
├── 0x05: Input (text input)
├── 0x06: Image (image display)
└── 0x07-0xFF: Reserved for future use

Property Support:
├── Basic layout properties (width, height, position)
├── Visual properties (colors, fonts, borders)
├── Text properties (alignment, size, weight)
├── Interactive properties (disabled, onClick)
└── Container properties (padding, margin, layout)
```

### Compression (1.0)

```
KRB 1.0 Compression:
├── String deduplication (simple)
├── Property block sharing (basic)
├── VarInt encoding for integers
├── No algorithmic compression
└── Typical compression ratio: 45-55%

Size Characteristics:
├── Small apps (< 5KB): Minimal compression benefit
├── Medium apps (5-50KB): 40-50% size reduction
├── Large apps (> 50KB): 50-60% size reduction
└── Very large apps: Limited by compression approach
```

## KRB 1.1 (Component System)

### Major Additions

KRB 1.1 introduced the component system and significant performance improvements:

```
New in KRB 1.1:
├── Component definition and instantiation
├── Custom element types (0x0A: Custom)
├── Enhanced property inheritance
├── Improved tree compression algorithms
├── Resource table for external assets
├── Performance optimization markers
└── Extended compatibility checking

Enhanced Features:
├── Component Properties section
├── Component Template definitions
├── Property type validation
├── Resource dependency tracking
├── Optimized element instantiation
└── Memory usage improvements
```

### Component System

```
Component Architecture:
├── Component Table section added
├── Property definitions with types and defaults
├── Template element trees
├── Runtime instantiation support
└── Component property binding

Binary Encoding:
├── Component Header (count, size)
├── Component Entries (name, properties, template)
├── Property Definitions (type, flags, defaults)
└── Template Element References

Size Impact:
├── Component overhead: 50-200 bytes per component
├── Instance savings: 60-80% for repeated components
├── Net benefit: Positive for apps with >3 instances
└── Memory efficiency: 40% improvement in complex apps
```

### Performance Improvements

```
KRB 1.1 Optimizations:
├── Subtree deduplication (shared element patterns)
├── Property block compression (LZ4 support)
├── Lazy loading infrastructure
├── Cache-friendly data layout
├── Reduced memory fragmentation
└── Faster parsing algorithms

Loading Performance:
├── 15-25% faster file parsing
├── 30-40% reduced memory allocation
├── 20% faster element instantiation
├── Improved cache locality
└── Better memory pressure handling

Runtime Performance:
├── 10-15% faster property access
├── Reduced garbage collection pressure
├── More efficient event handling
├── Optimized layout calculations
└── Improved rendering pipeline
```

## KRB 1.2 (Script Integration)

### Script System

KRB 1.2 introduced comprehensive scripting support:

```
New in KRB 1.2:
├── Script Table section
├── Multiple scripting languages (Lua, JavaScript, Python, Wren)
├── Embedded and external script support
├── Script-UI integration APIs
├── Event handler bindings
├── Runtime script execution
└── Script dependency management

Script Architecture:
├── Script entries with language and mode
├── Inline script embedding
├── External script references
├── Script initialization order
├── API binding definitions
└── Error handling mechanisms
```

### Pseudo-Selectors

```
Interactive State Styling:
├── CSS-like pseudo-selector syntax
├── :hover, :active, :focus, :disabled states
├── :checked, :selected for form elements
├── State-based property overrides
├── Efficient state change handling
└── Cascading state inheritance

Binary Encoding:
├── Pseudo-selector blocks in style entries
├── State-specific property tables
├── Optimized state change detection
├── Memory-efficient state storage
└── Fast state transition rendering
```

### Advanced Compression

```
KRB 1.2 Compression Improvements:
├── Zstd compression algorithm support
├── String substring optimization
├── Advanced property deduplication
├── Pattern-based tree compression
├── Script source compression
└── Resource bundling optimization

Compression Results:
├── 15-25% better compression ratios
├── 30% faster decompression
├── Improved compression for script-heavy apps
├── Better performance on mobile devices
└── Reduced network transfer times
```

### File Format Changes

```
New Sections (KRB 1.2):
├── Script Table (after Component Table)
├── Extended property blocks (pseudo-selectors)
├── Resource bundling support
├── Debug information (optional)
└── Performance hints (optional)

Header Changes:
├── New flags for scripts and pseudo-selectors
├── Extended version encoding
├── Compatibility matrix hints
├── Optional section indicators
└── Debug mode markers

Size Impact:
├── Script overhead: 100-2000 bytes per script
├── Pseudo-selector overhead: 20-50 bytes per element
├── Resource bundling: Variable (depends on resources)
├── Debug info: 200-1000 bytes (optional)
└── Net size: +10-30% for script-heavy apps
```

### Compatibility Matrix

```
KRB 1.2 Compatibility:
├── 1.2 Runtime:
│   ├── ✅ KRB 1.0: Full support
│   ├── ✅ KRB 1.1: Full support
│   └── ✅ KRB 1.2: Native support
├── 1.1 Runtime:
│   ├── ✅ KRB 1.0: Full support
│   ├── ✅ KRB 1.1: Native support
│   └── ⚠️  KRB 1.2: Limited (no scripts/pseudo-selectors)
└── 1.0 Runtime:
    ├── ✅ KRB 1.0: Native support
    ├── ⚠️  KRB 1.1: Basic (no components)
    └── ❌ KRB 1.2: Incompatible (too many new features)

Degradation Behavior:
├── Unknown sections: Skipped gracefully
├── Unknown elements: Rendered as containers
├── Unknown properties: Use defaults
├── Scripts: Ignored silently
└── Pseudo-selectors: Use base styling only
```

## Deprecation Timeline

### Deprecated Features

```
KRB 1.0 Deprecations (planned for removal in 2.0):
├── Legacy property encoding (replaced by typed system)
├── Simple string table (replaced by compressed table)
├── Fixed element type IDs (replaced by extensible system)
└── Basic checksum (replaced by cryptographic hash)

KRB 1.1 Deprecations (planned for removal in 2.1):
├── Basic component system (replaced by advanced templates)
├── Simple resource table (replaced by asset bundling)
└── Limited property inheritance (replaced by full cascading)

KRB 1.2 Deprecations (none currently planned)
```

## Version Detection

### Runtime Version Detection

```c
// Detect KRB format version
krb_version_t krb_detect_version(const void* data, size_t size) {
    if (size < 8) return KRB_VERSION_INVALID;
    
    const uint8_t* bytes = (const uint8_t*)data;
    
    // Check magic number
    if (memcmp(bytes, "KRB1", 4) != 0) {
        return KRB_VERSION_INVALID;
    }
    
    // Extract version from header
    uint16_t version = *(uint16_t*)(bytes + 4);
    
    switch (version) {
        case 0x0100: return KRB_VERSION_1_0;
        case 0x0101: return KRB_VERSION_1_1;
        case 0x0102: return KRB_VERSION_1_2;
        default: return KRB_VERSION_UNKNOWN;
    }
}

// Check runtime compatibility
bool krb_is_compatible(krb_version_t file_version, krb_version_t runtime_version) {
    // Newer runtimes support older formats
    return file_version <= runtime_version;
}

// Get feature availability
krb_features_t krb_get_features(krb_version_t version) {
    krb_features_t features = {0};
    
    if (version >= KRB_VERSION_1_0) {
        features.basic_elements = true;
        features.property_system = true;
        features.string_table = true;
    }
    
    if (version >= KRB_VERSION_1_1) {
        features.components = true;
        features.resource_table = true;
        features.advanced_compression = true;
    }
    
    if (version >= KRB_VERSION_1_2) {
        features.scripts = true;
        features.pseudo_selectors = true;
        features.state_management = true;
    }
    
    return features;
}
```

### Compiler Version Targeting

```bash
# Target specific KRB version
kryc app.kry --target-version=1.0 -o app_v1.0.krb

# Maximum compatibility build
kryc app.kry --max-compat -o app_compat.krb

# Feature detection build
kryc app.kry --detect-features --warn-incompatible -o app.krb

# Multi-version build
kryc app.kry --multi-target=1.0,1.1,1.2 -o builds/
```

### Runtime Capability Negotiation

```c
// Capability negotiation example
typedef struct krb_capability_check {
    krb_version_t min_version;
    krb_version_t max_version;
    krb_features_t required_features;
    krb_features_t optional_features;
} krb_capability_check_t;

krb_result_t krb_check_capabilities(const krb_file_t* file,
                                   const krb_capability_check_t* check,
                                   krb_compatibility_result_t* result) {
    krb_version_t file_version = krb_get_file_version(file);
    krb_features_t file_features = krb_get_file_features(file);
    
    // Check version range
    if (file_version < check->min_version || file_version > check->max_version) {
        result->compatible = false;
        result->reason = KRB_COMPAT_VERSION_MISMATCH;
        return KRB_SUCCESS;
    }
    
    // Check required features
    if (!krb_features_contains(file_features, check->required_features)) {
        result->compatible = false;
        result->reason = KRB_COMPAT_MISSING_FEATURES;
        return KRB_SUCCESS;
    }
    
    result->compatible = true;
    result->available_features = krb_features_intersect(file_features, check->optional_features);
    return KRB_SUCCESS;
}
```

## Future Roadmap

### Planned Features

```
KRB 1.3 (June 2024) - Planned:
├── Advanced compression algorithms (Brotli, LZMA)
├── Incremental loading and streaming
├── Native animation support
├── Enhanced debugging information
├── Cryptographic file signing
├── Resource preloading hints
└── Performance profiling integration

KRB 2.0 (December 2024) - Planned:
├── Redesigned binary format
├── Native GPU resource support
├── WebGPU integration
├── Advanced component composition
├── Real-time collaboration features
├── Plugin system architecture
└── Backwards compatibility layer

KRB 2.1+ - Long-term:
├── AI-assisted optimization
├── Distributed application support
├── Cloud-native features
├── Advanced accessibility
├── Multi-language UI support
└── Performance machine learning
```


## Best Practices

### 1. Version Management

```bash
# Always specify target version explicitly
kryc app.kry --target-version=1.2 -o app.krb

# Test against multiple runtime versions
krb-test app.krb --runtime-versions=1.0,1.1,1.2

# Document version requirements
echo "Requires KRB 1.1+ for component support" > VERSION_REQUIREMENTS.md

# Use feature detection in runtime code
if (krb_has_feature(app, KRB_FEATURE_SCRIPTS)) {
    krb_script_init(app);
}
```

### 2. Compatibility Testing

```bash
# Comprehensive compatibility testing
krb-compat app.krb --all-versions --all-platforms

# Performance regression testing
krb-perf app.krb --baseline=previous_version.krb

# Feature availability testing  
krb-test app.krb --feature-matrix

# Graceful degradation testing
krb-test app.krb --simulate-missing-features
```

### 3. Version Documentation

```markdown
# Document version requirements clearly
## Version Requirements

### Minimum Requirements
- KRB Runtime: 1.1+
- Features Used: Components, Resource Loading
- Platform Support: Desktop, Mobile, Web

### Recommended
- KRB Runtime: 1.2+  
- Features: Scripts, Pseudo-selectors
- Platform Support: All platforms

### Optional Enhancements
- KRB Runtime: 1.3+ (when available)
- Features: Advanced compression, Streaming
- Performance: 20% faster loading

### Compatibility Notes
- KRB 1.0 runtime: Basic functionality only
- KRB 1.1 runtime: Full compatibility except scripts
- KRB 1.2 runtime: Full feature support
```

---

Understanding KRB version evolution and compatibility is essential for successful Kryon application deployment.