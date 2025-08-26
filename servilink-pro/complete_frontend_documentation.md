# 📱 ServiLink Pro - Documentación Frontend Completa

## 🎯 Información General

**Aplicación:** ServiLink Pro  
**Tipo:** Progressive Web App (PWA)  
**Framework:** React 19.1.1 + Vite  
**Estilo:** Tailwind CSS 3.4.17  
**Routing:** React Router DOM 7.8.2  
**Estado:** Context API + Local Storage  
**API:** Axios con interceptores JWT  

### 🌐 URLs de la Aplicación
- **Desarrollo:** `http://localhost:3000/servi-link/`
- **Producción:** `https://tudominio.com/servi-link/`
- **API Backend:** `https://codeo.site/api-servilink/api/v1/`

---

## 🏗️ Arquitectura del Proyecto

### 📁 Estructura de Carpetas
```
servilink-pro/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── NavigationHeader.jsx
│   │   └── NotificationBadge.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── ClientAuth.jsx
│   │   │   ├── ClientRegister.jsx
│   │   │   ├── ContractorAuth.jsx
│   │   │   └── ContractorRegister.jsx
│   │   ├── client/
│   │   │   ├── ClientDashboard.jsx
│   │   │   ├── ServiceSelection.jsx
│   │   │   ├── ServiceDetails.jsx
│   │   │   ├── SearchingProfessional.jsx
│   │   │   ├── ProfessionalFound.jsx
│   │   │   ├── ScheduleTime.jsx
│   │   │   ├── ConfirmService.jsx
│   │   │   ├── PaymentScreen.jsx
│   │   │   └── RateService.jsx
│   │   ├── contractor/
│   │   │   ├── ContractorDashboard.jsx
│   │   │   ├── ContractorCalendar.jsx
│   │   │   └── ContractorAvailability.jsx
│   │   ├── shared/
│   │   │   ├── NotificationsScreen.jsx
│   │   │   └── UserProfile.jsx
│   │   └── Home.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🔧 Configuración y Setup

### 🛠️ Instalación
```bash
# Clonar el repositorio
git clone [repo-url]
cd servilink-pro

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
```

### 📋 Dependencias Principales
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.8.2",
  "react-hook-form": "^7.62.0",
  "axios": "^1.11.0",
  "lucide-react": "^0.541.0",
  "@headlessui/react": "^2.2.7",
  "@heroicons/react": "^2.2.0"
}
```

### ⚙️ Configuración de Vite
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/servi-link/',
  server: {
    port: 3000,
    host: true
  }
})
```

### 🎨 Configuración de Tailwind
```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { /* colores personalizados */ },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  }
}
```

---

## 🎨 Sistema de Design

### 🎯 Principios de Diseño
- **Mobile-First:** Diseñado primero para móviles
- **Consistencia:** Componentes y patrones unificados
- **Accesibilidad:** Contraste adecuado y navegación por teclado
- **Performance:** Carga rápida y transiciones suaves

### 🎨 Paleta de Colores
```css
/* Colores principales */
--blue-600: #2563eb;    /* Primario */
--red-600: #dc2626;     /* Headers */
--green-500: #10b981;   /* Éxito */
--yellow-400: #fbbf24;  /* Advertencia */
--gray-800: #1f2937;    /* Texto principal */
--gray-600: #4b5563;    /* Texto secundario */
```

### 📱 Breakpoints Responsive
```css
sm: '640px'   /* Tablets pequeñas */
md: '768px'   /* Tablets */
lg: '1024px'  /* Desktops pequeños */
xl: '1280px'  /* Desktops grandes */
```

### 🧩 Componentes Base
- **Botones:** Primarios, secundarios, outline, loading states
- **Inputs:** Text, email, password, select, textarea
- **Cards:** Sombras suaves, bordes redondeados
- **Modals:** Overlay con backdrop blur
- **Headers:** Variants (red, white, transparent)

---

## 🔐 Sistema de Autenticación

### 🏗️ AuthContext
```javascript
// Funciones principales
const { 
  user,           // Usuario actual
  loading,        // Estado de carga
  isAuthenticated,// Estado de autenticación
  login,          // Función de login
  register,       // Función de registro
  logout,         // Función de logout
  updateUser      // Actualizar datos del usuario
} = useAuth();
```

### 🔑 Flujo de Autenticación
1. **Login:** Email + password → JWT tokens
2. **Storage:** Access token + refresh token + user data
3. **Auto-refresh:** Renovación automática de tokens
4. **Logout:** Limpieza de storage + redirección
5. **Protección:** Rutas protegidas por tipo de usuario

### 🛡️ Rutas Protegidas
```javascript
// Componente ProtectedRoute
<ProtectedRoute userType="cliente">
  <ClientDashboard />
