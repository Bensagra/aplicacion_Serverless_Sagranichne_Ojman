# Estrategia de calidad

## Estrategia general

La estrategia busca detectar problemas antes de que lleguen a producción combinando controles de distinto alcance. El lint detecta errores estáticos y usos inconsistentes; los tests unitarios protegen reglas de negocio rápidas y deterministas; el test E2E verifica que una persona pueda iniciar el flujo principal desde la aplicación web; y el build confirma que Expo puede generar un entregable desplegable.

Estos controles se ejecutan en ese orden porque los más rápidos y económicos fallan primero. Un cambio solo puede desplegarse después de superar todos los pasos. Además, el trabajo se organiza con issues, ramas y Pull Requests para que cada decisión tenga trazabilidad y revisión humana.

## Herramientas seleccionadas

- **ESLint con la configuración de Expo:** ya formaba parte del proyecto y conoce las reglas adecuadas para React Native, Expo y TypeScript.
- **Vitest:** se eligió para las pruebas unitarias por su ejecución rápida, configuración simple con TypeScript y reporte de cobertura integrado. Jest también era válido, pero Vitest requirió menos configuración para probar funciones puras.
- **Playwright:** se eligió para E2E porque espera automáticamente a que la interfaz esté lista, ejecuta navegadores reales y produce trazas útiles cuando falla en CI.
- **GitHub Actions:** centraliza las validaciones en cada push o PR a `main` y deja un historial visible del resultado.
- **Vercel:** mantiene el destino de despliegue web usado en el TP2 y permite desplegar desde el workflow solo después de aprobar calidad.

## Tests desarrollados

Los tests unitarios están en `Catalogo/lib/food.test.ts`:

1. **Búsqueda normalizada:** valida que el catálogo encuentre comidas ignorando mayúsculas y espacios externos.
2. **Búsqueda combinada con categoría:** valida que nombre y categoría deban cumplirse al mismo tiempo.
3. **Cálculo del valor total:** suma precios válidos e ignora valores inválidos o negativos para no mostrar un total corrupto.
4. **Normalización del formulario:** recorta el nombre y convierte un precio válido a número.
5. **Rechazo de datos inválidos:** protege al catálogo de nombres vacíos y precios negativos.

La corrida local de `npm run test:coverage` obtuvo 100% de statements, branches, functions y lines en `Catalogo/lib/food.ts`. El pipeline exige un mínimo de 60% para impedir que futuras modificaciones reduzcan la cobertura de esa lógica sin advertencia.

El test E2E está en `Catalogo/e2e/auth.spec.ts`:

1. **Acceso de visitante:** verifica que un usuario sin sesión sea redirigido al login, pueda ir al registro y regresar al inicio de sesión. Este flujo protege el límite de acceso a los datos privados.

## Casos de uso críticos

Se priorizaron el control de acceso y las reglas que determinan qué datos ve y guarda una persona. Un error en el filtro puede ocultar o mezclar elementos del catálogo; un precio inválido afecta los totales; y una falla en la redirección de autenticación puede dejar inaccesible la aplicación o exponer pantallas privadas.

El CRUD conectado a Supabase también es crítico, pero por ahora se verifica manualmente porque un E2E completo de creación requeriría una cuenta y una base de prueba aisladas. Esa mejora está registrada como deuda técnica para evitar que CI modifique datos productivos.

## Pipeline de CI/CD

El workflow `/.github/workflows/ci-cd.yml` se dispara en cada push o Pull Request a `main`.

1. Instala dependencias reproducibles con `npm ci` y Chromium para Playwright.
2. Ejecuta `npm run lint`. Si falla, no se ejecutan tests ni deploy.
3. Ejecuta `npm run test:coverage`. Además de validar las reglas, exige al menos 60% de cobertura sobre `lib/food.ts`.
4. Ejecuta `npm run test:e2e` contra la aplicación Expo web levantada localmente.
5. Ejecuta `npm run build` y guarda `Catalogo/dist` como artefacto.
6. Solo ante un push a `main`, y únicamente si el job de calidad terminó correctamente, despliega a producción con Vercel.

Los Pull Requests validan todo excepto el deploy. Esto permite revisar cambios sin alterar producción.

## Flujo de trabajo en GitHub

- Cada tarea comienza con un issue descriptivo, asignado a un integrante.
- Las ramas usan `feature/nombre-corto`, `fix/nombre-corto`, `docs/nombre-corto` o `chore/nombre-corto`.
- Ningún cambio se mergea directo a `main`: cada rama abre un PR que incluye `Closes #<issue>`.
- El otro integrante revisa el PR y deja al menos un comentario concreto antes de aprobarlo.
- El merge se realiza solo con el workflow de CI en verde.

Se incluyen templates para issues y PRs con criterios de aceptación y checklist de calidad.

## Configuración necesaria

En GitHub, dentro de **Settings > Secrets and variables > Actions**, deben existir:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Las credenciales reales nunca se guardan en el repositorio. Para las validaciones que no consultan la base, CI usa valores de Supabase de reemplazo cuando los secrets no están disponibles.

## Limitaciones y deuda técnica

- El E2E actual protege el acceso de visitantes, pero no crea una comida real. Falta preparar un proyecto Supabase exclusivo de pruebas, sembrar un usuario y limpiar sus datos después de cada ejecución.
- Los tests unitarios se concentran en la lógica extraída del catálogo; todavía no hay tests de componentes ni del contexto de autenticación.
- El pipeline no ejecuta pruebas nativas en Android/iOS: valida la versión web que se despliega a Vercel.
- No se integró monitoreo de errores en producción.
- El deploy depende de que Vercel tenga configuradas las variables de Supabase y de que los secrets de GitHub sean válidos.
- `npm audit` mantiene advertencias moderadas en dependencias transitivas de Expo SDK 54. Corregirlas actualmente exige migrar a Expo 56, por lo que se acepta el riesgo hasta poder probar esa actualización mayor; no quedan vulnerabilidades críticas reportadas.

## Uso de IA

Se utilizó Codex para proponer la estructura inicial de tests, separar funciones puras, configurar Vitest/Playwright y redactar una primera versión de este documento. El equipo debe revisar cada prueba, ajustar la documentación a las decisiones efectivamente tomadas y poder explicar el pipeline y sus límites durante la defensa.
