import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

interface MysqlDriverError {
  code?: string;
  errno?: number;
}

const ER_DUP_ENTRY = 'ER_DUP_ENTRY';
const ER_CHECK_CONSTRAINT_VIOLATED = 'ER_CHECK_CONSTRAINT_VIOLATED';

/**
 * Traduce errores de MySQL a respuestas HTTP coherentes sin filtrar detalles
 * internos de la base de datos al cliente.
 */
@Catch(QueryFailedError)
export class QueryFailedFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  private readonly logger = new Logger(QueryFailedFilter.name);

  override catch(exception: QueryFailedError, host: ArgumentsHost): void {
    super.catch(this.toHttpException(exception), host);
  }

  private toHttpException(exception: QueryFailedError): HttpException {
    const { code } = exception.driverError as MysqlDriverError;

    switch (code) {
      case ER_DUP_ENTRY:
        return new ConflictException(
          'Ya existe un registro con ese valor único',
        );
      case ER_CHECK_CONSTRAINT_VIOLATED:
        return new ConflictException(
          'Los datos no cumplen las restricciones de la base de datos',
        );
      default:
        this.logger.error(exception.message, exception.stack);
        return new InternalServerErrorException();
    }
  }
}
