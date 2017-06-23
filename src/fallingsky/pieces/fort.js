import FactionPiece from '../../common/factionPiece';

class Fort extends FactionPiece {
    constructor(definition) {
        definition.type = 'fort';
        super(definition);
    }
}

export default Fort;