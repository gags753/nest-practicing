import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsNotEmpty } from "class-validator"
import { Jogador } from "src/jogadores/interfaces/jogador.interface"

export class CriarDesafioDto {

    @IsNotEmpty()
    @IsDateString()
    dataHoraDesafio: Date

    @IsNotEmpty()
    solicitante: Jogador

    @IsArray()
    @ArrayMaxSize(2)
    @ArrayMinSize(2)
    jogadores: Array<Jogador>
}