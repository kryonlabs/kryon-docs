# Styling Basics

KRY provides a comprehensive styling system that combines the best aspects of CSS with compile-time optimization and type safety. This guide covers the fundamental concepts and techniques for styling your Kryon applications.

## Core Styling Concepts

### Variables System
Variables provide a centralized way to manage design tokens and ensure consistency across your application.

```kry
@variables {
    # Color Palette
    primary_color: "#007BFFFF"
    secondary_color: "#6C757DFF"
    success_color: "#28A745FF"
    warning_color: "#FFC107FF"
    danger_color: "#DC3545FF"
    
    # Typography Scale
    font_size_xs: 12
    font_size_sm: 14
    font_size_base: 16
    font_size_lg: 18
    font_size_xl: 20
    font_size_2xl: 24
    font_size_3xl: 30
    
    # Spacing Scale
    spacing_xs: 4
    spacing_sm: 8
    spacing_md: 16
    spacing_lg: 24
    spacing_xl: 32
    spacing_2xl: 48
    
    # Border Radius
    radius_sm: 4
    radius_md: 6
    radius_lg: 8
    radius_xl: 12
    
    # Shadows
    shadow_sm: "0 1px 2px rgba(0,0,0,0.05)"
    shadow_md: "0 4px 6px rgba(0,0,0,0.1)"
    shadow_lg: "0 10px 15px rgba(0,0,0,0.1)"
    shadow_xl: "0 20px 25px rgba(0,0,0,0.15)"
}
```

### Style Definitions
Styles are reusable collections of properties that can be applied to elements:

```kry
style "button_base" {
    padding: $spacing_md
    border_radius: $radius_md
    font_size: $font_size_base
    font_weight: "600"
    cursor: "pointer"
    transition: "all 0.2s ease"
    
    &:hover {
        opacity: 0.8
        transform: "translateY(-1px)"
    }
    
    &:active {
        transform: "translateY(0px)"
    }
}

style "button_primary" {
    extends: "button_base"
    background_color: $primary_color
    text_color: "#FFFFFFFF"
    border: "none"
    
    &:hover {
        background_color: "#0056B3FF"
    }
}

style "button_secondary" {
    extends: "button_base"
    background_color: "transparent"
    text_color: $primary_color
    border_color: $primary_color
    border_width: 1
    
    &:hover {
        background_color: $primary_color
        text_color: "#FFFFFFFF"
    }
}
```

## Typography System

### Font Properties
KRY provides comprehensive typography control:

```kry
style "heading_1" {
    font_size: $font_size_3xl
    font_weight: "700"
    line_height: 1.2
    letter_spacing: "-0.025em"
    color: $primary_color
    margin_bottom: $spacing_lg
}

style "heading_2" {
    font_size: $font_size_2xl
    font_weight: "600"
    line_height: 1.3
    color: $text_color
    margin_bottom: $spacing_md
}

style "body_text" {
    font_size: $font_size_base
    font_weight: "400"
    line_height: 1.5
    color: $text_color
}

style "small_text" {
    font_size: $font_size_sm
    font_weight: "400"
    line_height: 1.4
    color: $muted_color
}
```

### Text Alignment and Layout
```kry
style "text_center" {
    text_alignment: "center"
}

style "text_left" {
    text_alignment: "left"
}

style "text_right" {
    text_alignment: "right"
}

style "text_justify" {
    text_alignment: "justify"
}
```

## Color System

### Color Definitions
Colors in KRY use 8-character hex values (RGBA):

```kry
@variables {
    # Primary Colors
    blue_50: "#EBF8FFFF"
    blue_100: "#E1F5FEFF"
    blue_200: "#BAE6FDFF"
    blue_300: "#7DD3FCFF"
    blue_400: "#38BDF8FF"
    blue_500: "#0EA5E9FF"
    blue_600: "#0284C7FF"
    blue_700: "#0369A1FF"
    blue_800: "#075985FF"
    blue_900: "#0C4A6EFF"
    
    # Semantic Colors
    text_primary: "#111827FF"
    text_secondary: "#6B7280FF"
    text_muted: "#9CA3AFFF"
    text_inverse: "#FFFFFFFF"
    
    background_primary: "#FFFFFFFF"
    background_secondary: "#F9FAFBFF"
    background_tertiary: "#F3F4F6FF"
    
    border_light: "#E5E7EBFF"
    border_medium: "#D1D5DBFF"
    border_dark: "#9CA3AFFF"
}
```

### Color Usage Patterns
```kry
style "success_state" {
    background_color: $success_color
    text_color: "#FFFFFFFF"
    border_color: "#1E7E34FF"
}

style "warning_state" {
    background_color: $warning_color
    text_color: $text_primary
    border_color: "#D39E00FF"
}

style "error_state" {
    background_color: $danger_color
    text_color: "#FFFFFFFF"
    border_color: "#C82333FF"
}
```

## Layout and Spacing

### Padding and Margin System
```kry
# Uniform spacing
style "padding_sm" { padding: $spacing_sm }
style "padding_md" { padding: $spacing_md }
style "padding_lg" { padding: $spacing_lg }

# Directional spacing
style "padding_x_md" {
    padding_left: $spacing_md
    padding_right: $spacing_md
}

style "padding_y_lg" {
    padding_top: $spacing_lg
    padding_bottom: $spacing_lg
}

# Individual sides
style "padding_top_xl" { padding_top: $spacing_xl }
style "margin_bottom_lg" { margin_bottom: $spacing_lg }
```

