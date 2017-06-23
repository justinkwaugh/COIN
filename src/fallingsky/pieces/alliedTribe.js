import FactionPiece from '../../common/factionPiece';

class AlliedTribe extends FactionPiece {
    constructor(definition) {
        definition.type = 'alliedtribe';
        super(definition);
        this.tribeId = null;
    }
}

export default AlliedTribe;