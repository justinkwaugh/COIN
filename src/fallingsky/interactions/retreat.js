import PlayerInteraction from 'common/playerInteraction';

class Retreat extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'Retreat';
        super(definition);
    }
}

export default Retreat;