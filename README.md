# FinanzApp - Personal Finance Management

Una aplicación moderna para gestionar tus finanzas personales con un diseño elegante y funcionalidades completas.

## Características

- 📊 **Dashboard interactivo** con gráficos y estadísticas
- 💰 **Gestión de ingresos y gastos** con categorización
- 📈 **Presupuestos** por categoría con seguimiento
- 🎯 **Metas financieras** con progreso visual
- 📋 **Reportes detallados** con análisis de tendencias
- 🎨 **Diseño moderno** con tema oscuro y UI/UX optimizada
- 📱 **Responsive** para todos los dispositivos

## Tecnologías

- **Frontend**: Astro + Tailwind CSS
- **Backend**: Astro API Routes
- **Base de datos**: Turso (SQLite en la nube)
- **Gráficos**: Chart.js

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar la base de datos Turso

#### Opción A: Usar Turso (Recomendado para producción)

1. Ve a [Turso Dashboard](https://dashboard.turso.tech)
2. Crea una nueva base de datos
3. Obtén tu URL y token de autenticación
4. Crea un archivo `.env` basado en `env.example`:

```bash
cp env.example .env
```

5. Edita `.env` con tus credenciales de Turso:

```env
TURSO_DATABASE_URL=libsql://your-database-name-your-username.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

#### Opción B: Base de datos local (Para desarrollo)

```env
TURSO_DATABASE_URL=file:./local.db
TURSO_AUTH_TOKEN=
```

### 3. Inicializar la base de datos

```bash
npm run db:init
```

### 4. Poblar con datos de ejemplo (opcional)

```bash
npm run seed
```

### 5. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Sidebar.astro   # Barra lateral de navegación
│   ├── Card.astro      # Componente de tarjeta
│   ├── Button.astro    # Botones estilizados
│   ├── Table.astro     # Tablas de datos
│   └── ...
├── layouts/            # Layouts de página
│   └── Layout.astro    # Layout principal
├── lib/               # Utilidades y configuración
│   ├── database.js    # Configuración de Turso y operaciones DB
│   ├── api.js         # Utilidades para llamadas API
│   └── seed.js        # Datos de ejemplo
├── pages/             # Páginas de la aplicación
│   ├── api/           # Endpoints de la API
│   │   ├── dashboard.js
│   │   ├── transactions.js
│   │   ├── categories.js
│   │   ├── budgets.js
│   │   ├── goals.js
│   │   └── reports.js
│   ├── index.astro    # Dashboard principal
│   ├── expenses.astro # Gestión de gastos
│   ├── income.astro   # Gestión de ingresos
│   ├── budgets.astro  # Presupuestos
│   ├── goals.astro    # Metas financieras
│   ├── reports.astro  # Reportes
│   └── settings.astro # Configuración
└── styles/            # Estilos globales
    └── globals.css
```

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Datos del dashboard

### Transacciones
- `GET /api/transactions` - Obtener transacciones
- `POST /api/transactions` - Crear transacción
- `PUT /api/transactions?id={id}` - Actualizar transacción
- `DELETE /api/transactions?id={id}` - Eliminar transacción

### Categorías
- `GET /api/categories` - Obtener categorías
- `POST /api/categories` - Crear categoría

### Presupuestos
- `GET /api/budgets` - Obtener presupuestos
- `POST /api/budgets` - Crear presupuesto

### Metas Financieras
- `GET /api/goals` - Obtener metas
- `POST /api/goals` - Crear meta
- `PUT /api/goals?id={id}&action=progress` - Actualizar progreso
- `PUT /api/goals?id={id}&action=status` - Actualizar estado

### Reportes
- `GET /api/reports?type={type}` - Generar reportes
  - `type=monthly` - Reporte mensual
  - `type=category` - Reporte por categoría
  - `type=trend` - Reporte de tendencias

## Base de Datos

### Tablas

- **users** - Información de usuarios
- **categories** - Categorías de ingresos/gastos
- **transactions** - Transacciones financieras
- **budgets** - Presupuestos por categoría
- **financial_goals** - Metas financieras

### Relaciones

- `transactions.user_id` → `users.id`
- `transactions.category_id` → `categories.id`
- `budgets.user_id` → `users.id`
- `budgets.category_id` → `categories.id`
- `financial_goals.user_id` → `users.id`

## Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de producción
- `npm run seed` - Poblar base de datos con datos de ejemplo
- `npm run db:init` - Inicializar base de datos

## Personalización

### Colores y Tema

Los colores principales están definidos en `src/styles/globals.css`:

```css
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #8b5cf6;
  --accent: #06b6d4;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
}
```

### Categorías Predeterminadas

Las categorías se crean automáticamente al inicializar la base de datos. Puedes modificarlas en `src/lib/database.js` en la función `insertDefaultCategories()`.

## Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura las variables de entorno
3. Usa el comando de build: `npm run build`

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

Desarrollado con ❤️ para ayudarte a gestionar mejor tus finanzas personales.
