import FactionPiece from '../../common/factionPiece';

class AlliedTribe extends FactionPiece {
    constructor(definition) {
        definition.type = 'alliedtribe';
        super(definition);
        this.tribeId = definition.tribeId;
    }

    identifier() {
        return super.identifier() + '|' + (this.tribeId || '');
    }
}

AlliedTribe.registerClass();

export default AlliedTribe;