import FactionPiece from '../../common/factionPiece';

class Fort extends FactionPiece {
    constructor(definition) {
        definition.type = 'fort';
        definition.canRoll = true;
        super(definition);
    }
    
    loadGameState(json) {
        super.loadGameState(json);
    }
}

export default Fort;