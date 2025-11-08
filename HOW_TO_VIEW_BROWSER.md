# 🎥 Cómo Visualizar el Navegador en k6 Browser

Existen **3 formas** de ver qué está pasando durante la ejecución de los tests:

---

## 📸 Opción 1: Screenshots (Recomendado)

**✅ La más fácil y práctica**

```bash
./run-browser-test.sh
# o
./run-browser-test.sh screenshots
```

Los screenshots se guardan automáticamente en `screenshots/`:
- `01-home.png` - Página inicial
- `02-combobox-clicked.png` - Después de hacer clic en el combobox
- `03-text-filled.png` - Texto ingresado
- `04-suggestion-clicked.png` - Sugerencia seleccionada
- `05-results.png` - Resultados
- `99-error.png` - Si hay error

**Ver screenshots:**
```bash
open screenshots/
```

---

## 🖥️ Opción 2: Navegador Visible (macOS con XQuartz)

**Requiere configuración previa:**

### Paso 1: Instalar XQuartz
```bash
brew install --cask xquartz
```

### Paso 2: Configurar XQuartz
1. Abre XQuartz
2. Ve a `XQuartz → Preferences → Security`
3. Marca ✅ "Allow connections from network clients"
4. Cierra y vuelve a abrir XQuartz

### Paso 3: Permitir conexiones
```bash
xhost + 127.0.0.1
```

### Paso 4: Ejecutar con navegador visible
```bash
./run-browser-test.sh visible
```

El navegador Chromium se abrirá y verás la ejecución en tiempo real.

---

## 🎬 Opción 3: Grabar Video (Próximamente)

Puedes configurar k6 para grabar video del navegador:

```javascript
const context = await browser.newContext({
  recordVideo: {
    dir: 'videos/',
    size: { width: 1280, height: 720 }
  }
});
```

---

## 📋 Comparación de Opciones

| Característica | Screenshots | Navegador Visible | Video |
|----------------|-------------|-------------------|-------|
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Rendimiento** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Detalle** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **CI/CD** | ✅ Funciona | ❌ No funciona | ✅ Funciona |
| **Depuración** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🔍 Ver Screenshots Capturados

Los screenshots actuales muestran:

1. **01-home.png**: La página carga correctamente ✅
2. **02-combobox-clicked.png**: El combobox se abre correctamente ✅
3. **03-text-filled.png**: El texto se escribe correctamente ✅
4. **99-error.png**: El selector del botón de sugerencia no se encuentra ❌

**Próximo paso**: Inspeccionar `03-text-filled.png` para ver qué selectores usar para la sugerencia.

---

## 💡 Tips

### Para depurar selectores:
1. Ejecuta con screenshots
2. Revisa la imagen antes del error
3. Ajusta los selectores en el script
4. Vuelve a ejecutar

### Para CI/CD (GitHub Actions):
- ✅ Usa screenshots (ya está configurado)
- Los screenshots se pueden subir como artefactos

### Para desarrollo local:
- Usa navegador visible si necesitas depurar interacciones complejas
- Usa screenshots para verificación rápida

---

## 🛠️ Comandos Útiles

```bash
# Ver screenshots
open screenshots/

# Limpiar screenshots anteriores
rm screenshots/*.png

# Ejecutar headless (por defecto)
./run-browser-test.sh

# Ejecutar con navegador visible
./run-browser-test.sh visible

# Ver logs detallados
./run-browser-test.sh 2>&1 | tee test.log
```

---

## ✅ Estado Actual

Los screenshots muestran que:
- ✅ La página carga correctamente
- ✅ El combobox se encuentra y se clickea
- ✅ El texto se escribe correctamente
- ❌ El botón de sugerencia no aparece o tiene otro selector

**Solución**: Revisar `03-text-filled.png` para identificar el selector correcto del botón de sugerencia.
