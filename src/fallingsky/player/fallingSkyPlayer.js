import Player from 'common/player';

class FallingSkyPlayer extends Player {

    constructor(definition) {
        super(definition);
    }

    willHarass(factionId) {
        return true;
    }

    willAgreeToQuarters(factionId) {
        return false;
    }

    willAgreeToRetreat() {
        return false;
    }

    willAgreeToSupplyLine(factionId) {
        return false;
    }

}

export default FallingSkyPlayer;

