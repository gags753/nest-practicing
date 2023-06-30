import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoriasModule } from 'src/categorias/categorias.module';
import { JogadoresModule } from 'src/jogadores/jogadores.module';
import { DesafiosController } from './desafios.controller';
import { DesafiosService } from './desafios.service';
import { DesafioSchema, PartidaSchema } from './interfaces/desafios.schema';


@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Desafio', schema: DesafioSchema },
    { name: 'Partida', schema: PartidaSchema }
  ]),
    JogadoresModule,
    CategoriasModule
  ],
  controllers: [DesafiosController],
  providers: [DesafiosService]
})
export class DesafiosModule { }