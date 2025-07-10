# Kryon Complete Reference Specification v1.2
*Exhaustive technical reference for all Kryon components*

## Table of Contents

1. [KRY Language Complete Reference](#kry-language-complete-reference)
2. [KRB Binary Format Complete Reference](#krb-binary-format-complete-reference)  
3. [Runtime API Complete Reference](#runtime-api-complete-reference)
4. [Error Codes and Messages](#error-codes-and-messages)
5. [Platform-Specific Implementation Details](#platform-specific-implementation-details)
6. [Performance Benchmarks and Optimization](#performance-benchmarks-and-optimization)
7. [Compatibility Matrix](#compatibility-matrix)
8. [Migration Guide](#migration-guide)

## KRY Language Complete Reference

### Complete Grammar (EBNF)
```ebnf
File               = { Include | Variables | Style | Define | Script } App ;

Include            = "@include" String ;

Variables          = "@variables" "{" { Variable } "}" ;
Variable           = Identifier ":" Value ;

Style              = "style" String "{" [ Extends ] { Property } "}" ;
Extends            = "extends" ":" ( String | "[" StringList "]" ) ;

Define             = "Define" Identifier "{" Properties Element "}" ;
Properties         = "Properties" "{" { PropertyDef } "}" ;
PropertyDef        = Identifier ":" TypeHint [ "=" Value ] ;

Script             = "@script" String [ ScriptSource ] [ ScriptMode ] ;
ScriptSource       = "from" String | "{" ScriptCode "}" ;
ScriptMode         = "mode" "=" String ;

App                = "App" "{" { Property | PseudoSelector | Element } "}" ;

Element            = ElementType [ PropertyBlock ] [ ChildBlock ] ;
ElementType        = "Container" | "Text" | "Button" | "Input" | "Image" | Identifier ;
PropertyBlock      = "{" { Property ";" } "}" ;
ChildBlock         = "{" { Property | PseudoSelector | Element } "}" ;

Property           = Identifier ":" Value ;
PseudoSelector     = "&:" PseudoState "{" { Property } "}" ;
PseudoState        = "hover" | "active" | "focus" | "disabled" | "checked" ;

Value              = String | Number | Boolean | Color | Variable | Identifier ;
Variable           = "$" Identifier ;
String             = '"' { Character } '"' ;
Number             = [ "-" ] Digit { Digit } [ "." Digit { Digit } ] ;
Boolean            = "true" | "false" ;
Color              = "#" HexDigit{3,8} ;
Identifier         = Letter { Letter | Digit | "_" } ;

TypeHint           = "String" | "Int" | "Float" | "Bool" | "Color" | "StyleID" | 
                     "Resource" | "Enum" "(" IdentifierList ")" ;

StringList         = String { "," String } ;
IdentifierList     = Identifier { "," Identifier } ;
ScriptCode         = { AnyCharacter } ;

Letter             = "a"..."z" | "A"..."Z" ;
Digit              = "0"..."9" ;
HexDigit           = Digit | "a"..."f" | "A"..."F" ;
Character          = AnyCharacter - '"' | EscapeSequence ;
EscapeSequence     = "\" ( '"' | "\" | "n" | "t" | "r" ) ;
AnyCharacter       = ? any Unicode character ? ;
```

### Complete Property Reference

#### Universal Properties (All Elements)
```
Property Name       | Type        | Default    | Description
--------------------|-------------|------------|------------------
id                  | String      | ""         | Unique element identifier
pos_x               | Int         | 0          | X coordinate (pixels)
pos_y               | Int         | 0          | Y coordinate (pixels)  
width               | Int|Percent | auto       | Element width
height              | Int|Percent | auto       | Element height
min_width           | Int|Percent | 0          | Minimum width constraint
min_height          | Int|Percent | 0          | Minimum height constraint
max_width           | Int|Percent | unlimited  | Maximum width constraint
max_height          | Int|Percent | unlimited  | Maximum height constraint
layout              | Enum        | column     | Layout direction and behavior
gap                 | Int         | 0          | Spacing between children (pixels)
padding             | EdgeInsets  | 0          | Internal spacing
margin              | EdgeInsets  | 0          | External spacing
background_color    | Color       | transparent| Background fill color
border_color        | Color       | transparent| Border stroke color
border_width        | Int         | 0          | Border thickness (pixels)
border_radius       | Int         | 0          | Corner rounding (pixels)
opacity             | Float       | 1.0        | Element transparency (0.0-1.0)
visibility          | Bool        | true       | Element visibility
z_index             | Int         | 0          | Layering order (higher = front)
cursor              | Enum        | default    | Mouse cursor type
style               | StyleID     | none       | Reference to style definition
```

#### Layout Property Values
```
layout values:
- Direction: column, row, column_reverse, row_reverse
- Alignment: start, center, end, space_between, space_around, space_evenly
- Wrap: nowrap, wrap, wrap_reverse  
- Grow: fixed, grow
- Position: relative, absolute

Examples:
  layout: column              # Vertical stack, start-aligned
  layout: row center          # Horizontal row, center-aligned
  layout: column center grow  # Vertical, centered, fill container
  layout: absolute            # Positioned absolutely by pos_x/pos_y
```

#### EdgeInsets Format
```
EdgeInsets can be specified as:
- Single value: padding: 12                    # All sides
- Two values: padding: "12 16"                 # Vertical, Horizontal  
- Four values: padding: "12 16 8 16"          # Top, Right, Bottom, Left
```

#### Text Properties (Text, Button)
```
Property Name       | Type        | Default    | Description
--------------------|-------------|------------|------------------
text                | String      | ""         | Text content
text_color          | Color       | inherit    | Text color (inheritable)
font_size           | Int         | inherit    | Font size in pixels (inheritable)
font_weight         | Enum        | inherit    | Font weight (inheritable)
font_family         | String      | inherit    | Font family name (inheritable)
text_alignment      | Enum        | inherit    | Text alignment (inheritable)
line_height         | Float       | 1.2        | Line spacing multiplier
text_decoration     | Enum        | none       | Text decoration
text_transform      | Enum        | none       | Text case transformation
```

#### Font Weight Values
```
font_weight values:
- normal (400)
- bold (700)  
- light (300)
- heavy (900)
- 100, 200, 300, 400, 500, 600, 700, 800, 900 (numeric weights)
```

#### Text Alignment Values
```
text_alignment values:
- start    # Left in LTR, right in RTL
- center   # Center-aligned
- end      # Right in LTR, left in RTL  
- justify  # Justified (full line width)
```

#### Interactive Properties (Button, Input)
```
Property Name       | Type        | Default    | Description
--------------------|-------------|------------|------------------
disabled            | Bool        | false      | Interaction disabled state
onClick             | Callback    | none       | Click event handler
onPress             | Callback    | none       | Press down event handler
onRelease           | Callback    | none       | Press release event handler
onHover             | Callback    | none       | Mouse enter/leave handler
onFocus             | Callback    | none       | Focus gained handler
onBlur              | Callback    | none       | Focus lost handler
```

#### Input-Specific Properties
```
Property Name       | Type        | Default    | Description
--------------------|-------------|------------|------------------
placeholder         | String      | ""         | Placeholder text
value               | String      | ""         | Current input value
onChange            | Callback    | none       | Value change handler
onSubmit            | Callback    | none       | Submit event handler (Enter key)
type                | Enum        | text       | Input type (text, password, email, etc.)
max_length          | Int         | unlimited  | Maximum character count
readonly            | Bool        | false      | Read-only state
```

#### Image-Specific Properties
```
Property Name       | Type        | Default    | Description
--------------------|-------------|------------|------------------
src                 | Resource    | none       | Image source path/URL
alt                 | String      | ""         | Alternative text
fit                 | Enum        | contain    | Image scaling behavior
```

#### Image Fit Values
```
fit values:
- contain   # Scale to fit within bounds, preserve aspect ratio
- cover     # Scale to fill bounds, preserve aspect ratio, may crop
- fill      # Scale to fill bounds exactly, may distort
- scale_down# Scale down only if larger than bounds
- none      # No scaling, original size
```

#### App-Specific Properties
```
Property Name       | Type        | Default    | Description
--------------------|-------------|------------|------------------
window_title        | String      | "Kryon App"| Application window title
window_width        | Int         | 800        | Initial window width
window_height       | Int         | 600        | Initial window height
window_min_width    | Int         | 200        | Minimum window width
window_min_height   | Int         | 200        | Minimum window height
window_max_width    | Int         | unlimited  | Maximum window width
window_max_height   | Int         | unlimited  | Maximum window height
resizable           | Bool        | true       | Window resize capability
keep_aspect_ratio   | Bool        | false      | Maintain aspect ratio during resize
scale_factor        | Float       | 1.0        | UI scaling factor (DPI scaling)
icon                | Resource    | none       | Application icon
version             | String      | "1.0"      | Application version string
author              | String      | ""         | Application author/developer
background_color    | Color       | #FFFFFF    | Window background color
```

#### Cursor Type Values
```
cursor values:
- default      # Platform default cursor
- pointer      # Hand pointer (for clickable elements)
- text         # Text input cursor (I-beam)
- crosshair    # Crosshair cursor
- move         # Move/drag cursor (4-way arrows)
- resize_ns    # North-south resize (vertical)
- resize_ew    # East-west resize (horizontal)
- resize_nesw  # Northeast-southwest diagonal resize
- resize_nwse  # Northwest-southeast diagonal resize  
- wait         # Loading/wait cursor
- help         # Help cursor (question mark)
- not_allowed  # Not allowed cursor (circle with line)
```

### Variable System Complete Reference

#### Variable Types and Validation
```kry
@variables {
    # String variables
    app_name: "My Application"                    # UTF-8 string, max 65535 chars
    
    # Numeric variables  
    spacing: 16                                   # Integer, -2147483648 to 2147483647
    opacity_val: 0.75                           # Float, IEEE 754 32-bit
    
    # Boolean variables
    debug_mode: true                             # Boolean: true or false only
    
    # Color variables
    primary_color: "#007BFFFF"                   # RGBA hex: #RRGGBBAA
    secondary_color: "#6C757D"                   # RGB hex: #RRGGBB (alpha defaults to FF)
    
    # Calculated variables (evaluated left-to-right)
    double_spacing: $spacing * 2                 # Arithmetic expressions
    theme_bg: $debug_mode ? "#FF0000" : "#FFF"  # Conditional expressions
    
    # Complex expressions
    scaled_size: $base_size * $scale_factor      # Multiple variable references
    final_color: $debug_mode ? $debug_color : $primary_color
}
```

#### Variable Resolution Algorithm
```
Resolution order:
1. Parse all variable declarations
2. Build dependency graph
3. Detect circular dependencies (error if found)
4. Topologically sort variables
5. Resolve in dependency order
6. Substitute resolved values into usage sites

Circular dependency detection:
variables: { a: $b, b: $c, c: $a }  # Error: Circular dependency a -> b -> c -> a

Forward references allowed:
variables: { 
    computed: $base * 2    # Can reference base defined later
    base: 10
}
```

#### Variable Scope Rules
```
1. Global scope: Variables available after definition point
2. File-level scope: Variables from @include files are merged
3. Override behavior: Later definitions override earlier ones with warning
4. Undefined usage: Compile-time error for undefined variable references
5. Case sensitivity: Variable names are case-sensitive
6. Reserved names: Cannot use KRY keywords as variable names
```

### Style System Complete Reference  

#### Style Inheritance Resolution
```kry
# Multiple inheritance example
style "base" {
    font_size: 14
    color: "#333"
}

style "padding_mixin" {
    padding: 12
    margin: 8
}

style "border_mixin" {
    border_width: 1
    border_color: "#DDD"
}

style "combined" {
    extends: ["base", "padding_mixin", "border_mixin"]
    background_color: "#FFF"    # Direct properties override inherited
    color: "#000"               # Overrides color from "base"
}

# Inheritance resolution order:
# 1. base properties applied first
# 2. padding_mixin properties applied (may override base)
# 3. border_mixin properties applied (may override base and padding_mixin)
# 4. Direct properties applied last (override all inherited)
```

#### Style Property Validation
```
Valid style properties (subset of element properties):
- All visual properties: background_color, border_*, opacity, etc.
- All text properties: font_size, font_weight, text_color, etc.
- All spacing properties: padding, margin, gap
- Layout properties: width, height, min_*, max_*

Invalid in styles:
- Structural properties: id, pos_x, pos_y
- Event handlers: onClick, onChange, etc.
- Element-specific: src (Image), placeholder (Input), etc.
```

### Component System Complete Reference

#### Component Property Type System
```kry
Define MyComponent {
    Properties {
        # Basic types
        title: String = "Default Title"
        count: Int = 0
        price: Float = 0.0
        enabled: Bool = true
        theme_color: Color = "#007BFF"
        
        # Special types
        item_style: StyleID = "default_item"     # References style by name
        icon: Resource = "default_icon.png"     # References resource
        
        # Enum types
        size: Enum(small, medium, large) = medium
        position: Enum(top, bottom, left, right) = bottom
        
        # Optional properties (no default)
        optional_text: String                   # Must be provided or runtime uses ""
        optional_callback: String               # For event handler function names
    }
    
    # Component template implementation
    Container {
        # Template can reference properties with $property_name
        background_color: $theme_color
        
        Text {
            text: $title
            style: $item_style
        }
        
        # Template can include conditional logic
        Button {
            text: $enabled ? "Enabled" : "Disabled"
            disabled: !$enabled
            onClick: $optional_callback
        }
    }
}
```

#### Component Instantiation Rules
```kry
# Component usage
MyComponent {
    id: "instance1"              # Standard property for instance
    width: 300                   # Standard property for instance
    style: "custom_wrapper"      # Standard property for instance
    
    # Declared properties become custom properties in KRB
    title: "Custom Title"        # Becomes custom property
    count: 42                    # Becomes custom property
    size: large                  # Becomes custom property (validated against enum)
    theme_color: "#FF0000"       # Becomes custom property
    
    # Instance children (optional)
    Text { text: "Extra content" }
    Button { text: "Action" }
}

# KRB compilation result:
# - Placeholder element with type Container (matches template root)
# - Standard properties: id="instance1", width=300, style=custom_wrapper
# - Custom property: _componentName="MyComponent"
# - Custom properties: title="Custom Title", count=42, etc.
# - Child elements: Text and Button as children of placeholder
```

#### Component Child Slot System
```kry
Define Card {
    Properties {
        title: String = "Card"
    }
    
    Container {
        style: "card_container"
        
        # Header (always present)
        Container {
            style: "card_header"
            Text { text: $title }
        }
        
        # Content slot for instance children
        Container {
            id: "content_slot"      # Special ID for child insertion
            style: "card_content"
        }
        
        # Footer (always present)
        Container {
            style: "card_footer"
            Text { text: "Card Footer" }
        }
    }
}

# Usage with children
Card {
    title: "My Card"
    
    # These children will be inserted into the content_slot Container
    Text { text: "Custom content here" }
    Button { text: "Action Button" }
}

# Runtime behavior:
# 1. Component template is instantiated
# 2. Instance children are moved from placeholder to content_slot container
# 3. If no content_slot found, children are appended to component root
```

### Script Integration Complete Reference

#### Multi-Language Support Details
```kry
# Lua script (recommended for embedded/mobile)
@script "lua" {
    -- Lightweight, fast, minimal memory footprint
    function handleClick()
        local element = kryon.getElementById("button1")
        element.text = "Clicked from Lua!"
    end
}

# JavaScript script (familiar for web developers)  
@script "javascript" {
    // Full ES6+ support via QuickJS engine
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    async function fetchData() {
        // Note: async/await support depends on runtime implementation
        const response = await fetch('/api/data');
        return response.json();
    }
}

# Python script (for data processing)
@script "python" {
    # MicroPython subset, good for calculations
    def calculate_stats(numbers):
        total = sum(numbers)
        average = total / len(numbers)
        return {"total": total, "average": average}
}

# Wren script (ultra-lightweight alternative)
@script "wren" {
    // Very small memory footprint, C-like syntax
    class Calculator {
        static add(a, b) { a + b }
        static multiply(a, b) { a * b }
    }
}
```

#### Script Storage and Loading Modes
```kry
# Embedded script (default for inline scripts)
@script "lua" {
    function embeddedFunction() end
}

# External file (default for file references)
@script "lua" from "scripts/utils.lua"

# Force embedding of external file
@script "lua" from "scripts/small_utils.lua" mode="embed"

# Force external storage of inline script  
@script "lua" mode="external" name="large_handlers" {
    -- Large script that should be lazy-loaded
    function complexCalculation() 
        -- Lots of code here...
    end
}

# Automatic mode (compiler decides based on size)
@script "lua" mode="auto" threshold="2048" {
    -- Embedded if < 2KB, external if >= 2KB
    function adaptiveFunction() end
}

# External with custom path and minification
@script "lua" mode="external" path="optimized/handlers.lua" minify="true" {
    function productionHandler() end
}
```

## KRB Binary Format Complete Reference

### File Header Structure (54 bytes)
```
Offset | Size | Field                | Type    | Description
-------|------|----------------------|---------|------------------------------------------
0      | 4    | Magic Number         | char[4] | Always "KRB1" (0x4B524231)
4      | 2    | Version              | uint16  | Format version (0x0005 = v1.2)
6      | 2    | Flags                | uint16  | Feature flags (see below)
8      | 2    | Element Count        | uint16  | Number of elements in main UI tree
10     | 2    | Style Count          | uint16  | Number of style definitions
12     | 2    | Component Def Count  | uint16  | Number of component definitions
14     | 2    | Animation Count      | uint16  | Number of animations (reserved)
16     | 2    | Script Count         | uint16  | Number of script blocks
18     | 2    | String Count         | uint16  | Number of strings in string table
20     | 2    | Resource Count       | uint16  | Number of external resources
22     | 4    | Element Offset       | uint32  | Byte offset to element section
26     | 4    | Style Offset         | uint32  | Byte offset to style section
30     | 4    | Component Def Offset | uint32  | Byte offset to component definitions
34     | 4    | Animation Offset     | uint32  | Byte offset to animations (reserved)
38     | 4    | Script Offset        | uint32  | Byte offset to script section
42     | 4    | String Offset        | uint32  | Byte offset to string table
46     | 4    | Resource Offset      | uint32  | Byte offset to resource table
50     | 4    | Total Size           | uint32  | Total file size in bytes
```

### Header Flags Detailed
```
Bit | Flag Name               | Description
----|-------------------------|------------------------------------------
0   | FLAG_HAS_STYLES         | File contains style definitions
1   | FLAG_HAS_COMPONENT_DEFS | File contains component definitions
2   | FLAG_HAS_ANIMATIONS     | File contains animations (reserved)
3   | FLAG_HAS_RESOURCES      | File contains external resource references
4   | FLAG_COMPRESSED         | File uses compression (reserved)
5   | FLAG_FIXED_POINT        | File uses 8.8 fixed-point numbers
6   | FLAG_EXTENDED_COLOR     | Colors are 4-byte RGBA (vs 1-byte palette)
7   | FLAG_HAS_APP            | First element is App element
8   | FLAG_HAS_SCRIPTS        | File contains embedded scripts
9   | FLAG_HAS_STATE_PROPS    | Elements have pseudo-selector properties
10-15| Reserved                | Must be zero
```

### Element Header Structure (18 bytes)
```
Offset | Size | Field            | Type   | Description
-------|------|------------------|--------|------------------------------------------
0      | 1    | Type             | uint8  | Element type (see Element Types)
1      | 1    | ID               | uint8  | String table index for ID (0 = no ID)
2      | 2    | Position X       | uint16 | X coordinate (little-endian)
4      | 2    | Position Y       | uint16 | Y coordinate (little-endian)  
6      | 2    | Width            | uint16 | Width in pixels/units (little-endian)
8      | 2    | Height           | uint16 | Height in pixels/units (little-endian)
10     | 1    | Layout           | uint8  | Layout flags (see Layout Byte)
11     | 1    | Style ID         | uint8  | Style table index (1-based, 0 = no style)
12     | 1    | Property Count   | uint8  | Number of standard properties
13     | 1    | Child Count      | uint8  | Number of child elements
14     | 1    | Event Count      | uint8  | Number of event handlers
15     | 1    | Animation Count  | uint8  | Number of animations (reserved)
16     | 1    | Custom Prop Count| uint8  | Number of custom properties
17     | 1    | State Prop Count | uint8  | Number of state property sets
```

### Element Types Complete List
```
Type | Value | Name           | Description
-----|-------|----------------|------------------------------------------
Core Elements (0x00-0x0F)
APP  | 0x00  | App            | Application root element
CONT | 0x01  | Container      | Layout container
TEXT | 0x02  | Text           | Text display element
IMG  | 0x03  | Image          | Image display element
CANV | 0x04  | Canvas         | Custom drawing surface (reserved)
     | 0x05-0x0F | Reserved    | Reserved for future core elements

Interactive Elements (0x10-0x1F)  
BTN  | 0x10  | Button         | Clickable button element
INPT | 0x11  | Input          | Text input element
CHKB | 0x12  | Checkbox       | Checkbox input (reserved)
RDIO | 0x13  | Radio          | Radio button input (reserved)
SLDR | 0x14  | Slider         | Range slider input (reserved)
     | 0x15-0x1F | Reserved    | Reserved for future interactive elements

Structural Elements (0x20-0x2F)
LIST | 0x20  | List           | List container (reserved)
GRID | 0x21  | Grid           | Grid layout container (reserved)  
SCRL | 0x22  | Scrollable     | Scrollable container (reserved)
TABS | 0x23  | Tabs           | Tab container (reserved)
     | 0x24-0x2F | Reserved    | Reserved for future structural elements

Specialized Elements (0x30-0xFF)
VID  | 0x30  | Video          | Video player (reserved)
     | 0x31-0xFF | Custom      | Application-specific elements
```

### Layout Byte Specification
```
Bits | Mask | Field     | Values                    | Description
-----|------|-----------|---------------------------|---------------------------
0-1  | 0x03 | Direction | 00=Row, 01=Column,        | Primary layout direction
     |      |           | 10=RowReverse,            |
     |      |           | 11=ColumnReverse          |
2-3  | 0x0C | Alignment | 00=Start, 01=Center,      | Child alignment
     |      |           | 10=End, 11=SpaceBetween   |
4    | 0x10 | Wrap      | 0=NoWrap, 1=Wrap          | Allow line wrapping
5    | 0x20 | Grow      | 0=Fixed, 1=Grow           | Expand to fill space
6    | 0x40 | Position  | 0=Flow, 1=Absolute        | Positioning mode
7    | 0x80 | Reserved  | Must be 0                 | Reserved for future use

Examples:
0x00 = Row, Start, NoWrap, Fixed, Flow
0x05 = Column, Center, NoWrap, Fixed, Flow  
0x21 = Column, Start, NoWrap, Grow, Flow
0x40 = Row, Start, NoWrap, Fixed, Absolute
```

### Property System Complete Reference

#### Standard Property IDs and Formats
```
ID   | Name              | Value Type      | Size | Description
-----|-------------------|-----------------|------|----------------------------------
0x01 | BackgroundColor   | VAL_TYPE_COLOR  | 4    | Background fill color (RGBA)
0x02 | ForegroundColor   | VAL_TYPE_COLOR  | 4    | Text/foreground color (RGBA)
0x03 | BorderColor       | VAL_TYPE_COLOR  | 4    | Border stroke color (RGBA)
0x04 | BorderWidth       | VAL_TYPE_BYTE   | 1    | Border thickness (pixels)
0x05 | BorderRadius      | VAL_TYPE_BYTE   | 1    | Corner radius (pixels)
0x06 | Padding           | VAL_TYPE_EDGEINSETS | 4 | Internal spacing (T,R,B,L bytes)
0x07 | Margin            | VAL_TYPE_EDGEINSETS | 4 | External spacing (T,R,B,L bytes)
0x08 | TextContent       | VAL_TYPE_STRING | 1    | Text content (string index)
0x09 | FontSize          | VAL_TYPE_SHORT  | 2    | Font size (pixels, little-endian)
0x0A | FontWeight        | VAL_TYPE_ENUM   | 1    | Font weight (0=Normal, 1=Bold, etc.)
0x0B | TextAlignment     | VAL_TYPE_ENUM   | 1    | Text alignment (0=Start, 1=Center, etc.)
0x0C | ImageSource       | VAL_TYPE_RESOURCE | 1  | Image source (resource index)
0x0D | Opacity           | VAL_TYPE_PERCENTAGE | 2 | Transparency (8.8 fixed point)
0x0E | ZIndex            | VAL_TYPE_SHORT  | 2    | Layer order (signed 16-bit)
0x0F | Visibility        | VAL_TYPE_BYTE   | 1    | Visible flag (0=Hidden, 1=Visible)
0x10 | Gap               | VAL_TYPE_SHORT  | 2    | Child spacing (pixels, little-endian)
0x11 | MinWidth          | VAL_TYPE_SHORT  | 2    | Minimum width (pixels or percentage)
0x12 | MinHeight         | VAL_TYPE_SHORT  | 2    | Minimum height (pixels or percentage)
0x13 | MaxWidth          | VAL_TYPE_SHORT  | 2    | Maximum width (pixels or percentage)
0x14 | MaxHeight         | VAL_TYPE_SHORT  | 2    | Maximum height (pixels or percentage)
0x15 | AspectRatio       | VAL_TYPE_PERCENTAGE | 2 | Aspect ratio (8.8 fixed point)
0x16 | Transform         | VAL_TYPE_STRING | 1    | CSS-like transform (string index)
0x17 | Shadow            | VAL_TYPE_STRING | 1    | Drop shadow (string index)
0x18 | Overflow          | VAL_TYPE_ENUM   | 1    | Overflow behavior (0=Visible, etc.)
0x19 | CustomData        | VAL_TYPE_CUSTOM | Var  | Arbitrary binary data
0x1A | LayoutFlags       | (Not stored)    | -    | Computed into Layout byte
0x29 | Cursor            | VAL_TYPE_ENUM   | 1    | Mouse cursor type

App-Specific Properties (0x20-0x28, only valid on ELEM_TYPE_APP):
0x20 | WindowWidth       | VAL_TYPE_SHORT  | 2    | Window width (pixels)
0x21 | WindowHeight      | VAL_TYPE_SHORT  | 2    | Window height (pixels)
0x22 | WindowTitle       | VAL_TYPE_STRING | 1    | Window title (string index)
0x23 | Resizable         | VAL_TYPE_BYTE   | 1    | Resizable flag (0=No, 1=Yes)
0x24 | KeepAspect        | VAL_TYPE_BYTE   | 1    | Keep aspect ratio (0=No, 1=Yes)
0x25 | ScaleFactor       | VAL_TYPE_PERCENTAGE | 2 | UI scale (8.8 fixed point)
0x26 | Icon              | VAL_TYPE_RESOURCE | 1  | App icon (resource index)
0x27 | Version           | VAL_TYPE_STRING | 1    | App version (string index)
0x28 | Author            | VAL_TYPE_STRING | 1    | App author (string index)
```

#### Value Type System
```
Type | Value | Name           | Description
-----|-------|----------------|------------------------------------------
0x00 | -     | None           | No value/null
0x01 | BYTE  | Byte           | 8-bit unsigned integer (0-255)
0x02 | SHORT | Short          | 16-bit unsigned integer (little-endian)
0x03 | COLOR | Color          | 32-bit RGBA color (little-endian)
0x04 | STRING| String Index   | 8-bit index into string table (0-based)
0x05 | RSRC  | Resource Index | 8-bit index into resource table (0-based)
0x06 | PCT   | Percentage     | 16-bit 8.8 fixed-point (little-endian)
0x07 | RECT  | Rectangle      | 8 bytes: x,y,w,h as 16-bit values
0x08 | EDGE  | EdgeInsets     | 4 bytes: top,right,bottom,left as 8-bit
0x09 | ENUM  | Enum           | 8-bit enumeration value (context-dependent)
0x0A | VEC   | Vector         | 4 bytes: x,y as 16-bit values  
0x0B | CSTM  | Custom         | Variable-length application data

Fixed-Point Format (VAL_TYPE_PERCENTAGE):
- 16 bits total: 8 bits integer + 8 bits fractional
- Range: 0.0 to 255.99609375 (255 + 255/256)
- Examples: 0.5 = 128 (0x0080), 1.0 = 256 (0x0100)
- Used for opacity, aspect ratio, scale factor
```

### String Table Format
```
String Table Header:
Offset | Size | Field        | Description
-------|------|--------------|----------------------------------
0      | 2    | String Count | Number of strings (little-endian)

String Entries (sequential):
Offset | Size     | Field  | Description  
-------|----------|--------|----------------------------------
0      | 1        | Length | String length in bytes (0-255)
1      | Length   | Data   | UTF-8 encoded string data

Notes:
- Index 0 typically represents empty string ""
- Maximum string length: 255 bytes
- Strings are NOT null-terminated
- UTF-8 encoding allows full Unicode support
- String deduplication: identical strings stored once
```

### Component Definition Table Format
```
Component Definition Header:
Offset | Size | Field              | Description
-------|------|--------------------|----------------------------------
0      | 2    | Component Count    | Number of component definitions

Component Definition Entry:
Offset | Size     | Field              | Description
-------|----------|--------------------|----------------------------------
0      | 1        | Name Index         | String table index for component name
1      | 1        | Property Def Count | Number of property definitions
2      | Variable | Property Defs      | Property definition array
Next   | Variable | Root Element       | Complete element block (template)

Property Definition Structure:
Offset | Size     | Field              | Description
-------|----------|--------------------|----------------------------------
0      | 1        | Name Index         | String table index for property name
1      | 1        | Value Type Hint    | Expected value type (VAL_TYPE_*)
2      | 1        | Default Value Size | Size of default value (0 = no default)
3      | Variable | Default Value Data | Default value in type-specific format
```

### Script Table Format
```
Script Table Header:
Offset | Size | Field        | Description
-------|------|--------------|----------------------------------
0      | 2    | Script Count | Number of script blocks

Script Entry:
Offset | Size     | Field             | Description
-------|----------|-------------------|----------------------------------
0      | 1        | Language ID       | Script language (see Language IDs)
1      | 1        | Name Index        | String table index (0 if unnamed)
2      | 1        | Storage Format    | 0=Inline, 1=External
3      | 1        | Entry Point Count | Number of exported functions
4      | 2        | Data Size/Res Idx | Size (inline) or resource index (external)
6      | Variable | Entry Points      | Function name indices
Next   | Variable | Code Data         | Script source (if inline)

Entry Point Structure:
Offset | Size | Field             | Description
-------|------|-------------------|----------------------------------
0      | 1    | Function Name Idx | String table index for function name

Language IDs:
0x01 = Lua
0x02 = JavaScript (QuickJS)
0x03 = Python (MicroPython)
0x04 = Wren
0x05-0xFF = Reserved/Custom
```

### State Property Sets Format
```
State Property Set Entry:
Offset | Size     | Field          | Description
-------|----------|----------------|----------------------------------
0      | 1        | State Flags    | Bit flags for applicable states
1      | 1        | Property Count | Number of properties in this set
2      | Variable | Properties     | Standard property entries

State Flags:
Bit 0 (0x01) = STATE_HOVER    (mouse over element)
Bit 1 (0x02) = STATE_ACTIVE   (element being pressed)
Bit 2 (0x04) = STATE_FOCUS    (element has keyboard focus)
Bit 3 (0x08) = STATE_DISABLED (element is disabled)
Bit 4 (0x10) = STATE_CHECKED  (checkbox/radio is checked)
Bit 5-7      = Reserved

Property Resolution Order:
1. Base element properties (style + direct properties)
2. State property sets (in order of appearance)
3. Later sets override earlier sets for same properties
4. Final computed properties used for rendering
```

## Runtime API Complete Reference

### Core API Classes

#### Element Manipulation API
```javascript
// Element access
kryon.getElementById(id: string): ElementHandle | null
kryon.getElementsByType(type: string): ElementHandle[]
kryon.getElementsByClass(className: string): ElementHandle[]
kryon.createElement(type: string): ElementHandle

// Element tree manipulation  
kryon.appendChild(parent: ElementHandle, child: ElementHandle): void
kryon.removeChild(parent: ElementHandle, child: ElementHandle): void
kryon.insertBefore(parent: ElementHandle, newChild: ElementHandle, 
                   refChild: ElementHandle): void

// Element queries
kryon.querySelector(selector: string): ElementHandle | null
kryon.querySelectorAll(selector: string): ElementHandle[]

// Selector syntax:
// "#myId"           - by ID
// ".myClass"        - by class (custom property "class")
// "Button"          - by element type
// "Container Text"  - descendant selector
// ":hover"          - pseudo-selector for current state
```

#### Property Manipulation API
```javascript
// Property access
kryon.getProperty(element: ElementHandle, property: string): any
kryon.setProperty(element: ElementHandle, property: string, value: any): void
kryon.hasProperty(element: ElementHandle, property: string): boolean
kryon.removeProperty(element: ElementHandle, property: string): void

// Batch property operations
kryon.setProperties(element: ElementHandle, properties: Object): void
kryon.getProperties(element: ElementHandle, properties: string[]): Object

// Style manipulation
kryon.getStyle(element: ElementHandle): string
kryon.setStyle(element: ElementHandle, styleId: string): void
kryon.getComputedProperties(element: ElementHandle): Object

// Type-safe property access (language-dependent)
element.text = "New text"              // Direct property access
element.backgroundColor = "#FF0000"    // Color property
element.width = 200                    // Numeric property
element.visible = true                 // Boolean property
```

#### Event Handling API
```javascript
// Event registration
kryon.addEventListener(element: ElementHandle, eventType: string, 
                       callback: Function): void
kryon.removeEventListener(element: ElementHandle, eventType: string, 
                          callback: Function): void

// Event types
"click"      // Mouse click
"mousedown"  // Mouse press down
"mouseup"    // Mouse release
"mouseover"  // Mouse enter element
"mouseout"   // Mouse leave element
"focus"      // Keyboard focus gained  
"blur"       // Keyboard focus lost
"change"     // Input value changed
"submit"     // Form submission (Enter key)

// Event object structure
interface EventObject {
    type: string;           // Event type
    target: ElementHandle;  // Element that triggered event
    currentTarget: ElementHandle; // Element with listener
    timestamp: number;      // Event timestamp
    cancelled: boolean;     // Event cancelled flag
    
    // Mouse events
    x?: number;            // Mouse X coordinate
    y?: number;            // Mouse Y coordinate
    button?: number;       // Mouse button (0=left, 1=middle, 2=right)
    
    // Keyboard events  
    key?: string;          // Key name
    code?: string;         // Key code
    ctrlKey?: boolean;     // Ctrl modifier
    shiftKey?: boolean;    // Shift modifier
    altKey?: boolean;      // Alt modifier
    
    // Input events
    value?: string;        // Input value (for change events)
    oldValue?: string;     // Previous value
}

// Event callback signature
function eventCallback(event: EventObject): void
```

#### State Management API
```javascript
// Application state
kryon.setState(key: string, value: any): void
kryon.getState(key: string): any
kryon.hasState(key: string): boolean
kryon.removeState(key: string): void
kryon.clearState(): void

// State change notifications
kryon.onStateChange(key: string, callback: Function): void
kryon.offStateChange(key: string, callback: Function): void

// State persistence (platform-dependent)
kryon.saveState(key: string): void      // Save to persistent storage
kryon.loadState(key: string): void      // Load from persistent storage
kryon.getStorageSize(): number          // Get current storage usage

// State validation and typing
kryon.setStateSchema(key: string, schema: Object): void
kryon.validateState(key: string): boolean

// Example state schema
{
    type: "object",
    properties: {
        user_id: { type: "number" },
        user_name: { type: "string", maxLength: 50 },
        preferences: {
            type: "object",
            properties: {
                theme: { type: "string", enum: ["light", "dark"] },
                notifications: { type: "boolean" }
            }
        }
    }
}
```

#### Variable Access API
```javascript
// Compile-time variable access (read-only)
kryon.getVariable(name: string): any
kryon.hasVariable(name: string): boolean
kryon.getAllVariables(): Object

// Runtime variable override (temporary)
kryon.setRuntimeVariable(name: string, value: any): void
kryon.clearRuntimeVariable(name: string): void
kryon.clearAllRuntimeVariables(): void

// Variable change notifications (for runtime variables only)
kryon.onVariableChange(name: string, callback: Function): void
kryon.offVariableChange(name: string, callback: Function): void

// Variable interpolation
kryon.interpolateString(template: string, variables?: Object): string

// Example usage
kryon.setRuntimeVariable("user_theme", "dark");
kryon.interpolateString("Hello $user_name, theme is $user_theme");
// Returns: "Hello John, theme is dark"
```

#### Timer and Animation API
```javascript
// Timer functions
kryon.setTimeout(callback: Function, delay: number): number
kryon.clearTimeout(timeoutId: number): void
kryon.setInterval(callback: Function, interval: number): number
kryon.clearInterval(intervalId: number): void

// Animation functions
kryon.animate(element: ElementHandle, properties: Object, 
              duration: number, options?: AnimationOptions): AnimationHandle

interface AnimationOptions {
    easing?: string;        // "linear", "ease", "ease-in", "ease-out", "ease-in-out"
    delay?: number;         // Delay before starting (ms)
    iterations?: number;    // Number of iterations (Infinity for infinite)
    direction?: string;     // "normal", "reverse", "alternate", "alternate-reverse"
    fill?: string;         // "none", "forwards", "backwards", "both"
    onComplete?: Function; // Completion callback
    onUpdate?: Function;   // Update callback (called each frame)
}

// Animation control
kryon.pauseAnimation(animation: AnimationHandle): void
kryon.resumeAnimation(animation: AnimationHandle): void
kryon.stopAnimation(animation: AnimationHandle): void
kryon.getAnimationState(animation: AnimationHandle): AnimationState

// Transition animations
kryon.transition(element: ElementHandle, property: string, 
                 targetValue: any, duration: number): AnimationHandle

// Frame-based animations
kryon.requestAnimationFrame(callback: Function): number
kryon.cancelAnimationFrame(requestId: number): void

// Example usage
kryon.animate(button, {
    backgroundColor: "#FF0000",
    width: 200,
    opacity: 0.5
}, 1000, {
    easing: "ease-in-out",
    onComplete: () => console.log("Animation finished")
});
```

#### System Integration API
```javascript
// UI notifications
kryon.showMessage(message: string, type?: string, duration?: number): void
kryon.showToast(message: string, options?: ToastOptions): void
kryon.showDialog(title: string, message: string, buttons?: string[]): Promise<string>

interface ToastOptions {
    type?: "info" | "success" | "warning" | "error";
    duration?: number;      // Auto-hide duration (ms)
    position?: "top" | "center" | "bottom";
    persistent?: boolean;   // Don't auto-hide
}

// Navigation
kryon.navigateTo(route: string, params?: Object): void
kryon.goBack(): void
kryon.goForward(): void
kryon.getCurrentRoute(): string
kryon.onRouteChange(callback: Function): void

// File system access (platform-dependent)
kryon.selectFile(options?: FileOptions): Promise<File>
kryon.saveFile(content: any, filename: string, type?: string): Promise<void>
kryon.readFile(path: string): Promise<any>

interface FileOptions {
    accept?: string[];      // File type filters
    multiple?: boolean;     // Allow multiple selection
    directory?: boolean;    // Select directory instead of file
}

// Clipboard operations
kryon.copyToClipboard(text: string): Promise<void>
kryon.readFromClipboard(): Promise<string>

// Device capabilities (mobile platforms)
kryon.vibrate(duration: number): void
kryon.getDeviceInfo(): DeviceInfo
kryon.getBatteryInfo(): BatteryInfo
kryon.getNetworkInfo(): NetworkInfo

interface DeviceInfo {
    platform: string;      // "desktop", "mobile", "web", "embedded"
    os: string;            // Operating system
    version: string;       // OS version
    screenWidth: number;   // Screen width (pixels)
    screenHeight: number;  // Screen height (pixels)
    devicePixelRatio: number; // Display density
}

// Logging and debugging
kryon.log(message: string, level?: string): void
kryon.debug(message: string, data?: any): void
kryon.warn(message: string): void
kryon.error(message: string, error?: Error): void
kryon.trace(message: string): void

// Performance monitoring
kryon.startPerformanceTimer(name: string): void
kryon.endPerformanceTimer(name: string): number
kryon.getPerformanceMetrics(): PerformanceMetrics

interface PerformanceMetrics {
    frameRate: number;      // Current FPS
    memoryUsage: number;    // Memory usage (bytes)
    renderTime: number;     // Last frame render time (ms)
    layoutTime: number;     // Last layout computation time (ms)
    scriptTime: number;     // Script execution time (ms)
}
```

### Script Engine Integration Details

#### Lua Integration Specifics
```lua
-- Kryon API available as global 'kryon' table
local element = kryon.getElementById("my_button")
element.text = "Updated from Lua"

-- Type conversion
kryon.setProperty("my_element", "background_color", "#FF0000")
kryon.setProperty("my_element", "width", 200)
kryon.setProperty("my_element", "visible", true)

-- Error handling
local success, result = pcall(function()
    return kryon.getElementById("nonexistent")
end)

if not success then
    kryon.log("Element not found: " .. result, "warning")
end

-- Coroutine support for async operations
function asyncOperation()
    local co = coroutine.create(function()
        kryon.log("Starting async operation")
        coroutine.yield()  -- Yield control back to runtime
        kryon.log("Async operation completed")
    end)
    
    coroutine.resume(co)
    
    -- Resume later via timer
    kryon.setTimeout(function()
        coroutine.resume(co)
    end, 1000)
end

-- Memory management
-- Lua garbage collection is automatic
-- Large objects should be explicitly cleared
large_data = nil
collectgarbage("collect")
```

#### JavaScript Integration Specifics
```javascript
// Kryon API available as global 'kryon' object
const element = kryon.getElementById("my_button");
element.text = "Updated from JavaScript";

// Promise-based async operations
async function loadData() {
    try {
        const data = await kryon.fetchData("/api/users");
        const userList = kryon.getElementById("user_list");
        
        data.users.forEach(user => {
            const userElement = kryon.createElement("Text");
            userElement.text = user.name;
            kryon.appendChild(userList, userElement);
        });
    } catch (error) {
        kryon.error("Failed to load data", error);
    }
}

// Event handling with arrow functions
kryon.addEventListener("my_button", "click", (event) => {
    console.log("Button clicked at:", event.x, event.y);
});

// Modern JavaScript features (ES6+)
const users = [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 }
];

const names = users.map(user => user.name);
const adults = users.filter(user => user.age >= 18);

// Destructuring
const { name, age } = users[0];

// Template literals
kryon.setProperty("greeting", "text", `Hello ${name}, you are ${age} years old`);

// Error boundaries
window.addEventListener('error', (event) => {
    kryon.error('JavaScript error:', event.error);
});
```

#### Python Integration Specifics
```python
# Kryon API available as 'kryon' module
import kryon

element = kryon.get_element_by_id("my_button")
element.text = "Updated from Python"

# List comprehensions and data processing
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [n for n in numbers if n % 2 == 0]
squares = [n*n for n in numbers]

# Dictionary operations
user_data = {
    "name": "Alice",
    "age": 30,
    "email": "alice@example.com"
}

# Error handling
try:
    element = kryon.get_element_by_id("nonexistent")
except ElementNotFoundError as e:
    kryon.log(f"Element not found: {e}", "warning")

# Function definitions
def calculate_statistics(data):
    """Calculate basic statistics for a list of numbers."""
    if not data:
        return {}
    
    total = sum(data)
    count = len(data)
    average = total / count
    minimum = min(data)
    maximum = max(data)
    
    return {
        "total": total,
        "count": count,
        "average": average,
        "min": minimum,
        "max": maximum
    }

# Integration with UI
stats = calculate_statistics([10, 20, 30, 40, 50])
kryon.set_property("stats_display", "text", f"Average: {stats['average']}")

# Note: MicroPython subset - some standard library modules may not be available
```

#### Wren Integration Specifics
```wren
// Kryon API available as static methods on Kryon class
var element = Kryon.getElementById("my_button")
element.text = "Updated from Wren"

// Class-based programming
class Calculator {
    static add(a, b) { a + b }
    static multiply(a, b) { a * b }
    static factorial(n) {
        if (n <= 1) return 1
        return n * factorial(n - 1)
    }
}

// List operations
var numbers = [1, 2, 3, 4, 5]
var doubled = numbers.map { |n| n * 2 }
var sum = numbers.reduce { |acc, n| acc + n }

// Error handling
var result = null
if (Kryon.hasElement("my_element")) {
    result = Kryon.getElementById("my_element")
} else {
    Kryon.log("Element not found", "warning")
}

// Fiber-based concurrency
var fiber = Fiber.new {
    Kryon.log("Starting background task")
    // Simulate work
    for (i in 1..1000) {
        if (i % 100 == 0) {
            Fiber.yield()  // Yield control periodically
        }
    }
    Kryon.log("Background task completed")
}

// Resume fiber execution
fiber.call()
```

## Error Codes and Messages

### Compiler Error Codes
```
Category: Lexical Analysis (1000-1099)
1001 | INVALID_CHARACTER      | Unexpected character in source
1002 | UNTERMINATED_STRING    | String literal not properly closed
1003 | INVALID_NUMBER_FORMAT  | Malformed numeric literal
1004 | INVALID_COLOR_FORMAT   | Invalid color format (not #RGB or #RRGGBBAA)
1005 | IDENTIFIER_TOO_LONG    | Identifier exceeds maximum length (64 chars)

Category: Syntax Analysis (1100-1199)  
1101 | UNEXPECTED_TOKEN       | Unexpected token in input
1102 | MISSING_LBRACE        | Expected '{' 
1103 | MISSING_RBRACE        | Expected '}'
1104 | MISSING_COLON         | Expected ':' after property name
1105 | MISSING_SEMICOLON     | Expected ';' between properties
1106 | INVALID_ELEMENT_TYPE  | Unknown element type
1107 | INVALID_PROPERTY_NAME | Unknown property for element type
1108 | MISSING_APP_ELEMENT   | No App element found (required)
1109 | MULTIPLE_APP_ELEMENTS | Multiple App elements found (only one allowed)

Category: Semantic Analysis (1200-1299)
1201 | UNDEFINED_VARIABLE    | Variable referenced but not defined
1202 | CIRCULAR_DEPENDENCY   | Circular dependency in variables or styles
1203 | TYPE_MISMATCH        | Property value type doesn't match expected type
1204 | UNDEFINED_STYLE      | Style referenced but not defined
1205 | UNDEFINED_COMPONENT  | Component referenced but not defined
1206 | INVALID_STYLE_INHERITANCE | Style inheritance creates circular dependency
1207 | INVALID_PROPERTY_VALUE | Property value out of valid range or format
1208 | MISSING_REQUIRED_PROPERTY | Required property not specified
1209 | INCOMPATIBLE_PROPERTIES | Properties conflict with each other

Category: Component Analysis (1300-1399)
1301 | INVALID_PROPERTY_TYPE | Invalid type in component Properties block
1302 | DUPLICATE_PROPERTY_DEF | Property defined multiple times in component
1303 | INVALID_COMPONENT_TEMPLATE | Component template structure invalid
1304 | MISSING_COMPONENT_ROOT | Component must have exactly one root element
1305 | INVALID_ENUM_VALUES   | Enum type has invalid value list

Category: Script Analysis (1400-1499)
1401 | INVALID_SCRIPT_LANGUAGE | Unsupported script language
1402 | SCRIPT_SYNTAX_ERROR    | Syntax error in script code
1403 | SCRIPT_FILE_NOT_FOUND  | External script file not found
1404 | INVALID_SCRIPT_MODE    | Invalid script storage mode
1405 | MISSING_SCRIPT_FUNCTION | Referenced function not found in script

Category: Code Generation (1500-1599)
1501 | STRING_TABLE_OVERFLOW  | Too many strings (max 65535)
1502 | RESOURCE_TABLE_OVERFLOW | Too many resources (max 255)
1503 | PROPERTY_SIZE_OVERFLOW | Property value too large for type
1504 | ELEMENT_TREE_TOO_DEEP  | Element nesting exceeds maximum depth (32)
1505 | OUTPUT_FILE_ERROR     | Cannot write output file
```

### Runtime Error Codes
```
Category: Loading Errors (2000-2099)
2001 | INVALID_KRB_MAGIC     | File is not a valid KRB file
2002 | UNSUPPORTED_VERSION   | KRB version not supported by runtime
2003 | CORRUPTED_FILE        | File corruption detected (checksum mismatch)
2004 | MISSING_SECTION       | Required section not found
2005 | INVALID_SECTION_SIZE  | Section size exceeds file bounds
2006 | MEMORY_ALLOCATION_FAILED | Insufficient memory to load file
2007 | FILE_NOT_FOUND        | KRB file not found
2008 | PERMISSION_DENIED     | Cannot read KRB file (permissions)

Category: Parsing Errors (2100-2199)
2101 | INVALID_ELEMENT_TYPE  | Unknown element type in KRB
2102 | INVALID_PROPERTY_ID   | Unknown property ID
2103 | INVALID_VALUE_TYPE    | Invalid value type for property
2104 | STRING_INDEX_OUT_OF_BOUNDS | String index exceeds string table
2105 | RESOURCE_INDEX_OUT_OF_BOUNDS | Resource index exceeds resource table
2106 | MALFORMED_PROPERTY    | Property data is malformed
2107 | INVALID_ELEMENT_STRUCTURE | Element structure violates format

Category: Component Errors (2200-2299)
2201 | COMPONENT_NOT_FOUND   | Component definition not found
2202 | INVALID_COMPONENT_PROPERTY | Invalid property for component type
2203 | COMPONENT_INSTANTIATION_FAILED | Failed to instantiate component
2204 | MISSING_PROPERTY_VALUE | Required component property not provided
2205 | PROPERTY_TYPE_MISMATCH | Component property type mismatch

Category: Script Errors (2300-2399)
2301 | SCRIPT_ENGINE_INIT_FAILED | Failed to initialize script engine
2302 | SCRIPT_COMPILATION_FAILED | Script compilation error
2303 | SCRIPT_EXECUTION_ERROR | Script runtime error
2304 | FUNCTION_NOT_FOUND    | Script function not found
2305 | INVALID_FUNCTION_ARGS | Invalid arguments passed to script function
2306 | SCRIPT_TIMEOUT        | Script execution timeout
2307 | SCRIPT_MEMORY_LIMIT   | Script memory limit exceeded

Category: Layout Errors (2400-2499)
2401 | LAYOUT_COMPUTATION_FAILED | Layout computation error
2402 | CIRCULAR_LAYOUT_DEPENDENCY | Circular dependency in layout constraints
2403 | INVALID_LAYOUT_CONSTRAINT | Layout constraint cannot be satisfied
2404 | LAYOUT_OVERFLOW       | Layout computation resulted in overflow

Category: Render Errors (2500-2599)
2501 | RENDER_INITIALIZATION_FAILED | Render system init failed
2502 | INVALID_RENDER_STATE  | Render state is invalid
2503 | RESOURCE_LOADING_FAILED | Failed to load external resource
2504 | GRAPHICS_CONTEXT_LOST | Graphics context lost (web/mobile)
2505 | OUT_OF_VIDEO_MEMORY   | Insufficient video memory
```

### Error Message Templates
```
Error message format: [CODE] CATEGORY: MESSAGE (file:line:column)

Examples:
[1201] SEMANTIC: Undefined variable '$primary_color' (app.kry:15:20)
  Suggestion: Define variable in @variables block or check spelling

[2201] COMPONENT: Component 'CustomButton' not found (app.krb:Component instance)
  Available components: TabBar, Card, Dialog
  
[2303] SCRIPT: Lua runtime error: attempt to index nil value (script:button_handlers:12)
  Function: handleButtonClick
  Stack trace: handleButtonClick -> validateInput -> checkRequired
```

## Platform-Specific Implementation Details

### Desktop Platforms

#### Windows Implementation
```
Build Requirements:
- Windows 10 SDK (minimum 10.0.19041.0)
- Visual Studio 2019+ or MinGW-w64
- DirectX 11/12 SDK for hardware acceleration

Runtime Architecture:
- Win32 API for window management
- DirectWrite for text rendering  
- Direct2D/Direct3D for graphics acceleration
- WinRT APIs for modern features (notifications, etc.)

File System:
- KRB files: Loaded via memory-mapped files (CreateFileMapping)
- External resources: Loaded relative to .krb file location
- User data: %APPDATA%\KryonApps\{AppName}\

Performance Characteristics:
- Load time: 0.5-1.2ms per 10KB of KRB data
- Memory overhead: 1.8x file size (including render buffers)
- Target frame rate: 60 FPS (16.7ms per frame)

Platform-Specific Features:
- Native Windows notifications (toast notifications)
- File dialog integration (IFileDialog)
- Clipboard integration (Windows Clipboard API)
- DPI awareness (Per-Monitor DPI v2)
- Windows Hello integration (if available)
```

#### macOS Implementation  
```
Build Requirements:
- Xcode 12+ with macOS 11.0+ SDK
- Metal SDK for hardware acceleration
- Code signing certificate for distribution

Runtime Architecture:
- Cocoa/AppKit for window management
- Core Text for text rendering
- Metal for graphics acceleration
- Core Animation for smooth animations

File System:
- KRB files: Loaded via mmap() system call
- External resources: Bundle-relative or ~/Documents/KryonApps/
- User data: ~/Library/Application Support/KryonApps/{AppName}/

Performance Characteristics:
- Load time: 0.4-1.0ms per 10KB of KRB data  
- Memory overhead: 1.6x file size (Metal optimizations)
- Target frame rate: 60 FPS with ProMotion support (120 FPS)

Platform-Specific Features:
- Native macOS notifications (NSUserNotification)
- Spotlight integration for search
- Touch Bar support (if available)
- Handoff/Continuity integration
- macOS appearance integration (light/dark mode)
```

#### Linux Implementation
```
Build Requirements:
- GCC 9+ or Clang 10+
- X11 development libraries or Wayland
- OpenGL 3.3+ or Vulkan SDK
- pkg-config for dependency management

Runtime Architecture:
- X11/Wayland for window management
- FreeType for text rendering
- OpenGL/Vulkan for graphics acceleration
- Optional: GTK+ integration for native dialogs

File System:
- KRB files: Loaded via mmap() system call
- External resources: Relative to executable or ~/.local/share/KryonApps/
- User data: ~/.config/KryonApps/{AppName}/ (XDG Base Directory)

Performance Characteristics:
- Load time: 0.6-1.4ms per 10KB of KRB data
- Memory overhead: 2.0x file size (varies by distribution)
- Target frame rate: 60 FPS (compositor-dependent)

Platform-Specific Features:
- D-Bus integration for system notifications
- XDG desktop integration (file associations, launchers)
- Clipboard integration (X11 selection/clipboard)
- Input method framework integration
- Wayland-specific optimizations (where available)
```

### Mobile Platforms

#### iOS Implementation
```
Build Requirements:
- Xcode 13+ with iOS 14.0+ SDK
- iOS Deployment Target: iOS 14.0+
- Metal SDK for graphics acceleration

Runtime Architecture:
- UIKit for interface management
- Core Text for text rendering
- Metal for graphics acceleration
- Core Animation for touch feedback

Memory Management:
- KRB files: Memory-mapped with VM pressure handling
- Automatic cache eviction under memory pressure
- Lazy loading of non-visible UI components
- Background app state handling

Performance Characteristics:
- Load time: 1.2-2.8ms per 10KB of KRB data
- Memory overhead: 1.4x file size (iOS optimizations)
- Target frame rate: 60 FPS (battery-optimized)
- Background processing: Limited to 30 seconds

Platform-Specific Features:
- Touch gesture recognition (UIGestureRecognizer)
- Haptic feedback integration (UIImpactFeedbackGenerator)
- iOS notifications (UserNotifications framework)
- App lifecycle management (background/foreground)
- Dynamic Type support for accessibility
- iOS dark mode integration
```

#### Android Implementation
```
Build Requirements:
- Android SDK API 24+ (Android 7.0+)
- NDK r21+ for native code
- Vulkan SDK or OpenGL ES 3.0+

Runtime Architecture:
- Android Activity/Fragment system
- Canvas/Paint for 2D rendering
- Vulkan/OpenGL ES for hardware acceleration
- Android Jetpack components for modern features

Memory Management:
- KRB files: Memory-mapped with LRU cache
- Android memory management integration
- Garbage collection coordination
- Low memory handling (onLowMemory callback)

Performance Characteristics:
- Load time: 1.8-4.2ms per 10KB of KRB data
- Memory overhead: 1.9x file size (varies by device)
- Target frame rate: 60 FPS (device-dependent)
- Battery optimization: Automatic performance scaling

Platform-Specific Features:
- Android notifications (NotificationManager)
- Material Design integration
- Android permissions model
- Intent system integration
- Adaptive icons and shortcuts
- Android dark theme integration
```

### Web Platform

#### WebAssembly Implementation
```
Build Requirements:
- Emscripten SDK 3.1.0+
- Modern browser with WebAssembly SIMD support
- WebGL 2.0 or WebGPU (experimental)

Runtime Architecture:
- WebAssembly module for core runtime
- JavaScript bridge for DOM integration
- WebGL/WebGPU for hardware acceleration
- Web Workers for background processing

File Loading:
- KRB files: Loaded via fetch() API
- Progressive loading for large files
- Service Worker integration for offline support
- IndexedDB for persistent caching

Performance Characteristics:
- Load time: 2.1-6.8ms per 10KB of KRB data
- Memory overhead: 2.5x file size (browser overhead)
- Target frame rate: 30-60 FPS (browser-dependent)
- Network latency: Significant factor for resource loading

Platform-Specific Features:
- Progressive Web App (PWA) support
- Service Worker integration
- Web Push notifications
- File System Access API (where supported)
- WebRTC for real-time features
- Clipboard API integration

Browser Compatibility:
- Chrome 84+ (full support)
- Firefox 79+ (full support)
- Safari 14+ (limited WebAssembly features)
- Edge 84+ (full support)
```

### Embedded Platforms

#### ARM Cortex-M Implementation
```
Hardware Requirements:
- ARM Cortex-M4+ with FPU
- Minimum 128KB Flash, 64KB RAM
- Optional: External display controller

Build Requirements:
- ARM GCC toolchain
- CMSIS libraries
- Device-specific HAL
- Real-time operating system (optional)

Runtime Architecture:
- Bare-metal or RTOS-based
- Custom memory allocators
- Framebuffer-based rendering
- Interrupt-driven input handling

Memory Management:
- Static memory pools
- Stack-based allocation for temporary objects
- Compile-time memory analysis
- No dynamic allocation in critical paths

Performance Characteristics:
- Load time: 5-20ms per 10KB of KRB data (depends on flash speed)
- Memory overhead: 1.2x file size (minimal runtime)
- Target frame rate: 24-30 FPS (hardware-dependent)
- Power consumption: Optimized for battery operation

Platform-Specific Features:
- Real-time constraints handling
- Hardware-specific input (buttons, encoders)
- Power management integration
- Watchdog timer integration
- Hardware floating-point optimization

Limitations:
- No scripting support (compile-time only)
- Limited string manipulation
- Fixed-size element pools
- Simplified layout engine
```

## Performance Benchmarks and Optimization

### Benchmark Test Suite
```
Standard Test Applications:
1. Simple Form (5KB KRB)
   - 10 elements, 2 styles, no components
   - Target: <2ms load, <1MB memory

2. Business Dashboard (50KB KRB)  
   - 150 elements, 20 styles, 5 components
   - Target: <15ms load, <8MB memory

3. Complex UI (500KB KRB)
   - 1500 elements, 100 styles, 25 components, scripts
   - Target: <80ms load, <50MB memory

4. Game UI (2MB KRB)
   - Complex animations, many resources
   - Target: <200ms load, <100MB memory

Platform Performance Matrix:
                    Simple | Business | Complex | Game
Desktop (Win/Mac/Linux) 
Load Time (ms)        0.8 |     3.2  |    28.4 |   156
Memory (MB)           0.6 |     4.2  |    32.1 |    87
60 FPS Sustained      ✓   |     ✓    |     ✓   |    ✓

Mobile (iOS/Android)
Load Time (ms)        1.5 |     6.1  |    52.3 |   298
Memory (MB)           0.9 |     6.8  |    45.2 |   124
60 FPS Sustained      ✓   |     ✓    |     ✓   |    ◐

Web (WebAssembly)
Load Time (ms)        2.1 |     9.4  |    78.6 |   445
Memory (MB)           1.4 |     8.9  |    58.7 |   156
30 FPS Sustained      ✓   |     ✓    |     ✓   |    ✓

Embedded (ARM Cortex-M)
Load Time (ms)        4.2 |    18.6  |   156.8 |   N/A
Memory (KB)          384 |    2.1MB |   12.4MB|   N/A
24 FPS Sustained      ✓   |     ◐    |     ✗   |    ✗

Legend: ✓ = Consistently achieves target, ◐ = Usually achieves target, ✗ = Below target
```

### Optimization Strategies

#### Compiler Optimizations
```
1. String Deduplication
   - Impact: 15-40% size reduction for text-heavy UIs
   - Algorithm: Hash-based string interning
   - Memory: O(n) hashtable during compilation

2. Property Block Sharing
   - Impact: 20-60% size reduction for repeated styling
   - Algorithm: Property fingerprinting and reuse
   - Memory: Minimal overhead, significant runtime savings

3. Tree Structure Compression
   - Impact: 10-25% size reduction for hierarchical UIs
   - Algorithm: Subtree template extraction
   - Limitation: Increases instantiation complexity

4. Dead Code Elimination
   - Impact: 5-15% size reduction
   - Algorithm: Reachability analysis from App root
   - Eliminates: Unused styles, components, scripts

5. Resource Optimization
   - Impact: Variable (depends on resource usage)
   - Techniques: Image compression, font subsetting
   - Format: WebP for images, WOFF2 for fonts
```

#### Runtime Optimizations
```
1. Lazy Loading
   - Components instantiated on first use
   - External resources loaded on demand
   - String table loaded incrementally

2. Memory Pool Allocation
   - Pre-allocated element pools
   - Reduced allocation overhead
   - Better memory locality

3. Render Batching
   - Group property changes
   - Minimize draw calls
   - Texture atlas usage

4. Layout Caching
   - Cache computed layouts
   - Invalidate only when necessary
   - Incremental layout updates

5. Script Engine Optimization
   - Bytecode compilation
   - Function call optimization
   - Garbage collection tuning
```

### Memory Usage Analysis
```
KRB File Size Breakdown (typical 100KB business app):
Element Data:     35KB (35%) - Element headers and relationships
String Table:     25KB (25%) - All text content (compressed)
Property Data:    18KB (18%) - Property values and references
Component Defs:   12KB (12%) - Component templates
Style Data:        8KB (8%)  - Style definitions
Script Code:       2KB (2%)  - Embedded scripts

Runtime Memory Usage (same 100KB app):
Element Objects:  180KB - In-memory element representation
Render Buffers:   120KB - Graphics/layout computation buffers
String Cache:      45KB - Decompressed strings
Property Cache:    35KB - Computed property values
Script Runtime:    25KB - Script engine overhead
Component Cache:   15KB - Instantiated components
System Overhead:   30KB - Runtime bookkeeping
Total:           450KB (4.5x file size)

Memory Usage by Platform:
Desktop:   450KB (full features, generous memory)
Mobile:    380KB (battery optimizations, compressed textures)
Web:       650KB (browser overhead, duplicate string storage)
Embedded:  125KB (minimal runtime, static allocation)
```

### Performance Tuning Guidelines
```
For Compiler Optimization:
1. Enable aggressive compression: --optimize=max --compress=max
2. Use external scripts for development, embedded for production
3. Minimize component property count (merge related properties)
4. Share styles aggressively (extract common patterns)
5. Avoid deeply nested element hierarchies (>8 levels)

For Runtime Performance:
1. Batch property updates: setProperties() vs multiple setProperty()
2. Use requestAnimationFrame() for smooth animations
3. Minimize script execution in event handlers
4. Cache frequently accessed elements
5. Use state-based styling instead of script-based style changes

For Memory Optimization:
1. Unload unused components: removeChild() when appropriate
2. Clear event listeners when elements destroyed
3. Use string interning for dynamic text content
4. Monitor memory usage: getPerformanceMetrics()
5. Implement memory pressure handling on mobile

For Battery Optimization (Mobile):
1. Reduce animation frequency during low battery
2. Use lower frame rates when app backgrounded
3. Minimize network requests from scripts
4. Cache resources aggressively
5. Implement idle state detection
```

## Compatibility Matrix

### KRB Format Compatibility
```
Runtime Version | KRB v0.3 | KRB v0.4 | KRB v0.5 | KRB v1.0 | KRB v1.1 | KRB v1.2
----------------|----------|----------|----------|----------|----------|----------
Kryon v1.0      |    ✓     |    ✗     |    ✗     |    ✗     |    ✗     |    ✗
Kryon v1.1      |    ✓     |    ✓     |    ✗     |    ✗     |    ✗     |    ✗  
Kryon v1.2      |    ✓     |    ✓     |    ✓     |    ✗     |    ✗     |    ✗
Kryon v2.0      |    ◐     |    ✓     |    ✓     |    ✓     |    ✗     |    ✗
Kryon v2.1      |    ◐     |    ✓     |    ✓     |    ✓     |    ✓     |    ✗
Kryon v2.2      |    ◐     |    ✓     |    ✓     |    ✓     |    ✓     |    ✓

Legend:
✓ = Full compatibility
◐ = Limited compatibility (some features unavailable)
✗ = Incompatible

Notes:
- Forward compatibility: New runtimes can load older KRB files
- Backward compatibility: Limited to 2 major versions
- Feature degradation: Unknown features are ignored gracefully
```

### Script Language Compatibility
```
Platform     | Lua 5.4 | JavaScript | Python 3.x | Wren
-------------|---------|------------|-------------|-------
Desktop      |    ✓    |     ✓      |     ✓       |   ✓
Mobile iOS   |    ✓    |     ✓      |     ◐       |   ✓
Mobile And   |    ✓    |     ✓      |     ◐       |   ✓
Web          |    ✓    |     ✓      |     ✗       |   ◐
Embedded     |    ✓    |     ✗      |     ✗       |   ✓

Notes:
- JavaScript: QuickJS engine on native, native on web
- Python: MicroPython subset, limited standard library
- Wren: Full support except web (WebAssembly limitations)
- Lua: Primary scripting language, universal support
```

### Browser Compatibility (Web Platform)
```
Feature              | Chrome 84+ | Firefox 79+ | Safari 14+ | Edge 84+
---------------------|------------|-------------|------------|----------
WebAssembly Core     |     ✓      |      ✓      |     ✓      |    ✓
WebAssembly SIMD     |     ✓      |      ✓      |     ◐      |    ✓
WebGL 2.0            |     ✓      |      ✓      |     ✓      |    ✓
WebGPU (preview)     |     ◐      |      ◐      |     ✗      |    ◐
Service Workers      |     ✓      |      ✓      |     ✓      |    ✓
IndexedDB            |     ✓      |      ✓      |     ✓      |    ✓
File System API      |     ✓      |      ✗      |     ✗      |    ✓
Web Notifications    |     ✓      |      ✓      |     ✓      |    ✓
Clipboard API        |     ✓      |      ✓      |     ◐      |    ✓

Performance Expectations:
Chrome:  100% baseline performance
Firefox: 85-95% of Chrome performance
Safari:  75-85% of Chrome performance (WebAssembly limitations)
Edge:    95-100% of Chrome performance (Chromium-based)
```

## Migration Guide

### Upgrading from KRY v1.0 to v1.2
```
Breaking Changes:
1. Script syntax change: @script "lua" { } instead of @lua { }
2. Component Properties syntax: Properties { } block now required
3. Pseudo-selector syntax: &:hover instead of :hover
4. Variable scoping: Variables now file-scoped instead of global

Migration Steps:

1. Update Script Blocks:
   Old (v1.0):
   @lua {
       function handleClick() end
   }
   
   New (v1.2):
   @script "lua" {
       function handleClick() end
   }

2. Update Component Definitions:
   Old (v1.0):
   Define MyComponent {
       title: String = "Default"
       Container { text: $title }
   }
   
   New (v1.2):
   Define MyComponent {
       Properties {
           title: String = "Default"
       }
       Container { Text { text: $title } }
   }

3. Update Pseudo-Selectors:
   Old (v1.0):
   Button {
       background_color: "#007BFF"
       :hover { background_color: "#0056B3" }
   }
   
   New (v1.2):
   Button {
       background_color: "#007BFF"
       &:hover { background_color: "#0056B3" }
   }

4. Update Variable Declarations:
   Old (v1.0):
   @vars {
       primary_color: "#007BFF"
   }
   
   New (v1.2):
   @variables {
       primary_color: "#007BFF"
   }
```

### Upgrading from KRB v0.4 to v0.5
```
Runtime Changes Required:

1. Update Header Parsing:
   - Header size increased from 48 to 54 bytes
   - New fields: Script Count, Script Offset
   - New flags: FLAG_HAS_SCRIPTS, FLAG_HAS_STATE_PROPERTIES

2. Update Element Parsing:
   - Element header size increased from 17 to 18 bytes
   - New field: State Prop Count (offset 17)
   - Support state property sets after custom properties

3. Add Script Support:
   - Implement Script Table parsing
   - Add script engine integration
   - Handle external script loading

4. Add State Property Support:
   - Implement state tracking (hover, focus, etc.)
   - Property resolution with state overrides
   - Update rendering pipeline for state changes

Code Changes:
```cpp
// Old header parsing (v0.4)
struct KRBHeader {
    char magic[4];
    uint16_t version;
    uint16_t flags;
    // ... 42 bytes total
};

// New header parsing (v0.5)
struct KRBHeader {
    char magic[4];
    uint16_t version;
    uint16_t flags;
    uint16_t scriptCount;    // New field
    uint32_t scriptOffset;   // New field
    // ... 54 bytes total
};


### Platform Migration Guide

#### Desktop → Mobile Migration

Preparation Checklist:
- □ Reduce memory targets (256MB → 128MB)
- □ Implement battery-aware performance scaling
- □ Add touch gesture recognition
- □ Handle app lifecycle events (background/foreground)
- □ Optimize layouts for smaller screens
- □ Test on low-end devices

Code Changes Required:

1. Memory Management:
```cpp
// Desktop: Generous memory allocation
ElementPool elements(10000);
StringCache cache(50MB);

// Mobile: Conservative allocation with pressure handling
ElementPool elements(2000);
StringCache cache(8MB);
cache.enablePressureHandling(true);
```

2. Performance Scaling:
```cpp
class MobileRuntime : public KryonRuntime {
    void updatePerformanceLevel() {
        float batteryLevel = getBatteryLevel();
        if (batteryLevel < 0.2f) {
            setTargetFrameRate(30);  // Reduce from 60 FPS
            setRenderQuality(RenderQuality::Low);
        }
    }
};
```

3. Touch Integration:
```cpp
void handleTouchInput(TouchEvent event) {
    switch (event.type) {
        case TouchEvent::Tap:
            triggerClickEvent(event.position);
            break;
        case TouchEvent::Swipe:
            handleSwipeGesture(event.direction, event.velocity);
            break;
        case TouchEvent::Pinch:
            handleZoomGesture(event.scale);
            break;
    }
}
```

#### Desktop → Web Migration

WebAssembly Build Pipeline:

1. Install Emscripten:
```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

2. Configure Build:
```cmake
# CMakeLists.txt for WebAssembly
if(EMSCRIPTEN)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s USE_WEBGL2=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s ALLOW_MEMORY_GROWTH=1")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXPORTED_FUNCTIONS='[\"_main\", \"_loadKRB\"]'")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -s EXTRA_EXPORTED_RUNTIME_METHODS='[\"ccall\", \"cwrap\"]'")
endif()
```

3. Browser Integration:
```javascript
// JavaScript bridge for web platform
class KryonWebRuntime {
    constructor() {
        this.wasmModule = null;
        this.canvas = null;
    }
    
    async initialize(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.wasmModule = await createKryonModule({
            canvas: this.canvas,
            onRuntimeInitialized: () => {
                console.log('Kryon runtime initialized');
            }
        });
    }
    
    loadApplication(krbData) {
        const dataPtr = this.wasmModule._malloc(krbData.length);
        this.wasmModule.HEAPU8.set(krbData, dataPtr);
        this.wasmModule._loadKRB(dataPtr, krbData.length);
        this.wasmModule._free(dataPtr);
    }
}
```

4. Service Worker Integration:
```javascript
// service-worker.js
const CACHE_NAME = 'kryon-app-v1';
const urlsToCache = [
    '/',
    '/kryon-runtime.js',
    '/kryon-runtime.wasm',
    '/app.krb'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
```

5. Progressive Web App Manifest:
```json
{
    "name": "Kryon Application",
    "short_name": "KryonApp",
    "description": "A Kryon-powered application",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#007bff",
    "icons": [
        {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/icons/icon-512x512.png", 
            "sizes": "512x512",
            "type": "image/png"
        }
    ]
}
```

#### Desktop → Embedded Migration

Embedded Platform Constraints:

1. Memory Limitations:
```cpp
// Desktop: Dynamic allocation
std::vector<Element> elements;
elements.resize(elementCount);

// Embedded: Static pools
#define MAX_ELEMENTS 500
static Element elementPool[MAX_ELEMENTS];
static uint16_t elementCount = 0;

Element* createElement() {
    if (elementCount >= MAX_ELEMENTS) return nullptr;
    return &elementPool[elementCount++];
}
```

2. Remove Dynamic Features:
```cpp
// Remove scripting support
#undef KRYON_ENABLE_SCRIPTING

// Remove floating-point layout
#undef KRYON_ENABLE_FLOAT_LAYOUT
#define KRYON_USE_FIXED_POINT_LAYOUT

// Remove complex animations
#undef KRYON_ENABLE_ANIMATIONS

// Use simplified string handling
#define KRYON_MAX_STRING_LENGTH 64
```

3. Real-Time Constraints:
```cpp
class EmbeddedRuntime {
    static constexpr uint32_t MAX_FRAME_TIME_US = 16666; // 60 FPS
    
    void update() {
        uint32_t startTime = micros();
        
        updateLayout();
        render();
        
        uint32_t elapsed = micros() - startTime;
        if (elapsed > MAX_FRAME_TIME_US) {
            // Frame took too long - implement degradation
            setRenderQuality(RenderQuality::Minimal);
        }
    }
};
```

4. Power Management:
```cpp
void enterLowPowerMode() {
    setUpdateFrequency(1);  // 1 FPS instead of 60
    disableAnimations();
    reduceBrightness(0.3f);
}

void onUserActivity() {
    setUpdateFrequency(60);
    enableAnimations();
    restoreBrightness();
    resetSleepTimer();
}
```

### Migration Tools and Utilities

#### Automated Migration Tool
```bash
# kryon-migrate: Automated source migration
kryon-migrate --from=v1.0 --to=v1.2 src/

# Options:
--dry-run          # Show changes without applying
--backup          # Create backup before migration
--ignore-errors   # Continue despite non-critical errors
--report          # Generate migration report

# Example output:
Migrating 15 files from KRY v1.0 to v1.2...
✓ Updated script syntax in app.kry
✓ Updated component definitions in components/
⚠ Manual review needed: components/custom.kry (line 23)
✗ Error in styles/theme.kry: Unsupported feature
Migration completed: 14/15 files successful
```

#### Binary Format Conversion
```bash
# krb-convert: Binary format conversion utility  
krb-convert --input=app-v0.4.krb --output=app-v0.5.krb

# Batch conversion
krb-convert --batch --input-dir=old/ --output-dir=new/ --target-version=v0.5

# Validation after conversion
krb-validate app-v0.5.krb --strict
✓ Header format valid
✓ All sections present
✓ String table integrity OK
⚠ Component features not used (OK for older runtimes)
✓ File passes validation
```

#### Compatibility Analysis
```bash
# kryon-analyze: Compatibility and performance analysis
kryon-analyze app.krb --target-platform=mobile

Performance Analysis:
├── Load time estimate: 15.2ms (target: <20ms) ✓
├── Memory usage: 8.4MB (target: <16MB) ✓  
├── Render complexity: Medium (60fps achievable) ✓
└── Battery impact: Low ✓

Compatibility Issues:
├── Script engine: JavaScript not available on embedded ⚠
├── Property usage: All properties supported ✓
├── Component complexity: Within limits ✓
└── Resource requirements: 2 external fonts required ⚠

Recommendations:
1. Consider Lua instead of JavaScript for broader compatibility
2. Embed fonts or provide fallbacks for embedded targets
3. Enable compression to reduce load time by ~30%
```

#### Performance Profiling
```bash
# kryon-profile: Runtime performance profiling
kryon-profile app.krb --platform=desktop --duration=30s

Performance Metrics (30 second average):
├── Frame rate: 59.7 FPS (target: 60 FPS) ✓
├── Frame time: 16.8ms avg, 23.2ms max ✓
├── Memory usage: 45.2MB avg, 67.8MB peak ✓
├── Layout time: 2.1ms avg (12.5% of frame time)
├── Render time: 8.4ms avg (50% of frame time)  
├── Script time: 1.2ms avg (7.1% of frame time)
└── Idle time: 5.1ms avg (30.4% of frame time)

Bottlenecks Identified:
1. Excessive redraws in component "UserList" (45% of render time)
2. String formatting in script function "updateStatus" (38% of script time)
3. Layout thrashing in "MainContainer" during resize events

Optimization Suggestions:
1. Cache UserList render output when data unchanged
2. Pre-format status strings or use string templates
3. Debounce resize events (current: immediate, suggested: 16ms)

Estimated improvements: +15% frame rate, -25% memory usage
```
