/** Cuerpo de error estándar de NestJS (HttpException / ValidationPipe). */
interface NestErrorBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica que la API esté en ejecución.',
  400: 'Los datos enviados no son válidos.',
  404: 'El recurso solicitado no existe o fue eliminado.',
  409: 'La operación entra en conflicto con datos existentes.',
  500: 'Ocurrió un error inesperado en el servidor.',
}

/** Error normalizado de la capa HTTP: la UI nunca trabaja con Response crudas. */
export class ApiError extends Error {
  readonly status: number
  readonly messages: readonly string[]

  constructor(status: number, messages: readonly string[]) {
    const fallback = MENSAJES_POR_ESTADO[status] ?? `Error HTTP ${status}`
    const finalMessages = messages.length > 0 ? messages : [fallback]
    super(finalMessages.join('. '))
    this.name = 'ApiError'
    this.status = status
    this.messages = finalMessages
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isValidationError(): boolean {
    return this.status === 400
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isConflict(): boolean {
    return this.status === 409
  }

  static network(): ApiError {
    return new ApiError(0, [])
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let body: NestErrorBody | null = null
    try {
      body = (await response.json()) as NestErrorBody
    } catch {
      // Cuerpo vacío o no JSON: se usa el mensaje por defecto del estado.
    }

    const raw = body?.message
    const messages = Array.isArray(raw) ? raw : raw ? [raw] : []
    // Un 500 de Nest trae "Internal server error" en inglés: se prefiere el propio.
    return new ApiError(response.status, response.status >= 500 ? [] : messages)
  }
}

/** Extrae un mensaje legible de cualquier error capturado. */
export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
