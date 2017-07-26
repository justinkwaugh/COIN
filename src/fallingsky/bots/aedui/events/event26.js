import _ from '../../../../lib/lodash';
import FactionIDs from '../../../config/factionIds';
import RegionIDs from '../../../config/regionIds';
import TribeIDs from '../../../config/tribeIds';
import RemovePieces from '../../../actions/removePieces';
import PlaceCitadel from '../../../actions/placeCitadel';
import PlaceAlliedTribe from '../../../actions/placeAlliedTribe';
import UndisperseTribe from 'fallingsky/actions/undisperseTribe';


class Event26 {
    static handleEvent(state) {
        const gergovia = state.tribesById[TribeIDs.ARVERNI];
        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        const aedui = state.factionsById[FactionIDs.AEDUI];

        const enemyAllyOrCitadel = gergovia.alliedFactionId() && gergovia.alliedFactionId() !== FactionIDs.AEDUI;
        const canPlaceAllyOrCitadel = (aedui.hasAvailableCitadel() || aedui.hasAvailableAlliedTribe());

        if (enemyAllyOrCitadel || canPlaceAllyOrCitadel) {
            console.log('*** Playing Gobannitio ***');
            const enemyPiece = _.find(
                arverniRegion.pieces(), function (piece) {
                    return (piece.type === 'alliedtribe' || piece.type === 'citadel') && piece.tribeId === TribeIDs.ARVERNI;
                });

            if (enemyPiece) {
                RemovePieces.execute(
                    state, {
                        factionId: enemyPiece.factionId,
                        regionId: arverniRegion.id,
                        pieces: [enemyPiece]
                    });
            }

            if(gergovia.isDispersed() || gergovia.isDispersedGathering() || gergovia.isRazed()) {
                UndisperseTribe.execute(state, {
                    tribeId: gergovia.id,
                    fully: true
                })
            }

            if (aedui.hasAvailableCitadel()) {
                PlaceCitadel.execute(state, {factionId: aedui.id, regionId: arverniRegion.id, tribeId: gergovia.id}, true);
            }
            else if (aedui.hasAvailableAlliedTribe()) {
                PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: arverniRegion.id, tribeId: gergovia.id}, true);
            }
            return true;
        }
        return false;
    }
}

export default Event26;
