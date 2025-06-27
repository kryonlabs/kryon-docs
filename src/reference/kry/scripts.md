# Scripts

Scripts in KRY provide dynamic behavior and interactivity to your user interfaces. They allow you to respond to user events, manipulate elements at runtime, manage application state, and integrate with external systems.

## Script Integration

### Basic Script Blocks

Scripts are embedded using the `@script` directive, typically placed after styles and components but before the main UI definition:

```kry
@variables {
    primary_color: "#007BFFFF"
}

style "button_style" {
    background_color: $primary_color
    padding: 12
}

# Scripts come after styling/components
@script "lua" {
    function handleButtonClick()
        print("Button was clicked!")
    end
    
    function initializeApp()
        print("Application starting...")
    end
}

App {
    Button {
        text: "Click Me"
        style: "button_style"
        onClick: "handleButtonClick"
    }
}
```

### Supported Languages

KRY supports multiple scripting languages:

```kry
# Lua scripting
@script "lua" {
    function calculateTotal(items)
        local total = 0
        for i, item in ipairs(items) do
            total = total + item.price
        end
        return total
    end
}

# JavaScript scripting
@script "javascript" {
    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
}

# Python scripting (runtime-dependent)
@script "python" {
    import json
    import datetime
    
    def process_data(raw_data):
        data = json.loads(raw_data)
        data['processed_at'] = datetime.datetime.now().isoformat()
        return json.dumps(data)
}

# Wren scripting (lightweight alternative)
@script "wren" {
    class Calculator {
        static add(a, b) { a + b }
        static multiply(a, b) { a * b }
    }
    
    var calculate = Fn.new { |operation, a, b|
        if (operation == "add") return Calculator.add(a, b)
        if (operation == "multiply") return Calculator.multiply(a, b)
        return 0
    }
}
```

### External Script Files

Scripts can be loaded from external files:

```kry
# Load script from file
@script "lua" from "scripts/app_logic.lua"

# Load with specific mode
@script "javascript" from "scripts/utilities.js" mode="external"

# Named script blocks for organization
@script "lua" name "user_management" from "scripts/users.lua"
@script "lua" name "data_processing" from "scripts/data.lua"
```

## Event Handling

### Basic Event Handlers

Connect UI events to script functions:

```kry
@script "lua" {
    local clickCount = 0
    
    function handleClick()
        clickCount = clickCount + 1
        local button = kryon.getElementById("counter_button")
        button.text = "Clicked " .. clickCount .. " times"
    end
    
    function handleReset()
        clickCount = 0
        local button = kryon.getElementById("counter_button")
        button.text = "Click Me"
    end
}

Container {
    Button {
        id: "counter_button"
        text: "Click Me"
        onClick: "handleClick"
    }
    
    Button {
        text: "Reset"
        onClick: "handleReset"
    }
}
```

### Event Types

Different elements support various event types:

```kry
@script "lua" {
    function onButtonClick()
        print("Button clicked")
    end
    
    function onButtonPress()
        print("Button pressed down")
    end
    
    function onButtonRelease()
        print("Button released")
    end
    
    function onInputChange(value)
        print("Input changed to: " .. value)
        validateInput(value)
    end
    
    function onInputFocus()
        print("Input gained focus")
        local input = kryon.getElementById("email_input")
        input.border_color = "#007BFFFF"
    end
    
    function onInputBlur()
        print("Input lost focus")
        local input = kryon.getElementById("email_input")
        input.border_color = "#D1D5DBFF"
    end
    
    function validateInput(value)
        local input = kryon.getElementById("email_input")
        if string.find(value, "@") then
            input.border_color = "#10B981FF"  -- Green for valid
        else
            input.border_color = "#EF4444FF"  -- Red for invalid
        end
    end
}

Container {
    Button {
        text: "Interactive Button"
        onClick: "onButtonClick"
        onPress: "onButtonPress"
        onRelease: "onButtonRelease"
    }
    
    Input {
        id: "email_input"
        placeholder: "Enter email..."
        onChange: "onInputChange"
        onFocus: "onInputFocus"
        onBlur: "onInputBlur"
    }
}
```

