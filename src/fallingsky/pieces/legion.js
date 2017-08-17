import FactionPiece from '../../common/factionPiece';

class Legion extends FactionPiece {
    constructor(definition) {

        definition.type = 'legion';
        definition.isMobile = true;
        definition.canRoll = true;
        super(definition);
    }
}

Legion.registerClass();

export default Legion;