import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Warband extends FactionPiece {
    constructor(definition) {
        definition.type = 'warband';
        definition.isMobile = true;

        super(definition);

        this.revealed = ko.observable();
        this.scouted = ko.observable();
    }
}

export default Warband;