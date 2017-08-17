import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Leader extends FactionPiece {
    constructor(definition) {
        definition.type = 'leader';
        definition.isMobile = true;
        definition.canRoll = true;
        super(definition);
        this.name = definition.name;
        this.isSuccessor = ko.observable(definition.isSuccessor);
    }

    toString() {
        let value = this.name;
        if (this.isSuccessor()) {
            value += '\'s Successor';
        }
        return value;
    }
}

Leader.registerClass();

export default Leader;