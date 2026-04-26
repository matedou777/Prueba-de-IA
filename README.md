# 🎭 El Impostor — Juego social de mesa (web)

**El Impostor** es un juego social para grupos que se juega desde el navegador.  
Uno o más jugadores no conocen la palabra secreta y deben disimular para no ser descubiertos.

---

## 🚀 Demo rápida
Podés abrir `index.html` directamente en tu navegador.  
No requiere build.

Si querés usar la generación con IA (`/api/generate`), corré el proyecto en un entorno con soporte de funciones serverless (por ejemplo Vercel).

---

## ✨ Características

- 👥 Cantidad de jugadores configurable
- 🕵️ Cantidad de impostores configurable
- 📂 Selección múltiple de categorías
- 🧠 Pool combinado de palabras cuando elegís varias categorías
- ✏️ Gestión por categoría: ver palabras, agregar y eliminar
- ➕ Crear categorías personalizadas
- 🗑️ Eliminar categorías personalizadas
- 💾 Persistencia en `localStorage`
- 🎴 Revelado privado de rol/palabra por turnos
- 🥳 Pantalla final con anuncio de quién comienza + confetti
- 📱 Diseño responsive
- ⚡ Todo en un único `index.html` (incluye estilos inline)

---

## 🧩 Cómo jugar

1. Configurá jugadores e impostores.
2. Elegí una o varias categorías.
3. (Opcional) Gestioná palabras por categoría.
4. Tocá **“¡Comenzar partida!”**.
5. Cada jugador revela su carta en privado y pasa el dispositivo.
6. Al terminar, el juego anuncia quién empieza y luego muestra **“A JUGAR”**.

---

## 🛠️ Instalación

```bash
git clone <tu-repo>
cd Prueba-de-IA
```

Abrí `index.html` en el navegador.

---

## 🤖 Generación de categoría con IA (opcional)

La función serverless está en `api/generate.js`.

Para usarla en Vercel:

1. Crear variable de entorno `GEMINI_API_KEY`.
2. Deploy del proyecto.
3. Usar el bloque “Generar categoría con IA” desde la UI.

---

## 📁 Estructura

- `index.html`: app completa (HTML + CSS + JS).
- `api/generate.js`: endpoint para generar categorías con IA.

---

## 📌 Notas

- El juego guarda categorías y palabras en `localStorage` del navegador.
- Si limpiás datos del navegador, se pierde esa configuración local.
