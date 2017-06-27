import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Auxilia extends FactionPiece {
    constructor(definition) {
        definition.type = 'auxilia';
        definition.isMobile = true;

        super(definition);

        this.revealed = ko.observable();
        this.scouted = ko.observable();
        this.status = ko.pureComputed(() => {
            return this.revealed() ? 'revealed' : 'hidden';
        });
    }
}

export default Auxilia;