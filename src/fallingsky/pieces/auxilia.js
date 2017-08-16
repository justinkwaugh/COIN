import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Auxilia extends FactionPiece {
    constructor(definition) {
        definition.type = 'auxilia';
        definition.isMobile = true;

        super(definition);

        // mutable:

        this.revealed = ko.observable();
        this.scouted = ko.observable();

        // immutable:
        
        this.status = ko.pureComputed(() => {
            return this.revealed() ? 'revealed' : 'hidden';
        });
    }

    identifier() {
        return super.identifier() + '|' + this.status();
    }
    
    loadGameState(json) {
        super.loadGameState(json);

        this.revealed(json.revealed);
        this.scouted(json.scouted);
    }
}

export default Auxilia;