### Event Parameters

Event handlers can receive parameters:

```kry
@script "lua" {
    function handleItemClick(itemId, itemData)
        print("Clicked item: " .. itemId)
        showItemDetails(itemData)
    end
    
    function handleKeyPress(key, modifiers)
        if key == "Enter" and modifiers.ctrl then
            saveDocument()
        elseif key == "Escape" then
            cancelOperation()
        end
    end
    
    function handleMouseMove(x, y)
        updateCursorPosition(x, y)
    end
}
```

## Runtime API

### Element Manipulation

The Kryon runtime provides APIs for manipulating elements:

```kry
@script "lua" {
    -- Get element by ID
    function updateDisplay()
        local display = kryon.getElementById("status_display")
        display.text = "Updated at " .. os.date("%H:%M:%S")
        display.text_color = "#10B981FF"
    end
    
    -- Get elements by class/type
    function hideAllButtons()
        local buttons = kryon.getElementsByType("Button")
        for i, button in ipairs(buttons) do
            button.visibility = false
        end
    end
    
    -- Create new elements dynamically
    function addNewItem(text)
        local container = kryon.getElementById("item_list")
        local newItem = kryon.createElement("Button")
        newItem.text = text
        newItem.onClick = "handleItemClick"
        container.appendChild(newItem)
    end
    
    -- Remove elements
    function removeItem(itemId)
        local item = kryon.getElementById(itemId)
        if item then
            item.parent.removeChild(item)
        end
    end
    
    -- Modify properties
    function toggleTheme()
        local app = kryon.getApp()
        local isDark = app.getVariable("dark_mode")
        
        if isDark then
            -- Switch to light theme
            app.setVariable("current_bg", "#FFFFFFFF")
            app.setVariable("current_text", "#000000FF")
            app.setVariable("dark_mode", false)
        else
            -- Switch to dark theme
            app.setVariable("current_bg", "#121212FF")
            app.setVariable("current_text", "#FFFFFFFF")
            app.setVariable("dark_mode", true)
        end
        
        updateAllElements()
    end
}

Container {
    Button {
        text: "Update Display"
        onClick: "updateDisplay"
    }
    
    Text {
        id: "status_display"
        text: "Ready"
    }
    
    Button {
        text: "Toggle Theme"
        onClick: "toggleTheme"
    }
    
    Container {
        id: "item_list"
        layout: column
        gap: 8
    }
}
```

### State Management

Scripts can manage application state:

```kry
@script "lua" {
    -- Application state
    local appState = {
        user = nil,
        preferences = {
            theme = "light",
            language = "en",
            notifications = true
        },
        currentView = "dashboard",
        data = {}
    }
    
    -- State getters
    function getCurrentUser()
        return appState.user
    end
    
    function getPreference(key)
        return appState.preferences[key]
    end
    
    function getCurrentView()
        return appState.currentView
    end
    
    -- State setters
    function setUser(userData)
        appState.user = userData
        updateUserInterface()
    end
    
    function setPreference(key, value)
        appState.preferences[key] = value
        savePreferences()
        applyPreference(key, value)
    end
    
    function navigateToView(viewName)
        appState.currentView = viewName
        updateViewInterface()
        logNavigation(viewName)
    end
    
    -- State persistence
    function saveState()
        local stateJson = json.encode(appState)
        kryon.localStorage.set("app_state", stateJson)
    end
    
    function loadState()
        local stateJson = kryon.localStorage.get("app_state")
        if stateJson then
            appState = json.decode(stateJson)
            restoreInterface()
        end
    end
    
    -- State synchronization
    function updateUserInterface()
        local user = getCurrentUser()
        if user then
            local nameDisplay = kryon.getElementById("user_name")
            nameDisplay.text = user.name
            
            local avatarImage = kryon.getElementById("user_avatar")
            avatarImage.source = user.avatar
        end
    end
    
    function applyPreference(key, value)
        if key == "theme" then
            applyTheme(value)
        elseif key == "language" then
            updateLanguage(value)
        elseif key == "notifications" then
            configureNotifications(value)
        end
    end
}
```

