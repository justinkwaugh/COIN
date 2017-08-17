import FactionPiece from '../../common/factionPiece';

class Fort extends FactionPiece {
    constructor(definition) {
        definition.type = 'fort';
        definition.canRoll = true;
        super(definition);
    }
}

Fort.registerClass();

export default Fort;