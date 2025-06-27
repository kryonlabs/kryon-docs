# Hello World - Your First Kryon App

Let's build a complete Kryon application from scratch. This tutorial will teach you the fundamentals while creating a working app with buttons, text, and basic interactivity.

## What We're Building

A simple counter app with:
- A title and counter display
- Increment and decrement buttons
- Clean, centered layout
- Basic styling

```
┌──────────────────────────┐
│     Counter App          │
│                          │
│         Count: 5         │
│                          │
│    [-]        [+]        │
│                          │
└──────────────────────────┘
```

## Step 1: Create the Project

First, set up a new project directory:

```bash
mkdir counter-app
cd counter-app
mkdir build
```

## Step 2: Basic App Structure

Create `main.kry` with the basic app shell:

```kry
# main.kry
App {
    window_title: "Counter App"
    window_width: 300
    window_height: 200
    
    Container {
        layout: column center
        padding: 20
        gap: 16
        
        Text {
            text: "Counter App"
            font_size: 20
            font_weight: bold
        }
    }
}
```

Compile and test:

```bash
kryc main.kry -o build/app.krb
```

This creates a window with just a title. Let's add more elements.

## Step 3: Add the Counter Display

Add a counter display below the title:

```kry
App {
    window_title: "Counter App"
    window_width: 300
    window_height: 200
    
    Container {
        layout: column center
        padding: 20
        gap: 16
        
        Text {
            text: "Counter App"
            font_size: 20
            font_weight: bold
            text_color: "#333333FF"
        }
        
        # Counter display
        Text {
            id: "counter_display"
            text: "Count: 0"
            font_size: 24
            text_color: "#007BFFFF"
            font_weight: bold
        }
    }
}
```

Notice the `id: "counter_display"` - this lets us reference this element from scripts later.

## Step 4: Add Control Buttons

Add increment and decrement buttons:

```kry
App {
    window_title: "Counter App"
    window_width: 300
    window_height: 200
    
    Container {
        layout: column center
        padding: 20
        gap: 16
        
        Text {
            text: "Counter App"
            font_size: 20
            font_weight: bold
            text_color: "#333333FF"
        }
        
        Text {
            id: "counter_display"
            text: "Count: 0"
            font_size: 24
            text_color: "#007BFFFF"
            font_weight: bold
        }
        
        # Button container
        Container {
            layout: row center
            gap: 12
            
            Button {
                id: "decrement_btn"
                text: "-"
                width: 50
                height: 40
                background_color: "#DC3545FF"
                text_color: "#FFFFFFFF"
                font_size: 20
                font_weight: bold
                border_radius: 6
                onClick: "decrementCounter"
            }
            
            Button {
                id: "increment_btn"
                text: "+"
                width: 50
                height: 40
                background_color: "#28A745FF"
                text_color: "#FFFFFFFF"
                font_size: 20
                font_weight: bold
                border_radius: 6
                onClick: "incrementCounter"
            }
        }
    }
}
```

## Step 5: Add Interactivity with Scripts

Now add a Lua script to handle the button clicks. Add this at the top of your file:

```kry
@script "lua" {
    -- Counter state
    local count = 0
    
    function incrementCounter()
        count = count + 1
        updateDisplay()
    end
    
    function decrementCounter()
        count = count - 1
        updateDisplay()
    end
    
    function updateDisplay()
        local display = kryon.getElementById("counter_display")
        display.text = "Count: " .. count
    end
}

App {
    window_title: "Counter App"
    window_width: 300
    window_height: 200
    
    Container {
        layout: column center
        padding: 20
        gap: 16
        
        Text {
            text: "Counter App"
            font_size: 20
            font_weight: bold
            text_color: "#333333FF"
        }
        
        Text {
            id: "counter_display"
            text: "Count: 0"
            font_size: 24
            text_color: "#007BFFFF"
            font_weight: bold
        }
        
        Container {
            layout: row center
            gap: 12
            
            Button {
                id: "decrement_btn"
                text: "-"
                width: 50
                height: 40
                background_color: "#DC3545FF"
                text_color: "#FFFFFFFF"
                font_size: 20
                font_weight: bold
                border_radius: 6
                onClick: "decrementCounter"
            }
            
            Button {
                id: "increment_btn"
                text: "+"
                width: 50
                height: 40
                background_color: "#28A745FF"
                text_color: "#FFFFFFFF"
                font_size: 20
                font_weight: bold
                border_radius: 6
                onClick: "incrementCounter"
            }
        }
    }
}
```

