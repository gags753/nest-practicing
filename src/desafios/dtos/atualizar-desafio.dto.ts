import { IsDateString, IsString, IsEnum, IsOptional } from "class-validator";
import { DesafioStatus } from "../interfaces/desafios-status.enum";

export class AtualizarDesafioDto {
    @IsOptional()
    dataHoraDesafio: Date

    @IsOptional()
    status: DesafioStatus
}