import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Warband extends FactionPiece {
    constructor(definition) {
        definition.type = 'warband';
        definition.isMobile = true;

        super(definition);

        // mutable:

        this.revealed = ko.observable();
        this.scouted = ko.observable();

        // immutable:
        
        this.status = ko.pureComputed(() => {
            return this.scouted() ? 'scouted' : this.revealed() ? 'revealed' : 'hidden';
        });
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            revealed: this.revealed(),
            scouted: this.scouted()
        });
    }
    
    loadGameState(json) {
        super.loadGameState(json);

        this.revealed(json.revealed);
        this.scouted(json.scouted);
    }

    identifier() {
        return super.identifier() + '|' + this.status();
    }
}

export default Warband;