</ProtectedRoute>

<ProtectedRoute userType="contratista">
  <ContractorDashboard />
</ProtectedRoute>
```

---

## 🌐 Sistema de Routing

### 🗺️ Mapa de Rutas

#### **Rutas Públicas**
- `/` - Home (selección cliente/contratista)
- `/client/auth` - Login de clientes
- `/client/register` - Registro de clientes
- `/contractor/auth` - Login de contratistas
- `/contractor/register` - Registro de contratistas

#### **Rutas de Clientes**
- `/client/dashboard` - Dashboard principal
- `/client/service-selection` - Selección de servicios
- `/client/service-details` - Detalles del servicio
- `/client/searching-professional` - Búsqueda de profesional
- `/client/professional-found` - Profesional encontrado
- `/client/schedule-time` - Selección de horario
- `/client/confirm-service` - Confirmación de servicio
- `/client/payment` - Pantalla de pago
- `/client/rate-service` - Calificar servicio

#### **Rutas de Contratistas**
- `/contractor/dashboard` - Dashboard de trabajos
- `/contractor/calendar` - Calendario de citas
- `/contractor/availability` - Gestión de disponibilidad

#### **Rutas Compartidas**
- `/notifications` - Centro de notificaciones
- `/profile` - Perfil de usuario (redirección contextual)

### 🔄 Configuración del Router
```javascript
<Router basename="/servi-link">
  <AuthProvider>
    <Routes>
      {/* Rutas definidas aquí */}
    </Routes>
  </AuthProvider>