## Step 6: Add Interactive States

Let's add hover effects to make the buttons feel more responsive:

```kry
@script "lua" {
    local count = 0
    
    function incrementCounter()
        count = count + 1
        updateDisplay()
    end
    
    function decrementCounter()
        count = count - 1
        updateDisplay()
    end
    
    function updateDisplay()
        local display = kryon.getElementById("counter_display")
        display.text = "Count: " .. count
    end
}

App {
    window_title: "Counter App"
    window_width: 300
    window_height: 200
    
    Container {
        layout: column center
        padding: 20
        gap: 16
        
        Text {
            text: "Counter App"
            font_size: 20
            font_weight: bold
            text_color: "#333333FF"
        }
        
        Text {
            id: "counter_display"
            text: "Count: 0"
            font_size: 24
            text_color: "#007BFFFF"
            font_weight: bold
        }
        
        Container {
            layout: row center
            gap: 12
            
            Button {
                id: "decrement_btn"
                text: "-"
                width: 50
                height: 40
                background_color: "#DC3545FF"
                text_color: "#FFFFFFFF"
                font_size: 20
                font_weight: bold
                border_radius: 6
                onClick: "decrementCounter"
                
                &:hover {
                    background_color: "#C82333FF"
                    cursor: "pointer"
                }
                
                &:active {
                    background_color: "#BD2130FF"
                }
            }
            
            Button {
                id: "increment_btn"
                text: "+"
                width: 50
                height: 40
                background_color: "#28A745FF"
                text_color: "#FFFFFFFF"
                font_size: 20
                font_weight: bold
                border_radius: 6
                onClick: "incrementCounter"
                
                &:hover {
                    background_color: "#218838FF"
                    cursor: "pointer"
                }
                
                &:active {
                    background_color: "#1E7E34FF"
                }
            }
        }
    }
}
```

## Step 7: Compile and Test

Compile your completed app:

```bash
kryc main.kry -o build/app.krb
```

If you have a Kryon runtime installed, run it:

```bash
# Desktop runtime
kryon-desktop build/app.krb

# Or web runtime
kryon-web build/app.krb --port 3000
```

You should see your counter app with working increment/decrement buttons!

## Understanding What We Built

Let's break down the key concepts:

### App Structure
- **`App`** - The root element that defines window properties
- **`Container`** - Layout containers that organize child elements
- **`Text`** - Displays text content
- **`Button`** - Interactive elements that trigger actions

### Layout System
- **`layout: column center`** - Arranges children vertically, centered
- **`layout: row center`** - Arranges children horizontally, centered
- **`gap: 16`** - Adds spacing between child elements
- **`padding: 20`** - Adds internal spacing around content

### Properties
- **Colors** - Use hex format `#RRGGBBAA` (red, green, blue, alpha)
- **Sizes** - Numbers represent pixels
- **IDs** - String identifiers for script access

### Scripts
- **`@script "lua"`** - Embeds Lua code for interactivity
- **Event handlers** - `onClick: "functionName"` connects UI to scripts
- **`kryon.getElementById()`** - Access UI elements from scripts

### Interactive States
- **`&:hover`** - Styles applied when mouse hovers over element
- **`&:active`** - Styles applied when element is being clicked

## File Size Analysis

Let's see how compact our app is:

```bash
ls -la build/app.krb
# Typical output: 1.2KB for complete interactive app!
```

Compare this to equivalent apps in other frameworks - Kryon's binary format is incredibly efficient.

## Next Steps

Congratulations! You've built your first Kryon app. Here's what to explore next:

**[→ Core Concepts](core-concepts.md)** - Dive deeper into elements and properties

**[→ Styling Guide](../styling/basics.md)** - Learn advanced styling techniques

**[→ Components](../reference/kry/components.md)** - Create reusable UI components

**[→ Calculator Example](../examples/calculator.md)** - Build a more complex app

## Exercises

Try these modifications to reinforce your learning:

1. **Add a reset button** that sets the counter back to 0
2. **Change the color scheme** to use your favorite colors
3. **Add minimum/maximum limits** (e.g., counter can't go below 0 or above 10)
4. **Create a second counter** with its own buttons
5. **Add a title input** that lets users customize the app title

Ready to learn more? Let's explore the core concepts that power Kryon apps.