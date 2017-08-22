import FactionIDs from 'fallingsky/config/factionIds';
import TribeIDs from 'fallingsky/config/tribeIds';
import RegionIDs from 'fallingsky/config/regionIds';

import UndisperseTribe from 'fallingsky/actions/undisperseTribe';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import RemovePieces from 'fallingsky/actions/removePieces';


class Event57 {
    static handleEvent(state) {
        const catuvellauni = state.tribesById[TribeIDs.CATUVELLAUNI];
        if (catuvellauni.alliedFactionId() !== FactionIDs.ARVERNI) {
            if (!state.arverni.hasAvailableAlliedTribe() && (state.belgae.hasAvailableAlliedTribe() || state.aedui.hasAvailableAlliedTribe())) {
                return false;
            }

            if (catuvellauni.isDispersed()) {
                UndisperseTribe.execute(state, {
                    tribeId: catuvellauni.id,
                    fully: true
                });
            }

            if (catuvellauni.isAllied()) {
                RemovePieces.execute(state, {
                    factionId: catuvellauni.alliedFactionId(),
                    regionId: RegionIDs.BRITANNIA,
                    pieces: state.regionsById[RegionIDs.BRITANNIA].getAlliesAndCitadels()
                });
            }

            PlaceAlliedTribe.execute(state, {
                factionId: FactionIDs.ARVERNI,
                regionId: RegionIDs.BRITANNIA,
                tribeId: catuvellauni.id
            });
        }

        if(state.arverni.availableWarbands().length > 0) {
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.ARVERNI,
                regionId: RegionIDs.BRITANNIA,
                count: Math.min(4, state.arverni.availableWarbands().length)
            });
        }

        return true;
    }
}

export default Event57
