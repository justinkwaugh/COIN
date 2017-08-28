import PlayerInteraction from 'common/playerInteraction';

class Harassment extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'Harassment';
        super(definition);

        this.regionId = definition.regionId;
    }
}

export default Harassment;