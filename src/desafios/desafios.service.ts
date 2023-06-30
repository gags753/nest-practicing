import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoriasService } from 'src/categorias/categorias.service';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtribuirDesafioPartidaDto } from './dtos/atribuir-desafio-partida.dto';
import { AtualizarDesafioDto } from './dtos/atualizar-desafio.dto';
import { CriarDesafioDto } from './dtos/criar-desafio.dto';
import { Desafio, Partida } from './interfaces/desafio.interface';
import { DesafioStatus } from './interfaces/desafios-status.enum';

@Injectable()
export class DesafiosService {

    constructor(
        @InjectModel('Desafio') private readonly desafioModel: Model<Desafio>,
        @InjectModel('Partida') private readonly partidaModel: Model<Partida>,
        private readonly jogadoresService: JogadoresService,
        private readonly categoriasService: CategoriasService
    ) { }

    private readonly logger = new Logger(DesafiosService.name)


    async CriarDesafio(criarDesafioDto: CriarDesafioDto): Promise<any> {

        // Verificar se os jogadoers existem na base de dados
        for (const jogador of criarDesafioDto.jogadores) {
            await this.jogadoresService.constultarJogadoresPeloId(jogador._id)
        }

        // Verificar se o solicitante é um dos jogadores da partida
        const jogadorSolicitante = criarDesafioDto.jogadores.find(jogador => {
            return jogador._id === criarDesafioDto.solicitante
        })

        if (!jogadorSolicitante) {
            throw new BadRequestException(`O solicitante deve ser um dos jogadores da partida`)
        }

        // Verificar se solicitante está cadastrado em alguma categoria
        const categoriaEncontrada = await this.categoriasService.consultarCategoriaDoJogador(jogadorSolicitante)

        if (!categoriaEncontrada) {
            throw new BadRequestException(`O solicitante deve estar cadastrado em uma categoria`)
        }

        // Criar desafio
        const desafioCriado = new this.desafioModel(criarDesafioDto)
        desafioCriado.categoria = categoriaEncontrada.categoria
        desafioCriado.dataHoraSolicitacao = new Date()
        desafioCriado.status = DesafioStatus.PENDENTE

        this.logger.log(`desafioCriado: ${JSON.stringify(desafioCriado)}`)
        return (await desafioCriado.save()).populate('jogadores')

    }

    async consultarTodosOsDesafios(): Promise<Array<Desafio>> {
        return await this.desafioModel.find()
            .populate("jogadores")
            .populate("solicitante")
            .populate("partida")
            .exec()
    }

    async consultarDesafiosDeUmJogador(_id: any): Promise<Array<Desafio>> {
        await this.jogadoresService.constultarJogadoresPeloId(_id)
        return await this.desafioModel.find().where('jogadores')
            .in(_id)
            .populate("jogadores")
            .populate("solicitante")
            .populate("partida")
            .exec()
    }

    async atualizarDesafio(_id: any, atualizarDesafioDto: AtualizarDesafioDto): Promise<void> {
        const desafioEncontrado = await this.desafioModel.findById(_id)
        if (!desafioEncontrado) {
            throw new NotFoundException(`Desafio com o id ${_id} não encontrado`)
        }
        if(atualizarDesafioDto.status) {
            desafioEncontrado.dataHoraResposta = new Date()
        }
        desafioEncontrado.status = atualizarDesafioDto.status
        desafioEncontrado.dataHoraDesafio = atualizarDesafioDto.dataHoraDesafio
        await this.desafioModel.findByIdAndUpdate(_id, {$set: desafioEncontrado}).exec()
    }

    async cancelarDesafio(_id: any): Promise<void> {
        const desafioEncontrado = await this.desafioModel.findById(_id)
        if (!desafioEncontrado) {
            throw new NotFoundException(`Desafio com o id ${_id} não encontrado`)
        }
        await this.desafioModel.findByIdAndUpdate(_id, { status: DesafioStatus.CANCELADO })
    }

    async atribuirDesafioPartida(_id: any, atribuirDesafioPartidaDto: AtribuirDesafioPartidaDto): Promise<void> {
        const desafioEncontrado = await this.desafioModel.findById(_id).exec()
        if (!desafioEncontrado) {
            throw new NotFoundException(`Desafio com o id ${_id} não encontrado`)
        }
        
        const { def } = atribuirDesafioPartidaDto
        const vencedor = desafioEncontrado.jogadores.find(jogador => {
            return jogador._id == def
        })
        if(!vencedor) {
            throw new BadRequestException(`O jogador informado com o id ${def} não fazia parte da partida`)
        }
        
        const partidaRealizada = new this.partidaModel(atribuirDesafioPartidaDto)
        partidaRealizada.categoria = desafioEncontrado.categoria
        partidaRealizada.jogadores = desafioEncontrado.jogadores

        const resultado = await partidaRealizada.save()
        
        desafioEncontrado.status = DesafioStatus.REALIZADO
        desafioEncontrado.partida = resultado._id
        
        try {
            await this.desafioModel.findOneAndUpdate({_id}, {$set: desafioEncontrado}).exec()
        } catch (error) {
            await this.partidaModel.deleteOne({_id: resultado._id}).exec()
            throw new InternalServerErrorException()
        }
    }
}
