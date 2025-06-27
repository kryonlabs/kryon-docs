# Embedded Runtime

The Kryon Embedded Runtime provides ultra-lightweight UI capabilities for resource-constrained embedded systems, microcontrollers, and IoT devices. It maintains essential Kryon functionality while operating within strict memory, processing, and power constraints.

## Target Platforms

### Supported Microcontrollers

```
Platform Support Matrix:
├── ARM Cortex-M Series
│   ├── Cortex-M0/M0+: Basic support (32KB+ RAM)
│   ├── Cortex-M3/M4: Full support (64KB+ RAM)
│   ├── Cortex-M7: Enhanced support (128KB+ RAM)
│   └── Cortex-M33/M55: Advanced features
├── RISC-V Platforms
│   ├── RV32I: Basic support
│   ├── RV32IM: Enhanced support
│   └── RV64: Full support
├── ESP32 Family
│   ├── ESP32: Full support (320KB RAM)
│   ├── ESP32-S2/S3: Enhanced support
│   └── ESP32-C3: RISC-V support
├── STM32 Series
│   ├── STM32F0/F1: Basic support
│   ├── STM32F4/F7: Full support
│   └── STM32H7: Advanced features
└── Other Platforms
    ├── Nordic nRF52/nRF53: BLE integration
    ├── Raspberry Pi Pico: RP2040 support
    ├── TI MSP430: Ultra-low power
    └── Atmel AVR: Limited support
```

### Hardware Requirements

```
Minimum Requirements:
├── CPU: 32-bit ARM Cortex-M0+ or equivalent
├── RAM: 32KB minimum (64KB recommended)
├── Flash: 128KB minimum (256KB recommended)
├── Display: SPI/I2C interfaced LCD/OLED
└── Input: GPIO buttons, rotary encoder, or touch

Recommended Configuration:
├── CPU: ARM Cortex-M4F @ 80MHz+
├── RAM: 128KB+ with external PSRAM option
├── Flash: 512KB+ for application code
├── Display: 240x320 SPI TFT or 128x64 OLED
├── Input: Touch screen or button matrix
└── Storage: SPI Flash or SD card
```

## Runtime Architecture

### Minimal Runtime Design

The embedded runtime uses a simplified architecture optimized for resource constraints:

```
Embedded Runtime Architecture:
├── Minimal Core (8-16KB)
│   ├── Element system (simplified)
│   ├── Property management (static)
│   ├── Event handling (polling-based)
│   └── Memory management (pools)
├── Display Driver (2-4KB)
│   ├── Framebuffer management
│   ├── Basic drawing primitives
│   ├── Font rendering (bitmap)
│   └── Hardware acceleration hooks
├── Input System (1-2KB)
│   ├── GPIO polling
│   ├── Button debouncing
│   ├── Touch input (if available)
│   └── Encoder support
└── Platform Abstraction (1-2KB)
    ├── Hardware abstraction layer
    ├── Timer management
    ├── Interrupt handling
    └── Power management
```

### Memory Layout

```c
// Embedded memory layout optimization
#pragma pack(1)  // Pack structures to save memory

// Minimal element structure (16 bytes)
typedef struct kryon_embedded_element {
    uint8_t type;           // Element type (1 byte)
    uint8_t flags;          // State flags (1 byte)
    uint16_t x, y;          // Position (4 bytes)
    uint16_t width, height; // Dimensions (4 bytes)
    uint16_t parent_id;     // Parent element ID (2 bytes)
    uint16_t first_child;   // First child ID (2 bytes)
    uint16_t next_sibling;  // Next sibling ID (2 bytes)
} kryon_embedded_element_t;

// Minimal property storage (variable size)
typedef struct kryon_embedded_property {
    uint8_t element_id;     // Element this property belongs to
    uint8_t property_type;  // Property type identifier
    uint16_t value;         // Property value (or offset for larger data)
} kryon_embedded_property_t;

// Static memory pools
#define KRYON_MAX_ELEMENTS 64
#define KRYON_MAX_PROPERTIES 256
#define KRYON_FRAMEBUFFER_SIZE (240 * 320 * 2) // 16-bit color

static kryon_embedded_element_t elements[KRYON_MAX_ELEMENTS];
static kryon_embedded_property_t properties[KRYON_MAX_PROPERTIES];
static uint16_t framebuffer[KRYON_FRAMEBUFFER_SIZE / 2];
static uint8_t element_count = 0;
static uint8_t property_count = 0;
```

## Platform Implementation

### ARM Cortex-M Implementation

