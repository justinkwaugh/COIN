import FallingSkyPlayer from './fallingSkyPlayer';
import PlayerInteractionNeededError from 'common/playerInteractionNeededError';
import SupplyLineAgreement from 'fallingsky/interactions/supplyLineAgreement';
import QuartersAgreement from 'fallingsky/interactions/quartersAgreement';
import RetreatAgreement from 'fallingsky/interactions/retreatAgreement';
import RetreatDeclaration from 'fallingsky/interactions/retreatDeclaration';
import BalearicSlingersDeclaration from 'fallingsky/interactions/balearicSlingersDeclaration';
import GermanicHorseDeclaration from 'fallingsky/interactions/germanicHorseDeclaration';
import Harassment from 'fallingsky/interactions/harassment';
import Losses from 'fallingsky/interactions/losses';
import Retreat from 'fallingsky/interactions/retreat';
import Pompey from 'fallingsky/interactions/pompey';
import GalliaTogata from 'fallingsky/interactions/galliaTogata';
import RemovePieces from 'fallingsky/interactions/removePieces';
import {CapabilityIDs} from 'fallingsky/config/capabilities';

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

    willAgreeToQuarters(state, factionId) {
        throw new PlayerInteractionNeededError('Quarters requested by ' + factionId,
                                               new QuartersAgreement({
                                                                         requestingFactionId: factionId,
                                                                         respondingFactionId: this.factionId
                                                                     }));
    }

    willAgreeToRetreat(state, factionId) {

        throw new PlayerInteractionNeededError('Retreat requested by ' + factionId,
                                               new RetreatAgreement({
                                                                        requestingFactionId: factionId,
                                                                        respondingFactionId: this.factionId
                                                                    }));
    }

    willAgreeToSupplyLine(state, factionId) {
        throw new PlayerInteractionNeededError('Supply line requested by ' + factionId,
                                               new SupplyLineAgreement({
                                                                           requestingFactionId: factionId,
                                                                           respondingFactionId: this.factionId
                                                                       }));
    }

    willApplyGermanicHorse(state, region, attackingFaction, defendingFaction) {
        throw new PlayerInteractionNeededError('Use Germanic Horse Capability?',
                                               new GermanicHorseDeclaration({
                                                                                requestingFactionId: attackingFaction.id,
                                                                                respondingFactionId: this.factionId,
                                                                                regionId: region.id
                                                                            }));
    }

    willApplyBalearicSlingers(state, region, attackingFaction, defendingFaction) {
        throw new PlayerInteractionNeededError('Use Balearic Slingers Capability?',
                                               new BalearicSlingersDeclaration({
                                                                                   requestingFactionId: attackingFaction.id,
                                                                                   respondingFactionId: this.factionId,
                                                                                   regionId: region.id,
                                                                                   defendingFactionId: defendingFaction.id
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
        throw new PlayerInteractionNeededError('Retreat from battle with ' + battleResults.attackingFactionId,
                                               new Retreat({
                                                               requestingFactionId: battleResults.attackingFactionId,
                                                               respondingFactionId: this.factionId,
                                                               regionId: battleResults.regionId
                                                           }));
    }

    takeLosses(state, battleResults, attackResults, counterattack) {
        throw new PlayerInteractionNeededError(
            'Losses must be taken from battle with ' + battleResults.attackingFactionId,
            new Losses({
                           requestingFactionId: battleResults.attackingFactionId,
                           respondingFactionId: this.factionId,
                           ambush: !counterattack && battleResults.willAmbush,
                           retreated: !counterattack && battleResults.willRetreat,
                           counterattack: counterattack,
                           regionId: battleResults.regionId,
                           legiones: battleResults.legiones,
                           losses: attackResults.losses
                       }));
    }

    takePompeyLosses(state) {
        throw new PlayerInteractionNeededError(
            'Please remove 2 Legions to the Legions track ', new Pompey({}));

    }

    takeGalliaTogataLosses(state) {
        throw new PlayerInteractionNeededError(
            'Please remove 1 Legions to the Legions track and 2 Auxilia to Available', new GalliaTogata({}));

    }

    removePieces(state, region, numPieces) {
        throw new PlayerInteractionNeededError(
            'Please remove ' + numPieces + ' pieces from region ' + region.name, new RemovePieces({
                                                                                                            regionId: region.id,
                                                                                                            count: numPieces
                                                                                                        }));
    }
}

export default HumanPlayer;