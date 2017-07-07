import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Warband extends FactionPiece {
    constructor(definition) {
        definition.type = 'warband';
        definition.isMobile = true;

        super(definition);

        this.revealed = ko.observable();
        this.scouted = ko.observable();
        this.status = ko.pureComputed(() => {
            return this.scouted() ? 'scouted' : this.revealed() ? 'revealed' : 'hidden';
        });
    }

    identifier() {
        return super.identifier() + '|' + this.status();
    }
}

export default Warband;