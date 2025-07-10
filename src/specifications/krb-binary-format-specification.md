# KRB Binary Format Specification

The KRB (Kryon Binary) format is an optimized binary format that provides 65-75% size reduction compared to source KRY files while maintaining fast parsing and cross-platform compatibility. This document provides a complete technical specification for implementing KRB parsers and generators.

## Overview

### Design Goals
- **Compact**: 65-75% size reduction over text format
- **Fast parsing**: Optimized for quick loading and minimal memory allocation
- **Cross-platform**: Consistent binary format across all platforms
- **Extensible**: Version-aware format supporting future features
- **String deduplication**: Shared string table reduces file size
- **Property sharing**: Common property values are deduplicated

### File Extension
- `.krb` - Kryon Binary files

## File Structure

A KRB file consists of a fixed-size header followed by variable-length sections:

```
┌─────────────────┐
│     Header      │ (72 bytes)
├─────────────────┤
│  String Table   │ (variable)
├─────────────────┤
│ Element Tree    │ (variable)
├─────────────────┤
│  Style Table    │ (variable)
├─────────────────┤
│ Component Table │ (variable)
├─────────────────┤
│  Script Table   │ (variable)
├─────────────────┤
│ Resource Table  │ (variable)
├─────────────────┤
│Template Vars    │ (variable)
├─────────────────┤
│Template Bindings│ (variable)
├─────────────────┤
│ Transform Data  │ (variable)
└─────────────────┘
```

## Header Format (72 bytes)

The header provides metadata and section offsets for the entire file:

| Offset | Size | Field | Description |
|--------|------|-------|-------------|
| 0 | 4 | Magic Number | "KRB1" (0x4B524231) |
| 4 | 2 | Version | Major.Minor (0x0005 = v0.5) |
| 6 | 2 | Flags | Feature flags bitfield |
| 8 | 2 | Element Count | Number of main elements |
| 10 | 2 | Style Count | Number of style definitions |
| 12 | 2 | Component Count | Number of component definitions |
| 14 | 2 | Animation Count | Reserved (0) |
| 16 | 2 | Script Count | Number of scripts |
| 18 | 2 | String Count | Number of strings |
| 20 | 2 | Resource Count | Number of resources |
| 22 | 2 | Template Var Count | Number of template variables |
| 24 | 2 | Template Bind Count | Number of template bindings |
| 26 | 2 | Transform Count | Number of transform objects |
| 28 | 4 | Element Offset | Offset to element tree |
| 32 | 4 | Style Offset | Offset to style table |
| 36 | 4 | Component Offset | Offset to component table |
| 40 | 4 | Animation Offset | Reserved (0) |
| 44 | 4 | Script Offset | Offset to script table |
| 48 | 4 | String Offset | Offset to string table |
| 52 | 4 | Resource Offset | Offset to resource table |
| 56 | 4 | Template Var Offset | Offset to template variables |
| 60 | 4 | Template Bind Offset | Offset to template bindings |
| 64 | 4 | Transform Offset | Offset to transform data |
| 68 | 4 | Total Size | Total file size |

### Header Flags (16-bit bitfield)

| Bit | Flag | Description |
|-----|------|-------------|
| 0 | FLAG_HAS_STYLES | File contains style definitions |
| 1 | FLAG_HAS_COMPONENT_DEFS | File contains component definitions |
| 2 | FLAG_HAS_ANIMATIONS | File contains animation data |
| 3 | FLAG_HAS_RESOURCES | File contains resource references |
| 4 | FLAG_COMPRESSED | File uses compression |
| 5 | FLAG_FIXED_POINT | Uses fixed-point arithmetic |
| 6 | FLAG_EXTENDED_COLOR | Extended color format support |
| 7 | FLAG_HAS_APP | File contains App element |
| 8 | FLAG_HAS_SCRIPTS | File contains script code |
| 9 | FLAG_HAS_STATE_PROPERTIES | File contains state properties |
| 10 | FLAG_HAS_TEMPLATE_VARIABLES | File contains template variables |
| 11 | FLAG_HAS_TRANSFORMS | File contains transform data |
| 12-15 | Reserved | Reserved for future use |

## Binary Data Encoding

### Endianness
All multi-byte values are stored in **little-endian** format:
- 16-bit values: `[low_byte, high_byte]`
- 32-bit values: `[byte0, byte1, byte2, byte3]`
- 64-bit values: `[byte0, byte1, byte2, byte3, byte4, byte5, byte6, byte7]`

### Data Types

#### Color Encoding (4 bytes)
Colors are stored as RGBA values:
```
[Red, Green, Blue, Alpha]  // Each component 0-255
```

