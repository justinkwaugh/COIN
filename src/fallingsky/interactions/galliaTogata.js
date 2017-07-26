import PlayerInteraction from 'common/playerInteraction';

class Pompey extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'GalliaTogata';
        super(definition);

        this.removed = definition.removed;
    }
}

export default Pompey;