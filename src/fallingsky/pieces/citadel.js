import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Citadel extends FactionPiece {
    constructor(definition) {
        definition.type = 'citadel';
        super(definition);

        this.tribeId = null;
    }

    identifier() {
        return super.identifier() + '|' + (this.tribeId || '');
    }
}

export default Citadel;