### Data Processing

Scripts can handle data transformation and validation:

```kry
@script "lua" {
    -- Data validation
    function validateForm(formData)
        local errors = {}
        
        if not formData.email or formData.email == "" then
            table.insert(errors, "Email is required")
        elseif not isValidEmail(formData.email) then
            table.insert(errors, "Invalid email format")
        end
        
        if not formData.password or string.len(formData.password) < 8 then
            table.insert(errors, "Password must be at least 8 characters")
        end
        
        return errors
    end
    
    function isValidEmail(email)
        return string.match(email, "^[%w._-]+@[%w.-]+%.[%a]+$") ~= nil
    end
    
    -- Data transformation
    function formatUserData(rawData)
        return {
            id = rawData.user_id,
            name = rawData.first_name .. " " .. rawData.last_name,
            email = string.lower(rawData.email_address),
            joinDate = formatDate(rawData.created_at),
            isActive = rawData.status == "active"
        }
    end
    
    function formatDate(timestamp)
        return os.date("%B %d, %Y", timestamp)
    end
    
    -- Data processing
    function processOrderItems(items)
        local total = 0
        local processedItems = {}
        
        for i, item in ipairs(items) do
            local processedItem = {
                name = item.name,
                quantity = item.qty,
                unitPrice = item.price,
                total = item.qty * item.price
            }
            
            total = total + processedItem.total
            table.insert(processedItems, processedItem)
        end
        
        return {
            items = processedItems,
            subtotal = total,
            tax = total * 0.08,
            total = total * 1.08
        }
    end
    
    -- Form handling
    function handleFormSubmit()
        local formData = collectFormData()
        local errors = validateForm(formData)
        
        if #errors > 0 then
            displayErrors(errors)
            return
        end
        
        local processedData = formatUserData(formData)
        submitData(processedData)
    end
    
    function collectFormData()
        local nameInput = kryon.getElementById("name_input")
        local emailInput = kryon.getElementById("email_input")
        local passwordInput = kryon.getElementById("password_input")
        
        return {
            name = nameInput.value,
            email = emailInput.value,
            password = passwordInput.value
        }
    end
    
    function displayErrors(errors)
        local errorContainer = kryon.getElementById("error_display")
        errorContainer.removeAllChildren()
        
        for i, error in ipairs(errors) do
            local errorText = kryon.createElement("Text")
            errorText.text = error
            errorText.text_color = "#EF4444FF"
            errorText.font_size = 12
            errorContainer.appendChild(errorText)
        end
        
        errorContainer.visibility = true
    end
}
```

## Advanced Scripting Patterns

### Module System

Organize scripts into logical modules:

```kry
@script "lua" name "utils" {
    local utils = {}
    
    function utils.formatCurrency(amount)
        return string.format("$%.2f", amount)
    end
    
    function utils.capitalizeWords(text)
        return string.gsub(text, "(%a)([%w_']*)", function(first, rest)
            return string.upper(first) .. string.lower(rest)
        end)
    end
    
    function utils.debounce(func, delay)
        local timer = nil
        return function(...)
            if timer then
                kryon.cancelTimer(timer)
            end
            timer = kryon.setTimeout(func, delay, ...)
        end
    end
    
    return utils
}

@script "lua" name "api" {
    local api = {}
    local utils = require("utils")
    
    function api.fetchUserData(userId)
        local url = "https://api.example.com/users/" .. userId
        kryon.http.get(url, function(response)
            if response.status == 200 then
                local userData = json.decode(response.body)
                updateUserDisplay(userData)
            else
                showError("Failed to load user data")
            end
        end)
    end
    
    function api.saveUserPreferences(preferences)
        local url = "https://api.example.com/preferences"
        local data = json.encode(preferences)
        
        kryon.http.post(url, data, {
            headers = { ["Content-Type"] = "application/json" }
        }, function(response)
            if response.status == 200 then
                showSuccess("Preferences saved")
            else
                showError("Failed to save preferences")
            end
        end)
    end
    
    return api
}

@script "lua" name "main" {
    local utils = require("utils")
    local api = require("api")
    
    function initializeApp()
        loadUserSession()
        setupEventHandlers()
        api.fetchUserData(getCurrentUserId())
    end
    
    function handlePriceDisplay(price)
        local formatted = utils.formatCurrency(price)
        local priceDisplay = kryon.getElementById("price_display")
        priceDisplay.text = formatted
    end
}
```