```c
// ARM Cortex-M specific implementation
#include <stdint.h>
#include <stdbool.h>
#include "stm32f4xx_hal.h"
#include "kryon_embedded.h"

// Platform configuration
typedef struct kryon_cortexm_config {
    // Display configuration
    SPI_HandleTypeDef* display_spi;
    GPIO_TypeDef* display_cs_port;
    uint16_t display_cs_pin;
    GPIO_TypeDef* display_dc_port;
    uint16_t display_dc_pin;
    GPIO_TypeDef* display_rst_port;
    uint16_t display_rst_pin;
    
    // Input configuration
    GPIO_TypeDef* button_ports[8];
    uint16_t button_pins[8];
    uint8_t button_count;
    
    // Timer configuration
    TIM_HandleTypeDef* update_timer;
    uint32_t update_frequency; // Hz
    
    // Power management
    bool enable_sleep_mode;
    uint32_t sleep_timeout_ms;
} kryon_cortexm_config_t;

// Initialize embedded runtime
kryon_result_t kryon_embedded_init(const kryon_cortexm_config_t* config) {
    // Initialize memory pools
    memset(elements, 0, sizeof(elements));
    memset(properties, 0, sizeof(properties));
    memset(framebuffer, 0, sizeof(framebuffer));
    
    element_count = 0;
    property_count = 0;
    
    // Initialize display
    kryon_result_t result = kryon_display_init(config);
    if (result != KRYON_SUCCESS) return result;
    
    // Initialize input system
    result = kryon_input_init(config);
    if (result != KRYON_SUCCESS) return result;
    
    // Setup update timer
    result = kryon_timer_init(config);
    if (result != KRYON_SUCCESS) return result;
    
    // Configure power management
    if (config->enable_sleep_mode) {
        kryon_power_init(config);
    }
    
    return KRYON_SUCCESS;
}

// Display initialization
kryon_result_t kryon_display_init(const kryon_cortexm_config_t* config) {
    // Reset display
    HAL_GPIO_WritePin(config->display_rst_port, config->display_rst_pin, GPIO_PIN_RESET);
    HAL_Delay(10);
    HAL_GPIO_WritePin(config->display_rst_port, config->display_rst_pin, GPIO_PIN_SET);
    HAL_Delay(120);
    
    // Initialize display controller (ILI9341 example)
    uint8_t init_commands[] = {
        0xEF, 3, 0x03, 0x80, 0x02,
        0xCF, 3, 0x00, 0xC1, 0x30,
        0xED, 4, 0x64, 0x03, 0x12, 0x81,
        0xE8, 3, 0x85, 0x00, 0x78,
        0xCB, 5, 0x39, 0x2C, 0x00, 0x34, 0x02,
        0xF7, 1, 0x20,
        0xEA, 2, 0x00, 0x00,
        0xC0, 1, 0x23,        // Power control
        0xC1, 1, 0x10,        // Power control
        0xC5, 2, 0x3e, 0x28,  // VCM control
        0xC7, 1, 0x86,        // VCM control2
        0x36, 1, 0x48,        // Memory Access Control
        0x3A, 1, 0x55,        // Pixel Format
        0xB1, 2, 0x00, 0x18,  // Frame Rate Control
        0xB6, 3, 0x08, 0x82, 0x27, // Display Function Control
        0x11, 0x80,           // Exit Sleep
        0x29, 0x80,           // Display on
        0, 0                  // End of commands
    };
    
    const uint8_t* cmd = init_commands;
    while (*cmd) {
        kryon_display_command(*cmd++);
        uint8_t len = *cmd++;
        if (len & 0x80) {
            HAL_Delay(len & 0x7F);
        } else {
            while (len--) {
                kryon_display_data(*cmd++);
            }
        }
    }
    
    return KRYON_SUCCESS;
}

// Display command/data transmission
void kryon_display_command(uint8_t cmd) {
    HAL_GPIO_WritePin(config.display_cs_port, config.display_cs_pin, GPIO_PIN_RESET);
    HAL_GPIO_WritePin(config.display_dc_port, config.display_dc_pin, GPIO_PIN_RESET);
    HAL_SPI_Transmit(config.display_spi, &cmd, 1, HAL_MAX_DELAY);
    HAL_GPIO_WritePin(config.display_cs_port, config.display_cs_pin, GPIO_PIN_SET);
}

void kryon_display_data(uint8_t data) {
    HAL_GPIO_WritePin(config.display_cs_port, config.display_cs_pin, GPIO_PIN_RESET);
    HAL_GPIO_WritePin(config.display_dc_port, config.display_dc_pin, GPIO_PIN_SET);
    HAL_SPI_Transmit(config.display_spi, &data, 1, HAL_MAX_DELAY);
    HAL_GPIO_WritePin(config.display_cs_port, config.display_cs_pin, GPIO_PIN_SET);
}

// Input system
kryon_result_t kryon_input_init(const kryon_cortexm_config_t* config) {
    // Configure button pins as inputs with pull-up
    for (uint8_t i = 0; i < config->button_count; i++) {
        GPIO_InitTypeDef GPIO_InitStruct = {0};
        GPIO_InitStruct.Pin = config->button_pins[i];
        GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
        GPIO_InitStruct.Pull = GPIO_PULLUP;
        HAL_GPIO_Init(config->button_ports[i], &GPIO_InitStruct);
    }
    
    return KRYON_SUCCESS;
}

// Button reading with debouncing
uint8_t kryon_read_buttons(const kryon_cortexm_config_t* config) {
    static uint8_t button_state = 0;
    static uint8_t button_debounce[8] = {0};
    static uint32_t last_read = 0;
    
    uint32_t now = HAL_GetTick();
    if (now - last_read < 10) return button_state; // Debounce delay
    
    last_read = now;
    uint8_t new_state = 0;
    
    for (uint8_t i = 0; i < config->button_count; i++) {
        bool pressed = !HAL_GPIO_ReadPin(config->button_ports[i], config->button_pins[i]);
        
        if (pressed) {
            if (++button_debounce[i] > 3) { // 30ms debounce
                new_state |= (1 << i);
                button_debounce[i] = 3;
            }
        } else {
            if (button_debounce[i] > 0) {
                button_debounce[i]--;
            }
        }
    }
    
    button_state = new_state;
    return button_state;
}
```

### ESP32 Implementation

```c
// ESP32-specific implementation with WiFi and touch support
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "esp_wifi.h"
#include "driver/spi_master.h"
#include "driver/gpio.h"
#include "driver/touch_pad.h"
#include "kryon_embedded.h"

typedef struct kryon_esp32_config {
    // Display SPI configuration
    spi_host_device_t spi_host;
    int mosi_pin;
    int sclk_pin;
    int cs_pin;
    int dc_pin;
    int rst_pin;
    int backlight_pin;
    
    // Touch configuration
    bool enable_touch;
    touch_pad_t touch_pins[10];
    uint8_t touch_count;
    uint16_t touch_threshold;
    
    // WiFi configuration
    bool enable_wifi;
    char wifi_ssid[32];
    char wifi_password[64];
    
    // Power management
    bool enable_light_sleep;
    uint32_t sleep_duration_ms;
} kryon_esp32_config_t;

// FreeRTOS task priorities
#define KRYON_TASK_PRIORITY     5
#define KRYON_INPUT_TASK_PRIORITY 6
#define KRYON_WIFI_TASK_PRIORITY  3

// Initialize ESP32 runtime
kryon_result_t kryon_esp32_init(const kryon_esp32_config_t* config) {
    // Initialize display SPI
    spi_bus_config_t buscfg = {
        .miso_io_num = -1,
        .mosi_io_num = config->mosi_pin,
        .sclk_io_num = config->sclk_pin,
        .quadwp_io_num = -1,
        .quadhd_io_num = -1,
        .max_transfer_sz = 320 * 240 * 2
    };
    
    spi_device_interface_config_t devcfg = {
        .clock_speed_hz = 26 * 1000 * 1000,  // 26 MHz
        .mode = 0,
        .spics_io_num = config->cs_pin,
        .queue_size = 7,
        .flags = SPI_DEVICE_NO_DUMMY,
    };
    
    ESP_ERROR_CHECK(spi_bus_initialize(config->spi_host, &buscfg, SPI_DMA_CH_AUTO));
    ESP_ERROR_CHECK(spi_bus_add_device(config->spi_host, &devcfg, &spi_device));
    
    // Initialize GPIO pins
    gpio_set_direction(config->dc_pin, GPIO_MODE_OUTPUT);
    gpio_set_direction(config->rst_pin, GPIO_MODE_OUTPUT);
    gpio_set_direction(config->backlight_pin, GPIO_MODE_OUTPUT);
    
    // Initialize display
    kryon_esp32_display_init(config);
    
    // Initialize touch if enabled
    if (config->enable_touch) {
        kryon_esp32_touch_init(config);
    }
    
    // Initialize WiFi if enabled
    if (config->enable_wifi) {
        kryon_esp32_wifi_init(config);
    }
    
    // Create FreeRTOS tasks
    xTaskCreate(kryon_main_task, "kryon_main", 4096, (void*)config, 
                KRYON_TASK_PRIORITY, NULL);
    xTaskCreate(kryon_input_task, "kryon_input", 2048, (void*)config, 
                KRYON_INPUT_TASK_PRIORITY, NULL);
    
    return KRYON_SUCCESS;
}

// Main Kryon task
void kryon_main_task(void* pvParameters) {
    kryon_esp32_config_t* config = (kryon_esp32_config_t*)pvParameters;
    TickType_t last_wake_time = xTaskGetTickCount();
    const TickType_t frequency = pdMS_TO_TICKS(16); // ~60 FPS
    
    while (1) {
        // Update Kryon application
        kryon_embedded_update();
        
        // Render to framebuffer
        kryon_embedded_render();
        
        // Transfer framebuffer to display
        kryon_esp32_display_update();
        
        // Handle power management
        if (config->enable_light_sleep && kryon_is_idle()) {
            esp_light_sleep_start();
        }
        
        vTaskDelayUntil(&last_wake_time, frequency);
    }
}

// Touch input handling
kryon_result_t kryon_esp32_touch_init(const kryon_esp32_config_t* config) {
    ESP_ERROR_CHECK(touch_pad_init());
    ESP_ERROR_CHECK(touch_pad_set_fsm_mode(TOUCH_FSM_MODE_TIMER));
    ESP_ERROR_CHECK(touch_pad_set_trigger_mode(TOUCH_TRIGGER_BELOW));
    
    for (uint8_t i = 0; i < config->touch_count; i++) {
        ESP_ERROR_CHECK(touch_pad_config(config->touch_pins[i], config->touch_threshold));
    }
    
    ESP_ERROR_CHECK(touch_pad_start());
    
    return KRYON_SUCCESS;
}

// WiFi initialization for IoT connectivity
kryon_result_t kryon_esp32_wifi_init(const kryon_esp32_config_t* config) {
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();
    
    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));
    
    wifi_config_t wifi_config = {
        .sta = {
            .threshold.authmode = WIFI_AUTH_WPA2_PSK,
        },
    };
    
    strcpy((char*)wifi_config.sta.ssid, config->wifi_ssid);
    strcpy((char*)wifi_config.sta.password, config->wifi_password);
    
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config));
    ESP_ERROR_CHECK(esp_wifi_start());
    
    return KRYON_SUCCESS;
}
```

