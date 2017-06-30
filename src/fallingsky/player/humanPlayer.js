import FallingSkyPlayer from './fallingSkyPlayer';
import PlayerInteractionNeededError from 'common/playerInteractionNeededError';

class HumanPlayer extends FallingSkyPlayer {

    willHarass(factionId, context) {
        return false;
    }

    willAgreeToQuarters(factionId) {
        return false;
    }

    willAgreeToRetreat(factionId) {
        return false;
    }

    willAgreeToSupplyLine(factionId) {
        throw new PlayerInteractionNeededError('Will you allow supply line for ' + factionId, { factionId : factionId });
    }
}

export default HumanPlayer;