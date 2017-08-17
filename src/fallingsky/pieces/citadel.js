import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Citadel extends FactionPiece {
    constructor(definition) {
        definition.type = 'citadel';
        definition.canRoll = true;
        super(definition);

        this.tribeId = definition.tribeId;
    }

    identifier() {
        return super.identifier() + '|' + (this.tribeId || '');
    }
}

Citadel.registerClass();

export default Citadel;