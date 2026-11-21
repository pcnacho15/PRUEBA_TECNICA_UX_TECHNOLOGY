import { PartialType } from '@nestjs/swagger';
import { CreateOrdenDto } from './create-orden.dto.js';

/** Mismas reglas que la creación; cada campo enviado se valida y se actualiza. */
export class UpdateOrdenDto extends PartialType(CreateOrdenDto) {}