### Asynchronous Operations

Handle asynchronous operations and callbacks:

```kry
@script "lua" {
    -- Promise-like pattern for async operations
    function createPromise(executor)
        local promise = {
            state = "pending",
            value = nil,
            error = nil,
            thenCallbacks = {},
            catchCallbacks = {}
        }
        
        local function resolve(value)
            if promise.state == "pending" then
                promise.state = "fulfilled"
                promise.value = value
                for _, callback in ipairs(promise.thenCallbacks) do
                    callback(value)
                end
            end
        end
        
        local function reject(error)
            if promise.state == "pending" then
                promise.state = "rejected"
                promise.error = error
                for _, callback in ipairs(promise.catchCallbacks) do
                    callback(error)
                end
            end
        end
        
        function promise:then(callback)
            if self.state == "fulfilled" then
                callback(self.value)
            elseif self.state == "pending" then
                table.insert(self.thenCallbacks, callback)
            end
            return self
        end
        
        function promise:catch(callback)
            if self.state == "rejected" then
                callback(self.error)
            elseif self.state == "pending" then
                table.insert(self.catchCallbacks, callback)
            end
            return self
        end
        
        executor(resolve, reject)
        return promise
    end
    
    -- Async data loading
    function loadDataAsync(endpoint)
        return createPromise(function(resolve, reject)
            kryon.http.get(endpoint, function(response)
                if response.status == 200 then
                    local data = json.decode(response.body)
                    resolve(data)
                else
                    reject("HTTP " .. response.status .. ": " .. response.statusText)
                end
            end)
        end)
    end
    
    -- Usage with chaining
    function handleLoadData()
        showLoading(true)
        
        loadDataAsync("https://api.example.com/data")
            :then(function(data)
                updateInterface(data)
                showLoading(false)
            end)
            :catch(function(error)
                showError("Failed to load data: " .. error)
                showLoading(false)
            end)
    end
    
    -- Parallel operations
    function loadMultipleDataSources()
        local results = {}
        local completed = 0
        local total = 3
        
        local function checkCompletion()
            completed = completed + 1
            if completed == total then
                processAllData(results)
            end
        end
        
        loadDataAsync("https://api.example.com/users")
            :then(function(data)
                results.users = data
                checkCompletion()
            end)
        
        loadDataAsync("https://api.example.com/products")
            :then(function(data)
                results.products = data
                checkCompletion()
            end)
        
        loadDataAsync("https://api.example.com/orders")
            :then(function(data)
                results.orders = data
                checkCompletion()
            end)
    end
}
```

### Performance Optimization

Optimize script performance for smooth UI interactions:

