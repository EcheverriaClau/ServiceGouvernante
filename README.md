# Ménage Hotel — Sistema de Housekeeping

App web progresiva (PWA) para la gestión diaria de limpieza y ménage de un hotel. Instalable en celular, tablet y computadora. Funciona sin conexión a internet una vez instalada.

---

## Funcionalidades

- **Vista del hotel** por pisos con color por estado de limpieza
- **4 tipos de servicio**: Rest normal, Rest especial, Rest súper-especial, Depart normal
- **Avance automático de día**: actualiza el tipo de limpieza según las noches de estancia
- **Alertas visuales** para habitaciones de limpieza especial
- **Asignación de colaboradoras** por habitación
- **Búsqueda rápida** de habitación por número
- **Exportación PDF** del reporte diario (habitaciones, tipos, alertas, colaboradoras)
- **Persistencia local** de datos con `localStorage`
- **Código de acceso personalizable** para la Gouvernante
- **PWA instalable**: funciona como app nativa en cualquier dispositivo

---

## Estructura del hotel

| Piso         | Habitaciones                            | Total |
|--------------|-----------------------------------------|-------|
| Recepción RC | 001–008                                 | 8     |
| 1er Piso     | 100–113, 115                            | 15    |
| 2do Piso     | 200–213, 215                            | 15    |
| 3er Piso     | 300–311, 313, 315                       | 14    |
| 4to Piso     | 400–411, 413, 415                       | 14    |
| 5to Piso     | 500–511, 513, 515                       | 14    |

---

## Lógica de limpieza según noches de estancia

| Noches acumuladas | Tipo asignado         | Alerta |
|-------------------|-----------------------|--------|
| 1 noche           | Rest normal           | No     |
| 2 noches          | Rest especial         | Sí     |
| 3+ noches         | Rest súper-especial   | Sí     |
| Salida            | Depart normal         | No     |

---


## Cómo instalar la app en cada dispositivo

**iPhone / iPad:** Safari → botón compartir → "Agregar a pantalla de inicio"

**Android:** Chrome → menú (3 puntos) → "Agregar a pantalla de inicio"

**Computadora (Chrome/Edge):** ícono de instalación en la barra de direcciones, o menú → "Instalar aplicación"

---

## Tecnologías

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks)
- Progressive Web App (PWA) con Service Worker
- `localStorage` para persistencia de datos
- Exportación a PDF vía ventana de impresión del navegador
- Fuentes: Cormorant Garamond + DM Sans (Google Fonts)

---

## Licencia

Uso interno del Gouvernate de hotel. Todos los derechos reservados.
