import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { ValidacaoParametrosPipe } from 'src/common/pipes/validacao-parametros.pipe';
import { DesafiosService } from './desafios.service';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio } from './interfaces/desafio.interface';
import { DesafioStatusValidationPipe } from './pipes/desafio-status-validation.pipe';

@Controller('api/v1/desafios')
export class DesafiosController {

    constructor(private readonly desafiosService: DesafiosService) { }

    private readonly logger = new Logger(DesafiosController.name)

    @Post()
    @UsePipes(ValidationPipe)
    async criarDesafio(
        @Body() criarDesafioDto: CriarDesafioDto): Promise<any> {
            this.logger.log(`criarDesafioDto: ${JSON.stringify(criarDesafioDto)}`)
            return await this.desafiosService.CriarDesafio(criarDesafioDto)
    }

    @Get()
    async consultarTodosOsDesafios(): Promise<Array<Desafio>> {
        return await this.desafiosService.consultarTodosOsDesafios()
    }

    @Get('/:_id')
    @UsePipes(ValidationPipe)
    async consultarDesafiosDeUmJogador(
        @Param('_id') _id: string
    ): Promise<Array<Desafio>> {
        return await this.desafiosService.consultarDesafiosDeUmJogador(_id)
    }

    @Put('/:desafio')
    async atualizarDesafio(
        @Body(DesafioStatusValidationPipe) atualizarDesafioDto: AtualizarDesafioDto,
        @Param('desafio') _id: string): Promise<void> {
            await this.desafiosService.atualizarDesafio(_id, atualizarDesafioDto)
    }

    @Delete('/:_id')
    @UsePipes(ValidationPipe)
    async cancelarDesafio(
        @Param('_id', ValidacaoParametrosPipe) _id: string,
    ): Promise<void> {
        await this.desafiosService.cancelarDesafio(_id)
    }

    @Post('/:_id/partida')
    @UsePipes(ValidationPipe)
    async atribuirDesafioPartida(
        @Param('_id', ValidacaoParametrosPipe) _id: string,
        @Body() atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto
    ): Promise<void> {
        return await this.desafiosService.atribuirDesafioPartida(_id, atribuirDesafioPartidaDto)
    }

}