```kry
@script "lua" {
    -- Efficient DOM updates
    local pendingUpdates = {}
    local updateTimer = nil
    
    function scheduleUpdate(elementId, property, value)
        if not pendingUpdates[elementId] then
            pendingUpdates[elementId] = {}
        end
        pendingUpdates[elementId][property] = value
        
        if updateTimer then
            kryon.cancelTimer(updateTimer)
        end
        
        updateTimer = kryon.setTimeout(flushUpdates, 16) -- 60fps
    end
    
    function flushUpdates()
        for elementId, updates in pairs(pendingUpdates) do
            local element = kryon.getElementById(elementId)
            if element then
                for property, value in pairs(updates) do
                    element[property] = value
                end
            end
        end
        
        pendingUpdates = {}
        updateTimer = nil
    end
    
    -- Memoization for expensive calculations
    local memoCache = {}
    
    function memoize(func)
        return function(...)
            local key = table.concat({...}, "|")
            if memoCache[key] then
                return memoCache[key]
            end
            
            local result = func(...)
            memoCache[key] = result
            return result
        end
    end
    
    -- Memoized calculation example
    local calculateExpensiveMetrics = memoize(function(data)
        -- Expensive calculation here
        local result = {}
        for i, item in ipairs(data) do
            -- Complex processing...
            result[i] = processComplexItem(item)
        end
        return result
    end)
    
    -- Virtual scrolling for large lists
    function setupVirtualScrolling(containerId, itemHeight, totalItems)
        local container = kryon.getElementById(containerId)
        local visibleCount = math.ceil(container.height / itemHeight) + 2
        local scrollTop = 0
        
        local function updateVisibleItems()
            local startIndex = math.floor(scrollTop / itemHeight)
            local endIndex = math.min(startIndex + visibleCount, totalItems)
            
            container.removeAllChildren()
            
            for i = startIndex, endIndex do
                local item = createListItem(i)
                item.pos_y = i * itemHeight
                container.appendChild(item)
            end
        end
        
        container.onScroll = function(newScrollTop)
            scrollTop = newScrollTop
            scheduleUpdate("virtual_list", "scroll", newScrollTop)
        end
        
        updateVisibleItems()
    end
}
```

## Integration Patterns

### Component-Script Integration

Integrate scripts with custom components:

```kry
Define DataTable {
    Properties {
        data_source: String = ""
        sortable: Bool = true
        filterable: Bool = true
        page_size: Number = 10
        on_row_click: String = ""
        on_sort_change: String = ""
    }
    
    # Component implementation would include script hooks
    Container {
        id: "data_table_" + generateId()
        
        # Header row
        Container {
            layout: row
            gap: 8
            
            @foreach column in getColumns($data_source) {
                Button {
                    text: $column.title
                    onClick: "handleColumnSort"
                    data-column: $column.key
                    
                    @if $sortable {
                        Text {
                            text: getSortIcon($column.key)
                            font_size: 12
                        }
                    }
                }
            }
        }
        
        # Data rows
        Container {
            id: "table_body_" + generateId()
            layout: column
            
            # Populated by script
        }
    }
}

@script "lua" {
    local tableData = {}
    local sortColumns = {}
    
    function initializeDataTable(tableId, dataSource)
        tableData[tableId] = loadTableData(dataSource)
        renderTableRows(tableId)
    end
    
    function handleColumnSort(columnKey, tableId)
        local currentSort = sortColumns[tableId] or {}
        
        if currentSort.column == columnKey then
            currentSort.direction = currentSort.direction == "asc" and "desc" or "asc"
        else
            currentSort.column = columnKey
            currentSort.direction = "asc"
        end
        
        sortColumns[tableId] = currentSort
        sortTableData(tableId, currentSort)
        renderTableRows(tableId)
    end
    
    function renderTableRows(tableId)
        local tbody = kryon.getElementById("table_body_" .. tableId)
        tbody.removeAllChildren()
        
        local data = tableData[tableId]
        for i, row in ipairs(data) do
            local rowElement = createTableRow(row, i)
            tbody.appendChild(rowElement)
        end
    end
}
```

## Best Practices

### 1. Organize Code Logically

```kry
# Good: Logical organization with clear separation
@script "lua" name "constants" {
    local CONSTANTS = {
        API_BASE_URL = "https://api.example.com",
        ITEMS_PER_PAGE = 20,
        ANIMATION_DURATION = 300,
        COLORS = {
            PRIMARY = "#007BFFFF",
            SUCCESS = "#28A745FF",
            ERROR = "#DC3545FF"
        }
    }
    return CONSTANTS
}

@script "lua" name "utils" {
    -- Utility functions
}

@script "lua" name "api" {
    -- API interaction functions
}

@script "lua" name "ui" {
    -- UI manipulation functions
}

@script "lua" name "main" {
    -- Main application logic
}

# Avoid: Everything in one large script block
@script "lua" {
    -- 500+ lines of mixed logic, utilities, API calls, etc.
}
```

