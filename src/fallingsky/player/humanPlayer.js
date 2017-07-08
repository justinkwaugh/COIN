import FallingSkyPlayer from './fallingSkyPlayer';
import PlayerInteractionNeededError from 'common/playerInteractionNeededError';
import SupplyLineAgreement from 'fallingsky/interactions/supplyLineAgreement';
import QuartersAgreement from 'fallingsky/interactions/quartersAgreement';
import RetreatAgreement from 'fallingsky/interactions/retreatAgreement';
import RetreatDeclaration from 'fallingsky/interactions/retreatDeclaration';
import Harassment from 'fallingsky/interactions/harassment';
import Losses from 'fallingsky/interactions/losses';
import Retreat from 'fallingsky/interactions/retreat';

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

    willRetreat(state, region, attackingFaction, worstCaseAttackerLosses, noRetreatDefenderResults, retreatDefenderResults) {
        throw new PlayerInteractionNeededError('Will retreat from battle with ' + attackingFaction.id,
                                               new RetreatDeclaration({
                                                                          requestingFactionId: attackingFaction.id,
                                                                          respondingFactionId: this.factionId,
                                                                          regionId: region.id
                                                                      }));
    }

    retreatFromBattle(state, battleResults, attackResults) {
        throw new PlayerInteractionNeededError('Retreat from battle with ' + battleResults.attackingFaction.id,
                                               new Retreat({
                                                                          requestingFactionId: battleResults.attackingFaction.id,
                                                                          respondingFactionId: this.factionId,
                                                                          regionId: battleResults.region.id
                                                                      }));
    }

    takeLosses(state, battleResults, attackResults, counterattack) {
        throw new PlayerInteractionNeededError('Losses must be taken from battle with ' + battleResults.attackingFaction.id,
                                               new Losses({
                                                              requestingFactionId: battleResults.attackingFaction.id,
                                                              respondingFactionId: this.factionId,
                                                              ambush: !counterattack && battleResults.willAmbush,
                                                              retreated: !counterattack && battleResults.willRetreat,
                                                              counterattack: counterattack,
                                                              regionId: battleResults.region.id,
                                                              losses: attackResults.losses,
                                                              targets: attackResults.targets
                                                          }));
    }
}

export default HumanPlayer;