#### String References (1 byte)
String values are stored as indices into the string table:
```
[String_Index]  // 0-255, index into string table
```

#### Floating Point Values (4 or 8 bytes)
- 32-bit float: IEEE 754 single precision
- 64-bit float: IEEE 754 double precision

## Section Formats

### String Table

The string table contains all strings used in the file, enabling deduplication:

```
String Entry Format:
┌─────────────┬─────────────────┐
│   Length    │   UTF-8 Data    │
│   (1 byte)  │  (length bytes) │
└─────────────┴─────────────────┘
```

**Format:**
- Length: 1 byte (0-255 characters)
- Data: UTF-8 encoded string data

**Example:**
```
String "Hello": [0x05, 0x48, 0x65, 0x6C, 0x6C, 0x6F]
              [  5  ,  'H' ,  'e' ,  'l' ,  'l' ,  'o' ]
```

### Element Tree

Each element has a 19-byte header followed by variable-length property data:

#### Element Header (19 bytes)

| Offset | Size | Field | Description |
|--------|------|-------|-------------|
| 0 | 1 | Element Type | Element type ID (see Element Types) |
| 1 | 1 | ID String Index | Index into string table |
| 2 | 2 | Position X | X coordinate (pixels) |
| 4 | 2 | Position Y | Y coordinate (pixels) |
| 6 | 2 | Width | Width in pixels |
| 8 | 2 | Height | Height in pixels |
| 10 | 1 | Layout Flags | Layout configuration |
| 11 | 1 | Style ID | Style table index |
| 12 | 1 | Checked | Boolean flag (0/1) |
| 13 | 1 | Property Count | Number of standard properties |
| 14 | 1 | Child Count | Number of child elements |
| 15 | 1 | Event Count | Number of event handlers |
| 16 | 1 | Animation Count | Number of animations |
| 17 | 1 | Custom Prop Count | Number of custom properties |
| 18 | 1 | State Prop Count | Number of state property sets |

#### Element Types

| ID | Type | Description |
|----|------|-------------|
| 0x00 | App | Root application element |
| 0x01 | Container | Layout container |
| 0x02 | Text | Text display element |
| 0x03 | Image | Image display element |
| 0x04 | Canvas | Drawing canvas |
| 0x10 | Button | Interactive button |
| 0x11 | Input | Text input field |
| 0x12 | Checkbox | Checkbox input |
| 0x13 | Radio | Radio button |
| 0x14 | Slider | Slider control |
| 0x20 | List | List container |
| 0x21 | Grid | Grid layout |
| 0x22 | Scrollable | Scrollable container |
| 0x23 | Tabs | Tab container |
| 0x30 | Video | Video player |
| 0xFE | ComponentUsage | Component instance |
| 0xFF | Unknown | Unknown element |

#### Layout Flags (8-bit bitfield)

| Bits | Field | Values |
|------|-------|--------|
| 0-1 | Direction | 0=Row, 1=Column, 2=Absolute |
| 2-3 | Alignment | 0=Start, 1=Center, 2=End, 3=SpaceBetween |
| 4 | Wrap flag | 0=No wrap, 1=Wrap |
| 5 | Grow flag | 0=No grow, 1=Grow |
| 6 | Absolute positioning | 0=Relative, 1=Absolute |
| 7 | Reserved | Reserved for future use |

#### Property Data

Following the element header, properties are stored in three sections:

1. **Standard Properties** (Property Count entries)
2. **Custom Properties** (Custom Prop Count entries)
3. **State Property Sets** (State Prop Count entries)

##### Standard Property Format (3+ bytes)

```
┌─────────────┬─────────────┬─────────────┬─────────────────┐
│Property ID  │ Value Type  │  Data Size  │   Value Data    │
│  (1 byte)   │  (1 byte)   │  (1 byte)   │  (size bytes)   │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

##### Custom Property Format (3+ bytes)

```
┌─────────────┬─────────────┬─────────────┬─────────────────┐
│Key Str Index│ Value Type  │  Data Size  │   Value Data    │
│  (1 byte)   │  (1 byte)   │  (1 byte)   │  (size bytes)   │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

#### Property IDs

##### Core Properties (0x01-0x1F)