## Resource-Constrained Optimizations

### Memory Management

```c
// Ultra-efficient memory management for embedded systems
#define KRYON_MEMORY_POOL_SIZE 8192  // 8KB memory pool

static uint8_t memory_pool[KRYON_MEMORY_POOL_SIZE];
static uint16_t memory_pool_offset = 0;
static bool memory_pool_initialized = false;

// Stack-based allocator (no free, reset on frame)
void* kryon_embedded_alloc(size_t size) {
    // Align to 4-byte boundary
    size = (size + 3) & ~3;
    
    if (memory_pool_offset + size > KRYON_MEMORY_POOL_SIZE) {
        // Out of memory - reset pool (frame-based allocation)
        memory_pool_offset = 0;
    }
    
    void* ptr = &memory_pool[memory_pool_offset];
    memory_pool_offset += size;
    
    return ptr;
}

// Reset memory pool (called each frame)
void kryon_embedded_memory_reset(void) {
    memory_pool_offset = 0;
}

// String interning for memory efficiency
#define KRYON_MAX_STRINGS 32
#define KRYON_STRING_POOL_SIZE 512

static char string_pool[KRYON_STRING_POOL_SIZE];
static uint16_t string_offsets[KRYON_MAX_STRINGS];
static uint8_t string_count = 0;
static uint16_t string_pool_offset = 0;

uint8_t kryon_intern_string(const char* str) {
    uint8_t len = strlen(str);
    
    // Check if string already exists
    for (uint8_t i = 0; i < string_count; i++) {
        if (strcmp(&string_pool[string_offsets[i]], str) == 0) {
            return i;
        }
    }
    
    // Add new string
    if (string_count < KRYON_MAX_STRINGS && 
        string_pool_offset + len + 1 < KRYON_STRING_POOL_SIZE) {
        
        string_offsets[string_count] = string_pool_offset;
        strcpy(&string_pool[string_pool_offset], str);
        string_pool_offset += len + 1;
        
        return string_count++;
    }
    
    return 0xFF; // Error: no space
}

const char* kryon_get_string(uint8_t index) {
    if (index < string_count) {
        return &string_pool[string_offsets[index]];
    }
    return "";
}
```

### Efficient Rendering

```c
// Lightweight rendering system
typedef struct kryon_embedded_renderer {
    uint16_t* framebuffer;
    uint16_t width;
    uint16_t height;
    uint16_t dirty_x1, dirty_y1;
    uint16_t dirty_x2, dirty_y2;
    bool dirty;
} kryon_embedded_renderer_t;

static kryon_embedded_renderer_t renderer = {
    .framebuffer = framebuffer,
    .width = 240,
    .height = 320,
    .dirty = false
};

// Mark region as dirty for partial updates
void kryon_mark_dirty(uint16_t x1, uint16_t y1, uint16_t x2, uint16_t y2) {
    if (!renderer.dirty) {
        renderer.dirty_x1 = x1;
        renderer.dirty_y1 = y1;
        renderer.dirty_x2 = x2;
        renderer.dirty_y2 = y2;
        renderer.dirty = true;
    } else {
        // Expand dirty region
        if (x1 < renderer.dirty_x1) renderer.dirty_x1 = x1;
        if (y1 < renderer.dirty_y1) renderer.dirty_y1 = y1;
        if (x2 > renderer.dirty_x2) renderer.dirty_x2 = x2;
        if (y2 > renderer.dirty_y2) renderer.dirty_y2 = y2;
    }
}

// Efficient rectangle drawing
void kryon_draw_rect(uint16_t x, uint16_t y, uint16_t w, uint16_t h, uint16_t color) {
    if (x >= renderer.width || y >= renderer.height) return;
    
    // Clip to screen bounds
    if (x + w > renderer.width) w = renderer.width - x;
    if (y + h > renderer.height) h = renderer.height - y;
    
    // Draw rectangle
    for (uint16_t row = 0; row < h; row++) {
        uint16_t* line = &renderer.framebuffer[(y + row) * renderer.width + x];
        for (uint16_t col = 0; col < w; col++) {
            line[col] = color;
        }
    }
    
    kryon_mark_dirty(x, y, x + w, y + h);
}

// Bitmap font rendering (5x8 font)
static const uint8_t font_5x8[] = {
    0x00, 0x00, 0x00, 0x00, 0x00, // Space
    0x00, 0x00, 0x5F, 0x00, 0x00, // !
    0x00, 0x07, 0x00, 0x07, 0x00, // "
    0x14, 0x7F, 0x14, 0x7F, 0x14, // #
    // ... rest of font data
};

void kryon_draw_char(uint16_t x, uint16_t y, char c, uint16_t color) {
    if (c < 32 || c > 126) return;
    
    const uint8_t* char_data = &font_5x8[(c - 32) * 5];
    
    for (uint8_t col = 0; col < 5; col++) {
        uint8_t line = char_data[col];
        for (uint8_t row = 0; row < 8; row++) {
            if (line & (1 << row)) {
                if (x + col < renderer.width && y + row < renderer.height) {
                    renderer.framebuffer[(y + row) * renderer.width + (x + col)] = color;
                }
            }
        }
    }
    
    kryon_mark_dirty(x, y, x + 5, y + 8);
}

void kryon_draw_string(uint16_t x, uint16_t y, const char* str, uint16_t color) {
    while (*str) {
        kryon_draw_char(x, y, *str++, color);
        x += 6; // 5 pixels + 1 space
    }
}

// Efficient display update (only dirty regions)
void kryon_update_display(void) {
    if (!renderer.dirty) return;
    
    // Set display window
    kryon_display_set_window(renderer.dirty_x1, renderer.dirty_y1,
                           renderer.dirty_x2, renderer.dirty_y2);
    
    // Transfer only dirty region
    uint16_t width = renderer.dirty_x2 - renderer.dirty_x1;
    uint16_t height = renderer.dirty_y2 - renderer.dirty_y1;
    
    for (uint16_t row = 0; row < height; row++) {
        uint16_t* line = &renderer.framebuffer[(renderer.dirty_y1 + row) * 
                                             renderer.width + renderer.dirty_x1];
        kryon_display_write_pixels(line, width);
    }
    
    renderer.dirty = false;
}
```