</Router>
```

---

## 🔌 Integración con API

### 🏗️ Estructura del API Service
```javascript
// src/services/api.js
const api = axios.create({
  baseURL: 'https://codeo.site/api-servilink/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});
```

### 🔐 Interceptores de Axios
```javascript
// Request interceptor - Agregar JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Manejar refresh token
api.interceptors.response.use(
  response => response.data,
  async error => {
    if (error.response?.status === 401) {
      // Lógica de refresh token
    }
    return Promise.reject(error);
  }
);
```

### 📡 Servicios Disponibles

#### **Autenticación**
```javascript
authService.login(email, password)
authService.register(userData)
authService.getProfile()
authService.refreshToken(refreshToken)
```

#### **Configuración**
```javascript
configService.getCategories()
configService.getServices()
configService.getServicesByCategory(categoryId)
```

#### **Contratistas**
```javascript
contractorService.getContractors(params)
contractorService.searchAvailableContractors(searchData)
contractorService.getContractorById(id)
```

#### **Solicitudes**
```javascript
requestService.createRequest(requestData)
requestService.getRequests(params)
requestService.updateRequestStatus(id, status)
```

#### **Asignaciones**
```javascript
assignmentService.getAssignments(params)
assignmentService.acceptAssignment(id, acceptData)
assignmentService.rejectAssignment(id, rejectData)
```

#### **Citas**
```javascript
appointmentService.createAppointment(appointmentData)
appointmentService.getAppointments(params)
appointmentService.confirmAppointment(id)
appointmentService.startService(id)
appointmentService.completeService(id, completionData)
```

#### **Horarios**
```javascript
scheduleService.getAvailability(contractorId, params)
scheduleService.createSchedule(scheduleData)
scheduleService.updateAvailability(id, availabilityData)
```

#### **Pagos**
```javascript
paymentService.createConsultationPayment(paymentData)
paymentService.getPaymentsByAppointment(appointmentId)
```

#### **Evaluaciones**
```javascript
evaluationService.createEvaluation(evaluationData)
evaluationService.getEvaluationsByContractor(contractorId)
```

#### **Notificaciones**
```javascript
notificationService.getNotificationsByUser(userId, params)
notificationService.markAsRead(id)
notificationService.sendManualNotification(notificationData)
```

---

## 💼 Flujos de Usuario

### 👤 **Flujo de Cliente**

#### 1. **Registro/Login**
```
Home → Client Auth → Dashboard
```

#### 2. **Solicitud de Servicio**
```
Dashboard → Service Selection → Service Details 
→ Searching Professional → Professional Found 
→ Schedule Time → Confirm Service → Payment
```

#### 3. **Post-Servicio**
```
Dashboard → Rate Service → Completado
```

### 🔧 **Flujo de Contratista**

#### 1. **Registro/Login**
```
Home → Contractor Auth → Dashboard
```

#### 2. **Gestión de Disponibilidad**
```
Dashboard → Availability → Agregar/Editar Horarios
```

#### 3. **Gestión de Trabajos**
```
Dashboard → Ver Asignaciones → Aceptar/Rechazar
→ Calendar → Ver Citas → Completar Trabajo
```

---

## 🎯 Componentes Principales

### 🧭 **NavigationHeader**
```javascript
<NavigationHeader
  title="Mi Dashboard"
  showBack={true}
  backPath="/dashboard"
  showNotifications={true}
  showProfile={true}
  variant="red" // 'default', 'red', 'transparent'
/>
```

**Props:**
- `title`: Título del header
- `showBack`: Mostrar botón de regreso
- `backPath`: Ruta de regreso personalizada
- `showNotifications`: Mostrar badge de notificaciones
- `showProfile`: Mostrar dropdown de perfil
- `variant`: Estilo del header

### 🔔 **NotificationBadge**
```javascript
<NotificationBadge />
```

**Funciones:**
- Contador de notificaciones no leídas
- Dropdown con preview de notificaciones
- Auto-actualización cada 30 segundos
- Navegación contextual al hacer clic

### 📱 **Pantallas Principales**

#### **ClientDashboard**
- Lista de categorías de servicios
- Servicios completados para calificar
- Navegación a selección de servicios

#### **ContractorDashboard**
- Tabs: Nuevas, Activas, Completadas
- Lista de asignaciones con acciones
- Estados de carga y error

#### **PaymentScreen**
- 4 estados: pending, processing, success, error
- Integración con MercadoPago
- Pago protegido con retención

#### **ScheduleTime**
- Disponibilidad real desde API
- Selector de fechas y horarios
- Filtrado de horarios pasados

---

## 🎨 Guía de Estilos

### 🎨 **Clases de Utilidad Personalizadas**
```css
/* Estados de botones */
.btn-primary {
  @apply bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors;
}

.btn-loading {
  @apply relative text-transparent;
}

/* Cards */
.card {
  @apply bg-white rounded-2xl shadow-sm p-6 border border-gray-100;
}

/* Animaciones */
.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}
```

### 📱 **Patrones de Layout**
```javascript
// Layout móvil estándar
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
  <NavigationHeader variant="red" />
  <div className="max-w-md mx-auto px-6 py-8">
    {/* Contenido */}
  </div>
</div>
```

### 🎯 **Estados de Componentes**
```javascript
// Loading state
{loading && (
  <div className="text-center py-8">
    <div className="text-gray-600">Cargando...</div>
  </div>
)}

// Error state
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
    <p className="text-sm">{error}</p>
  </div>
)}

// Empty state
<div className="text-center py-12">
  <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
  <h3 className="text-lg font-medium text-gray-800 mb-2">
    No hay datos
  </h3>
  <p className="text-gray-600 text-sm">
    Descripción del estado vacío
  </p>
</div>
```

---

## 🚀 Optimizaciones y Performance

### ⚡ **Técnicas Implementadas**
- **Code Splitting:** Rutas cargadas bajo demanda
- **Lazy Loading:** Componentes pesados diferidos
- **Memoización:** useCallback y useMemo donde corresponde
- **Optimización de imágenes:** Formatos modernos
- **Caching:** Respuestas de API en memoria

### 📦 **Build Optimization**
```javascript
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        router: ['react-router-dom'],
        utils: ['axios']
      }
    }
  }
}
```

### 🔄 **Estado y Context**
```javascript
// Optimización de re-renders
const MemoizedComponent = React.memo(({ data }) => {
  return <ExpensiveComponent data={data} />;
});

