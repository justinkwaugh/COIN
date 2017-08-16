import FactionPiece from '../../common/factionPiece';

class AlliedTribe extends FactionPiece {
    constructor(definition) {
        definition.type = 'alliedtribe';
        super(definition);
        this.tribeId = null;
    }

    identifier() {
        return super.identifier() + '|' + (this.tribeId || '');
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            tribeId: this.tribeId || ''
        });
    }
    
    loadGameState(json) {
        super.loadGameState(json);

        this.tribeId = json.tribeId;
    }
}

export default AlliedTribe;