### Power Management

```c
// Embedded power management
typedef enum {
    KRYON_POWER_ACTIVE,
    KRYON_POWER_IDLE,
    KRYON_POWER_SLEEP,
    KRYON_POWER_DEEP_SLEEP
} kryon_power_state_t;

typedef struct kryon_power_manager {
    kryon_power_state_t current_state;
    uint32_t idle_timeout_ms;
    uint32_t sleep_timeout_ms;
    uint32_t last_activity_time;
    bool activity_detected;
    
    // Power saving callbacks
    void (*enter_idle)(void);
    void (*exit_idle)(void);
    void (*enter_sleep)(void);
    void (*exit_sleep)(void);
} kryon_power_manager_t;

static kryon_power_manager_t power_manager = {
    .current_state = KRYON_POWER_ACTIVE,
    .idle_timeout_ms = 5000,    // 5 seconds
    .sleep_timeout_ms = 30000,  // 30 seconds
    .last_activity_time = 0,
    .activity_detected = false
};

void kryon_power_init(void (*enter_idle)(void), void (*exit_idle)(void),
                     void (*enter_sleep)(void), void (*exit_sleep)(void)) {
    power_manager.enter_idle = enter_idle;
    power_manager.exit_idle = exit_idle;
    power_manager.enter_sleep = enter_sleep;
    power_manager.exit_sleep = exit_sleep;
    power_manager.last_activity_time = kryon_get_time_ms();
}

void kryon_power_activity(void) {
    power_manager.activity_detected = true;
    power_manager.last_activity_time = kryon_get_time_ms();
    
    if (power_manager.current_state != KRYON_POWER_ACTIVE) {
        kryon_power_set_state(KRYON_POWER_ACTIVE);
    }
}

void kryon_power_update(void) {
    uint32_t now = kryon_get_time_ms();
    uint32_t idle_time = now - power_manager.last_activity_time;
    
    switch (power_manager.current_state) {
        case KRYON_POWER_ACTIVE:
            if (idle_time > power_manager.idle_timeout_ms) {
                kryon_power_set_state(KRYON_POWER_IDLE);
            }
            break;
            
        case KRYON_POWER_IDLE:
            if (power_manager.activity_detected) {
                kryon_power_set_state(KRYON_POWER_ACTIVE);
            } else if (idle_time > power_manager.sleep_timeout_ms) {
                kryon_power_set_state(KRYON_POWER_SLEEP);
            }
            break;
            
        case KRYON_POWER_SLEEP:
            if (power_manager.activity_detected) {
                kryon_power_set_state(KRYON_POWER_ACTIVE);
            }
            break;
            
        case KRYON_POWER_DEEP_SLEEP:
            // Only wake up from external interrupt
            break;
    }
    
    power_manager.activity_detected = false;
}

void kryon_power_set_state(kryon_power_state_t new_state) {
    if (new_state == power_manager.current_state) return;
    
    // Exit current state
    switch (power_manager.current_state) {
        case KRYON_POWER_IDLE:
            if (power_manager.exit_idle) power_manager.exit_idle();
            break;
        case KRYON_POWER_SLEEP:
            if (power_manager.exit_sleep) power_manager.exit_sleep();
            break;
        default:
            break;
    }
    
    // Enter new state
    switch (new_state) {
        case KRYON_POWER_IDLE:
            if (power_manager.enter_idle) power_manager.enter_idle();
            break;
        case KRYON_POWER_SLEEP:
            if (power_manager.enter_sleep) power_manager.enter_sleep();
            break;
        default:
            break;
    }
    
    power_manager.current_state = new_state;
}

// Platform-specific power management implementations
#ifdef STM32F4XX
void kryon_stm32_enter_idle(void) {
    // Reduce CPU frequency
    SystemClock_Config_LowPower();
    
    // Disable non-essential peripherals
    __HAL_RCC_GPIOC_CLK_DISABLE();
    __HAL_RCC_GPIOD_CLK_DISABLE();
}

void kryon_stm32_enter_sleep(void) {
    // Enter STOP mode
    HAL_PWR_EnterSTOPMode(PWR_LOWPOWERREGULATOR_ON, PWR_STOPENTRY_WFI);
}
#endif

#ifdef ESP32
void kryon_esp32_enter_idle(void) {
    // Reduce CPU frequency
    esp_pm_config_esp32_t pm_config = {
        .max_freq_mhz = 80,
        .min_freq_mhz = 10,
        .light_sleep_enable = true
    };
    esp_pm_configure(&pm_config);
}

void kryon_esp32_enter_sleep(void) {
    // Configure wake up source
    esp_sleep_enable_timer_wakeup(1000000); // 1 second
    esp_light_sleep_start();
}
#endif
```

## Real-Time System Integration

### RTOS Integration