### 2. Handle Errors Gracefully

```kry
@script "lua" {
    function safeApiCall(url, callback, errorCallback)
        kryon.http.get(url, function(response)
            if response.status >= 200 and response.status < 300 then
                local success, data = pcall(json.decode, response.body)
                if success then
                    callback(data)
                else
                    handleError("Invalid JSON response", errorCallback)
                end
            else
                handleError("HTTP " .. response.status, errorCallback)
            end
        end)
    end
    
    function handleError(message, errorCallback)
        print("Error: " .. message)
        
        if errorCallback then
            errorCallback(message)
        else
            showDefaultError(message)
        end
    end
    
    function showDefaultError(message)
        local errorDisplay = kryon.getElementById("error_display")
        if errorDisplay then
            errorDisplay.text = "Error: " .. message
            errorDisplay.visibility = true
            
            -- Auto-hide after 5 seconds
            kryon.setTimeout(function()
                errorDisplay.visibility = false
            end, 5000)
        end
    end
    
    -- Safe element access
    function safeGetElement(id)
        local element = kryon.getElementById(id)
        if not element then
            print("Warning: Element with id '" .. id .. "' not found")
        end
        return element
    end
    
    function safeUpdateElement(id, property, value)
        local element = safeGetElement(id)
        if element then
            element[property] = value
        end
    end
}
```

### 3. Use Clear Function Names

```kry
@script "lua" {
    # Good: Descriptive function names
    function validateEmailAddress(email)
        return string.match(email, "^[%w._-]+@[%w.-]+%.[%a]+$") ~= nil
    end
    
    function formatCurrencyAmount(amount)
        return string.format("$%.2f", amount)
    end
    
    function handleUserRegistrationSubmit()
        local formData = collectRegistrationFormData()
        if validateRegistrationForm(formData) then
            submitRegistrationToServer(formData)
        end
    end
    
    function showSuccessNotification(message)
        createNotification(message, "success", 3000)
    end
    
    # Avoid: Unclear or abbreviated names
    function valEmail(e)          -- Unclear abbreviation
        return check(e)           -- Vague function name
    end
    
    function doStuff()            -- Meaningless name
        -- What does this do?
    end
    
    function handleClick()        -- Too generic
        -- Which click? What does it handle?
    end
}
```

### 4. Comment Complex Logic

```kry
@script "lua" {
    -- User session management with automatic refresh
    function initializeUserSession()
        local sessionData = loadSessionFromStorage()
        
        if sessionData and sessionData.expires > os.time() then
            -- Session is still valid, set up user interface
            setCurrentUser(sessionData.user)
            scheduleSessionRefresh(sessionData.expires)
        else
            -- Session expired or doesn't exist, redirect to login
            clearSessionData()
            navigateToLogin()
        end
    end
    
    -- Debounced search to avoid excessive API calls
    local searchTimer = nil
    function handleSearchInput(query)
        -- Cancel previous search if user is still typing
        if searchTimer then
            kryon.cancelTimer(searchTimer)
        end
        
        -- Wait 300ms after user stops typing before searching
        searchTimer = kryon.setTimeout(function()
            if string.len(query) >= 3 then
                performSearch(query)
            else
                clearSearchResults()
            end
        end, 300)
    end
    
    -- Complex data transformation with validation
    function processOrderData(rawOrderData)
        local processedOrder = {
            id = rawOrderData.order_id,
            items = {},
            totals = {
                subtotal = 0,
                tax = 0,
                shipping = 0,
                total = 0
            }
        }
        
        -- Process each item and calculate totals
        for i, rawItem in ipairs(rawOrderData.line_items or {}) do
            local item = {
                sku = rawItem.product_sku,
                name = rawItem.product_name,
                quantity = tonumber(rawItem.qty) or 0,
                unitPrice = tonumber(rawItem.unit_price) or 0
            }
            
            -- Calculate item total
            item.total = item.quantity * item.unitPrice
            processedOrder.totals.subtotal = processedOrder.totals.subtotal + item.total
            
            table.insert(processedOrder.items, item)
        end
        
        -- Calculate tax (8% rate)
        processedOrder.totals.tax = processedOrder.totals.subtotal * 0.08
        
        -- Calculate shipping (free over $50, otherwise $5.99)
        if processedOrder.totals.subtotal >= 50 then
            processedOrder.totals.shipping = 0
        else
            processedOrder.totals.shipping = 5.99
        end
        
        -- Calculate final total
        processedOrder.totals.total = processedOrder.totals.subtotal + 
                                    processedOrder.totals.tax + 
                                    processedOrder.totals.shipping
        
        return processedOrder
    end
}
```

