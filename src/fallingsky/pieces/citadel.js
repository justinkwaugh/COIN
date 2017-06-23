import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Citadel extends FactionPiece {
    constructor(definition) {
        definition.type = 'citadel';
        super(definition);

        this.tribeId = ko.observable();
    }
}

export default Citadel;