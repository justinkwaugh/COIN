import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Citadel extends FactionPiece {
    constructor(definition) {
        definition.type = 'citadel';
        definition.canRoll = true;
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

export default Citadel;