import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Warband extends FactionPiece {
    constructor(definition) {
        definition.type = 'warband';
        definition.isMobile = true;

        super(definition);

        this.revealed = ko.observable(definition.revealed);
        this.scouted = ko.observable(definition.scouted);
        this.status = ko.pureComputed(() => {
            return this.scouted() ? 'scouted' : this.revealed() ? 'revealed' : 'hidden';
        });
    }

    toJSON() {
        const plainObject = super.toJSON();
        plainObject.revealed = this.revealed();
        plainObject.scouted = this.scouted();
        return plainObject;
    }

    identifier() {
        return super.identifier() + '|' + this.status();
    }
}

Warband.registerClass();

export default Warband;