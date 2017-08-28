import FactionIDs from 'fallingsky/config/factionIds';
import TribeIDs from 'fallingsky/config/tribeIds';
import RegionIDs from 'fallingsky/config/regionIds';

import UndisperseTribe from 'fallingsky/actions/undisperseTribe';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import RemovePieces from 'fallingsky/actions/removePieces';


class Event57 {
    static handleEvent(state) {
        if (!state.belgae.hasAvailableAlliedTribe()) {
            return false;
        }

        const catuvellauni = state.tribesById[TribeIDs.CATUVELLAUNI];
        if (catuvellauni.alliedFactionId() === FactionIDs.BELGAE) {
            return false;
        }

        if (catuvellauni.isDispersed() || catuvellauni.isDispersedGathering()) {
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
            factionId: FactionIDs.BELGAE,
            regionId: RegionIDs.BRITANNIA,
            tribeId: catuvellauni.id
        });

        if (state.belgae.availableWarbands().length > 0) {
            PlaceWarbands.execute(state, {
                factionId: FactionIDs.BELGAE,
                regionId: RegionIDs.BRITANNIA,
                count: Math.min(4, state.belgae.availableWarbands().length)
            });
        }
        return true;
    }
}

export default Event57