```c
// FreeRTOS integration example
#include "FreeRTOS.h"
#include "task.h"
#include "queue.h"
#include "semphr.h"

// Task handles
static TaskHandle_t kryon_ui_task_handle = NULL;
static TaskHandle_t kryon_input_task_handle = NULL;
static TaskHandle_t kryon_update_task_handle = NULL;

// Inter-task communication
static QueueHandle_t input_event_queue = NULL;
static SemaphoreHandle_t framebuffer_mutex = NULL;

// Input event structure
typedef struct kryon_input_event {
    uint8_t type;        // Button press, release, etc.
    uint8_t button_id;   // Which button
    uint32_t timestamp;  // When it happened
} kryon_input_event_t;

// Initialize RTOS integration
kryon_result_t kryon_rtos_init(void) {
    // Create input event queue
    input_event_queue = xQueueCreate(10, sizeof(kryon_input_event_t));
    if (!input_event_queue) return KRYON_ERROR_OUT_OF_MEMORY;
    
    // Create framebuffer mutex
    framebuffer_mutex = xSemaphoreCreateMutex();
    if (!framebuffer_mutex) return KRYON_ERROR_OUT_OF_MEMORY;
    
    // Create tasks
    BaseType_t result;
    
    result = xTaskCreate(kryon_ui_task, "UI", 2048, NULL, 3, &kryon_ui_task_handle);
    if (result != pdPASS) return KRYON_ERROR_TASK_CREATE_FAILED;
    
    result = xTaskCreate(kryon_input_task, "Input", 1024, NULL, 4, &kryon_input_task_handle);
    if (result != pdPASS) return KRYON_ERROR_TASK_CREATE_FAILED;
    
    result = xTaskCreate(kryon_update_task, "Update", 1024, NULL, 2, &kryon_update_task_handle);
    if (result != pdPASS) return KRYON_ERROR_TASK_CREATE_FAILED;
    
    return KRYON_SUCCESS;
}

// UI rendering task (highest priority for smooth display)
void kryon_ui_task(void* pvParameters) {
    TickType_t last_wake_time = xTaskGetTickCount();
    const TickType_t frequency = pdMS_TO_TICKS(16); // ~60 FPS
    
    while (1) {
        // Take framebuffer mutex
        if (xSemaphoreTake(framebuffer_mutex, portMAX_DELAY) == pdTRUE) {
            // Render UI elements
            kryon_embedded_render();
            
            // Update display
            kryon_update_display();
            
            // Release framebuffer mutex
            xSemaphoreGive(framebuffer_mutex);
        }
        
        // Wait for next frame
        vTaskDelayUntil(&last_wake_time, frequency);
    }
}

// Input handling task (high priority for responsiveness)
void kryon_input_task(void* pvParameters) {
    kryon_input_event_t event;
    static uint8_t last_button_state = 0;
    
    while (1) {
        // Read button state
        uint8_t current_state = kryon_read_buttons(NULL);
        uint8_t changed = current_state ^ last_button_state;
        
        // Send events for changed buttons
        for (uint8_t i = 0; i < 8; i++) {
            if (changed & (1 << i)) {
                event.type = (current_state & (1 << i)) ? 
                            KRYON_INPUT_BUTTON_PRESS : KRYON_INPUT_BUTTON_RELEASE;
                event.button_id = i;
                event.timestamp = xTaskGetTickCount();
                
                xQueueSend(input_event_queue, &event, 0);
            }
        }
        
        last_button_state = current_state;
        
        // Register activity for power management
        if (changed) {
            kryon_power_activity();
        }
        
        vTaskDelay(pdMS_TO_TICKS(10)); // 100 Hz input polling
    }
}

// Application update task (lower priority)
void kryon_update_task(void* pvParameters) {
    kryon_input_event_t event;
    
    while (1) {
        // Process input events
        while (xQueueReceive(input_event_queue, &event, 0) == pdTRUE) {
            kryon_handle_input_event(&event);
        }
        
        // Take framebuffer mutex for UI updates
        if (xSemaphoreTake(framebuffer_mutex, portMAX_DELAY) == pdTRUE) {
            // Update application logic
            kryon_embedded_update();
            
            // Release framebuffer mutex
            xSemaphoreGive(framebuffer_mutex);
        }
        
        // Update power management
        kryon_power_update();
        
        vTaskDelay(pdMS_TO_TICKS(20)); // 50 Hz update rate
    }
}

// Interrupt-safe input event posting
void kryon_post_input_event_from_isr(uint8_t type, uint8_t button_id) {
    kryon_input_event_t event = {
        .type = type,
        .button_id = button_id,
        .timestamp = xTaskGetTickCountFromISR()
    };
    
    BaseType_t higher_priority_task_woken = pdFALSE;
    xQueueSendFromISR(input_event_queue, &event, &higher_priority_task_woken);
    portYIELD_FROM_ISR(higher_priority_task_woken);
}
```

### Interrupt-Driven Input

```c
// Interrupt-driven input handling for better responsiveness
#ifdef STM32F4XX

// GPIO interrupt configuration
void kryon_setup_gpio_interrupts(void) {
    GPIO_InitTypeDef GPIO_InitStruct = {0};
    
    // Configure button pins for interrupt
    __HAL_RCC_GPIOA_CLK_ENABLE();
    
    GPIO_InitStruct.Pin = GPIO_PIN_0 | GPIO_PIN_1 | GPIO_PIN_2 | GPIO_PIN_3;
    GPIO_InitStruct.Mode = GPIO_MODE_IT_FALLING;  // Interrupt on falling edge
    GPIO_InitStruct.Pull = GPIO_PULLUP;
    HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);
    
    // Enable EXTI interrupts
    HAL_NVIC_SetPriority(EXTI0_IRQn, 5, 0);
    HAL_NVIC_EnableIRQ(EXTI0_IRQn);
    HAL_NVIC_SetPriority(EXTI1_IRQn, 5, 0);
    HAL_NVIC_EnableIRQ(EXTI1_IRQn);
    HAL_NVIC_SetPriority(EXTI2_IRQn, 5, 0);
    HAL_NVIC_EnableIRQ(EXTI2_IRQn);
    HAL_NVIC_SetPriority(EXTI3_IRQn, 5, 0);
    HAL_NVIC_EnableIRQ(EXTI3_IRQn);
}

// GPIO interrupt handlers
void EXTI0_IRQHandler(void) {
    HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_0);
}

void EXTI1_IRQHandler(void) {
    HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_1);
}

void EXTI2_IRQHandler(void) {
    HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_2);
}

void EXTI3_IRQHandler(void) {
    HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_3);
}

// Common EXTI callback
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    uint8_t button_id = 0;
    
    switch (GPIO_Pin) {
        case GPIO_PIN_0: button_id = 0; break;
        case GPIO_PIN_1: button_id = 1; break;
        case GPIO_PIN_2: button_id = 2; break;
        case GPIO_PIN_3: button_id = 3; break;
        default: return;
    }
    
    // Post event to queue from ISR
    kryon_post_input_event_from_isr(KRYON_INPUT_BUTTON_PRESS, button_id);
}

#endif // STM32F4XX
```

## IoT and Connectivity

### WiFi Integration