| ID | Property | Description |
|----|----------|-------------|
| 0x01 | BackgroundColor | Background color (RGBA) |
| 0x02 | ForegroundColor | Text/foreground color |
| 0x03 | BorderColor | Border color |
| 0x04 | BorderWidth | Border width |
| 0x05 | BorderRadius | Border radius |
| 0x06 | Padding | Padding values |
| 0x07 | Margin | Margin values |
| 0x08 | TextContent | Text content |
| 0x09 | FontSize | Font size |
| 0x0A | FontWeight | Font weight |
| 0x0B | TextAlignment | Text alignment |
| 0x0C | FontFamily | Font family |
| 0x0D | ImageSource | Image source |
| 0x0E | Opacity | Opacity value |
| 0x0F | ZIndex | Z-index |
| 0x10 | Visibility | Visibility flag |
| 0x11 | Gap | Gap between elements |
| 0x12 | MinWidth | Minimum width |
| 0x13 | MinHeight | Minimum height |
| 0x14 | MaxWidth | Maximum width |
| 0x15 | MaxHeight | Maximum height |
| 0x16 | AspectRatio | Aspect ratio |
| 0x17 | Transform | Transform data |
| 0x18 | Shadow | Shadow properties |
| 0x19 | Overflow | Overflow behavior |
| 0x1A | Width | Width property |
| 0x1B | LayoutFlags | Layout flags |
| 0x1C | Height | Height property |

##### App-Specific Properties (0x20-0x2F)

| ID | Property | Description |
|----|----------|-------------|
| 0x20 | WindowWidth | Window width (App only) |
| 0x21 | WindowHeight | Window height (App only) |
| 0x22 | WindowTitle | Window title (App only) |
| 0x23 | Resizable | Resizable flag (App only) |
| 0x24 | KeepAspect | Keep aspect ratio (App only) |
| 0x25 | ScaleFactor | Scale factor (App only) |
| 0x26 | Icon | Icon resource (App only) |
| 0x27 | Version | Version string (App only) |
| 0x28 | Author | Author string (App only) |
| 0x29 | Cursor | Cursor type |
| 0x2A | Checked | Checked state |

##### Modern Layout Properties (0x30-0x5F)

| ID | Property | Description |
|----|----------|-------------|
| 0x30 | GridTemplateColumns | Grid template columns |
| 0x31 | GridTemplateRows | Grid template rows |
| 0x32 | GridColumn | Grid column |
| 0x33 | GridRow | Grid row |
| 0x34 | GridArea | Grid area |
| 0x35 | GridColumnGap | Grid column gap |
| 0x36 | GridRowGap | Grid row gap |
| 0x37 | GridAutoFlow | Grid auto flow |
| 0x38 | GridAutoColumns | Grid auto columns |
| 0x39 | GridAutoRows | Grid auto rows |
| 0x40 | Display | Display type |
| 0x41 | FlexDirection | Flex direction |
| 0x42 | FlexWrap | Flex wrap |
| 0x43 | FlexGrow | Flex grow |
| 0x44 | FlexShrink | Flex shrink |
| 0x45 | FlexBasis | Flex basis |
| 0x46 | AlignItems | Align items |
| 0x47 | AlignSelf | Align self |
| 0x48 | AlignContent | Align content |
| 0x49 | JustifyContent | Justify content |
| 0x4A | JustifyItems | Justify items |
| 0x4B | JustifySelf | Justify self |
| 0x50 | Position | Position type |
| 0x51 | Top | Top position |
| 0x52 | Right | Right position |
| 0x53 | Bottom | Bottom position |
| 0x54 | Left | Left position |
| 0x55 | Inset | Inset shorthand |

#### Value Types

| ID | Type | Description | Size |
|----|------|-------------|------|
| 0x00 | None | No value | 0 bytes |
| 0x01 | Byte | 8-bit unsigned integer | 1 byte |
| 0x02 | Short | 16-bit unsigned integer | 2 bytes |
| 0x03 | Color | 32-bit RGBA color | 4 bytes |
| 0x04 | String | String reference | 1 byte |
| 0x05 | Resource | Resource reference | 1 byte |
| 0x06 | Percentage | Percentage value | 4 bytes |
| 0x07 | Rect | Rectangle (4 values) | 16 bytes |
| 0x08 | EdgeInsets | Edge insets (4 values) | 16 bytes |
| 0x09 | Enum | Enumeration value | 1 byte |
| 0x0A | Vector | Vector of values | Variable |
| 0x0B | Custom | Custom data | Variable |
| 0x0C | StyleId | Style reference | 1 byte |
| 0x0D | Float | 32-bit float | 4 bytes |
| 0x0E | Int | 32-bit integer | 4 bytes |
| 0x0F | Bool | Boolean value | 1 byte |
| 0x10 | GridTrack | Grid track value | Variable |
| 0x11 | GridArea | Grid area value | Variable |
| 0x12 | FlexValue | Flex value | Variable |
| 0x13 | AlignmentValue | Alignment value | 1 byte |
| 0x14 | PositionValue | Position value | 1 byte |
| 0x15 | LengthPercentage | Length/percentage value | 9 bytes |
| 0x16 | Dimension | Dimension value | 9 bytes |
| 0x17 | Transform | Transform object | Variable |
| 0x18 | TransformMatrix | Transform matrix | 64 bytes |
| 0x19 | CSSUnit | CSS unit value | 9 bytes |
| 0x1A | Transform2D | 2D transform | Variable |
| 0x1B | Transform3D | 3D transform | Variable |

