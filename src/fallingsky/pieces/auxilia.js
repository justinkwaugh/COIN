import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Auxilia extends FactionPiece {
    constructor(definition) {
        definition.type = 'auxilia';
        definition.isMobile = true;

        super(definition);

        this.revealed = ko.observable(definition.revealed);
        this.scouted = ko.observable(definition.scouted);
        this.status = ko.pureComputed(() => {
            return this.revealed() ? 'revealed' : 'hidden';
        });
    }

    identifier() {
        return super.identifier() + '|' + this.status();
    }
}

Auxilia.registerClass();

export default Auxilia;