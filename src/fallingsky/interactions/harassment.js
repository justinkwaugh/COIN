import PlayerInteraction from 'common/playerInteraction';

class Harassment extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'Harassment';
        super(definition);
    }
}

export default Harassment;