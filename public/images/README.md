# Imágenes de la flota / Fleet Images

## TODO: reemplazar con fotos reales del Drive del cliente

Cada carpeta corresponde al `slug` del vehículo en `lib/fleet.ts`.

### Estructura esperada por vehículo

```
public/images/[slug]/
  exterior-1.jpg   ← foto principal (mínimo 800x600px)
  interior.jpg     ← interior del vehículo
  trunk.jpg        ← maletero / espacio de carga
```

### Vehículos

| Carpeta | Vehículo |
|---------|---------|
| `toyota-agya-2021/` | Toyota Agya 2021 |
| `suzuki-swift-2024/` | Suzuki Swift 2024 |
| `hyundai-venue-2021/` | Hyundai Venue 2021 |
| `suzuki-vitara-2024/` | Suzuki Vitara 2024 |
| `toyota-rush-2023/` | Toyota Rush 2023 |
| `hyundai-santa-fe-2018/` | Hyundai Santa Fe 2018 |

### Recomendaciones

- **Formato:** JPG o WebP
- **Resolución mínima:** 800 × 600 px
- **Aspecto exterior:** 16:9 o 4:3, vehículo en primer plano
- **Fondo:** limpio, sin elementos distractivos
- **Tamaño máximo:** 500 KB por imagen (usar https://squoosh.app para comprimir)

### Pasos para agregar las fotos

1. Descarga las fotos del Google Drive del cliente
2. Renombra los archivos exactamente como se indica arriba (`exterior-1.jpg`, `interior.jpg`, `trunk.jpg`)
3. Coloca cada foto en la carpeta del vehículo correspondiente
4. Ejecuta `npm run build` para verificar que todo compila correctamente
