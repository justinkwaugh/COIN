import Player from 'common/player';

class FallingSkyPlayer extends Player {

    constructor(definition) {
        super(definition);
    }

    willHarass(factionId) {
        return true;
    }

    willAgreeToQuarters(state, factionId) {
        return false;
    }

    willAgreeToRetreat(state, factionId) {
        return false;
    }

    willAgreeToSupplyLine(state, factionId) {
        return false;
    }

}

export default FallingSkyPlayer;