### Container Styles
```kry
style "container" {
    max_width: 1200
    margin: "0 auto"
    padding_left: $spacing_md
    padding_right: $spacing_md
}

style "container_sm" {
    max_width: 640
    margin: "0 auto"
    padding_left: $spacing_md
    padding_right: $spacing_md
}

style "container_lg" {
    max_width: 1440
    margin: "0 auto"
    padding_left: $spacing_lg
    padding_right: $spacing_lg
}
```

## Border and Visual Effects

### Border Styles
```kry
style "border_light" {
    border_color: $border_light
    border_width: 1
}

style "border_medium" {
    border_color: $border_medium
    border_width: 1
}

style "border_dashed" {
    border_color: $border_medium
    border_width: 1
    border_style: "dashed"
}

style "border_rounded" {
    border_radius: $radius_md
}

style "border_pill" {
    border_radius: 9999
}
```

### Shadow System
```kry
style "shadow_sm" {
    box_shadow: $shadow_sm
}

style "shadow_md" {
    box_shadow: $shadow_md
}

style "shadow_lg" {
    box_shadow: $shadow_lg
}

style "shadow_hover" {
    &:hover {
        box_shadow: $shadow_lg
        transform: "translateY(-2px)"
    }
}
```

## Component Styling Patterns

### Card Components
```kry
style "card" {
    background_color: $background_primary
    border_radius: $radius_lg
    box_shadow: $shadow_md
    padding: $spacing_lg
    border_color: $border_light
    border_width: 1
}

style "card_hover" {
    extends: "card"
    cursor: "pointer"
    transition: "all 0.2s ease"
    
    &:hover {
        box_shadow: $shadow_lg
        transform: "translateY(-2px)"
        border_color: $primary_color
    }
}
```

### Input Styles
```kry
style "input_base" {
    padding: $spacing_md
    border_radius: $radius_md
    border_color: $border_medium
    border_width: 1
    font_size: $font_size_base
    background_color: $background_primary
    
    &:focus {
        border_color: $primary_color
        outline: "none"
        box_shadow: "0 0 0 3px rgba(0,123,255,0.1)"
    }
    
    &:disabled {
        background_color: $background_tertiary
        color: $text_muted
        cursor: "not-allowed"
    }
}

style "input_error" {
    extends: "input_base"
    border_color: $danger_color
    
    &:focus {
        border_color: $danger_color
        box_shadow: "0 0 0 3px rgba(220,53,69,0.1)"
    }
}
```

## Responsive Design

### Responsive Properties
KRY supports responsive design through conditional properties:

```kry
style "responsive_container" {
    padding: $spacing_md
    width: "100%"
    
    # Mobile-first approach using media queries
    @media "(min-width: 640px)" {
        padding: $spacing_lg
        max_width: 640
    }
    
    @media "(min-width: 1024px)" {
        padding: $spacing_xl
        max_width: 1024
    }
}
```

### Flexible Layouts
```kry
style "flex_container" {
    display: "flex"
    layout: "row"
    gap: $spacing_md
    align_items: "center"
    
    @media "(max-width: 768px)" {
        layout: "column"
        align_items: "stretch"
    }
}
```

## Advanced Styling Techniques

### State-Based Styling
```kry
style "interactive_element" {
    background_color: $background_primary
    color: $text_primary
    padding: $spacing_md
    border_radius: $radius_md
    transition: "all 0.2s ease"
    cursor: "pointer"
    
    &:hover {
        background_color: $background_secondary
        transform: "scale(1.02)"
    }
    
    &:active {
        background_color: $background_tertiary
        transform: "scale(0.98)"
    }
    
    &:focus {
        outline: "none"
        box_shadow: "0 0 0 3px rgba(0,123,255,0.2)"
    }
    
    &:disabled {
        opacity: 0.5
        cursor: "not-allowed"
        transform: "none"
    }
}
```

### Style Composition
```kry
style "base_component" {
    padding: $spacing_md
    border_radius: $radius_md
    font_size: $font_size_base
}

style "primary_variant" {
    extends: "base_component"
    background_color: $primary_color
    text_color: "#FFFFFFFF"
}

style "secondary_variant" {
    extends: "base_component"
    background_color: $secondary_color
    text_color: "#FFFFFFFF"
}

style "large_primary" {
    extends: ["primary_variant", "padding_lg"]
    font_size: $font_size_lg
}
```

## Performance Considerations

### Optimization Tips
1. **Use variables for repeated values** - Reduces compiled size
2. **Leverage style inheritance** - Avoid duplicating common properties
3. **Group related styles** - Better compression in KRB format
4. **Minimize pseudo-selector usage** - Use sparingly for best performance

### Example: Optimized Style System
```kry
# Define base styles first
style "base_interactive" {
    cursor: "pointer"
    transition: "all 0.2s ease"
    border_radius: $radius_md
    padding: $spacing_md
}

# Extend base styles for variants
style "button_primary" {
    extends: "base_interactive"
    background_color: $primary_color
    text_color: "#FFFFFFFF"
}

style "button_outline" {
    extends: "base_interactive"
    background_color: "transparent"
    border_color: $primary_color
    border_width: 1
    text_color: $primary_color
}
```

## Best Practices

1. **Establish a Design System**: Use variables for colors, spacing, and typography
2. **Use Semantic Naming**: Name styles by purpose, not appearance
3. **Leverage Inheritance**: Build style hierarchies to reduce duplication
4. **Consistent Spacing**: Use a spacing scale for visual harmony
5. **Performance-First**: Consider compilation and runtime performance
6. **State Management**: Use pseudo-selectors for interactive states
7. **Responsive Design**: Plan for multiple screen sizes from the start

This styling system provides the foundation for creating beautiful, consistent, and performant user interfaces in Kryon applications while maintaining excellent developer experience and compile-time optimization.