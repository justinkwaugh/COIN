import Player from 'common/player';

class FallingSkyPlayer extends Player {

    constructor(definition) {
        super(definition);
    }

    toJSON() {
        return Object.assign(super.toJSON(), {});
    }

    willHarass() {
        return true;
    }

    willAgreeToQuarters() {
        return false;
    }

    willAgreeToRetreat() {
        return false;
    }

    willRetreat() {
        return false;
    }

    willAgreeToSupplyLine() {
        return false;
    }

    willApplyBalearicSlingers() {
        return false;
    }

    willApplyGermanicHorse() {
        return false;
    }

}

export default FallingSkyPlayer;