```c
// WiFi connectivity for IoT applications
typedef struct kryon_iot_config {
    char device_id[32];
    char mqtt_server[64];
    uint16_t mqtt_port;
    char mqtt_username[32];
    char mqtt_password[32];
    char firmware_update_url[128];
} kryon_iot_config_t;

// IoT message structure
typedef struct kryon_iot_message {
    char topic[64];
    char payload[128];
    uint8_t qos;
} kryon_iot_message_t;

// Initialize IoT connectivity
kryon_result_t kryon_iot_init(const kryon_iot_config_t* config) {
    // Connect to WiFi (already done in ESP32 init)
    
    // Initialize MQTT client
    esp_mqtt_client_config_t mqtt_cfg = {
        .uri = config->mqtt_server,
        .port = config->mqtt_port,
        .username = config->mqtt_username,
        .password = config->mqtt_password,
        .client_id = config->device_id
    };
    
    esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(client);
    
    return KRYON_SUCCESS;
}

// MQTT event handler
static void mqtt_event_handler(void *handler_args, esp_event_base_t base, 
                              int32_t event_id, void *event_data) {
    esp_mqtt_event_handle_t event = event_data;
    
    switch ((esp_mqtt_event_id_t)event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI("MQTT", "Connected to broker");
            // Subscribe to control topics
            esp_mqtt_client_subscribe(event->client, "device/control", 1);
            esp_mqtt_client_subscribe(event->client, "device/config", 1);
            break;
            
        case MQTT_EVENT_DATA:
            ESP_LOGI("MQTT", "Received: %.*s", event->data_len, event->data);
            kryon_handle_iot_message(event->topic, event->data, event->data_len);
            break;
            
        case MQTT_EVENT_ERROR:
            ESP_LOGE("MQTT", "Connection error");
            break;
            
        default:
            break;
    }
}

// Handle incoming IoT messages
void kryon_handle_iot_message(const char* topic, const char* data, int len) {
    if (strncmp(topic, "device/control", 14) == 0) {
        // Parse control commands
        if (strncmp(data, "display_on", 10) == 0) {
            kryon_display_enable(true);
        } else if (strncmp(data, "display_off", 11) == 0) {
            kryon_display_enable(false);
        } else if (strncmp(data, "restart", 7) == 0) {
            esp_restart();
        }
    } else if (strncmp(topic, "device/config", 13) == 0) {
        // Parse configuration updates
        cJSON *json = cJSON_ParseWithLength(data, len);
        if (json) {
            kryon_update_config_from_json(json);
            cJSON_Delete(json);
        }
    }
}

// Send telemetry data
void kryon_send_telemetry(void) {
    static uint32_t last_send = 0;
    uint32_t now = esp_timer_get_time() / 1000;
    
    if (now - last_send < 30000) return; // Send every 30 seconds
    last_send = now;
    
    // Collect system information
    cJSON *telemetry = cJSON_CreateObject();
    cJSON_AddNumberToObject(telemetry, "uptime", now);
    cJSON_AddNumberToObject(telemetry, "free_heap", esp_get_free_heap_size());
    cJSON_AddNumberToObject(telemetry, "min_free_heap", esp_get_minimum_free_heap_size());
    cJSON_AddNumberToObject(telemetry, "cpu_freq", esp_clk_cpu_freq() / 1000000);
    
    // Add application-specific data
    cJSON_AddNumberToObject(telemetry, "button_presses", kryon_get_button_press_count());
    cJSON_AddBoolToObject(telemetry, "display_active", kryon_is_display_active());
    
    char *json_string = cJSON_Print(telemetry);
    if (json_string) {
        esp_mqtt_client_publish(mqtt_client, "device/telemetry", json_string, 0, 1, 0);
        free(json_string);
    }
    
    cJSON_Delete(telemetry);
}
```

### Over-The-Air Updates

```c
// OTA firmware update system
#include "esp_ota_ops.h"
#include "esp_https_ota.h"

typedef struct kryon_ota_config {
    char update_url[128];
    char version_check_url[128];
    char current_version[16];
    bool auto_update;
} kryon_ota_config_t;

// Check for firmware updates
kryon_result_t kryon_check_for_updates(const kryon_ota_config_t* config) {
    esp_http_client_config_t http_config = {
        .url = config->version_check_url,
        .timeout_ms = 10000,
    };
    
    esp_http_client_handle_t client = esp_http_client_init(&http_config);
    esp_err_t err = esp_http_client_open(client, 0);
    
    if (err != ESP_OK) {
        esp_http_client_cleanup(client);
        return KRYON_ERROR_NETWORK_FAILED;
    }
    
    int content_length = esp_http_client_fetch_headers(client);
    if (content_length <= 0) {
        esp_http_client_cleanup(client);
        return KRYON_ERROR_NO_DATA;
    }
    
    char version_buffer[32];
    int data_read = esp_http_client_read_response(client, version_buffer, sizeof(version_buffer) - 1);
    version_buffer[data_read] = '\0';
    
    esp_http_client_cleanup(client);
    
    // Compare versions
    if (strcmp(version_buffer, config->current_version) != 0) {
        ESP_LOGI("OTA", "New version available: %s", version_buffer);
        
        if (config->auto_update) {
            return kryon_perform_ota_update(config);
        }
        
        return KRYON_SUCCESS; // Update available but not auto-updating
    }
    
    return KRYON_ERROR_NO_UPDATE; // No update needed
}

// Perform OTA update
kryon_result_t kryon_perform_ota_update(const kryon_ota_config_t* config) {
    ESP_LOGI("OTA", "Starting OTA update from %s", config->update_url);
    
    // Show update progress on display
    kryon_show_update_screen();
    
    esp_https_ota_config_t ota_config = {
        .http_config = {
            .url = config->update_url,
            .timeout_ms = 30000,
        }
    };
    
    esp_https_ota_handle_t https_ota_handle = NULL;
    esp_err_t err = esp_https_ota_begin(&ota_config, &https_ota_handle);
    
    if (err != ESP_OK) {
        ESP_LOGE("OTA", "Failed to begin OTA update");
        kryon_show_update_error("Failed to start update");
        return KRYON_ERROR_OTA_FAILED;
    }
    
    // Download and install update
    while (1) {
        err = esp_https_ota_perform(https_ota_handle);
        if (err != ESP_ERR_HTTPS_OTA_IN_PROGRESS) {
            break;
        }
        
        // Update progress display
        int progress = esp_https_ota_get_image_len_read(https_ota_handle) * 100 / 
                      esp_https_ota_get_image_size(https_ota_handle);
        kryon_update_progress(progress);
        
        vTaskDelay(pdMS_TO_TICKS(100));
    }
    
    if (err == ESP_OK) {
        err = esp_https_ota_finish(https_ota_handle);
        if (err == ESP_OK) {
            ESP_LOGI("OTA", "OTA update successful, restarting...");
            kryon_show_update_success();
            vTaskDelay(pdMS_TO_TICKS(2000));
            esp_restart();
        }
    }
    
    ESP_LOGE("OTA", "OTA update failed");
    kryon_show_update_error("Update failed");
    esp_https_ota_abort(https_ota_handle);
    
    return KRYON_ERROR_OTA_FAILED;
}

// Update progress display
void kryon_show_update_screen(void) {
    kryon_draw_rect(0, 0, 240, 320, 0x0000); // Clear screen
    kryon_draw_string(80, 100, "Updating...", 0xFFFF);
    kryon_draw_rect(40, 150, 160, 20, 0x3186); // Progress bar background
    kryon_update_display();
}

void kryon_update_progress(int percent) {
    // Update progress bar
    int width = (160 * percent) / 100;
    kryon_draw_rect(40, 150, width, 20, 0x07E0); // Green progress
    
    // Update percentage text
    char percent_str[8];
    snprintf(percent_str, sizeof(percent_str), "%d%%", percent);
    kryon_draw_string(110, 180, percent_str, 0xFFFF);
    
    kryon_update_display();
}
```

