# Playwright AI Agent - E2E Test Automation (Free AI Edition)

Automatización end-to-end para [SauceDemo](https://www.saucedemo.com) usando **Playwright** y **opencode**, un agente de IA de código abierto para terminal, conectado al sitio a través del **Model Context Protocol (MCP)**.

Este proyecto es una adaptación de [pw-agent-](https://github.com/dhruv-r3010/pw-agent-) que reemplaza Claude Code por **opencode + modelos gratuitos de OpenCode Zen**, demostrando que la generación de pruebas asistida por IA no requiere un motor de pago.

## Qué demuestra este proyecto

- **Exploración de UI guiada por IA** — opencode navega el sitio en vivo, descubre selectores (`data-test`) reales y documenta la estructura de la página.
- **Generación de casos de prueba por IA** — a partir de la exploración, el agente escribe planes de prueba en Markdown.
- **Generación de código de test por IA** — el agente convierte los planes en tests reales de Playwright.
- **Integración MCP** — el servidor MCP de Playwright le da al agente control directo del navegador.
- **Reportes con Allure** — resultados con severidad, pasos (`steps`) y agrupación por epic/feature/story.
- **Cobertura E2E** — login, catálogo de productos, carrito y checkout completo.

## Estructura del proyecto

```
.
├── tests/
│   └── login-checkout.spec.ts     # E2E: login → agregar al carrito → checkout → confirmación
├── specs/
│   ├── login-tests.md             # Escenarios de prueba para login
│   └── checkout-tests.md          # Escenarios de prueba para checkout
├── playwright.config.ts           # Configuración de Playwright (base URL, reporter, timeouts)
├── seed.spec.ts                   # Archivo semilla requerido por el generador de tests de Playwright
├── opencode.json                  # Configuración del agente y del servidor MCP
└── package.json
```

## Selectores clave descubiertos por la IA

| Elemento              | Selector                                        |
| ---------------------- | ------------------------------------------------ |
| Usuario                 | `[data-test="username"]`                         |
| Contraseña              | `[data-test="password"]`                         |
| Botón login              | `[data-test="login-button"]`                     |
| Agregar al carrito       | `[data-test="add-to-cart-sauce-labs-backpack"]`  |
| Ícono carrito            | `.shopping_cart_link`                            |
| Botón checkout           | `[data-test="checkout"]`                         |
| Nombre / Apellido / CP   | `[data-test="first-name"]`, `[data-test="last-name"]`, `[data-test="postal-code"]` |
| Continuar / Finalizar    | `[data-test="continue"]`, `[data-test="finish"]` |
| Mensaje de éxito         | `.complete-header`                               |

## Prerrequisitos

- Node.js 18+
- [opencode](https://opencode.ai) instalado (`curl -fsSL https://opencode.ai/install | bash`)
- Una cuenta gratuita en OpenCode Zen (sin tarjeta) para el motor de IA

## Instalación

```bash
npm install
npx playwright install chromium
```

## Configurar el agente de IA (gratis)

```bash
opencode auth login
# Selecciona OpenCode (Zen) y pega tu API key gratuita
```

El modelo por defecto se fija en `opencode.json`:

```json
{
  "$schema": "http://opencode.ai/config.json",
  "model": "opencode/deepseek-v4-flash-free",
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "playwright", "run-test-mcp-server"]
    }
  }
}
```

## Uso con opencode (agente de IA)

```bash
opencode
```

Prompt de ejemplo dentro de la sesión:

```
Usa el MCP playwright para navegar a https://www.saucedemo.com, iniciar
sesión con standard_user / secret_sauce, explorar el catálogo, el carrito
y el checkout, y generar specs/login-tests.md y specs/checkout-tests.md
con escenarios de prueba.
```

También se puede correr en un solo comando, sin la interfaz interactiva:

```bash
opencode run "Usa el MCP playwright para explorar saucedemo.com y generar specs/login-tests.md"
```

## Ejecutar las pruebas

```bash
# Todas las pruebas
npx playwright test

# Con navegador visible
npx playwright test --headed

# Modo UI de Playwright
npx playwright test --ui
```

## Reporte con Allure

```bash
npm run test:report
```

Genera y abre un reporte HTML con historial, severidad, pasos por test y evidencia (screenshots) de fallos.

## Stack técnico

- [Playwright](https://playwright.dev/) — automatización de navegador y test runner
- [opencode](https://opencode.ai/) — agente de IA de código abierto para terminal
- [OpenCode Zen](https://opencode.ai/docs/zen) — modelos de IA gratuitos (DeepSeek, MiMo, Qwen, entre otros)
- [Playwright MCP](https://playwright.dev/) — puente entre el agente de IA y el navegador
- [Allure Report](https://allurereport.org/) — reportes de ejecución

## Créditos

Basado en la arquitectura de [pw-agent-](https://github.com/dhruv-r3010/pw-agent-) de dhruv-r3010, adaptado para usar un motor de IA gratuito y un sitio de práctica de código abierto.

## Licencia

MIT
