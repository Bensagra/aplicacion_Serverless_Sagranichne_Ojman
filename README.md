# Catálogo de Comidas · Aplicación Serverless

Aplicación móvil (React Native + Expo) con backend **serverless** sobre **Supabase** (Auth + Postgres). Cada usuario puede crear, ver, editar y eliminar su propio catálogo de comidas, con datos persistidos en la nube.

> Trabajo Práctico Nº 3 — Calidad y Automatización CI/CD, construido sobre la aplicación serverless del TP2.

## Estado de calidad

El pipeline de GitHub Actions ejecuta `lint → tests unitarios con cobertura → E2E → build → deploy`. El despliegue a producción ocurre únicamente ante un push a `main` después de que todos los controles pasan.

- **Producción:** [https://ivo-3.vercel.app](https://ivo-3.vercel.app)
- **Decisiones, tests y limitaciones:** [`CALIDAD.md`](CALIDAD.md)
- **Workflow:** [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

---

## 👥 Equipo

| Alumno | Rol principal | Branch |
|---|---|---|
| Ojman | Layout, navegación, UI base del catálogo | `Ojman` |
| Sagranichne | Auth, integración Supabase, CRUD y perfil | `Sagranichne` |

---

## 🧱 Stack

- **Frontend**: React Native 0.81 · Expo SDK 54 · Expo Router (file-based routing) · TypeScript
- **Backend serverless**: [Supabase](https://supabase.com)
  - **Auth**: email + password (`supabase.auth`)
  - **DB**: Postgres con **Row Level Security** por usuario
- **Persistencia de sesión**: `@react-native-async-storage/async-storage`
- **Deploy web**: [Vercel](https://vercel.com) (build estático de Expo)

---

## 🌿 Estrategia de ramas

```
main      ←  versión funcional desplegada
 ↑
develop   ←  integración (merge desde branches de cada alumno)
 ↑   ↑
Ojman   Sagranichne
```

Convenciones:
- Cada alumno trabaja en su branch.
- Las features se integran a `Develop` vía Pull Request.
- `main` siempre tiene una versión funcional desplegable.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, …).

Para el TP3, las ramas de trabajo siguen `feature/nombre-corto`, `fix/nombre-corto`, `docs/nombre-corto` o `chore/nombre-corto`. Cada cambio parte de un issue y se integra mediante un PR revisado por el otro integrante.

---

## 🚀 Cómo correr el proyecto

### 1. Cloná el repo

```bash
git clone <repo-url>
cd aplicacion_Serverless_Sagranichne_Ojman/Catalogo
npm install
```

### 2. Creá el proyecto en Supabase

1. Entrá a https://supabase.com y creá un nuevo proyecto.
2. En el **SQL Editor** copiá y ejecutá [`supabase/schema.sql`](Catalogo/supabase/schema.sql). Eso crea las tablas `profiles` y `foods` con RLS por usuario y un trigger que crea el perfil al registrarse.
3. (Opcional) En **Authentication → Providers → Email**, desactivá "Confirm email" si querés probar login inmediato sin verificar el mail.

### 3. Variables de entorno

Copiá [`Catalogo/.env.example`](Catalogo/.env.example) a `Catalogo/.env` y completalo con la URL y la **anon key** de tu proyecto Supabase (Settings → API).

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 4. Levantá la app

```bash
npm run start      # menú interactivo de Expo
npm run ios        # iOS Simulator
npm run android    # emulador Android
npm run web        # versión web (la que se despliega en Vercel)
npm run lint       # análisis estático
npm run test:unit  # tests unitarios
npm run test:e2e   # test E2E en Chromium
npm run build      # export web de producción
```

---

## 🌐 Deploy

La versión web se construye con `expo export -p web` (genera la carpeta `dist/`) y se publica en Vercel. En Vercel hay que definir las mismas variables `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` como Environment Variables.

```bash
npx expo export -p web
# luego: vercel --prod  (o conectar el repo en el dashboard de Vercel)
```

El deploy automático requiere configurar en GitHub Actions los secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Las variables de Supabase también deben estar configuradas en el proyecto de Vercel.

---

## 🗂️ Estructura

```
Catalogo/
├── app/                          # rutas (Expo Router)
│   ├── _layout.tsx               # AuthProvider + gating
│   ├── (auth)/                   # pantallas públicas
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                   # pantallas autenticadas
│   │   ├── index.tsx             # catálogo + búsqueda + FAB
│   │   └── profile.tsx           # perfil editable + logout
│   └── food/
│       ├── new.tsx               # crear comida
│       └── [id].tsx              # editar comida
├── components/
│   ├── FoodForm.tsx              # form reusable (crear/editar)
│   └── ui/FoodCard.tsx           # tarjeta animada con acciones
├── context/
│   └── AuthContext.tsx           # sesión + signIn/signUp/signOut
├── lib/
│   └── supabase.ts               # cliente Supabase + tipos
├── supabase/
│   └── schema.sql                # DDL + políticas RLS + trigger
└── .env.example
```

---

## ✅ Cumplimiento de la consigna

| Requisito mínimo | Dónde se cumple |
|---|---|
| Registro de usuario | [`app/(auth)/signup.tsx`](Catalogo/app/(auth)/signup.tsx) → `supabase.auth.signUp` |
| Inicio de sesión | [`app/(auth)/login.tsx`](Catalogo/app/(auth)/login.tsx) → `supabase.auth.signInWithPassword` |
| Cierre de sesión | [`app/(tabs)/profile.tsx`](Catalogo/app/(tabs)/profile.tsx) → `supabase.auth.signOut` |
| Crear / Ver / Editar info asociada al usuario | Tabla `foods` con `user_id`, pantallas `food/new`, `(tabs)/index`, `food/[id]` |
| Persistencia en DB en la nube | Postgres de Supabase con RLS — cada usuario solo accede a sus propios datos |

### Opcionales implementados

- ✅ **Branching** (`main` / `Develop` / `Ojman` / `Sagranichne`)
- ✅ **Conventional Commits** en los commits de feature
- ✅ **Pull Requests** para mergear a `Develop`
- ✅ **Edición de datos del usuario** (`profiles` editable desde la app)
- ✅ **Row Level Security** server-side, no se confía sólo en el cliente

---

## 🧭 Decisiones técnicas (para la defensa)

- **Por qué Supabase**: ofrece Auth + Postgres + Storage en un solo servicio gratuito, con SDK oficial para JS/RN y soporte nativo de RLS, lo que nos permite delegar la seguridad de los datos al backend sin escribir un servidor propio.
- **Por qué Expo Router**: file-based routing, layouts anidados y deep linking sin configuración. El layout raíz hace de _auth gate_ (`useSegments` + `useEffect`) redirigiendo entre `(auth)` y `(tabs)` según la sesión.
- **RLS en lugar de filtros en el cliente**: aunque las queries filtran por `user_id`, las políticas SQL garantizan que aunque alguien intente saltarse el filtro, Postgres devuelve 0 filas. La seguridad no depende del frontend.
- **AsyncStorage para la sesión**: la sesión de Supabase se persiste localmente con `auto-refresh`, así no hay que loguearse cada vez que se abre la app.