## Deployment and Manufacturing

### Flash Memory Layout

```
Embedded Flash Layout:
├── Bootloader (32KB)
│   ├── Primary bootloader
│   ├── Secondary bootloader (OTA)
│   └── Recovery bootloader
├── Application (256KB)
│   ├── Kryon runtime
│   ├── Application code
│   ├── KRB file
│   └── Assets (fonts, images)
├── Configuration (16KB)
│   ├── Device configuration
│   ├── WiFi credentials
│   ├── Calibration data
│   └── User preferences
├── File System (128KB)
│   ├── Logs
│   ├── User data
│   ├── Temporary files
│   └── Cache
└── OTA Partition (256KB)
    ├── Update staging area
    └── Backup partition
```

### Build System Integration

```makefile
# Makefile for embedded Kryon application
PROJECT_NAME := kryon_embedded_app

# Toolchain configuration
CROSS_COMPILE ?= arm-none-eabi-
CC := $(CROSS_COMPILE)gcc
OBJCOPY := $(CROSS_COMPILE)objcopy
SIZE := $(CROSS_COMPILE)size

# Compiler flags
CFLAGS := -mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16
CFLAGS += -Os -g3 -Wall -Wextra -Werror
CFLAGS += -DSTM32F407xx -DUSE_HAL_DRIVER
CFLAGS += -DKRYON_EMBEDDED -DKRYON_MAX_ELEMENTS=64

# Include paths
INCLUDES := -Isrc -Ilib/kryon/include -Ilib/stm32/include -Ilib/cmsis/include

# Source files
SOURCES := src/main.c src/kryon_embedded.c src/display.c src/input.c
SOURCES += lib/kryon/kryon_runtime.c lib/stm32/system_stm32f4xx.c
SOURCES += lib/stm32/stm32f4xx_hal.c

# Linker script
LDSCRIPT := STM32F407VGTx_FLASH.ld
LDFLAGS := -T$(LDSCRIPT) -Wl,--gc-sections -Wl,--print-memory-usage

# Build targets
all: $(PROJECT_NAME).bin $(PROJECT_NAME).hex

# Compile KRY to KRB
app.krb: src/app.kry
	kryc src/app.kry --target=embedded --platform=stm32 --optimize=size -o app.krb

# Embed KRB in object file
app_krb.o: app.krb
	$(OBJCOPY) -I binary -O elf32-littlearm -B arm --rename-section .data=.rodata,alloc,load,readonly,data,contents app.krb app_krb.o

# Compile sources
%.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

# Link application
$(PROJECT_NAME).elf: $(SOURCES:.c=.o) app_krb.o
	$(CC) $(CFLAGS) $(LDFLAGS) $^ -o $@
	$(SIZE) $@

# Generate binary
$(PROJECT_NAME).bin: $(PROJECT_NAME).elf
	$(OBJCOPY) -O binary $< $@

# Generate hex
$(PROJECT_NAME).hex: $(PROJECT_NAME).elf
	$(OBJCOPY) -O ihex $< $@

# Flash to device
flash: $(PROJECT_NAME).bin
	st-flash write $(PROJECT_NAME).bin 0x8000000

# Debug target
debug: $(PROJECT_NAME).elf
	arm-none-eabi-gdb -ex "target remote localhost:3333" -ex "load" -ex "monitor reset halt" $

# Clean build artifacts
clean:
	rm -f $(SOURCES:.c=.o) app_krb.o app.krb $(PROJECT_NAME).elf $(PROJECT_NAME).bin $(PROJECT_NAME).hex

.PHONY: all flash debug clean
```

### Production Testing

