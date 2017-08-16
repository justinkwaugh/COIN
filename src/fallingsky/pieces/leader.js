import ko from '../../lib/knockout';
import FactionPiece from '../../common/factionPiece';

class Leader extends FactionPiece {
    constructor(definition) {
        definition.type = 'leader';
        definition.isMobile = true;
        definition.canRoll = true;
        
        super(definition);

        this.name = definition.name;
        this.isSuccessor = ko.observable(false);
    }

    toJSON() {
        return Object.assign(super.toJSON(), {
            name: this.name,
            isSuccessor: this.isSuccessor()
        });
    }

    toString() {
        let value = this.name;
        if (this.isSuccessor()) {
            value += '\'s Successor';
        }
        return value;
    }
    
    loadGameState(json) {
        super.loadGameState(json);

        this.name = json.name;
        this.isSuccessor(json.isSuccessor);
    }
}

export default Leader;