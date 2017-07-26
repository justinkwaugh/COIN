import PlayerInteraction from 'common/playerInteraction';

class Losses extends PlayerInteraction {
    constructor(definition) {
        definition.type = 'Losses';
        super(definition);

        // This part is for the request
        this.reason = definition.reason;
        this.ambush = definition.ambush;
        this.retreated = definition.retreated;
        this.balearicSlingers = definition.balearicSlingers;
        this.massedGallicArchers = definition.massedGallicArchers;
        this.regionId = definition.regionId;
        this.losses = definition.losses;

        // This part is for the response
        this.caesarCanCounterattack = false;
        this.removed = definition.removed;
    }
}

export default Losses;