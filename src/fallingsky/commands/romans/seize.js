import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from 'fallingsky/config/factionIds';
import SeizeResults from './seizeResults';

class Seize extends Command {

    static doTest(state, args) {
        return _(state.regions).map((region) => {
            const romanPieces = region.getPiecesForFaction(FactionIDs.ROMANS);
            if (romanPieces.length === 0) {
                return false;
            }

            const numAllies = region.getAlliesForFaction(FactionIDs.ROMANS).length;
            const numSubdued = region.getSubduedTribes().length;

            if (numAllies === 0 && numSubdued === 0) {
                return false;
            }

            const harassmentLosses = this.harassmentLosses(state, FactionIDs.ARVERNI, region) +
                                     this.harassmentLosses(state, FactionIDs.BELGAE, region) +
                                     this.harassmentLosses(state, FactionIDs.AEDUI, region) +
                                     this.harassmentLosses(state, FactionIDs.GERMANIC_TRIBES, region);

            return new SeizeResults({
                                        region,
                                        resourcesGained: region.devastated() ? 0 : (numAllies + numSubdued) * 2,
                                        canDisperse: numSubdued > 0 && state.romans.hasAvailableDispersalTokens(),
                                        harassmentLosses

                                    });
        }).compact().value();
    }

    static harassmentLosses(state, factionId, region) {
        let losses = 0;
        const numHiddenEnemies = region.getHiddenPiecesForFaction(factionId).length;
        if (numHiddenEnemies >= 3) {
            const player = state.playersByFaction[factionId];
            if (player.willHarass(FactionIDs.ROMANS)) {
                losses = Math.floor(numHiddenEnemies / 3);
            }
        }
        return losses;
    }
}

export default Seize;