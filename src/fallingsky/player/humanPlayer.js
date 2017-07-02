import FallingSkyPlayer from './fallingSkyPlayer';
import PlayerInteractionNeededError from 'common/playerInteractionNeededError';
import SupplyLineAgreement from 'fallingsky/interactions/supplyLineAgreement';
import QuartersAgreement from 'fallingsky/interactions/quartersAgreement';
import RetreatAgreement from 'fallingsky/interactions/retreatAgreement';
import Harassment from 'fallingsky/interactions/harassment';

class HumanPlayer extends FallingSkyPlayer {
    constructor(definition) {
        super(definition);
    }

    willHarass(factionId, context) {
        throw new PlayerInteractionNeededError('Harassment possible for ' + factionId,
                                               new Harassment({
                                                                  requestingFactionId: factionId,
                                                                  respondingFactionId: this.factionId
                                                              }));
    }

    willAgreeToQuarters(factionId) {
        throw new PlayerInteractionNeededError('Quarters requested by ' + factionId,
                                               new QuartersAgreement({
                                                                         requestingFactionId: factionId,
                                                                         respondingFactionId: this.factionId
                                                                     }));
    }

    willAgreeToRetreat(factionId) {

        throw new PlayerInteractionNeededError('Retreat requested by ' + factionId,
                                               new RetreatAgreement({
                                                                        requestingFactionId: factionId,
                                                                        respondingFactionId: this.factionId
                                                                    }));
    }

    willAgreeToSupplyLine(factionId) {
        throw new PlayerInteractionNeededError('Supply line requested by ' + factionId,
                                               new SupplyLineAgreement({
                                                                           requestingFactionId: factionId,
                                                                           respondingFactionId: this.factionId
                                                                       }));
    }
}

export default HumanPlayer;