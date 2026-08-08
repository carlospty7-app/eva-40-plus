---
description: Retoma el proyecto donde quedó leyendo ESTADO.md y espera tu OK antes de continuar
---
Regla canónica actualizada: aplica primero `docs/sistema/PROMPT-RETOMAR.txt`, especialmente hablar
simple, marcar ⚠️ riesgos/costos/acciones del usuario y esperar OK antes de continuar.

Lee ESTADO.md y dime en pocas líneas: en qué app estamos, en qué fase quedamos, qué fue lo último
que hicimos, qué quedó pendiente, y cuál es el siguiente paso. Luego espera mi OK para continuar
con ese siguiente paso (no avances sin confirmación).

Si no existe ESTADO.md pero hay código del proyecto, explóralo (estructura, pantallas, stack real),
reconstruye el estado, créame el ESTADO.md con la plantilla de docs/sistema/PLANTILLA-ESTADO.md, y
luego dime dónde quedamos.

Si hubo una compactación de contexto a mitad de sesión, relee ESTADO.md + CLAUDE.md antes de seguir.

Contexto adicional del usuario (si lo dio): $ARGUMENTS
