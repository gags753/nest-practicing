import * as mongoose from 'mongoose'

export const DesafioSchema = new mongoose.Schema({
    dataHoraDesafio: { type: Date },
    status: { type: String },
    dataHoraSolicitacao: { type: Date },
    dataHoraResposta: { type: Date },
    solicitante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Jogador"
    },
    categoria: { type: String },
    jogadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Jogador"
    }],
    partida: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partida"
    }
}, { timestamps: true, collection: 'desafios' })

export const PartidaSchema = new mongoose.Schema({
    categoria: { type: String },
    jogadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Jogador"
    }],
    def: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Jogador"
    },
    resultado: [
        { set: { type: String } }
    ]
}, { timestamps: true, collection: 'partidas' })