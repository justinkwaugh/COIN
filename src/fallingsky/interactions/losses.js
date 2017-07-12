import PlayerInteraction from 'common/playerInteraction';

class Losses extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'Losses';
        super(definition);

        // This part is for the request
        this.ambush = false;
        this.retreated = false;
        this.balearicSlingers = false;
        this.massedGallicArchers = false;
        this.regionId = definition.regionId;
        this.losses = definition.losses;

        // This part is for the response
        this.caesarCanCounterattack = false;
        this.removed = definition.removed;
    }
}

export default Losses;