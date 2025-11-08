# 📄 Configuración de GitHub Pages - Guía Rápida

## ✅ Ya configurado en el código

El workflow ya está listo para desplegar automáticamente a GitHub Pages. Solo necesitas **habilitar GitHub Pages en tu repositorio**.

---

## 🚀 Pasos para Habilitar GitHub Pages

### 1️⃣ Ve a la configuración de tu repositorio

Abre en tu navegador:
```
https://github.com/anbepa/k6-holisteek-starter-2/settings/pages
```

O manualmente:
1. Ve a tu repositorio: https://github.com/anbepa/k6-holisteek-starter-2
2. Click en **"Settings"** (⚙️)
3. En el menú lateral, busca **"Pages"**

---

### 2️⃣ Configurar Source

En la sección **"Build and deployment"**:

```
┌─────────────────────────────────────────────────┐
│ Source                                          │
│ ● Deploy from a branch                         │
│                                                 │
│ Branch                                          │
│ [gh-pages ▼]  [/(root) ▼]  [Save]             │
│      ↑                                          │
│      └── Selecciona "gh-pages"                 │
└─────────────────────────────────────────────────┘
```

**Importante:**
- Source: **Deploy from a branch**
- Branch: **gh-pages**
- Folder: **/ (root)**

---

### 3️⃣ Click en "Save"

Espera unos segundos y verás:

```
✅ Your site is live at https://anbepa.github.io/k6-holisteek-starter-2/
```

---

## 🧪 Probar que funciona

### Ejecutar un test:

1. Ve a **Actions**: https://github.com/anbepa/k6-holisteek-starter-2/actions

2. Click en el workflow **"k6 load + browser"**

3. Click en **"Run workflow"** (botón verde a la derecha)

4. Deja los valores por defecto y click **"Run workflow"**

5. Espera 1-2 minutos a que termine

6. Una vez completado, abre el reporte en:
   ```
   https://anbepa.github.io/k6-holisteek-starter-2/reports/[RUN_NUMBER]/report.html
   ```
   
   El `RUN_NUMBER` lo puedes ver en la lista de ejecuciones (ej: #1, #2, #3, etc.)

---

## 📊 Acceder a los Reportes

### Formato de URL:

```
https://anbepa.github.io/k6-holisteek-starter-2/reports/{RUN_NUMBER}/report.html
```

### Ejemplos:

- Ejecución #1: `https://anbepa.github.io/k6-holisteek-starter-2/reports/1/report.html`
- Ejecución #5: `https://anbepa.github.io/k6-holisteek-starter-2/reports/5/report.html`
- Ejecución #10: `https://anbepa.github.io/k6-holisteek-starter-2/reports/10/report.html`

### Encontrar el número de ejecución:

En la lista de Actions, verás algo como:
```
✅ k6 load + browser #12
   ↑
   └── Este es el run_number
```

---

## 🔍 Verificar que GitHub Pages está activo

Después de habilitar y ejecutar el primer test:

1. Ve a: https://github.com/anbepa/k6-holisteek-starter-2/settings/pages

2. Deberías ver:
   ```
   ✅ Your site is published at https://anbepa.github.io/k6-holisteek-starter-2/
   ```

3. También verás el historial de deployments:
   ```
   Latest deployment
   ✓ Deploy site • 2 minutes ago
   ```

---

## 📁 Estructura en GitHub Pages

Cada ejecución crea un directorio con su número:

```
https://anbepa.github.io/k6-holisteek-starter-2/
├── reports/
│   ├── 1/
│   │   └── report.html
│   ├── 2/
│   │   └── report.html
│   ├── 3/
│   │   └── report.html
│   └── ...
```

---

## 🎯 Características

### ✅ Lo que hace automáticamente:

1. **Genera reporte HTML** después de cada ejecución de test
2. **Despliega a GitHub Pages** automáticamente
3. **Mantiene histórico** de todas las ejecuciones
4. **Link directo** en comentarios de Pull Requests
5. **No requiere configuración** de InfluxDB/Grafana

### ✅ Lo que se eliminó (simplificación):

- ❌ InfluxDB (no necesario)
- ❌ Grafana (no necesario)
- ❌ Screenshots (no se generan ni suben)
- ❌ Artifacts de GitHub Actions (reemplazado por Pages)

---

## 🔧 Troubleshooting

### Error: "GitHub Pages is not enabled"

**Solución:** Ve a Settings → Pages y habilita la branch `gh-pages`

---

### Error: "gh-pages branch doesn't exist"

**Solución:** Ejecuta el workflow una vez. El workflow creará automáticamente la branch `gh-pages` en la primera ejecución.

---

### No veo el reporte después de ejecutar

**Pasos:**

1. Verifica que el workflow terminó exitosamente (✅ verde)
2. Ve a la pestaña "Actions" del workflow
3. Busca el step "📊 Desplegar reporte a GitHub Pages"
4. Debería mostrar: "Published successfully"
5. Espera 1-2 minutos para que GitHub Pages actualice
6. Abre la URL: `https://anbepa.github.io/k6-holisteek-starter-2/reports/{RUN_NUMBER}/report.html`

---

### Error 404 al abrir el reporte

**Verifica:**

1. Que el `RUN_NUMBER` sea correcto (míra en Actions)
2. Que GitHub Pages esté habilitado
3. Que la URL tenga el formato correcto
4. Espera 1-2 minutos después de la ejecución

---

## 📚 Recursos

- [Documentación de GitHub Pages](https://docs.github.com/es/pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [k6 HTML Reporter](https://github.com/benc-uk/k6-reporter)

---

## 🎉 Resumen

1. **Habilita GitHub Pages** en Settings → Pages → gh-pages branch
2. **Ejecuta el workflow** desde Actions
3. **Abre el reporte** en: `https://anbepa.github.io/k6-holisteek-starter-2/reports/{RUN_NUMBER}/report.html`
4. **¡Listo!** Cada ejecución genera un nuevo reporte automáticamente

**No necesitas configurar nada más. Todo es automático después de habilitar GitHub Pages.**