#### CSS Unit Values

For modern layout and transform properties (9 bytes):

```
┌─────────────────────────────┬─────────────┐
│         Value               │  Unit Type  │
│       (8 bytes)             │  (1 byte)   │
│     (64-bit float)          │             │
└─────────────────────────────┴─────────────┘
```

**Unit Types:**
- 0x01: px (pixels)
- 0x02: em (relative to font size)
- 0x03: rem (relative to root font size)
- 0x04: vw (viewport width percentage)
- 0x05: vh (viewport height percentage)
- 0x06: % (percentage)
- 0x07: deg (degrees)
- 0x08: rad (radians)
- 0x09: turn (turns)
- 0x0A: number (unitless)

### Style Table

Each style entry contains a style ID, name reference, and properties:

```
Style Entry Format:
┌─────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Style ID   │ Name Str Index  │ Property Count  │   Properties    │
│  (1 byte)   │    (1 byte)     │    (1 byte)     │   (variable)    │
└─────────────┴─────────────────┴─────────────────┴─────────────────┘
```

Properties use the same format as element standard properties.

### Component Table

Component definitions store reusable UI templates:

```
Component Entry Format:
┌─────────────┬─────────────────┬─────────────────┬─────────────────┐
│Component ID │ Name Str Index  │ Property Count  │ Template Offset │
│  (1 byte)   │    (1 byte)     │    (1 byte)     │    (4 bytes)    │
└─────────────┴─────────────────┴─────────────────┴─────────────────┘
```

Component properties define the interface:

```
Component Property Format:
┌─────────────┬─────────────┬─────────────────┬─────────────────┐
│ Name Index  │ Type Index  │  Default Index  │    Constraints  │
│  (1 byte)   │  (1 byte)   │    (1 byte)     │    (variable)   │
└─────────────┴─────────────┴─────────────────┴─────────────────┘
```

### Template Variables

Template variables enable runtime value updates:

```
Template Variable Entry (3 bytes):
┌─────────────┬─────────────┬─────────────────┐
│ Name Index  │ Value Type  │ Default Index   │
│  (1 byte)   │  (1 byte)   │    (1 byte)     │
└─────────────┴─────────────┴─────────────────┘
```

### Template Bindings

Template bindings connect variables to element properties:

```
Template Binding Entry (5+ bytes):
┌─────────────┬─────────────┬─────────────────┬─────────────────┬─────────────────┐
│Element Index│Property ID  │ Expression Index│ Variable Count  │Variable Indices │
│  (2 bytes)  │  (1 byte)   │    (1 byte)     │    (1 byte)     │  (count bytes)  │
└─────────────┴─────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Transform Data

Transform objects store CSS-like transform properties:

```
Transform Entry:
┌─────────────┬─────────────────┬─────────────────┐
│Transform ID │ Property Count  │   Properties    │
│  (1 byte)   │    (1 byte)     │   (variable)    │
└─────────────┴─────────────────┴─────────────────┘
```

Transform properties:

```
Transform Property (3+ bytes):
┌─────────────┬─────────────┬─────────────┬─────────────────┐
│Property Type│ Value Type  │ Value Size  │   Value Data    │
│  (1 byte)   │  (1 byte)   │  (1 byte)   │  (size bytes)   │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

**Transform Property Types:**
- 0x01: Scale (uniform)
- 0x02: ScaleX
- 0x03: ScaleY
- 0x04: Rotate
- 0x05: TranslateX
- 0x06: TranslateY
- 0x07: SkewX
- 0x08: SkewY
- 0x09: Matrix

### Script Table

Scripts contain executable code for application logic:

```
Script Entry:
┌─────────────┬─────────────┬─────────────┬─────────────────┬─────────────┬─────────────────┐
│Language ID  │ Name Index  │Storage Format│ Entry Pt Count  │  Data Size  │   Entry Points │
│  (1 byte)   │  (1 byte)   │  (1 byte)   │    (1 byte)     │  (2 bytes)  │  (count bytes)  │
└─────────────┴─────────────┴─────────────┴─────────────────┴─────────────┴─────────────────┘
```

