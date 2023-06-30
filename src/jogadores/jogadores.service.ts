import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CriarJogadorDto } from './dtos/criar-jogador.dto';
import { Jogador } from './interfaces/jogador.interface';
import { AtualizarJogadorDto } from './dtos/atualizar-jogador.dto';

@Injectable()
export class JogadoresService {

    constructor(@InjectModel('Jogador') private readonly jogadorModel: Model<Jogador>) { }

    // private readonly logger = new Logger(JogadoresService.name)

    async criarJogador(criarJogadorDto: CriarJogadorDto): Promise<Jogador> {

        const { email } = criarJogadorDto;

        const jogadorEncontrado = await this.jogadorModel.findOne({ email }).exec();

        if (jogadorEncontrado) {
            throw new BadRequestException(`Jogador com e-mail ${email} já cadastrado`)
        }

        const jogadorCriado = new this.jogadorModel(criarJogadorDto)
        return await jogadorCriado.save()
    }

    async atualizarJogador(_id: string, atualizarJogadorDto: AtualizarJogadorDto): Promise<void> {

        const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec();

        if (!jogadorEncontrado) {
            throw new NotFoundException(`Jogador com o id ${_id} não encontrado`)
        }
        await this.jogadorModel.findOneAndUpdate({ _id }, { $set: atualizarJogadorDto }).exec();
    }

    async consultarTodosJogadores(): Promise<Jogador[]> {
        return await this.jogadorModel.find().exec()
    }

    async constultarJogadoresPeloId(_id: string): Promise<Jogador> {
        const jogadorEncontrado = await this.jogadorModel.findOne({ _id }).exec();
        if(!jogadorEncontrado) {
            throw new NotFoundException(`Jogador com id ${_id} não encontrado`)
        }
        return await this.jogadorModel.findOne({ _id }).exec();
    }

    async deletarJogador(_id: string): Promise<any> {
        return await this.jogadorModel.findOneAndDelete({_id}).exec();
    }
}
