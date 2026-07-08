# zamuro

Analizador público de sesgos y límites argumentativos. Pega un texto (un post,
un extracto periodístico, un comunicado) y recibe un análisis crítico, riguroso
y ecuánime del razonamiento que sostiene — no un veredicto sobre su tesis.

**Instrumento de lectura crítica, no un oráculo.** Sesgo ≠ falsedad.

## Los dos modos

| | Rápido | Profundo |
|---|---|---|
| Costo | gratis, para todos | la clave (y el costo) son del usuario |
| Motor | modelo cuantizado en el navegador ([WebLLM](https://github.com/mlc-ai/web-llm) sobre WebGPU) | API de Anthropic, llamada directa desde el navegador (BYOK) |
| Capas | 1–4 condensadas | las 7 completas |
| Verificación web | no | sí (herramienta `web_search` de Anthropic) |
| Requisitos | navegador con WebGPU (Chrome/Edge recientes) | una clave `sk-ant-…` |

Si no hay WebGPU, el modo Rápido ofrece un **analizador heurístico** por
patrones léxicos: mucho más tosco, sin criterio real, pero funciona en
cualquier dispositivo sin descarga.

Opcional: si hay clave presente, el modo Rápido puede enrutarse también por
Anthropic (modelo pequeño, sin búsqueda web) para mayor calidad.

## Sin backend

No hay servidor propio, ni funciones serverless, ni login, ni analítica. Es un
sitio estático: la clave del usuario vive solo en su navegador (en memoria por
defecto; `localStorage` solo si lo activa) y viaja únicamente en la llamada
directa a `https://api.anthropic.com/v1/messages`, habilitada por el header
`anthropic-dangerous-direct-browser-access: true`. Hay botón de borrado.

## Correr en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # genera dist/
npm run preview    # sirve dist/ para probar el build
```

## Desplegar en GitHub Pages

El build usa rutas relativas (`base: './'`), así que `dist/` funciona en
cualquier host estático sin configuración.

1. `npm run build`
2. Publica el contenido de `dist/` en la rama/carpeta que sirva Pages
   (Settings → Pages), o usa una action estándar:

```yaml
# .github/workflows/pages.yml (ejemplo mínimo)
name: pages
on: { push: { branches: [main] } }
permissions: { contents: read, pages: write, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
```

## El motor analítico

El núcleo intelectual vive en [`prompts/system-zamuro.md`](prompts/system-zamuro.md)
— un solo archivo editable con tres bloques delimitados:

- `CORE`: identidad, principios de integridad epistémica, reglas de salida.
- `FAST`: capas 1–4 condensadas para el modelo local.
- `DEEP`: las 7 capas con verificación web.

La app compone `CORE + FAST` o `CORE + DEEP` más una directiva de idioma
(ES/EN). Editar el `.md` cambia el análisis sin tocar código.

## Configuración

Todo lo editable está en [`src/config.js`](src/config.js): modelos (WebLLM y
Anthropic), versión de la herramienta de búsqueda web, `max_tokens`, y el
**límite de entrada** (280 caracteres por defecto, formato post de X — es una
sola constante, `maxInputChars`, si quieres analizar textos largos).

Modelos por defecto: `claude-opus-4-8` (Profundo; `claude-sonnet-5` es la
alternativa más barata), `claude-haiku-4-5` (Rápido vía API) y
`Llama-3.2-3B-Instruct-q4f16_1-MLC` (Rápido local).

## Notas sobre WebGPU y el modelo local

- WebGPU está disponible en Chrome/Edge de escritorio recientes (y detrás de
  flags o parcialmente en otros navegadores). La app lo detecta y avisa con
  gracia si falta.
- La primera vez, WebLLM descarga el modelo (~2 GB para el 3B) y lo cachea en
  el navegador (Cache API); las siguientes cargas son locales.
- Un modelo 3B cuantizado es un anticipo del método: puede simplificar u
  omitir. El informe lo declara en su nota de confianza.

## Manejo de la clave

- Solo se usa en el modo Profundo (y en el Rápido enrutado, si se activa).
- Por defecto vive en memoria (se pierde al cerrar la pestaña); persistirla en
  `localStorage` es opt-in explícito; el botón «borrar clave» limpia ambos.
- Nunca se transmite fuera de la llamada a `api.anthropic.com`.
- La búsqueda web tiene un costo adicional por búsqueda en la factura del
  usuario (hasta `webSearchMaxUses` búsquedas por análisis, 5 por defecto).

## Ejemplos de prueba

Tres ejemplos cargables desde la UI (`src/examples.js`), deliberadamente de
signos distintos para exhibir la ecuanimidad del método: un tuit ideológico,
un extracto periodístico y un comunicado institucional.

## Estructura

```
prompts/system-zamuro.md   ← el motor analítico (editable)
src/
  config.js                ← modelos y límites
  i18n.js                  ← interfaz ES/EN
  examples.js              ← ejemplos de prueba
  engine/
    prompt.js              ← compone system/user prompts desde el .md
    anthropic.js           ← BYOK: fetch directo + pause_turn + errores
    webllm.js              ← modelo local (WebGPU), carga diferida
    heuristic.js           ← respaldo léxico sin modelo
    parse.js               ← extracción segura de JSON + normalización + export
  components/              ← Analyzer, Report, Finding, KeyManager, About
```