**Language IDs:**
- 0x01: Lua
- 0x02: JavaScript
- 0x03: Python
- 0x04: Wren

**Storage Formats:**
- 0x00: Inline (script data follows)
- 0x01: External file reference

### Resource Table

Resources reference external files:

```
Resource Entry (4 bytes):
┌─────────────┬─────────────┬─────────────┬─────────────────┐
│Resource Type│ Name Index  │   Format    │   Data Index    │
│  (1 byte)   │  (1 byte)   │  (1 byte)   │    (1 byte)     │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

**Resource Types:**
- 0x01: Image
- 0x02: Font
- 0x03: Audio
- 0x04: Video
- 0x05: Data file

**Resource Formats:**
- 0x00: External file
- 0x01: Inline data

## Optimization Techniques

### String Deduplication

All strings in the file are stored once in the string table. Elements, styles, and other sections reference strings by index, significantly reducing file size for applications with repeated text.

### Property Sharing

Common property values are deduplicated. For example, if multiple elements have the same background color, the color value is stored once and referenced by index.

### Compact Encoding

- Booleans use 1 bit (stored as bytes for alignment)
- Small integers use appropriate byte sizes
- Colors use efficient 4-byte RGBA encoding
- Flags are packed into bitfields

### Layout Flags

Common layout configurations are encoded as compact bitfields rather than separate properties, reducing the number of property entries per element.

## Version Compatibility

### Version Format
Version is stored as a 16-bit value: `(major << 8) | minor`

### Current Version: 0.5
- Major version: 0
- Minor version: 5
- Binary representation: 0x0005

### Compatibility Rules

1. **Same major version**: Files can be read by any parser with the same major version
2. **Minor version differences**: Newer parsers can read files with older minor versions
3. **Unknown features**: Parsers should skip unknown flags and sections gracefully
4. **Magic number**: Must always be "KRB1" for this specification

## Performance Characteristics

### File Size
- **Typical reduction**: 65-75% smaller than equivalent KRY source
- **String deduplication**: 20-40% additional savings in text-heavy UIs
- **Property sharing**: 10-20% additional savings with repeated styles

### Parse Speed
- **Sequential access**: Sections can be read independently
- **Memory mapping**: File structure supports memory-mapped I/O
- **Minimal allocations**: Fixed-size headers reduce allocation overhead
- **Cache-friendly**: Related data stored together

### Memory Usage
- **Lazy loading**: Sections can be loaded on demand
- **String sharing**: Deduplicated strings reduce memory usage
- **Property compression**: Compact property encoding reduces memory footprint

## Error Handling

### Validation
1. **Magic number**: Must be "KRB1"
2. **Version check**: Major version must match
3. **Section bounds**: All offsets must be within file size
4. **String indices**: Must be valid indices into string table
5. **Property sizes**: Value data must match declared size

### Recovery Strategies
1. **Unknown properties**: Skip unknown property IDs
2. **Invalid indices**: Use default values for invalid string/style references
3. **Corrupted sections**: Attempt to continue parsing other sections
4. **Version mismatch**: Warn but attempt to parse compatible features

## Implementation Guidelines

### Parser Architecture

```rust
pub struct KRBParser {
    data: Vec<u8>,
    position: usize,
    header: KRBHeader,
}

impl KRBParser {
    pub fn new(data: Vec<u8>) -> Result<Self> {
        let mut parser = Self { 
            data, 
            position: 0, 
            header: KRBHeader::default() 
        };
        parser.header = parser.parse_header()?;
        parser.validate_header()?;
        Ok(parser)
    }
    
    pub fn parse(&mut self) -> Result<KRBFile> {
        let strings = self.parse_string_table()?;
        let elements = self.parse_element_tree(&strings)?;
        let styles = self.parse_style_table(&strings)?;
        // ... parse other sections
        
        Ok(KRBFile {
            header: self.header.clone(),
            strings,
            elements,
            styles,
            // ... other sections
        })
    }
}
```

### Memory Management

- Use memory-mapped I/O for large files
- Implement lazy loading for unused sections
- Share string data between elements
- Use appropriate data structures (HashMap for elements, Vec for strings)

### Cross-Platform Compatibility

- Always use little-endian byte order
- Handle alignment requirements appropriately
- Test on all target platforms
- Validate floating-point format compatibility

This specification provides the complete foundation for implementing KRB parsers and generators while maintaining compatibility with the Kryon ecosystem across all supported platforms.