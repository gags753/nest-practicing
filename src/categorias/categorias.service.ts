import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jogador } from 'src/jogadores/interfaces/jogador.interface';
import { JogadoresService } from 'src/jogadores/jogadores.service';
import { AtualizarCategoriaDto } from './dtos/Atualizar-categoria.dto';
import { CriarCategoriaDto } from './dtos/Criar-categoria.dto';
import { Categoria } from './interfaces/categoria.interface';

@Injectable()
export class CategoriasService {

    constructor(
        @InjectModel('Categoria') private readonly categoriaModel: Model<Categoria>,
        private readonly jogadoresService: JogadoresService) { }

    async criarCategoria(criarCategoriaDto: CriarCategoriaDto): Promise<Categoria> {

        const { categoria } = criarCategoriaDto

        const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec();

        if (categoriaEncontrada) {
            throw new BadRequestException(`Categoria ${categoria} já encontrada`)
        }

        const categoriaCriada = new this.categoriaModel(criarCategoriaDto)
        return categoriaCriada.save()

    }

    async consultarTodasAsCategorias(): Promise<Array<Categoria>> {
        return await this.categoriaModel.find().populate("jogadores").exec()
    }

    async consultarCategoriaPeloId(categoria: string): Promise<Categoria> {
        const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).populate("jogadores").exec()

        if (!categoriaEncontrada) {
            throw new NotFoundException(`Categoria ${categoria} não encontrada`)
        }

        return categoriaEncontrada
    }

    async atualizarCategoria(categoria: string, atualizarCategoriaDto: AtualizarCategoriaDto): Promise<void> {
        const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec()

        if (!categoriaEncontrada) {
            throw new NotFoundException(`Categoria ${categoria} não encontrada`)
        }
        await this.categoriaModel.findOneAndUpdate({ categoria }, { $set: atualizarCategoriaDto }).exec()
    }

    async atribuirCategoriaJogador(params: string[]): Promise<void> {

        const categoria = params['categoria']
        const idJogador = params['idJogador']

        const categoriaEncontrada = await this.categoriaModel.findOne({ categoria }).exec()
        if (!categoriaEncontrada) {
            throw new BadRequestException(`Categoria ${categoria} não cadastrada`)
        }

        await this.jogadoresService.constultarJogadoresPeloId(idJogador)

        const jogadorJaCadastradoCategoria = await this.categoriaModel.find({ categoria }).where('jogadores').in(idJogador).exec()
        if (jogadorJaCadastradoCategoria.length > 0) {
            throw new BadRequestException(`Jogador com o id ${idJogador} já cadastrado na Categoria ${categoria}`)
        }

        categoriaEncontrada.jogadores.push(idJogador)
        await this.categoriaModel.findOneAndUpdate({ categoria }, { $set: categoriaEncontrada }).exec()

    }

    async consultarCategoriaDoJogador(id: any): Promise<Categoria> {
        return await this.categoriaModel.findOne().where('jogadores').in(id).exec()
    }
}