```c
// Production test suite for embedded devices
typedef struct kryon_test_result {
    bool display_test;
    bool input_test;
    bool memory_test;
    bool flash_test;
    bool rtc_test;
    bool power_test;
    uint32_t test_timestamp;
} kryon_test_result_t;

// Run production tests
kryon_test_result_t kryon_run_production_tests(void) {
    kryon_test_result_t results = {0};
    results.test_timestamp = kryon_get_time_ms();
    
    // Display test
    results.display_test = kryon_test_display();
    
    // Input test
    results.input_test = kryon_test_input();
    
    // Memory test
    results.memory_test = kryon_test_memory();
    
    // Flash test
    results.flash_test = kryon_test_flash();
    
    // RTC test
    results.rtc_test = kryon_test_rtc();
    
    // Power consumption test
    results.power_test = kryon_test_power();
    
    // Store test results in flash
    kryon_store_test_results(&results);
    
    return results;
}

// Display functionality test
bool kryon_test_display(void) {
    // Test pattern generation
    const uint16_t test_colors[] = {0xF800, 0x07E0, 0x001F, 0xFFFF, 0x0000}; // R,G,B,W,K
    
    for (int i = 0; i < 5; i++) {
        // Fill screen with test color
        kryon_draw_rect(0, 0, 240, 320, test_colors[i]);
        kryon_update_display();
        HAL_Delay(500);
        
        // Check for display update completion
        if (!kryon_display_ready()) {
            return false;
        }
    }
    
    // Test pixel accuracy
    for (int x = 0; x < 240; x += 10) {
        for (int y = 0; y < 320; y += 10) {
            kryon_draw_rect(x, y, 1, 1, 0xFFFF);
        }
    }
    kryon_update_display();
    HAL_Delay(1000);
    
    return true;
}

// Input system test
bool kryon_test_input(void) {
    uint32_t start_time = HAL_GetTick();
    uint8_t buttons_tested = 0;
    uint8_t required_buttons = 0x0F; // First 4 buttons
    
    // Display test instructions
    kryon_draw_rect(0, 0, 240, 320, 0x0000);
    kryon_draw_string(50, 100, "Press all buttons", 0xFFFF);
    kryon_draw_string(70, 120, "within 10 seconds", 0xFFFF);
    kryon_update_display();
    
    while ((HAL_GetTick() - start_time) < 10000) { // 10 second timeout
        uint8_t current_buttons = kryon_read_buttons(NULL);
        buttons_tested |= current_buttons;
        
        // Show button status
        char status[16];
        snprintf(status, sizeof(status), "Buttons: %02X", buttons_tested);
        kryon_draw_rect(0, 140, 240, 20, 0x0000);
        kryon_draw_string(70, 150, status, 0xFFFF);
        kryon_update_display();
        
        if ((buttons_tested & required_buttons) == required_buttons) {
            return true;
        }
        
        HAL_Delay(50);
    }
    
    return false; // Timeout or not all buttons pressed
}

// Memory integrity test
bool kryon_test_memory(void) {
    // Test pattern
    const uint32_t test_pattern = 0xA5A5A5A5;
    const uint32_t inv_pattern = 0x5A5A5A5A;
    
    // Test RAM
    volatile uint32_t* ram_start = (volatile uint32_t*)0x20000000;
    volatile uint32_t* ram_end = (volatile uint32_t*)0x20020000; // 128KB
    
    // Write test pattern
    for (volatile uint32_t* addr = ram_start; addr < ram_end; addr++) {
        *addr = test_pattern;
    }
    
    // Verify test pattern
    for (volatile uint32_t* addr = ram_start; addr < ram_end; addr++) {
        if (*addr != test_pattern) {
            return false;
        }
    }
    
    // Write inverted pattern
    for (volatile uint32_t* addr = ram_start; addr < ram_end; addr++) {
        *addr = inv_pattern;
    }
    
    // Verify inverted pattern
    for (volatile uint32_t* addr = ram_start; addr < ram_end; addr++) {
        if (*addr != inv_pattern) {
            return false;
        }
    }
    
    return true;
}

// Store test results in flash
void kryon_store_test_results(const kryon_test_result_t* results) {
    // Calculate storage address (last sector of flash)
    uint32_t storage_addr = 0x08060000; // STM32F407 sector 7
    
    // Unlock flash
    HAL_FLASH_Unlock();
    
    // Erase sector
    FLASH_EraseInitTypeDef erase_init = {
        .TypeErase = FLASH_TYPEERASE_SECTORS,
        .Sector = FLASH_SECTOR_7,
        .NbSectors = 1,
        .VoltageRange = FLASH_VOLTAGE_RANGE_3
    };
    
    uint32_t sector_error;
    HAL_FLASHEx_Erase(&erase_init, &sector_error);
    
    // Write test results
    uint32_t* data = (uint32_t*)results;
    for (int i = 0; i < sizeof(kryon_test_result_t) / 4; i++) {
        HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, storage_addr + (i * 4), data[i]);
    }
    
    // Lock flash
    HAL_FLASH_Lock();
}
```

## Best Practices

### 1. Memory Optimization

```c
// Memory-efficient coding practices
// Use const for read-only data to store in flash
const uint8_t kryon_font_data[] PROGMEM = {
    // Font data stored in flash, not RAM
};

// Use packed structures to save memory
#pragma pack(1)
typedef struct {
    uint8_t type;
    uint16_t x, y;
    uint8_t flags;
} compact_element_t;
#pragma pack()

// Use bit fields for boolean flags
typedef struct {
    uint8_t visible : 1;
    uint8_t enabled : 1;
    uint8_t focused : 1;
    uint8_t dirty : 1;
    uint8_t reserved : 4;
} element_flags_t;

// Use enums instead of defines for better debugging
typedef enum {
    ELEMENT_BUTTON = 1,
    ELEMENT_TEXT = 2,
    ELEMENT_IMAGE = 3
} element_type_t;
```

### 2. Power Efficiency

```c
// Power-efficient practices
void kryon_optimize_for_battery(void) {
    // Use lowest possible CPU frequency
    SystemClock_Config_LowPower();
    
    // Disable unused peripherals
    __HAL_RCC_GPIOF_CLK_DISABLE();
    __HAL_RCC_GPIOG_CLK_DISABLE();
    
    // Use DMA for data transfers
    kryon_enable_dma_transfers();
    
    // Implement display sleep mode
    kryon_display_sleep_mode(true);
    
    // Use event-driven updates instead of polling
    kryon_enable_interrupt_driven_updates();
}
```

### 3. Real-Time Considerations

```c
// Real-time system guidelines
void kryon_ensure_real_time_performance(void) {
    // Use interrupt priorities correctly
    NVIC_SetPriority(SysTick_IRQn, 0);     // Highest priority
    NVIC_SetPriority(EXTI0_IRQn, 1);       // Input interrupts
    NVIC_SetPriority(DMA1_Stream0_IRQn, 2); // Display DMA
    
    // Keep ISRs short
    // Do minimal work in interrupts, defer to tasks
    
    // Use deterministic algorithms
    // Avoid variable-time operations in critical paths
    
    // Implement watchdog for reliability
    IWDG_Init();
}
```

### 4. Testing and Validation

```c
// Comprehensive testing approach
void kryon_run_self_tests(void) {
    // Test critical systems on startup
    assert(kryon_test_memory());
    assert(kryon_test_display());
    assert(kryon_test_input());
    
    // Monitor for errors during operation
    kryon_enable_error_monitoring();
    
    // Implement graceful degradation
    if (!kryon_test_wifi()) {
        kryon_disable_iot_features();
        kryon_log_warning("WiFi unavailable, IoT features disabled");
    }
}

// Error monitoring and reporting
void kryon_monitor_system_health(void) {
    // Check stack usage
    uint32_t stack_usage = kryon_get_stack_usage();
    if (stack_usage > 80) {
        kryon_log_warning("High stack usage: %d%%", stack_usage);
    }
    
    // Check heap fragmentation
    uint32_t free_heap = xPortGetFreeHeapSize();
    uint32_t min_heap = xPortGetMinimumEverFreeHeapSize();
    if ((free_heap - min_heap) > 1024) {
        kryon_log_warning("Heap fragmentation detected");
    }
    
    // Monitor task execution times
    TaskStatus_t task_status;
    vTaskGetInfo(NULL, &task_status, pdTRUE, eInvalid);
    if (task_status.ulRunTimeCounter > MAX_TASK_RUNTIME) {
        kryon_log_error("Task runtime exceeded: %lu", task_status.ulRunTimeCounter);
    }
}
```

---

The Embedded Runtime enables Kryon applications to run on resource-constrained devices while maintaining essential UI functionality. By carefully managing memory, power, and processing resources, developers can create responsive, efficient embedded interfaces that operate reliably in demanding environments. The runtime's modular design allows for platform-specific optimizations while maintaining compatibility with the broader Kryon ecosystem.