### 5. Test Script Functions

```kry
@script "lua" {
    -- Main application functions
    function calculateTax(amount, rate)
        return amount * rate
    end
    
    function formatPhoneNumber(phone)
        local cleaned = string.gsub(phone, "[^%d]", "")
        if string.len(cleaned) == 10 then
            return string.format("(%s) %s-%s", 
                string.sub(cleaned, 1, 3),
                string.sub(cleaned, 4, 6),
                string.sub(cleaned, 7, 10))
        end
        return phone
    end
    
    -- Test functions (removed in production)
    function runTests()
        testCalculateTax()
        testFormatPhoneNumber()
        print("All tests completed")
    end
    
    function testCalculateTax()
        local result = calculateTax(100, 0.08)
        assert(result == 8, "Tax calculation failed")
        print("✓ Tax calculation test passed")
    end
    
    function testFormatPhoneNumber()
        local result = formatPhoneNumber("1234567890")
        assert(result == "(123) 456-7890", "Phone formatting failed")
        
        local result2 = formatPhoneNumber("(123) 456-7890")
        assert(result2 == "(123) 456-7890", "Phone formatting failed")
        
        print("✓ Phone formatting test passed")
    end
    
    -- Initialize app and optionally run tests
    function initializeApp()
        if kryon.getVariable("debug_mode") then
            runTests()
        end
        
        setupUserInterface()
        loadApplicationData()
    end
}
```

### 6. Optimize for Performance

```kry
@script "lua" {
    -- Cache frequently accessed elements
    local elementCache = {}
    
    function getCachedElement(id)
        if not elementCache[id] then
            elementCache[id] = kryon.getElementById(id)
        end
        return elementCache[id]
    end
    
    -- Batch DOM updates
    local updateQueue = {}
    local updateScheduled = false
    
    function queueUpdate(elementId, property, value)
        if not updateQueue[elementId] then
            updateQueue[elementId] = {}
        end
        updateQueue[elementId][property] = value
        
        if not updateScheduled then
            updateScheduled = true
            kryon.nextFrame(flushUpdateQueue)
        end
    end
    
    function flushUpdateQueue()
        for elementId, updates in pairs(updateQueue) do
            local element = getCachedElement(elementId)
            if element then
                for property, value in pairs(updates) do
                    element[property] = value
                end
            end
        end
        
        updateQueue = {}
        updateScheduled = false
    end
    
    -- Efficient list operations
    function updateLargeList(items)
        local container = getCachedElement("item_list")
        
        -- Remove all children efficiently
        container.removeAllChildren()
        
        -- Create document fragment for batch insertion
        local fragment = kryon.createDocumentFragment()
        
        for i, item in ipairs(items) do
            local itemElement = createListItem(item)
            fragment.appendChild(itemElement)
        end
        
        -- Insert all items at once
        container.appendChild(fragment)
    end
}
```

---

Scripts bring your KRY interfaces to life with dynamic behavior and interactivity. By following best practices for organization, error handling, and performance, you can create responsive, maintainable applications that provide excellent user experiences. Next, explore [Pseudo-Selectors](pseudo-selectors.md) to learn about advanced styling for interactive states.