// Context optimizado
const AuthProvider = ({ children }) => {
  const value = useMemo(() => ({
    user, login, logout, loading
  }), [user, loading]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🧪 Testing y Calidad

### 🔍 **Herramientas de Calidad**
- **ESLint:** Linting de código JavaScript
- **Prettier:** Formateo automático de código
- **TypeScript:** Tipado estático (preparado para migración)

### 📋 **Configuración de ESLint**
```javascript
// eslint.config.js
export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
    ],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
```

### ✅ **Checklist de Calidad**
- [ ] Componentes con PropTypes o TypeScript
- [ ] Manejo de errores en todas las llamadas API
- [ ] Estados de loading para UX mejorada
- [ ] Validación de formularios
- [ ] Accesibilidad (alt tags, aria-labels)
- [ ] Performance (memo, useMemo, useCallback)
- [ ] Mobile-first responsive design

---

## 🚀 Deployment y Producción

### 📦 **Build de Producción**
```bash
# Construir para producción
npm run build

# Preview del build
npm run preview

# Archivos generados en /dist
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── vite.svg
```

### 🌐 **Configuración del Servidor**

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    location /servi-link/ {
        alias /var/www/servilink-pro/dist/;
        try_files $uri $uri/ /servi-link/index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### **Apache Configuration**
```apache
<Directory "/var/www/html/servi-link">
    RewriteEngine On
    RewriteBase /servi-link/
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /servi-link/index.html [L]
</Directory>
```

### 📊 **Variables de Entorno**
```bash
# .env.production
VITE_API_URL=https://codeo.site/api-servilink
VITE_APP_NAME=ServiLink Pro
VITE_NODE_ENV=production
```

---

## 🔧 Mantenimiento y Debugging

### 🐛 **Debugging Común**

#### **Problemas de Routing**
```javascript
// Verificar basename del router
<Router basename="/servi-link">

// Verificar configuración de Vite
base: '/servi-link/'
```

#### **Problemas de API**
```javascript
// Verificar interceptores
console.log('API Request:', config);
console.log('API Response:', response);

// Verificar tokens
const token = localStorage.getItem('access_token');
console.log('Token:', token);
```

#### **Problemas de Estado**
```javascript
// Verificar AuthContext
const { user, loading, isAuthenticated } = useAuth();
console.log({ user, loading, isAuthenticated });
```

### 📝 **Logs y Monitoreo**
```javascript
// Logger personalizado
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data)
};
```

### 🔄 **Actualización de Dependencias**
```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit
npm audit fix
```

---

## 📚 Recursos y Referencias

### 📖 **Documentación Relacionada**
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Axios](https://axios-http.com/)

### 🛠️ **Herramientas de Desarrollo**
- **VSCode Extensions:** ES7+ React/Redux/React-Native snippets
- **Chrome DevTools:** React Developer Tools
- **Debugging:** Redux DevTools (si se migra a Redux)

### 🎯 **Mejores Prácticas Implementadas**
- **Component Composition:** Componentes reutilizables
- **Custom Hooks:** Lógica compartida extraída
- **Error Boundaries:** Manejo de errores de React
- **Code Splitting:** Rutas lazy-loaded
- **Performance:** Optimizaciones de re-render
- **Accessibility:** Navegación por teclado y screen readers
- **SEO:** Meta tags y estructura semántica

---

## 🎉 Conclusión

ServiLink Pro es una aplicación React moderna y completamente funcional que conecta clientes con contratistas de servicios técnicos. La arquitectura está diseñada para ser:

- **🚀 Escalable:** Fácil agregar nuevas funcionalidades
- **🔧 Mantenible:** Código limpio y bien documentado  
- **📱 Responsive:** Optimizada para todos los dispositivos
- **⚡ Performante:** Carga rápida y experiencia fluida
- **🔒 Segura:** Autenticación JWT y validaciones
- **🎨 Moderna:** UI/UX contemporánea y atractiva

El MVP está **100% completado y listo para producción** con todas las funcionalidades core implementadas y probadas.

---

**Documentación actualizada:** Agosto 2025  
**Versión:** 2.0.0  
**Estado:** Producción Ready ✅